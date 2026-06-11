import {
  Injectable,
  Logger,
  OnModuleDestroy,
  ServiceUnavailableException,
} from "@nestjs/common";
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { Api, TelegramClient } from "telegram";
import { returnBigInt } from "telegram/Helpers";
import { StringSession } from "telegram/sessions";
import { PrismaService } from "../prisma/prisma.service";

export type TelegramCredentials = {
  apiId: number;
  apiHash: string;
  botToken: string;
};

/**
 * Owns the single MTProto (GramJS) connection used for both uploading
 * recordings to Telegram and streaming them back into the web player.
 *
 * Credentials come from AppSettings (editable in the admin panel) and fall
 * back to TELEGRAM_API_ID / TELEGRAM_API_HASH / TELEGRAM_BOT_TOKEN env vars.
 * When they change, the next getClient() call transparently reconnects.
 */
@Injectable()
export class TelegramClientService implements OnModuleDestroy {
  private readonly logger = new Logger(TelegramClientService.name);
  private client: TelegramClient | null = null;
  private clientCredentialsKey: string | null = null;
  private clientPromise: Promise<TelegramClient> | null = null;

  constructor(private readonly prisma: PrismaService) {}

  async onModuleDestroy() {
    await this.disconnect();
  }

  /** Resolve credentials from settings with env fallback; null when incomplete. */
  async getCredentials(): Promise<TelegramCredentials | null> {
    const settings = await this.prisma.appSettings.upsert({
      where: { id: "default" },
      create: { id: "default" },
      update: {},
    });

    const apiId = Number.parseInt(
      settings.telegramApiId.trim() || process.env.TELEGRAM_API_ID?.trim() || "",
      10,
    );
    const apiHash = settings.telegramApiHash.trim() || process.env.TELEGRAM_API_HASH?.trim() || "";
    const botToken =
      settings.telegramBotToken.trim() || process.env.TELEGRAM_BOT_TOKEN?.trim() || "";

    if (!apiId || !apiHash || !botToken) {
      return null;
    }

    return { apiId, apiHash, botToken };
  }

  async isConfigured() {
    return Boolean(await this.getCredentials());
  }

  async getClient(): Promise<TelegramClient> {
    const credentials = await this.getCredentials();

    if (!credentials) {
      throw new ServiceUnavailableException(
        "Telegram is not configured: set api_id, api_hash and the bot token in settings.",
      );
    }

    const key = this.credentialsKey(credentials);

    if (this.client?.connected && this.clientCredentialsKey === key) {
      return this.client;
    }

    if (!this.clientPromise) {
      this.clientPromise = this.createClient(credentials, key).finally(() => {
        this.clientPromise = null;
      });
    }

    return this.clientPromise;
  }

  /**
   * Resolve "@username" or "-100..." into an entity usable with GramJS calls.
   *
   * Bots cannot look up arbitrary channel ids the way the HTTP Bot API can:
   * MTProto needs an access hash the in-memory session may not have yet. For
   * channels the bot is a member of, Telegram accepts a zero access hash, so
   * fall back to that before giving up.
   */
  async resolveChat(chatRef: string) {
    const client = await this.getClient();

    if (chatRef.startsWith("@")) {
      return client.getEntity(chatRef);
    }

    try {
      return await client.getEntity(returnBigInt(chatRef));
    } catch {
      const channelId = chatRef.startsWith("-100")
        ? chatRef.slice(4)
        : chatRef.replace(/^-/, "");

      const result = await client.invoke(
        new Api.channels.GetChannels({
          id: [
            new Api.InputChannel({
              channelId: returnBigInt(channelId),
              accessHash: returnBigInt(0),
            }),
          ],
        }),
      );

      const chat = result.chats[0];

      if (!chat) {
        throw new ServiceUnavailableException(
          `Telegram chat ${chatRef} is not reachable. Is the bot an admin of the channel?`,
        );
      }

      return chat;
    }
  }

  private async createClient(credentials: TelegramCredentials, key: string) {
    await this.disconnect();

    const sessionPath = resolve(
      process.env.DATA_DIR ?? "./data",
      "telegram",
      "gramjs-session.json",
    );

    // The MTProto session is persisted so restarts don't re-authorize the bot
    // (Telegram rate-limits repeated bot logins). A session belongs to one
    // set of credentials, so it is discarded when they change.
    let savedSession = "";
    try {
      const parsed = JSON.parse(readFileSync(sessionPath, "utf8")) as {
        key?: string;
        session?: string;
      };
      if (parsed.key === key && parsed.session) {
        savedSession = parsed.session;
      }
    } catch {
      // First run or unreadable file: start a fresh session.
    }

    const client = new TelegramClient(
      new StringSession(savedSession),
      credentials.apiId,
      credentials.apiHash,
      { connectionRetries: 5 },
    );

    await client.start({ botAuthToken: credentials.botToken });

    try {
      mkdirSync(dirname(sessionPath), { recursive: true });
      writeFileSync(
        sessionPath,
        JSON.stringify({ key, session: String(client.session.save()) }),
        "utf8",
      );
    } catch (error) {
      this.logger.warn(
        `Failed to persist the MTProto session: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }

    this.logger.log("Connected to Telegram (MTProto).");
    this.client = client;
    this.clientCredentialsKey = key;
    return client;
  }

  private async disconnect() {
    if (this.client) {
      try {
        await this.client.disconnect();
      } catch {
        // Best-effort shutdown.
      }
      this.client = null;
      this.clientCredentialsKey = null;
    }
  }

  private credentialsKey(credentials: TelegramCredentials) {
    return createHash("sha256")
      .update(`${credentials.apiId}:${credentials.apiHash}:${credentials.botToken}`)
      .digest("hex");
  }
}
