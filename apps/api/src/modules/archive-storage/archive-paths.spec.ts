import assert from "node:assert/strict";
import test from "node:test";
import {
  buildSessionDir,
  formatStamp,
  isUnderDataRoot,
  slugifyTitle,
} from "./archive-paths";

test("keeps a readable title, in any alphabet, out of the filesystem's way", () => {
  assert.equal(slugifyTitle("Прохождение Elden Ring #2"), "Прохождение-Elden-Ring-2");
  assert.equal(slugifyTitle("a/b\\c:d*e?f"), "a-b-c-d-e-f");
  assert.equal(slugifyTitle("  ...  "), "");
  assert.equal(slugifyTitle(null), "");
});

test("never produces a hidden folder or a trailing separator", () => {
  assert.equal(slugifyTitle(".secret"), "secret");
  assert.equal(slugifyTitle("trailing..."), "trailing");
  assert.equal(slugifyTitle("--dashes--"), "dashes");
});

test("caps the title so the path stays inside filesystem limits", () => {
  const slug = slugifyTitle("x".repeat(200));

  assert.equal(slug.length, 60);
  assert.ok(!slug.endsWith("-"));
});

test("groups a session by platform, channel and month", () => {
  const dir = buildSessionDir("/archive", {
    platform: "twitch",
    channelLogin: "skywhywalker",
    startedAt: new Date("2026-08-01T14:30:00.000Z"),
    title: "Ночной стрим",
    sessionId: "clx0000000abcdef",
  });

  assert.equal(
    dir,
    "/archive/twitch/skywhywalker/2026-08/2026-08-01_14-30-00__Ночной-стрим__abcdef",
  );
});

test("two broadcasts starting in the same second get different folders", () => {
  const base = {
    platform: "twitch",
    channelLogin: "strogo",
    startedAt: new Date("2026-08-01T14:30:00.000Z"),
    title: null,
  };

  const first = buildSessionDir("/archive", { ...base, sessionId: "aaaaaaaaaa111111" });
  const second = buildSessionDir("/archive", { ...base, sessionId: "bbbbbbbbbb222222" });

  assert.notEqual(first, second);
});

test("a channel login can never escape the archive root", () => {
  const dir = buildSessionDir("/archive", {
    platform: "../../etc",
    channelLogin: "../../../root",
    startedAt: new Date("2026-08-01T14:30:00.000Z"),
    title: null,
    sessionId: "abcdef",
  });

  assert.ok(dir.startsWith("/archive/"));
  assert.ok(!dir.includes(".."));
});

test("stamps in UTC so a server timezone change cannot rename folders", () => {
  assert.equal(formatStamp(new Date("2026-01-02T03:04:05.000Z")), "2026-01-02_03-04-05");
});

test("tells the local disk apart from the archive tier", (t) => {
  const previous = process.env.DATA_DIR;
  process.env.DATA_DIR = "/data";
  t.after(() => {
    process.env.DATA_DIR = previous;
  });

  assert.equal(isUnderDataRoot("/data/records/strogo/strogo_2026.mp4"), true);
  assert.equal(isUnderDataRoot("/archive/twitch/strogo/2026-08/x/video.mp4"), false);
  // The root itself is not a file inside it, and a sibling with a shared
  // prefix must not read as "inside".
  assert.equal(isUnderDataRoot("/data"), false);
  assert.equal(isUnderDataRoot("/database/records/x.mp4"), false);
});
