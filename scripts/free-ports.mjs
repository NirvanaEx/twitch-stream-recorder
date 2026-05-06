import { execFileSync } from "node:child_process";

const ports = process.argv
  .slice(2)
  .map((value) => Number(value))
  .filter((value) => Number.isInteger(value) && value > 0);

if (ports.length === 0) {
  process.exit(0);
}

function unique(values) {
  return [...new Set(values)];
}

function runCommand(candidates, args, options = {}) {
  for (const candidate of candidates) {
    try {
      return execFileSync(candidate, args, options);
    } catch (error) {
      if (error?.code === "ENOENT") {
        continue;
      }
    }
  }

  throw new Error(`No executable found for ${candidates.join(", ")}`);
}

function getPidsOnWindows(targetPorts) {
  const command = [
    "-NoProfile",
    "-Command",
    `Get-NetTCPConnection -State Listen -LocalPort ${targetPorts.join(
      ",",
    )} -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess`,
  ];

  let stdout = "";

  try {
    stdout = runCommand(["powershell.exe", "powershell"], command, {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    });
  } catch {
    return [];
  }

  return unique(
    stdout
      .split(/\r?\n/)
      .map((line) => Number(line.trim()))
      .filter((value) => Number.isInteger(value) && value > 0),
  );
}

function getPidsOnUnix(targetPorts) {
  const collected = [];

  for (const port of targetPorts) {
    try {
      const stdout = execFileSync("lsof", ["-ti", `tcp:${port}`], {
        encoding: "utf8",
        stdio: ["ignore", "pipe", "ignore"],
      });

      collected.push(
        ...stdout
          .split(/\r?\n/)
          .map((line) => Number(line.trim()))
          .filter((value) => Number.isInteger(value) && value > 0),
      );
    } catch {
      // Ignore ports without listeners.
    }
  }

  return unique(collected);
}

function killPids(pids) {
  for (const pid of pids) {
    try {
      process.kill(pid, "SIGKILL");
    } catch {
      // Ignore already-exited processes.
    }
  }
}

function killWindowsPids(pids) {
  for (const pid of pids) {
    try {
      runCommand(["taskkill.exe", "taskkill"], ["/F", "/PID", String(pid)], {
        stdio: ["ignore", "ignore", "ignore"],
      });
    } catch {
      // Ignore already-exited processes.
    }
  }
}

const windowsPids = getPidsOnWindows(ports);
const unixPids = getPidsOnUnix(ports);
const pids = unique([...windowsPids, ...unixPids]);

if (pids.length > 0) {
  console.log(`Freeing ports ${ports.join(", ")} by stopping PIDs: ${pids.join(", ")}`);
  killWindowsPids(windowsPids);
  killPids(unixPids);
}
