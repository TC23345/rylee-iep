import { redirect } from "next/navigation";
import { monthOf } from "@/lib/dates";
import { userToday } from "@/lib/timezone";

export const dynamic = "force-dynamic";

// The app opens on today's log: the current month's page, which selects today
// when no day is given. The Calendar overview lives at /calendar.
export default async function HomePage() {
  redirect(`/month/${monthOf(await userToday())}`);
}
