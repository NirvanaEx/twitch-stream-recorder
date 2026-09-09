# Chat history visibility — 2026-09-10

Base: deployed/GitHub `6de8875`.

The user's admin archive was in theater mode. Its history card existed and contained messages, but was behind the theater stage: card z-index 60, stage 100; browser hit-testing at the card header returned the video.

- Place history above the theater stage (120).
- Portal into the active fullscreen element, falling back to body when leaving fullscreen. Preserve search/history state, and keep the card in the viewport on resize.
- Default ChatReplay historySessionId to archiveId so admin archives load previous broadcasts as the public page does. Local file replay remains unchanged.

Validation: chat React DOM harness covers fullscreen entry/exit, retained search, admin history, scrolling and previous-message seek protection. Production web build includes type/lint checks. Server history endpoint for the affected author returned 165 messages across 10 earlier sessions.
