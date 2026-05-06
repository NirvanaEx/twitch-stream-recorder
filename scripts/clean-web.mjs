import { rmSync } from "node:fs";

const targetPath = "apps/web/.next";
const maxAttempts = 20;
const retryDelayMs = 500;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRetryable(error) {
  return (
    error &&
    typeof error === "object" &&
    "code" in error &&
    ["EBUSY", "EPERM", "ENOTEMPTY"].includes(String(error.code))
  );
}

for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
  try {
    rmSync(targetPath, { recursive: true, force: true });
    process.exit(0);
  } catch (error) {
    if (!isRetryable(error) || attempt === maxAttempts) {
      throw error;
    }

    console.log(
      `Retrying cleanup for ${targetPath} (${attempt}/${maxAttempts}) because ${String(
        error.code,
      )}...`,
    );
    await sleep(retryDelayMs);
  }
}

