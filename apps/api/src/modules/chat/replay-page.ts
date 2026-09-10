import type { PrismaService } from "../prisma/prisma.service";

export const REPLAY_PAGE_SIZE = 10000;

/** Opt-in cursor pages keep old clients compatible and let new players load
 * the entire conversation. A second sort key makes equal-second boundaries
 * deterministic, so a message cannot disappear between requests.
 */
export async function readReplayPage(
  prisma: Pick<PrismaService, "chatMessage">,
  sessionId: string,
  paged: boolean,
  cursor?: string,
) {
  const rows = await prisma.chatMessage.findMany({
    where: { streamSessionId: sessionId },
    orderBy: [{ relativeTimeSec: "asc" }, { id: "asc" }],
    take: paged ? REPLAY_PAGE_SIZE + 1 : 50000,
    ...(paged && cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
  });
  const messages = paged ? rows.slice(0, REPLAY_PAGE_SIZE) : rows;
  return {
    messages,
    nextCursor: paged && rows.length > REPLAY_PAGE_SIZE ? messages.at(-1)!.id : null,
  };
}
