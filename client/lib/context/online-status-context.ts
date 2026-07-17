import { createContext } from "react";

export interface OnlineStatusContextType {
  isOnline: boolean;
  pendingCount: number;
  isSyncing: boolean;
  /** Manually drain the sync queue. Safe to call even if offline or empty - shows a toast either way. */
  syncNow: () => Promise<void>;
}

export const OnlineStatusContext = createContext<OnlineStatusContextType>({
  isOnline: true,
  pendingCount: 0,
  isSyncing: false,
  syncNow: async () => {},
});
