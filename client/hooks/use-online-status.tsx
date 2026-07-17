import { useContext } from "react";
import { OnlineStatusContext } from "@/lib/context/online-status-context";

export function useOnlineStatus() {
  const context = useContext(OnlineStatusContext);

  if (!context) {
    throw new Error(
      "ContextProvider Missing: useOnlineStatus must be used within OnlineStatusProvider",
    );
  }

  return context;
}
