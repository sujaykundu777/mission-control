"use client";

import { ReactNode, useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { toast } from "sonner";
import { OnlineStatusContext } from "@/lib/context/online-status-context";
import { getSyncQueue, getDomainSyncQueue } from "@/lib/indexeddb";
import { syncAllPending } from "@/lib/sync";

interface OnlineStatusProviderProps {
  children: ReactNode;
}

// Subscribe to the browser's connectivity via useSyncExternalStore instead of
// mirroring navigator.onLine into state from an effect - that pattern triggers
// cascading renders. The server snapshot is `true` to keep hydration stable.
function subscribeOnlineStatus(onChange: () => void) {
  window.addEventListener("online", onChange);
  window.addEventListener("offline", onChange);
  return () => {
    window.removeEventListener("online", onChange);
    window.removeEventListener("offline", onChange);
  };
}

export function OnlineStatusProvider({ children }: OnlineStatusProviderProps) {
  const isOnline = useSyncExternalStore(
    subscribeOnlineStatus,
    () => navigator.onLine,
    () => true,
  );
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const isSyncingRef = useRef(false);

  const refreshPendingCount = useCallback(async () => {
    try {
      const [contactQueue, domainQueue] = await Promise.all([getSyncQueue(), getDomainSyncQueue()]);
      setPendingCount(contactQueue.length + domainQueue.length);
    } catch {
      // IndexedDB not ready yet - next poll will pick it up
    }
  }, []);

  // Silent when there's nothing to do - used for the automatic online event
  // and the on-mount catch-up. Guards against overlapping runs (e.g. a
  // manual click while the auto-sync from a reconnect is still in flight).
  const runSync = useCallback(async () => {
    if (isSyncingRef.current) return;
    isSyncingRef.current = true;
    setIsSyncing(true);

    try {
      const result = await syncAllPending();
      await refreshPendingCount();

      if (result.synced > 0) {
        toast.success(`Synced ${result.synced} item${result.synced > 1 ? "s" : ""}`);
      }
      if (result.failed > 0) {
        toast.error(
          `Failed to sync ${result.failed} item${result.failed > 1 ? "s" : ""}. Will retry automatically.`,
        );
      }
    } catch {
      // Network dropped again mid-sync - next 'online' event or poll retries.
    } finally {
      isSyncingRef.current = false;
      setIsSyncing(false);
    }
  }, [refreshPendingCount]);

  // Manual trigger (e.g. a "Sync now" button) - talks back even when there's
  // nothing to sync, since a person clicking it wants feedback either way.
  const syncNow = useCallback(async () => {
    if (!navigator.onLine) {
      toast.error("Cannot sync while offline");
      return;
    }
    if (pendingCount === 0) {
      toast("Already synced - no pending changes");
      return;
    }
    await runSync();
  }, [pendingCount, runSync]);

  useEffect(() => {
    // Reconnecting is a good moment to flush anything queued while offline.
    const handleOnline = () => runSync();
    window.addEventListener("online", handleOnline);

    // The service worker posts this when its 'sync' event fires (Background
    // Sync API) - covers reconnects that happen without this tab seeing a
    // window 'online' event, e.g. it was reloaded while still offline.
    const handleServiceWorkerMessage = (event: MessageEvent) => {
      if (event.data?.type === "SYNC_QUEUES") runSync();
    };
    navigator.serviceWorker?.addEventListener?.("message", handleServiceWorkerMessage);

    // Defer the on-mount kick to a microtask so the effect body itself stays
    // free of synchronous state updates (react-hooks/set-state-in-effect); the
    // work is async anyway (IndexedDB reads / network), so nothing is lost.
    queueMicrotask(() => {
      refreshPendingCount();
      // Catch up on anything left in the queue from a previous session.
      if (navigator.onLine) runSync();
    });

    const interval = setInterval(refreshPendingCount, 5000);

    return () => {
      window.removeEventListener("online", handleOnline);
      navigator.serviceWorker?.removeEventListener?.("message", handleServiceWorkerMessage);
      clearInterval(interval);
    };
  }, [refreshPendingCount, runSync]);

  return (
    <OnlineStatusContext.Provider value={{ isOnline, pendingCount, isSyncing, syncNow }}>
      {children}
    </OnlineStatusContext.Provider>
  );
}
