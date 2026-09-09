/** Collapse bursts of socket events; never overlap refreshes or lose a change
 * received while one is in flight. Hidden tabs defer the work until visible. */
export function createRefreshQueue(refresh: () => void | Promise<void>, visible = () => true) {
  let timer: ReturnType<typeof setTimeout> | undefined;
  let running = false;
  let pending = false;
  let disposed = false;
  const request = () => {
    if (disposed) return;
    pending = true;
    if (timer || running || !visible()) return;
    timer = setTimeout(async () => {
      timer = undefined;
      if (disposed || !visible()) return;
      pending = false;
      running = true;
      try { await refresh(); } catch { /* The caller owns its error state. */ }
      finally {
        running = false;
        if (pending && !disposed) request();
      }
    }, 200);
  };
  return { request, dispose: () => { disposed = true; if (timer) clearTimeout(timer); } };
}
