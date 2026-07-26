import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { PassThrough } from "node:stream";
import test from "node:test";
import { EmoteAssetsController } from "./emote-assets.controller";
import { EmoteMirrorService } from "./emote-mirror.service";
import type { EmoteSnapshotPayload } from "./seventv.service";

function withDataDir(run: (service: EmoteMirrorService, emotesDir: string) => void) {
  const previous = process.env.DATA_DIR;
  const root = mkdtempSync(join(tmpdir(), "tsr-emotes-"));
  const emotesDir = join(root, "emotes");
  mkdirSync(emotesDir, { recursive: true });
  process.env.DATA_DIR = root;

  try {
    run(new EmoteMirrorService(), emotesDir);
  } finally {
    if (previous === undefined) delete process.env.DATA_DIR;
    else process.env.DATA_DIR = previous;
    rmSync(root, { recursive: true, force: true });
  }
}

test("resolveFile refuses anything that is not a plain mirrored emote name", () => {
  withDataDir((service, emotesDir) => {
    writeFileSync(join(emotesDir, "01G3WEGZN0000ET2J0MQP5YJ0G.webp"), "image-bytes");

    assert.ok(service.resolveFile("01G3WEGZN0000ET2J0MQP5YJ0G.webp"));

    // The name arrives from a URL, so traversal and absolute paths must not
    // reach the filesystem.
    for (const hostile of [
      "../../../etc/passwd",
      "..%2f..%2fsecret.webp",
      "../records/stream.mp4",
      "a/b.webp",
      "01G3WEGZN0000ET2J0MQP5YJ0G.exe",
      "01G3WEGZN0000ET2J0MQP5YJ0G",
      ".webp",
    ]) {
      assert.equal(service.resolveFile(hostile), null, `should reject ${hostile}`);
    }

    // A well-formed name that simply is not mirrored is a miss, not a path.
    assert.equal(service.resolveFile("01AAAAAAAAAAAAAAAAAAAAAAAA.webp"), null);
  });
});

test("a zero-byte mirror file counts as missing, so the CDN fallback wins", () => {
  withDataDir((service, emotesDir) => {
    writeFileSync(join(emotesDir, "01BBBBBBBBBBBBBBBBBBBBBBBB.webp"), "");
    assert.equal(service.resolveFile("01BBBBBBBBBBBBBBBBBBBBBBBB.webp"), null);
  });
});

test("bundle inlines only the emotes the chat actually uses", () => {
  withDataDir((service, emotesDir) => {
    writeFileSync(join(emotesDir, "01USEDUSEDUSEDUSEDUSEDUSED.webp"), "used-bytes");
    writeFileSync(join(emotesDir, "01UNUSEDUNUSEDUNUSEDUNUSED.webp"), "unused-bytes");

    const payload: EmoteSnapshotPayload = {
      provider: "7tv",
      platform: "kick",
      fetchedAt: "2026-07-27T00:00:00.000Z",
      emotes: [
        {
          id: "01USEDUSEDUSEDUSEDUSEDUSED",
          name: "catJAM",
          url: "https://cdn.7tv.app/emote/01USEDUSEDUSEDUSEDUSEDUSED/2x.webp",
          localUrl: "public/emotes/01USEDUSEDUSEDUSEDUSEDUSED.webp",
          animated: true,
        },
        {
          id: "01UNUSEDUNUSEDUNUSEDUNUSED",
          name: "Sadge",
          url: "https://cdn.7tv.app/emote/01UNUSEDUNUSEDUNUSEDUNUSED/2x.webp",
          localUrl: "public/emotes/01UNUSEDUNUSEDUNUSEDUNUSED.webp",
          animated: false,
        },
      ],
    };

    const bundle = service.buildBundleSnapshot(payload, ["hello catJAM everyone"]);
    const [used, unused] = bundle!.emotes;

    // The used one travels inside the file, so an offline replay needs no net.
    assert.ok(used.localUrl?.startsWith("data:image/webp;base64,"));
    assert.equal(
      Buffer.from(used.localUrl!.split(",")[1], "base64").toString(),
      "used-bytes",
    );

    // The unused one cannot be rendered by this chat, so it stays a link —
    // and the server-relative path is dropped, since an offline bundle could
    // never load it anyway.
    assert.equal(unused.localUrl, undefined);
    assert.equal(unused.url, "https://cdn.7tv.app/emote/01UNUSEDUNUSEDUNUSEDUNUSED/2x.webp");

    // Names survive verbatim: matching is by name against the recorded text.
    assert.equal(used.name, "catJAM");
  });
});

test("bundle keeps a CDN link when the image was never mirrored", () => {
  withDataDir((service) => {
    const payload: EmoteSnapshotPayload = {
      provider: "7tv",
      fetchedAt: "2026-07-27T00:00:00.000Z",
      emotes: [
        {
          id: "01MISSINGMISSINGMISSINGMIS",
          name: "PogChamp",
          url: "https://cdn.7tv.app/emote/01MISSINGMISSINGMISSINGMIS/2x.webp",
          animated: false,
        },
      ],
    };

    const bundle = service.buildBundleSnapshot(payload, ["PogChamp"]);
    assert.equal(bundle!.emotes[0].localUrl, undefined);
    assert.equal(bundle!.emotes[0].url, payload.emotes[0].url);
  });
});

test("the serving endpoint answers with immutable cache headers, or 404s", async () => {
  const previous = process.env.DATA_DIR;
  const root = mkdtempSync(join(tmpdir(), "tsr-emotes-"));
  const emotesDir = join(root, "emotes");
  mkdirSync(emotesDir, { recursive: true });
  process.env.DATA_DIR = root;

  try {
    writeFileSync(join(emotesDir, "01SERVESERVESERVESERVESERV.webp"), "image-bytes");

    const service = new EmoteMirrorService();
    const controller = new EmoteAssetsController(service);

    // A real writable, so the controller's pipe behaves as it does in Nest.
    const sink = new PassThrough();
    const body: Buffer[] = [];
    sink.on("data", (chunk: Buffer) => body.push(chunk));
    const written: Array<[number, Record<string, unknown>]> = [];
    const res = Object.assign(sink, {
      writeHead: (status: number, headers: Record<string, unknown>) => {
        written.push([status, headers]);
      },
    });

    const finished = new Promise((resolveDone) => sink.on("end", resolveDone));
    controller.serveEmote("01SERVESERVESERVESERVESERV.webp", res as never);
    await finished;

    const [status, headers] = written[0];
    assert.equal(status, 200);
    assert.equal(headers["Content-Type"], "image/webp");
    assert.equal(headers["Content-Length"], "image-bytes".length);
    // A 7TV emote id never changes its image, so this may be cached forever.
    assert.match(String(headers["Cache-Control"]), /immutable/);
    assert.equal(Buffer.concat(body).toString(), "image-bytes");

    // Express decodes %2F before the param is bound, so traversal arrives as
    // a plain slash — and is rejected the same way a missing file is.
    for (const hostile of ["../../package.json", "01AAAAAAAAAAAAAAAAAAAAAAAA.webp"]) {
      assert.throws(() => controller.serveEmote(hostile, res as never), /не найден/i);
    }
  } finally {
    if (previous === undefined) delete process.env.DATA_DIR;
    else process.env.DATA_DIR = previous;
    rmSync(root, { recursive: true, force: true });
  }
});

test("an empty or absent snapshot passes through untouched", () => {
  withDataDir((service) => {
    assert.equal(service.buildBundleSnapshot(null, ["anything"]), null);

    const empty: EmoteSnapshotPayload = {
      provider: "7tv",
      fetchedAt: "2026-07-27T00:00:00.000Z",
      emotes: [],
    };
    assert.deepEqual(service.buildBundleSnapshot(empty, ["anything"]), empty);
  });
});
