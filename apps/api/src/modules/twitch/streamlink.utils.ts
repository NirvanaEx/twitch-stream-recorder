import { BadRequestException } from "@nestjs/common";
import { spawn } from "node:child_process";

export type StreamlinkCommand = {
  command: string;
  args: string[];
};

let cachedStreamlinkCommandPromise: Promise<StreamlinkCommand> | null = null;

export function resolveStreamlinkCommand() {
  if (!cachedStreamlinkCommandPromise) {
    cachedStreamlinkCommandPromise = detectStreamlinkCommand();
  }

  return cachedStreamlinkCommandPromise;
}

async function detectStreamlinkCommand(): Promise<StreamlinkCommand> {
  const candidates: StreamlinkCommand[] = [
    { command: "streamlink", args: [] },
    { command: "py", args: ["-m", "streamlink"] },
    { command: "python", args: ["-m", "streamlink"] },
    { command: "python3", args: ["-m", "streamlink"] },
  ];

  for (const candidate of candidates) {
    try {
      const versionCheck = spawn(candidate.command, [...candidate.args, "--version"], {
        stdio: "ignore",
      });

      await new Promise<void>((resolvePromise, rejectPromise) => {
        versionCheck.once("exit", (code) => {
          if (code === 0) {
            resolvePromise();
            return;
          }

          rejectPromise(new Error("non-zero exit"));
        });

        versionCheck.once("error", rejectPromise);
      });

      return candidate;
    } catch {
      // Continue to next candidate.
    }
  }

  throw new BadRequestException(
    "Streamlink is not installed. Install it or make `python -m streamlink` available.",
  );
}
