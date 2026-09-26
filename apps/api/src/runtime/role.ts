/** Only the recorder owns capture, recovery, uploads and maintenance. */
export type RuntimeRole = "api" | "recorder" | "standalone";

export function runtimeRole(env: NodeJS.ProcessEnv = process.env): RuntimeRole {
  const role = env.TSR_ROLE ?? (env.NODE_ENV === "production" ? "" : "standalone");
  if (role !== "api" && role !== "recorder" && role !== "standalone") {
    throw new Error("Set TSR_ROLE explicitly to api or recorder in production.");
  }
  return role;
}

export function ownsBackgroundJobs(): boolean {
  return runtimeRole() !== "api";
}

export function requireRecorder(): void {
  if (!ownsBackgroundJobs()) throw new Error("This operation belongs to the recorder service.");
}

export function recorderOrigin(): URL {
  const url = new URL(process.env.TSR_RECORDER_URL ?? "http://twitch-recorder-api:3001");
  if (url.protocol !== "http:" || url.username || url.password || url.pathname !== "/" || url.search || url.hash) {
    throw new Error("TSR_RECORDER_URL must be an internal HTTP origin without credentials or a path.");
  }
  return url;
}
