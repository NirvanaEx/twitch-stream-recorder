import assert from "node:assert/strict";
import { test } from "node:test";
import { ManagedTelegramClient } from "./managed-telegram-client";
import { TelegramClientService } from "./telegram-client.service";
import { Api } from "telegram";
import { StringSession } from "telegram/sessions";
import { RequestState } from "telegram/network/RequestState";

const turn = () => new Promise<void>((resolve) => setImmediate(resolve));

test("disconnect closes every exported sender and cancels its release timer", async () => {
  const client = Object.create(ManagedTelegramClient.prototype) as any;
  let main = 0, exports = 0, timerFired = false;
  client._disconnect = async () => { main++; };
  client._exportedSenderPromises = new Map([
    [2, Promise.resolve({ disconnect: async () => { exports++; } })],
    [4, Promise.resolve({ disconnect: async () => { exports++; } })],
  ]);
  client._exportedSenderReleaseTimeouts = new Map([[2, setTimeout(() => { timerFired = true; }, 10)]]);
  await Promise.all([client.disconnect(), client.disconnect()]);
  await new Promise((resolve) => setTimeout(resolve, 20));
  assert.equal(main, 1);
  assert.equal(exports, 2);
  assert.equal(timerFired, false);
  assert.equal(client._exportedSenderPromises.size, 0);
  assert.equal(client._exportedSenderReleaseTimeouts.size, 0);
});

test("pending senders close on resolution even if another disconnect fails", async () => {
  const client = Object.create(ManagedTelegramClient.prototype) as any;
  let resolveSender!: (sender: unknown) => void;
  let closed = 0;
  client._disconnect = async () => { throw new Error("main disconnect failed"); };
  client._exportedSenderPromises = new Map([[2, new Promise((resolve) => { resolveSender = resolve; })]]);
  client._exportedSenderReleaseTimeouts = new Map();
  const closing = client.disconnect();
  const failed = assert.rejects(closing, /main disconnect failed/);
  await assert.rejects(client.getSender(4), /closing/);
  resolveSender({ disconnect: async () => { closed++; } });
  await failed;
  assert.equal(closed, 1);
});

test("destroy settles pending and queued RPCs and disables delayed reconnect callbacks", async () => {
  const client = new ManagedTelegramClient(new StringSession(""), 1, "test", {});
  const first = new RequestState(new Api.help.GetConfig());
  const second = new RequestState(new Api.help.GetConfig());
  const rejected = [assert.rejects(first.promise!, /transport closed/), assert.rejects(second.promise!, /transport closed/)];
  let closed = 0, reconnects = 0;
  const sender = {
    disconnect: async () => { closed++; },
    reconnect: () => { reconnects++; }, _reconnect: async () => { reconnects++; },
    connect: async () => { reconnects++; return true; },
    _pendingState: { values: () => [first], clear: () => {} },
    _sendQueue: { _pendingStates: [first, second], values: () => [second], clear: () => {} },
  };
  (client as any)._sender = sender;
  await client.destroy();
  await Promise.all(rejected);
  sender.reconnect();
  await sender._reconnect();
  await sender.connect();
  const late = new RequestState(new Api.help.GetConfig());
  const lateRejected = assert.rejects(late.promise!, /transport closed/);
  (sender as any).addStateToQueue(late);
  await lateRejected;
  assert.equal(closed, 1);
  assert.equal(reconnects, 0);
});

test("destroy does not wait on pending DC discovery and cannot reconnect when it resolves late", async () => {
  const client = new ManagedTelegramClient(new StringSession(""), 1, "test", {});
  let resolveDC!: (dc: any) => void;
  client.getDC = () => new Promise((resolve) => { resolveDC = resolve; });
  let closes = 0, connects = 0;
  const sender = { authKey: { getKey: () => undefined },
    connect: async () => { connects++; return true; }, disconnect: async () => { closes++; } };
  const connecting = client._connectSender(sender as any, 2);
  const rejected = assert.rejects(connecting, /closing/);
  client._exportedSenderPromises.set(2, connecting);
  await client.destroy();
  resolveDC({ ipAddress: "127.0.0.1", port: 443 });
  await rejected;
  await assert.rejects(client.getSender(2), /closing/);
  assert.equal(connects, 0);
  assert.ok(closes >= 1);
});

function clientService() {
  const service = new TelegramClientService({} as any) as any;
  const credentials = { apiId: 1, apiHash: "test", botToken: "test" };
  service.getCredentials = async () => credentials;
  return { service, key: service.credentialsKey(credentials) };
}

test("parallel calls reconnect the existing client once instead of replacing it", async () => {
  const { service, key } = clientService();
  let connects = 0;
  const client = { connected: false, connect: async () => {
    connects++; await turn(); client.connected = true;
  } };
  service.client = client;
  service.clientCredentialsKey = key;
  service.createClient = () => { throw new Error("must not create a replacement"); };
  const results = await Promise.all(Array.from({ length: 20 }, () => service.getClient()));
  assert.equal(connects, 1);
  assert.ok(results.every((result) => result === client));
});

test("concurrent stuck-block recoveries retire the same transport only once", async () => {
  const { service, key } = clientService();
  let destroys = 0, creates = 0;
  const old = { destroy: async () => { destroys++; await turn(); } };
  const replacement = { connected: true };
  service.client = old;
  service.clientCredentialsKey = key;
  service.createClient = async () => {
    creates++; service.client = replacement; service.clientCredentialsKey = key;
    return replacement;
  };
  await Promise.all(Array.from({ length: 6 }, () => service.recoverClient(old)));
  await service.recoverClient(old); // another old RPC times out later
  assert.equal(destroys, 1);
  assert.equal(creates, 1);
});
