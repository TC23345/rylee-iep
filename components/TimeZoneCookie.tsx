"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { TIME_ZONE_COOKIE } from "@/lib/dates";

/**
 * Tells the server which timezone this machine runs in, so "today" on the
 * server matches the user's own clock. Refreshes once when it changes.
 */
export function TimeZoneCookie({ current }: { current: string | null }) {
  const router = useRouter();

  useEffect(() => {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (!tz || tz === current) return;
    // IANA names ("America/New_York") are plain cookie-safe characters.
    document.cookie = `${TIME_ZONE_COOKIE}=${tz}; path=/; max-age=31536000; samesite=lax`;
    router.refresh();
  }, [current, router]);

  return null;
}
