import { execFileSync } from "node:child_process";

const root = process.cwd();

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

function getWindowsRoots() {
  const roots = [root];

  try {
    const windowsRoot = execFileSync("wslpath", ["-w", root], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();

    if (windowsRoot) {
      roots.push(windowsRoot);
    }
  } catch {
    // Ignore environments without wslpath.
  }

  return unique(roots);
}

function getWindowsNodePids() {
  const windowsRoots = getWindowsRoots();

  if (!windowsRoots.length) {
    return [];
  }

  const rootMatch = windowsRoots
    .map((value) => `($_.CommandLine -like '*${value.replace(/'/g, "''")}*')`)
    .join(" -or ");

  const script = [
    `$current = ${process.pid}`,
    "$pids = Get-CimInstance Win32_Process |",
    "Where-Object {",
    "  $_.ProcessId -ne $current -and",
    "  $_.CommandLine -and",
    "  $_.Name -eq 'node.exe' -and",
    `  (${rootMatch})`,
    "} | Select-Object -ExpandProperty ProcessId",
    "if ($pids) {",
    "  ($pids | Sort-Object -Unique) -join [Environment]::NewLine",
    "}",
  ].join(" ");

  try {
    const stdout = runCommand(["powershell.exe", "powershell"], ["-NoProfile", "-Command", script], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    });

    return unique(
      stdout
        .split(/\r?\n/)
        .map((line) => Number(line.trim()))
        .filter((value) => Number.isInteger(value) && value > 0),
    );
  } catch {
    return [];
  }
}

function getUnixNodePids() {
  try {
    const stdout = execFileSync("pgrep", ["-f", root], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    });

    return unique(
      stdout
        .split(/\r?\n/)
        .map((line) => Number(line.trim()))
        .filter((value) => Number.isInteger(value) && value > 0 && value !== process.pid),
    );
  } catch {
    return [];
  }
}

function killWindowsPids(pids) {
  for (const pid of pids) {
    try {
      runCommand(["taskkill.exe", "taskkill"], ["/F", "/T", "/PID", String(pid)], {
        stdio: ["ignore", "ignore", "ignore"],
      });
    } catch {
      // Ignore already-exited processes.
    }
  }
}

function killUnixPids(pids) {
  for (const pid of pids) {
    try {
      process.kill(pid, "SIGKILL");
    } catch {
      // Ignore already-exited processes.
    }
  }
}

const windowsPids = getWindowsNodePids();
const unixPids = getUnixNodePids();
const pids = unique([...windowsPids, ...unixPids]);

if (pids.length > 0) {
  console.log(`Stopping existing project dev processes: ${pids.join(", ")}`);
  killWindowsPids(windowsPids);
  killUnixPids(unixPids);
}
