/** Runs in Twitch's page world; only the native VOD-chat reducer is wrapped.
 * Verified against Twitch's publicly served chat-video bundle, 2026-09-15.
 * No player API, video.currentTime assignment, network, or account data.
 */
// Keep page-world code as a literal: function.toString() can capture TypeScript
// bundler helpers that do not exist in Twitch's JavaScript context.
const NATIVE_CHAT_BRIDGE = String.raw`(function () {
  const root = document.documentElement;
  if (root.hasAttribute("data-tsr-native-chat-bridge")) return;
  root.setAttribute("data-tsr-native-chat-bridge", "1");
  const TIME = "vodChat.video.CURRENT_VIDEO_TIME_CHANGED";
  const EVENT = "tsr-native-chat-update";
  let runtime = null;
  let store = null;
  let original = null;
  let wrapped = null;
  let binding = null;
  let applied = 0;
  let lastSearch = 0;

  function status(value) { root.setAttribute("data-tsr-native-chat-status", value); }
  function desired() {
    if (!/^\/videos\/\d+/.test(location.pathname) || root.getAttribute("data-tsr-native-chat-mode") !== "twitch") return 0;
    const value = Number(root.getAttribute("data-tsr-native-chat-offset"));
    return Number.isFinite(value) ? Math.max(-3600, Math.min(3600, value)) : 0;
  }
  function videoTime() {
    const video = document.querySelector("video");
    return video && Number.isFinite(video.currentTime) ? video.currentTime : null;
  }
  function refresh() {
    const time = videoTime();
    if (time !== null) store.dispatch({ type: TIME, updatedTime: time });
  }
  function restore() {
    if (binding) binding.active = false;
    if (store && wrapped && store.reducers.vodChat === wrapped) {
      store.reducers.vodChat = original;
      refresh();
    }
    original = wrapped = null;
    binding = null;
    applied = 0;
  }
  function findStore() {
    if (store?.reducers?.vodChat) return true;
    const now = Date.now();
    if (now - lastSearch < 1500) return false;
    lastSearch = now;
    if (!runtime) {
      const chunks = window.webpackChunktwitch_twilight;
      if (!Array.isArray(chunks) || chunks.push === Array.prototype.push) return false;
      const token = "tsr-native-chat-" + now;
      chunks.push([[token], {}, (require) => { runtime = require; }]);
    }
    if (!runtime?.m) return false;
    // Find the already initialized store module by its signature, not a
    // numeric webpack id that changes with Twitch deployments.
    for (const id of Object.keys(runtime.m)) {
      const source = Function.prototype.toString.call(runtime.m[id]);
      if (!source.includes("Reducer already registered:") || !source.includes("getReduxStore")) continue;
      const exports = runtime(id);
      for (const key of Object.keys(exports)) {
        const candidate = exports[key]?.store;
        if (candidate?.reducers && typeof candidate.dispatch === "function" && typeof candidate.getReduxStore === "function") {
          store = candidate;
          return typeof store.reducers.vodChat === "function";
        }
      }
    }
    return false;
  }
  function sync() {
    try {
      const offset = desired();
      if (!offset) { restore(); status("idle"); return; }
      if (!findStore()) { status("waiting"); return; }
      // Another integration may replace the reducer. Do not wrap its wrapper
      // again, which could apply our offset twice or cause recursion.
      if (wrapped && store.reducers.vodChat !== wrapped) { status("unavailable"); return; }
      if (!wrapped) {
        const previous = original = store.reducers.vodChat;
        const current = binding = { active: true };
        // Pass adjusted time only to this reducer. Every other part of Twitch
        // keeps receiving the untouched action and player clock.
        wrapped = function (state, action) {
          if (current.active && action?.type === TIME && Number.isFinite(action.updatedTime)) {
            return previous(state, { ...action, updatedTime: Math.max(0, action.updatedTime + desired()) });
          }
          return previous(state, action);
        };
        store.reducers.vodChat = wrapped;
      }
      if (applied !== offset) { applied = offset; refresh(); }
      status("ready");
    } catch {
      restore(); status("unavailable");
    }
  }
  window.addEventListener(EVENT, sync);
  window.addEventListener("pagehide", restore);
  setInterval(sync, 1500);
  sync();
})();`;

export function buildTwitchNativeChatBridge() {
  return NATIVE_CHAT_BRIDGE;
}
