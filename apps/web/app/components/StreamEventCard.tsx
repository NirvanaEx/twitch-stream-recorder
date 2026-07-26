"use client";

import { useEffect, useMemo, useState } from "react";
import { apiGet } from "../lib/api";
import type { ChatCopy } from "../lib/chat-copy";
import { outcomeColor, type ReplayEvent } from "../lib/stream-events";

/**
 * Predictions and polls, replayed where they happened.
 *
 * The card appears at the second it appeared live, its bars grow from the
 * samples taken while it ran, it says "bets closed" the moment it locked, and
 * the winner is revealed only once the streamer actually called it. That last
 * part is the whole reason the status is recomputed from the playback position
 * instead of read off the stored row: the row already knows how it ended, and
 * showing that from the start would give away the result of whatever the
 * viewer is watching — the same reason the category strip is clipped.
 */

type Props = {
  /** API path for the events; omit to render nothing (offline bundle). */
  eventsUrl?: string;
  /** Point the player has reached, on the broadcast timeline. */
  chatTimeSec: number;
  copy: ChatCopy;
  locale: "ru" | "en";
};

// How long a finished card stays up. Twitch keeps the result on screen for a
// moment rather than snapping it away the instant it resolves.
const RESULT_LINGER_SEC = 90;

function formatCount(value: number, locale: "ru" | "en") {
  return value.toLocaleString(locale === "ru" ? "ru-RU" : "en-US");
}

export function StreamEventCard({ eventsUrl, chatTimeSec, copy, locale }: Props) {
  const [events, setEvents] = useState<ReplayEvent[] | null>(null);

  useEffect(() => {
    if (!eventsUrl) return undefined;

    let cancelled = false;
    setEvents(null);

    void (async () => {
      try {
        const response = await apiGet<{ events: ReplayEvent[] }>(eventsUrl);
        if (!cancelled) setEvents(response.events ?? []);
      } catch {
        // A missing extra must never break the chat panel around it.
        if (!cancelled) setEvents([]);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [eventsUrl]);

  const visible = useMemo(() => {
    if (!events?.length) return [];

    // A live recording has no meaningful playback position (the caller passes
    // Infinity), so there is nothing to clip against — show the latest instead
    // of hiding everything for being in the past.
    const live = !Number.isFinite(chatTimeSec);

    const onScreen = events.filter((event) => {
      if (live) return true;
      if (chatTimeSec < event.startedAtSec) return false;
      if (event.endedAtSec === null) return true;
      return chatTimeSec <= event.endedAtSec + RESULT_LINGER_SEC;
    });

    // Newest first, and never more than a couple at once — a stack of cards
    // would push the chat itself off the screen.
    return onScreen.sort((a, b) => b.startedAtSec - a.startedAtSec).slice(0, 2);
  }, [events, chatTimeSec]);

  if (!eventsUrl || visible.length === 0) return null;

  return (
    <div className="stream-events">
      {visible.map((event) => (
        <EventCard
          key={event.id}
          event={event}
          chatTimeSec={chatTimeSec}
          copy={copy}
          locale={locale}
        />
      ))}
    </div>
  );
}

function EventCard({
  event,
  chatTimeSec,
  copy,
  locale,
}: {
  event: ReplayEvent;
  chatTimeSec: number;
  copy: ChatCopy;
  locale: "ru" | "en";
}) {
  // The totals as of now: the last sample at or before the playback position.
  // Before the first sample the card is up but empty, exactly as it was live.
  const sample = useMemo(() => {
    let found: ReplayEvent["samples"][number] | null = null;
    for (const entry of event.samples) {
      if (entry.atSec > chatTimeSec) break;
      found = entry;
    }
    return found;
  }, [event.samples, chatTimeSec]);

  // Recomputed from the clock, not taken from the row — see the note above.
  const phase: "active" | "locked" | "ended" =
    event.endedAtSec !== null && chatTimeSec >= event.endedAtSec
      ? "ended"
      : event.lockedAtSec !== null && chatTimeSec >= event.lockedAtSec
        ? "locked"
        : "active";

  const ended = phase === "ended";
  const cancelled = ended && event.status === "cancelled";
  const isPoll = event.kind === "poll";

  const points = sample?.points ?? event.outcomes.map(() => 0);
  const users = sample?.users ?? event.outcomes.map(() => 0);
  const pool = points.reduce((sum, value) => sum + value, 0);
  const backers = users.reduce((sum, value) => sum + value, 0);

  const statusLabel = cancelled
    ? copy.eventCancelled
    : ended
      ? isPoll
        ? copy.eventPollDone
        : copy.eventResolved
      : phase === "locked"
        ? copy.eventLocked
        : isPoll
          ? copy.eventPoll
          : copy.eventOpen;

  return (
    <div className={`stream-event stream-event--${phase}${cancelled ? " is-cancelled" : ""}`}>
      <div className="stream-event__head">
        <span className={`stream-event__kind stream-event__kind--${event.kind}`}>
          {isPoll ? copy.eventPoll : copy.eventPrediction}
        </span>
        <span className="stream-event__title">{event.title}</span>
        <span className="stream-event__status">{statusLabel}</span>
      </div>

      <div className="stream-event__outcomes">
        {event.outcomes.map((outcome, index) => {
          const value = points[index] ?? 0;
          const share = pool > 0 ? value / pool : 0;
          // Twitch's payout: the whole pool split among the backers of the
          // outcome that wins. Meaningless for a poll, and meaningless before
          // anyone has staked anything.
          const ratio = !isPoll && value > 0 ? pool / value : null;
          const won = ended && !cancelled && event.winningOutcomeId === outcome.id;
          const lost = ended && !cancelled && event.winningOutcomeId !== null && !won;

          return (
            <div
              key={outcome.id}
              className={`stream-event__outcome${won ? " is-won" : ""}${lost ? " is-lost" : ""}`}
            >
              <span
                className="stream-event__fill"
                style={{
                  width: `${Math.round(share * 100)}%`,
                  background: outcomeColor(outcome, index),
                }}
              />
              <span className="stream-event__label">
                {won ? <span className="stream-event__crown">👑</span> : null}
                {outcome.title}
              </span>
              <span className="stream-event__numbers">
                <span className="stream-event__share">{Math.round(share * 100)}%</span>
                <span className="stream-event__count">
                  {formatCount(value, locale)} {isPoll ? copy.eventVotes : copy.eventPoints}
                </span>
                {ratio !== null ? (
                  <span className="stream-event__ratio" title={copy.eventReturn}>
                    ×{ratio.toFixed(2)}
                  </span>
                ) : null}
              </span>
            </div>
          );
        })}
      </div>

      <div className="stream-event__foot">
        {backers > 0 ? <span>{formatCount(backers, locale)} {copy.eventUsers}</span> : null}
        {event.startedAtSec < 0 ? (
          <span className="stream-event__early" title={copy.eventAlreadyOpen}>
            ⏳
          </span>
        ) : null}
      </div>
    </div>
  );
}
