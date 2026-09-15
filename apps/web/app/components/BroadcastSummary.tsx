"use client";
import type { BroadcastInfo } from "../lib/playback-sources";
import { useLanguage } from "../providers";
import { useSpoiler } from "../lib/spoiler";
import { formatSeconds } from "../lib/media";

export function BroadcastSummary({ broadcast, admin = false, current }: { broadcast?: BroadcastInfo | null; admin?: boolean; current?: number }) {
  const { locale } = useLanguage();
  const { spoilerFree } = useSpoiler();
  if (!broadcast) return null;
  const ru = locale === "ru";
  return <details className="broadcast-summary" id="continuations">
    <summary>{ru ? "Единая запись эфира" : "Combined broadcast"} · {ru ? "частей" : "recordings"}: {broadcast.memberCount}{current ? ` · ${ru ? "сейчас" : "playing"} ${current}` : ""}</summary>
    {broadcast.incomplete ? <p>{ru ? "Некоторые продолжения сейчас недоступны. Сохранённые части доступны для просмотра." : "Some recordings are unavailable. Saved parts can still be played."}</p> : null}
    {broadcast.gapSec > 1 ? <p>{ru ? "Перерывы захвата пропускаются при воспроизведении; чат синхронизируется с каждой записью." : "Capture gaps are skipped during playback; chat follows each recording."}</p> : null}
    <ol>{broadcast.members.map((member, index) => <li key={member.id}>
      <a href={`${admin ? "/admin/archives" : "/watch"}/${member.id}?single=1`}>{ru ? "Открыть отдельно" : "Open separately"}: {index + 1}</a>
      {!spoilerFree ? <span> · {formatSeconds(member.durationSec)}</span> : null}
      {member.gapBeforeSec > 1 ? <span> · {ru ? "перерыв" : "gap"} {formatSeconds(member.gapBeforeSec)}</span> : null}
      {!member.available ? <span> · {ru ? "недоступно" : "unavailable"}</span> : null}
    </li>)}</ol>
  </details>;
}
