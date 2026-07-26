"""Read the recent chat messages of a Kick channel without API credentials.

Same trick as kick-channel.py: kick.com's endpoints sit behind Cloudflare's
bot check, and streamlink (installed for the recording itself) already carries
the workaround, so its HTTP session is borrowed for one request.

Takes the NUMERIC channel id (kick-channel.py prints it as "id") — the
endpoint does not answer by slug. Prints a single JSON object on stdout:

    {"ok": true, "messages": [{"id": "...", "content": "...", "type":
     "message", "created_at": "2026-07-26T08:20:05Z", "sender": {...}}, ...]}

or {"ok": false, "error": "..."} — never a traceback, so the caller only has
to deal with JSON. Exit code is 0 either way; `ok` is the signal. Messages
come newest-first, exactly as Kick returns them; ordering is the caller's job.
"""

import json
import sys

API_URL = "https://kick.com/api/v2/channels/{channel_id}/messages"
TIMEOUT = 15


def build_session():
    from streamlink import Streamlink
    from streamlink.plugin.api import useragents

    session = Streamlink()

    # The adapter lives in the plugin module and is not public API, so treat it
    # as optional: without it the request usually still works, it just becomes
    # more likely to be challenged.
    try:
        from streamlink.plugins.kick import KickAdapter

        session.http.mount("https://kick.com/", KickAdapter())
    except Exception:
        pass

    return session, useragents.CHROME


def main():
    if len(sys.argv) < 2:
        print(json.dumps({"ok": False, "error": "usage: kick-messages.py <channelId>"}))
        return

    channel_id = sys.argv[1].strip()

    if not channel_id.isdigit():
        print(json.dumps({"ok": False, "error": "channel id must be numeric"}))
        return

    try:
        session, user_agent = build_session()
        response = session.http.get(
            API_URL.format(channel_id=channel_id),
            headers={
                "Accept": "application/json",
                "Accept-Language": "en-US",
                "User-Agent": user_agent,
                "Referer": "https://kick.com/",
            },
            timeout=TIMEOUT,
            raise_for_status=False,
        )

        if response.status_code == 404:
            print(json.dumps({"ok": False, "error": "channel_not_found"}))
            return

        if response.status_code != 200:
            print(json.dumps({"ok": False, "error": f"http_{response.status_code}"}))
            return

        payload = response.json()
    except Exception as error:  # noqa: BLE001 - the caller wants JSON, not a stack
        print(json.dumps({"ok": False, "error": f"{type(error).__name__}: {error}"}))
        return

    messages = (payload.get("data") or {}).get("messages") or []

    print(json.dumps({"ok": True, "messages": messages}, ensure_ascii=False))


if __name__ == "__main__":
    main()
