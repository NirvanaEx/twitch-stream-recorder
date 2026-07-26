"""Read a Kick channel without any API credentials.

kick.com's own endpoints sit behind Cloudflare's bot check, which a plain HTTP
client cannot pass — but streamlink already ships the workaround (a TLS context
without session tickets plus Chrome headers), and streamlink is installed in
this image anyway because it does the recording. So instead of reimplementing
the trick in Node, we borrow streamlink's HTTP session for one request.

Prints a single JSON object on stdout:

    {"ok": true, "id": 668, "userId": 676, "slug": "xqc", "chatroomId": 668,
     "displayName": "xQc", "avatar": "https://...", "isLive": true,
     "livestreamId": 119125610, "title": "...", "category": "Just Chatting", "viewers": 1234,
     "startedAt": "2026-07-26 09:00:00", "thumbnail": "https://..."}

or {"ok": false, "error": "..."} — never a traceback, so the caller only has to
deal with JSON. Exit code is 0 either way; `ok` is the signal.

This is the fallback path. When KICK_CLIENT_ID/KICK_CLIENT_SECRET are set the
API talks to the documented api.kick.com instead and never runs this script.
"""

import json
import sys

API_URL = "https://kick.com/api/v2/channels/{slug}"
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
        print(json.dumps({"ok": False, "error": "usage: kick-channel.py <slug>"}))
        return

    slug = sys.argv[1].strip().lower()

    try:
        session, user_agent = build_session()
        response = session.http.get(
            API_URL.format(slug=slug),
            headers={
                "Accept": "application/json",
                "Accept-Language": "en-US",
                "User-Agent": user_agent,
                "Referer": f"https://kick.com/{slug}",
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

    user = payload.get("user") or {}
    chatroom = payload.get("chatroom") or {}
    livestream = payload.get("livestream") or None
    categories = (livestream or {}).get("categories") or []

    print(
        json.dumps(
            {
                "ok": True,
                "id": payload.get("id"),
                "userId": payload.get("user_id"),
                "slug": payload.get("slug") or slug,
                "chatroomId": chatroom.get("id"),
                "displayName": user.get("username") or payload.get("slug") or slug,
                "avatar": user.get("profile_pic"),
                "isLive": bool(livestream and livestream.get("is_live")),
                "livestreamId": (livestream or {}).get("id"),
                "title": (livestream or {}).get("session_title"),
                "category": (categories[0] or {}).get("name") if categories else None,
                # Kick has used both spellings for this field; take whichever
                # is present so the viewer graph is not silently empty.
                "viewers": (livestream or {}).get("viewer_count")
                if (livestream or {}).get("viewer_count") is not None
                else (livestream or {}).get("viewers"),
                "startedAt": (livestream or {}).get("start_time"),
                "thumbnail": ((livestream or {}).get("thumbnail") or {}).get("url")
                if isinstance((livestream or {}).get("thumbnail"), dict)
                else (livestream or {}).get("thumbnail"),
            },
            ensure_ascii=False,
        )
    )


if __name__ == "__main__":
    main()
