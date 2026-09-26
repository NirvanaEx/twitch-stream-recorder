import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

export type MediaTimeline = {
  version: 1;
  captureAnchorMs: number;
  points: Array<{ mediaSec: number; wallClockMs: number }>;
};

export function parseMediaTimeline(raw: string | null | undefined): MediaTimeline | null {
  if (!raw) return null;
  try {
    const value = JSON.parse(raw) as MediaTimeline;
    if (value?.version !== 1 || !Number.isFinite(value.captureAnchorMs) ||
        !Array.isArray(value.points) || !value.points.length || value.points.length > 10000) return null;
    for (let i = 0; i < value.points.length; i++) {
      const p = value.points[i];
      const previous = value.points[i - 1];
      if (!p || !Number.isFinite(p.mediaSec) || !Number.isFinite(p.wallClockMs) ||
          (previous && (p.mediaSec <= previous.mediaSec || p.wallClockMs <= previous.wallClockMs))) return null;
    }
    return value;
  } catch {
    return null;
  }
}

export function measuredMediaStart(timeline: MediaTimeline): Date {
  const first = timeline.points[0];
  return new Date(first.wallClockMs - first.mediaSec * 1000);
}

export const timingJournalPath = (outputPath: string) => `${outputPath}.timing.jsonl`;
const scriptPath = () => resolve(__dirname, "../../../scripts/capture_timing.py");
type PythonCommand = { command: string; args: string[] };
let pythonProbe: Promise<PythonCommand | null> | undefined;

// The reader adapter is deliberately tied to the tested Streamlink version.
// A different installation retains the original recorder and reports that
// timing is unavailable instead of breaking an active capture.
export function resolveTimingPython(): Promise<PythonCommand | null> {
  return pythonProbe ??= (async () => {
    for (const command of ["python3", "python", "py"]) {
      const candidate = { command, args: command === "py" ? ["-3"] : [] };
      try {
        const version = await runPython(candidate, ["-c", "import streamlink; print(streamlink.__version__)"], 10000);
        if (version.trim() === "8.5.0") return candidate;
      } catch { /* Try the next installed runtime. */ }
    }
    return null;
  })();
}

export async function timedCaptureCommand(options: {
  outputPath: string; destination: string; anchorMs: number; url: string; quality: string;
}) {
  const python = await resolveTimingPython();
  if (!python || !existsSync(scriptPath())) return null;
  return {
    command: python.command,
    args: [...python.args, scriptPath(), "capture", "--journal", timingJournalPath(options.outputPath),
      "--anchor-ms", String(options.anchorMs), "--output", options.destination, options.url, options.quality],
  };
}

export async function verifyMediaTimeline(outputPath: string): Promise<MediaTimeline | null> {
  if (!existsSync(timingJournalPath(outputPath))) return null;
  const python = await resolveTimingPython();
  if (!python) return null;
  // One sequential audio-packet pass while the finished recording is local.
  // Never probe the archive mount on a viewer request.
  const raw = await runPython(python, [scriptPath(), "build", "--journal",
    timingJournalPath(outputPath), "--media", outputPath], 15 * 60 * 1000);
  return parseMediaTimeline(raw);
}

function runPython(python: PythonCommand, args: string[], timeoutMs: number) {
  return new Promise<string>((resolvePromise, reject) => {
    const child = spawn(python.command, [...python.args, ...args], { stdio: ["ignore", "pipe", "ignore"] });
    let output = "";
    const timer = setTimeout(() => { child.kill(); reject(new Error("Media clock verification timed out")); }, timeoutMs);
    child.stdout.on("data", (chunk: Buffer) => {
      output += chunk.toString();
      if (output.length > 2_000_000) { child.kill(); reject(new Error("Media clock output is too large")); }
    });
    child.once("error", (error) => { clearTimeout(timer); reject(error); });
    child.once("close", (code) => {
      clearTimeout(timer);
      if (code === 0) resolvePromise(output);
      else reject(new Error(`Media clock process exited with code ${String(code)}`));
    });
  });
}
