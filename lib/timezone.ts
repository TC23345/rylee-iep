import "server-only";

import { cookies } from "next/headers";
import { DEFAULT_TIME_ZONE, TIME_ZONE_COOKIE, todayIso } from "@/lib/dates";

function isTimeZone(tz: string): boolean {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

/** The raw cookie value, for TimeZoneCookie to compare against. */
export async function timeZoneCookie(): Promise<string | null> {
  return (await cookies()).get(TIME_ZONE_COOKIE)?.value ?? null;
}

/** The signed-in browser's timezone, from the cookie TimeZoneCookie sets. */
export async function userTimeZone(): Promise<string> {
  const tz = await timeZoneCookie();
  return tz && isTimeZone(tz) ? tz : DEFAULT_TIME_ZONE;
}

/** Today's date on the user's machine, as the server sees it. */
export async function userToday(): Promise<string> {
  return todayIso(new Date(), await userTimeZone());
}
