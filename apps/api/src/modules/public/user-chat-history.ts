import { NotFoundException } from "@nestjs/common";
import type { PrismaClient } from "@prisma/client";
import { buildReplayMessage } from "../chat/replay-message.utils";

const HISTORY_LIMIT = 1000;
const PAST_GAP_MS = 5 * 60 * 1000;

export async function getUserChatHistory(
  prisma: Pick<PrismaClient, "streamSession" | "chatMessage">,
  id: string,
  rawLogin: string,
) {
  const current = await prisma.streamSession.findUnique({
    where: { id },
    select: { channelId: true, startedAt: true },
  });
  if (!current) throw new NotFoundException("Запись не найдена.");
  const login = rawLogin.trim().toLowerCase();
  if (!current.startedAt || !login || login.length > 100) {
    return { messages: [], sessions: 0, truncated: false };
  }
  // Same five-minute margin as the userscript: restart fragments of this
  // broadcast and newer broadcasts must never leak into an older VOD.
  const cutoff = new Date(current.startedAt.getTime() - PAST_GAP_MS);
  const sessions = await prisma.streamSession.findMany({
    where: { channelId: current.channelId, chatAvailable: true, startedAt: { lt: cutoff } },
    select: { id: true, startedAt: true },
    orderBy: [{ startedAt: "desc" }, { createdAt: "desc" }],
    take: 10,
  });
  if (!sessions.length) return { messages: [], sessions: 0, truncated: false };
  const messages = await prisma.chatMessage.findMany({
    where: {
      streamSessionId: { in: sessions.map((session) => session.id) },
      authorLogin: { equals: login, mode: "insensitive" },
      // A mislabelled or overlapping capture must not expose later messages.
      messageTimestamp: { lt: cutoff },
    },
    orderBy: [{ messageTimestamp: "desc" }, { id: "desc" }],
    take: HISTORY_LIMIT + 1,
  });
  return {
    messages: messages.slice(0, HISTORY_LIMIT).map((message) => ({
      ...buildReplayMessage(message, null, { includeTimestamps: true }),
      // A deletion after the viewed broadcast has not happened yet.
      isDeleted: message.isDeleted && (!message.deletedAt || message.deletedAt < cutoff),
      historySessionId: message.streamSessionId,
    })),
    sessions: sessions.length,
    truncated: messages.length > HISTORY_LIMIT,
  };
}
