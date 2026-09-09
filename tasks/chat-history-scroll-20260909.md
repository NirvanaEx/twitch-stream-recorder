# Chat history and scrolling — 9 September 2026

Based on deployed `1711a79` (6 September: collapse predictions/polls), including
`ff44fd1` (4 September: first-message badges and older-VOD history filtering).
GitHub had only `ff44fd1`; the original server checkout also contained unrelated
uncommitted changes. Work was isolated in the `fix/chat-history-scroll-20260909`
worktree so neither the latest release nor those edits was overwritten.

- Public user cards load that author's messages from the previous ten recorded
  chats of the same channel. Both session dates and message dates must precede
  the opened broadcast by five minutes, matching the userscript's margin.
- Responses contain at most the latest 1000 matching messages and report
  truncation. Cards render 100 rows at a time, search all loaded messages,
  show dates for past broadcasts, and offer retry after a failed request.
- Current-recording messages still respect player time/part offset. Logins are
  matched without case sensitivity. Timestamp buttons seek within the current
  recording; mention buttons can open another author without nested buttons.
- Auto-scroll runs before paint and on list/content resize. Content growth
  alone cannot pause chat; scrolling upward can. The existing 200-row window,
  first-message badges and collapsed event preferences remain in place.

Validation uses Node 22, the Docker runtime version:

```
npm run verify:precommit
npm install --prefix /tmp/stream-chat-test-deps --no-audit --no-fund jsdom@22.1.0
NODE_PATH=/tmp/stream-chat-test-deps/node_modules node --require tsx/cjs scripts/test-chat-ui.cjs
```

158 API tests passed, including author/channel/time isolation, bounded history,
missing dates, and future deletion handling. Web production build and all
workspace type checks passed. The React DOM harness checks content growth,
resize, manual pause/resume, rolling-window eviction, history search, case
matching and seek protection. Read-only verification against real data found
960 earlier messages for the sampled viewer, with no newer messages included.
