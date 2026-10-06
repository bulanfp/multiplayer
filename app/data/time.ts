// Seed timestamps are relative to when the app loads, so "Today" and "Yesterday"
// dividers always read naturally.

/** A time on a past day, e.g. dayAt(1, "10:12") is yesterday at 10:12. */
export function dayAt(daysAgo: number, time: string): string {
  const [hours = 0, minutes = 0] = time.split(":").map(Number);
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  date.setHours(hours, minutes, 0, 0);
  return date.toISOString();
}

/** Minutes before now; use for "today" so seeds never land in the future. */
export function minutesAgo(minutes: number): string {
  return new Date(Date.now() - minutes * 60_000).toISOString();
}

/** A date in the future at 17:00, for due dates. */
export function daysFromNow(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(17, 0, 0, 0);
  return date.toISOString();
}
