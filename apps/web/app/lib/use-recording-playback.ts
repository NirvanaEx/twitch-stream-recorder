"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { clearResume, readResume, saveResume } from "./resume";
import { locatePlaybackTime, type PlaybackChoice, type PlaybackStart, type RecordingPlayback } from "./playback-sources";

export function useRecordingPlayback(id: string, data: RecordingPlayback | null, mediaUrl: (url?: string | null) => string, single = false) {
  const [videoElement, setVideoElement] = useState<HTMLMediaElement | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [partState, setCurrentPart] = useState(0);
  const [revision, setRevision] = useState(0);
  const startRef = useRef<{ part: number; playback: PlaybackStart } | null>(null);
  const chosenRef = useRef<PlaybackChoice | undefined>(undefined);
  const switchingRef = useRef<{ absolute: number; play: boolean; rate: number; volume: number; muted: boolean } | null>(null);
  const layoutRef = useRef<{ signature: string; url: string } | null>(null);
  const identity = `${id}:${single ? "single" : "broadcast"}`;
  const [archiveId, setArchiveId] = useState(identity);
  if (archiveId !== identity) {
    setArchiveId(identity); setSelected(null); setCurrentPart(0); setRevision(0);
    startRef.current = null; chosenRef.current = undefined; switchingRef.current = null; layoutRef.current = null;
  }
  if (data?.id !== id) data = null;
  const resumeId = data?.broadcast ? `broadcast:${data.broadcast.id}` : id;
  const choices = data?.playbackSources ?? [];
  if (!chosenRef.current && choices.length) chosenRef.current = choices[0];
  // A background upload finishing must not switch a viewer's source mid-play.
  const choice = choices.find((item) => item.source === (selected ?? chosenRef.current?.source)) ?? chosenRef.current;
  const parts = choice?.parts ?? data?.parts ?? [];
  const selectedSource = choice?.source ?? "auto";
  if (data && !startRef.current) {
    const groupSaved = data.broadcast ? readResume(resumeId) : null;
    const saved = groupSaved ?? readResume(id);
    const oldMember = data.broadcast?.members.find((member) => member.id === id);
    // Old resume entries only have a part/time pair. Use the known Telegram
    // partition when available; new entries persist absolute recording time.
    const oldParts = saved?.source ? choices.find((item) => item.source === saved.source)?.parts : parts.length ? parts : choices.find((item) => item.source === "telegram")?.parts;
    const legacyParts = data.broadcast && !groupSaved ? (oldParts ?? []).filter((part) => part.sessionId === id) : oldParts;
    const localTime = saved?.absoluteTime ?? ((legacyParts?.[(saved?.part ?? 1) - 1]?.sessionOffsetSec ?? legacyParts?.[(saved?.part ?? 1) - 1]?.startOffsetSec ?? 0) + (saved?.time ?? 0));
    const absolute = localTime + (saved && !groupSaved ? oldMember?.startOffsetSec ?? 0 : 0);
    const position = locatePlaybackTime(parts, absolute);
    startRef.current = { part: position.part, playback: { time: position.time, play: false, rate: 1 } };
  }
  const currentPart = Math.max(1, Math.min(partState || startRef.current?.part || 1, parts.length || 1));
  const activePart = parts[currentPart - 1] ?? null;
  const activeSource = activePart?.source ?? choice?.source ?? data?.videoSource ?? null;
  const videoSrc = mediaUrl(activePart?.streamUrl ?? choice?.videoUrl ?? data?.videoUrl);
  const signature = parts.map((part) => part.streamUrl).join("|") || videoSrc;
  // A newly finished continuation may expand an open single recording into a
  // broadcast. Capture its position before React changes the media src.
  if (layoutRef.current && signature !== layoutRef.current.signature && !switchingRef.current && videoElement && videoElement.readyState >= 1) {
    const index = parts.findIndex((part) => mediaUrl(part.streamUrl) === layoutRef.current!.url);
    if (index >= 0) {
      const settings = { play: !videoElement.paused, rate: videoElement.playbackRate, volume: videoElement.volume, muted: videoElement.muted };
      startRef.current = { part: index + 1, playback: { time: videoElement.currentTime, ...settings } };
      switchingRef.current = { absolute: parts[index].startOffsetSec + videoElement.currentTime, ...settings };
      setCurrentPart(index + 1); setRevision((value) => value + 1);
    }
  }
  layoutRef.current = data ? { signature, url: videoSrc } : null;
  const playlist = useMemo(() => parts.length && parts.every((part) => (part.durationSec ?? 0) > 0)
    ? parts.map((part) => ({ src: mediaUrl(part.streamUrl), durationSec: part.durationSec!, startOffsetSec: part.startOffsetSec })) : null, [parts, mediaUrl]);

  const changeSource = useCallback((source: string) => {
    const next = choices.find((item) => item.source === source);
    if (!next || source === selectedSource) return;
    const previous = startRef.current?.playback;
    const transition = switchingRef.current ?? {
      absolute: (activePart?.startOffsetSec ?? 0) + (videoElement?.currentTime ?? previous?.time ?? 0),
      play: videoElement ? !videoElement.paused : previous?.play ?? false,
      rate: videoElement?.playbackRate ?? 1, volume: videoElement?.volume ?? 1, muted: videoElement?.muted ?? false,
    };
    const { absolute, ...settings } = transition;
    switchingRef.current = transition;
    const position = locatePlaybackTime(next.parts, absolute);
    if (absolute >= 10) saveResume(resumeId, position.part, position.time, absolute, source);
    startRef.current = {
      part: position.part,
      playback: { time: position.time, ...settings },
    };
    setCurrentPart(position.part);
    chosenRef.current = next;
    setSelected(source);
    setRevision((value) => value + 1);
  }, [resumeId, choices, selectedSource, activePart, videoElement]);

  useEffect(() => {
    if (!videoElement || !videoSrc) return;
    const loaded = () => {
      if (videoElement.currentSrc === new URL(videoSrc, window.location.href).href) switchingRef.current = null;
    };
    videoElement.addEventListener("loadedmetadata", loaded);
    if (videoElement.readyState >= 1) loaded();
    return () => videoElement.removeEventListener("loadedmetadata", loaded);
  }, [videoElement, videoSrc]);

  useEffect(() => {
    if (!videoElement || !data) return;
    let lastSaved = 0;
    const save = () => {
      const time = videoElement.currentTime;
      const absoluteTime = (activePart?.startOffsetSec ?? 0) + time;
      if (switchingRef.current || videoElement.readyState < 1 || !Number.isFinite(time) || absoluteTime < 10) return;
      if (currentPart >= parts.length && Number.isFinite(videoElement.duration) && videoElement.duration - time < 60) {
        clearResume(resumeId);
      } else saveResume(resumeId, currentPart, time, absoluteTime, selectedSource);
    };
    const onTime = () => { if (Date.now() - lastSaved >= 5000) { lastSaved = Date.now(); save(); } };
    videoElement.addEventListener("timeupdate", onTime);
    videoElement.addEventListener("pause", save);
    return () => { videoElement.removeEventListener("timeupdate", onTime); videoElement.removeEventListener("pause", save); };
  }, [videoElement, resumeId, data, activePart, currentPart, parts.length, selectedSource]);

  return { videoElement, setVideoElement, currentPart, setCurrentPart, parts, activePart, activeSource, videoSrc, playlist,
    selectedSource, changeSource, playbackKey: `${identity}:${selectedSource}:${revision}`,
    initialSegment: startRef.current?.part ?? 1, initialPlayback: startRef.current?.playback };
}
