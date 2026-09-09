# Player controls — 2026-09-09

Based on deployed/GitHub main `1773c65`.

- Fixed repeated center animations: feedback now has an action sequence instead of a render-time `Date.now()` key.
- Mouse click and single touch tap on the media surface toggle playback. Touch compatibility clicks are suppressed; left/right double taps still seek 5 seconds.
- Feedback is smaller, fades for 450 ms, does not intercept clicks, and does not overlap the initial play button or loading spinner.
- Held toggle shortcuts no longer oscillate playback/modes; repeated seek and volume keys remain supported.
- Swipes/cancelled gestures and a pending tap from a previous source cannot toggle playback.

Validation: production web build (including type/lint checks); player-controls, playback and chat React DOM harnesses passed. The new animation regression test fails on `1773c65` and passes on the fix. Run UI harnesses with `node --import tsx scripts/test-player-controls.cjs` (jsdom available through NODE_PATH, as for the existing UI harnesses).
