"use client";

import { Wifi, WifiOff, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useOnlineStatus } from "@/hooks/use-online-status";

export function SyncStatusIndicator() {
  const { isOnline, pendingCount, isSyncing, syncNow } = useOnlineStatus();

  return (
    <div className="flex items-center gap-2">
      <div
        className={cn(
          "hidden items-center gap-1.5 rounded-full px-2.5 py-1 text-xs lg:flex",
          isOnline ? "bg-green-600/10 text-green-600" : "bg-yellow-600/10 text-yellow-600",
        )}
      >
        {isOnline ? <Wifi className="h-3.5 w-3.5" /> : <WifiOff className="h-3.5 w-3.5" />}
        <span>{isOnline ? "Online" : "Offline"}</span>
      </div>

      {pendingCount > 0 && (
        <div className="flex items-center gap-1 rounded-full bg-yellow-100 px-2 py-1 text-xs text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
          <span>{pendingCount} pending</span>
        </div>
      )}

      {pendingCount > 0 && (
        <Button
          variant="outline"
          size="icon"
          onClick={syncNow}
          disabled={isSyncing || !isOnline}
          title={isOnline ? "Sync now" : "Cannot sync while offline"}
          className="h-9 w-9 rounded-xl"
          aria-label="Sync pending contact changes"
        >
          <RefreshCw className={cn("h-4 w-4", isSyncing && "animate-spin")} />
        </Button>
      )}
    </div>
  );
}
