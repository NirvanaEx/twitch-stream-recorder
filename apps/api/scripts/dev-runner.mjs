import { spawn } from "node:child_process";
import { resolve } from "node:path";

const cwd = process.cwd();
const tscEntry = resolve(cwd, "../../node_modules/typescript/bin/tsc");

let serverProcess = null;
let restartQueued = false;
let shuttingDown = false;

function log(prefix, chunk) {
  process.stdout.write(`[${prefix}] ${chunk.toString()}`);
}

function killProcess(processRef, signal = "SIGTERM") {
  if (!processRef || processRef.killed) {
    return;
  }

  try {
    processRef.kill(signal);
  } catch {
    // Ignore already stopped processes.
  }
}

function spawnServer() {
  if (shuttingDown) {
    return;
  }

  serverProcess = spawn(process.execPath, [resolve(cwd, "dist/main.js")], {
    cwd,
    env: process.env,
    stdio: ["ignore", "pipe", "pipe"],
  });

  serverProcess.stdout?.on("data", (chunk) => log("api", chunk));
  serverProcess.stderr?.on("data", (chunk) => log("api", chunk));

  serverProcess.once("exit", () => {
    serverProcess = null;

    if (restartQueued && !shuttingDown) {
      restartQueued = false;
      spawnServer();
    }
  });
}

function restartServer() {
  if (shuttingDown) {
    return;
  }

  if (!serverProcess) {
    spawnServer();
    return;
  }

  restartQueued = true;
  killProcess(serverProcess, "SIGTERM");

  setTimeout(() => {
    if (serverProcess) {
      killProcess(serverProcess, "SIGKILL");
    }
  }, 4000);
}

const tscProcess = spawn(
  process.execPath,
  [tscEntry, "-p", "tsconfig.json", "-w", "--preserveWatchOutput", "--pretty", "false"],
  {
    cwd,
    env: process.env,
    stdio: ["ignore", "pipe", "pipe"],
  },
);

let tscBuffer = "";

function handleCompilerOutput(chunk) {
  const text = chunk.toString();
  log("tsc", text);
  tscBuffer += text;

  if (tscBuffer.includes("Found 0 errors. Watching for file changes.")) {
    tscBuffer = "";
    restartServer();
  } else if (tscBuffer.length > 4000) {
    tscBuffer = tscBuffer.slice(-2000);
  }
}

tscProcess.stdout?.on("data", handleCompilerOutput);
tscProcess.stderr?.on("data", (chunk) => log("tsc", chunk));

tscProcess.once("exit", (code) => {
  if (shuttingDown) {
    return;
  }

  process.stderr.write(`[tsc] watcher exited with code ${String(code)}\n`);
  process.exit(code ?? 1);
});

function shutdown() {
  if (shuttingDown) {
    return;
  }

  shuttingDown = true;
  killProcess(serverProcess, "SIGTERM");
  killProcess(tscProcess, "SIGTERM");
  setTimeout(() => process.exit(0), 500);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
