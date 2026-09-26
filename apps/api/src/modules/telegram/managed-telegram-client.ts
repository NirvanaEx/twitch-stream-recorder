import { Api, TelegramClient } from "telegram";
import { LAYER } from "telegram/tl/AllTLObjects";
import { MTProtoSender } from "telegram/network/MTProtoSender";
import type { RequestState } from "telegram/network/RequestState";

/**
 * GramJS 2.26.22 uses Object.values() on these Maps in disconnect(), leaving
 * download senders and their idle/reconnect timers alive. Keep the workaround
 * here, including internal calls to client.disconnect(), not in node_modules.
 * Remove it only with the regression test passing against an upgraded GramJS.
 */
export class ManagedTelegramClient extends TelegramClient {
  private closing: Promise<void> | null = null;
  private generation = 0;
  private connectingSenders = new Set<MTProtoSender>();

  private assertOpen(generation = this.generation) {
    if (this.closing || this._destroyed || generation !== this.generation) {
      throw new Error("Telegram client is closing.");
    }
  }

  override getSender(dcId: number) {
    if (this.closing || this._destroyed) return Promise.reject(new Error("Telegram client is closing."));
    return super.getSender(dcId);
  }

  override async _borrowExportedSender(dcId: number, reconnect?: boolean, existing?: MTProtoSender) {
    this.assertOpen();
    const generation = this.generation;
    const sender = await super._borrowExportedSender(dcId, reconnect, existing);
    if (this.closing || this._destroyed || generation !== this.generation) {
      const timers = (this as unknown as {
        _exportedSenderReleaseTimeouts: Map<number, ReturnType<typeof setTimeout>>;
      })._exportedSenderReleaseTimeouts;
      clearTimeout(timers.get(dcId));
      timers.delete(dcId);
      await this.closeSender(sender);
    }
    this.assertOpen(generation);
    return sender;
  }

  // The upstream loop retries forever, including after destroy(). Keep the
  // same authorization exchange but check shutdown between attempts/awaits.
  override async _connectSender(sender: MTProtoSender, dcId: number) {
    const generation = this.generation;
    this.connectingSenders.add(sender);
    try {
      this.assertOpen(generation);
      const dc = await this.getDC(dcId, !!sender.authKey.getKey());
      for (;;) {
        this.assertOpen(generation);
        try {
          await sender.connect(new this._connection({
            ip: dc.ipAddress, port: dc.port, dcId, loggers: this._log,
            proxy: this._proxy, testServers: this.testServers, socket: this.networkSocket,
          }), false);
          this.assertOpen(generation);
          if (this.session.dcId !== dcId && !sender._authenticated) {
            const auth = await this.invoke(new Api.auth.ExportAuthorization({ dcId }));
            this.assertOpen(generation);
            this._initRequest.query = new Api.auth.ImportAuthorization({ id: auth.id, bytes: auth.bytes });
            await sender.send(new Api.InvokeWithLayer({ layer: LAYER, query: this._initRequest }));
            this.assertOpen(generation);
            sender._authenticated = true;
          }
          sender.dcId = dcId;
          sender.userDisconnected = false;
          return sender;
        } catch (error) {
          this.assertOpen(generation);
          if ((error as { errorMessage?: string }).errorMessage === "DC_ID_INVALID") {
            sender._authenticated = true;
            sender.userDisconnected = false;
            return sender;
          }
          await new Promise((resolve) => setTimeout(resolve, 1000));
          this.assertOpen(generation);
          await sender.disconnect();
        }
      }
    } finally {
      this.connectingSenders.delete(sender);
      if (this._destroyed || generation !== this.generation) await sender.disconnect();
    }
  }

  override disconnect(): Promise<void> {
    if (!this.closing) {
      this.generation = (this.generation ?? 0) + 1;
      this.closing = this.closeSenders().finally(() => { this.closing = null; });
    }
    return this.closing;
  }

  private async closeSenders() {
    const internal = this as unknown as {
      _exportedSenderReleaseTimeouts: Map<number, ReturnType<typeof setTimeout>>;
    };
    const timers = internal._exportedSenderReleaseTimeouts;
    const senders = [...this._exportedSenderPromises.values()];
    for (const timer of timers.values()) clearTimeout(timer);
    timers.clear();
    this._exportedSenderPromises.clear();

    // Attach handlers before awaiting the main sender. A pending sender may
    // finish connecting during shutdown; it must be closed too, even if a
    // sibling fails to disconnect.
    const closed = new Map<MTProtoSender, Promise<void>>();
    const close = (sender: MTProtoSender) => {
      if (!closed.has(sender)) closed.set(sender, this.closeSender(sender));
      return closed.get(sender)!;
    };
    const pending = new Set(this.connectingSenders ?? []);
    // Known connecting senders can be closed directly; awaiting their
    // authorization promise first can deadlock on the connection being closed.
    const resolved = senders.map(async (promise) => {
      const sender = await promise;
      return close(sender);
    });
    for (const promise of resolved) void promise.catch(() => undefined);
    const results = await Promise.allSettled([
      this._sender ? close(this._sender) : this._disconnect(),
      ...[...pending].map(close),
      // With pending connects, their late completion is observed above and
      // _connectSender's finally also closes a connection that arrives late.
      ...(pending.size ? [] : resolved),
    ]);
    // A getSender already in flight may have installed an idle timer while
    // its connection promise was resolving.
    for (const timer of timers.values()) clearTimeout(timer);
    timers.clear();
    this._exportedSenderPromises.clear();
    const failure = results.find((result) => result.status === "rejected");
    if (failure?.status === "rejected") throw failure.reason;
  }

  private async closeSender(sender: MTProtoSender) {
    if (this._destroyed || sender !== this._sender) {
      // GramJS schedules reconnect() one second ahead without rechecking
      // userDisconnected. Prevent those callbacks reviving a retired sender.
      sender.reconnect = () => {};
      sender._reconnect = async () => {};
      sender.connect = async () => false;
      // An invoke may still be in GramJS's automatic FLOOD_WAIT sleep and
      // enqueue again after shutdown. Reject that late retry as well.
      sender.addStateToQueue = (state) => state.reject(new Error("Telegram transport closed."));
      sender.send = async () => { throw new Error("Telegram transport closed."); };
    }
    await sender.disconnect();
    // 2.26.22 disconnect closes the socket but leaves request promises pending.
    // Settle them only after closing it so scheduler slots track real work.
    const internal = sender as unknown as {
      _sendQueue?: { _pendingStates: RequestState[]; values(): RequestState[]; clear(): void };
    };
    const queue = internal._sendQueue;
    const states = new Set([...(sender._pendingState?.values() ?? []),
      ...(queue?._pendingStates ?? []), ...(queue?.values() ?? [])]);
    for (const state of states) state?.reject(new Error("Telegram transport closed."));
    sender._pendingState?.clear();
    queue?.clear();
  }
}
