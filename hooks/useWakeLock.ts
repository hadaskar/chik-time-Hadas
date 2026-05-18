"use client";

import { useEffect, useRef } from "react";

type WakeLockSentinelType = WakeLockSentinel | null;

export function useWakeLock(enabled: boolean) {
  const wakeLockRef = useRef<WakeLockSentinelType>(null);

  useEffect(() => {
    if (!enabled) {
      releaseWakeLock();
      return;
    }

    async function requestWakeLock() {
      try {
        // ✅ בדוק אם הדף נראה לפני בקשת Wake Lock
        if (
          "wakeLock" in navigator &&
          document.visibilityState === "visible"
        ) {
          wakeLockRef.current =
            await navigator.wakeLock.request("screen");

          console.log("Wake Lock activated");

          wakeLockRef.current.addEventListener(
            "release",
            () => {
              console.log("Wake Lock released");
            }
          );
        }
      } catch (err) {
        console.error(err);
      }
    }

    async function releaseWakeLock() {
      try {
        if (wakeLockRef.current) {
          await wakeLockRef.current.release();
          wakeLockRef.current = null;
        }
      } catch (err) {
        console.error(err);
      }
    }

    requestWakeLock();

    const handleVisibilityChange = async () => {
      if (
        document.visibilityState === "visible" &&
        enabled &&
        !wakeLockRef.current
      ) {
        await requestWakeLock();
      }
    };

    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange
    );

    return () => {
      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange
      );

      releaseWakeLock();
    };
  }, [enabled]);
}