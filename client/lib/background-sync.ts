/**
 * Registers a one-off Background Sync request so the browser can wake the
 * service worker and drain the relevant queue even if no tab is open when
 * connectivity returns (Chrome/Edge/Android). Safari and Firefox don't
 * support the Sync API - there the window 'online' listener in
 * OnlineStatusProvider is the only path, which is already wired up.
 */
export function registerBackgroundSync(
  tag: "sync-contacts" | "sync-domains" = "sync-contacts",
): void {
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;
  if (!("SyncManager" in window)) return;

  navigator.serviceWorker.ready
    .then((registration) =>
      (
        registration as unknown as { sync: { register: (tag: string) => Promise<void> } }
      ).sync.register(tag),
    )
    .catch(() => {
      // Registration can race with the SW activating - harmless, the
      // window 'online' listener still covers this case.
    });
}
