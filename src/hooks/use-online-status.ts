// src/hooks/use-online-status.ts
"use client";

import { useEffect, useState } from "react";

/**
 * Tracks browser connectivity so the UI can warn the user before an action
 * fails. Falls back to "online" on browsers that don't expose the events.
 */
export function useOnlineStatus(): boolean {
  const [isOnline, setIsOnline] = useState<boolean>(() =>
    typeof navigator !== "undefined" ? navigator.onLine !== false : true
  );

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.addEventListener !== "function") {
      return;
    }

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    // Sync with current state in case connectivity changed before mount.
    setIsOnline(navigator.onLine !== false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return isOnline;
}
