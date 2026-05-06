const apiBaseUrl = process.env.SMOKE_API_URL ?? "http://localhost:3001/api";
const webBaseUrl = process.env.SMOKE_WEB_URL ?? "http://localhost:3000";
const hasTwitchCredentials = Boolean(
  process.env.TWITCH_CLIENT_ID?.trim() && process.env.TWITCH_CLIENT_SECRET?.trim(),
);

async function waitFor(url, timeoutMs = 45_000) {
  const startedAt = Date.now();
  let lastError = "unknown error";

  while (Date.now() - startedAt < timeoutMs) {
    try {
      const response = await fetch(url, { redirect: "manual" });

      if (response.ok) {
        return response;
      }

      lastError = `HTTP ${response.status}`;
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error);
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  throw new Error(`Timed out waiting for ${url}: ${lastError}`);
}

async function expectJson(url, init, assertion) {
  const response = await fetch(url, init);
  const text = await response.text();

  if (!response.ok) {
    throw new Error(`Request failed ${response.status} for ${url}: ${text}`);
  }

  const data = text ? JSON.parse(text) : null;
  assertion(data);
  return data;
}

async function expectHtml(url, marker) {
  const response = await fetch(url);
  const html = await response.text();

  if (!response.ok) {
    throw new Error(`Page failed ${response.status} for ${url}`);
  }

  if (!html.includes(marker)) {
    throw new Error(`Expected marker "${marker}" not found in ${url}`);
  }
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function run() {
  console.log("Waiting for API and web...");
  await waitFor(`${apiBaseUrl}/health`);
  await waitFor(webBaseUrl);

  console.log("Checking API routes...");
  await expectJson(`${apiBaseUrl}/health`, undefined, (data) => {
    assert(data?.ok === true, "Health endpoint did not return ok=true");
  });

  const settingsBefore = await expectJson(`${apiBaseUrl}/settings`, undefined, (data) => {
    assert(typeof data?.retentionDays === "number", "Settings payload is invalid");
  });

  await expectJson(`${apiBaseUrl}/channels`, undefined, (data) => {
    assert(Array.isArray(data?.items), "Channels payload must contain items array");
  });

  await expectJson(`${apiBaseUrl}/dashboard`, undefined, (data) => {
    assert(typeof data?.trackedChannels === "number", "Dashboard payload is invalid");
  });

  await expectJson(`${apiBaseUrl}/archives`, undefined, (data) => {
    assert(Array.isArray(data?.items), "Archives payload must contain items array");
  });

  const updatedSettings = await expectJson(
    `${apiBaseUrl}/settings`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...settingsBefore,
        defaultChatOffsetSec: settingsBefore.defaultChatOffsetSec + 1,
      }),
    },
    (data) => {
      assert(
        data?.defaultChatOffsetSec === settingsBefore.defaultChatOffsetSec + 1,
        "Settings update did not persist",
      );
    },
  );

  await expectJson(
    `${apiBaseUrl}/settings`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(settingsBefore),
    },
    (data) => {
      assert(
        data?.defaultChatOffsetSec === settingsBefore.defaultChatOffsetSec,
        "Settings rollback did not persist",
      );
    },
  );

  let twitchValidated = false;

  if (hasTwitchCredentials) {
    const createdChannel = await expectJson(
      `${apiBaseUrl}/channels`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          channel: "twitchdev",
        }),
      },
      (data) => {
        assert(data?.item?.id, "Channel creation did not return item.id");
        assert(data?.item?.twitchLogin === "twitchdev", "Channel creation returned wrong login");
      },
    );

    twitchValidated = true;

    await expectJson(
      `${apiBaseUrl}/channels/${createdChannel.item.id}/sync`,
      {
        method: "POST",
      },
      (data) => {
        assert(data?.item?.id === createdChannel.item.id, "Channel sync returned wrong item");
      },
    );

    await expectJson(
      `${apiBaseUrl}/channels/${createdChannel.item.id}`,
      {
        method: "DELETE",
      },
      (data) => {
        assert(data?.ok === true, "Channel delete did not return ok=true");
      },
    );
  }

  console.log("Checking web pages...");
  await expectHtml(webBaseUrl, "Recorder");
  await expectHtml(`${webBaseUrl}/channels`, "skywhywalker");
  await expectHtml(`${webBaseUrl}/archives`, "Архивы");
  await expectHtml(`${webBaseUrl}/settings`, "Настройки");

  console.log(
    JSON.stringify(
      {
        ok: true,
        apiBaseUrl,
        webBaseUrl,
        settingsVerified: updatedSettings.defaultChatOffsetSec,
        twitchValidated,
      },
      null,
      2,
    ),
  );
}

run().catch((error) => {
  console.error(error instanceof Error ? error.stack ?? error.message : String(error));
  process.exit(1);
});
