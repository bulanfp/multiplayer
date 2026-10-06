// Dates and times shown across the app. English (UK) formats, 24-hour clock.

const TIME = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit" });
const DAY = new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long" });
const SHORT_DATE = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short" });
const WEEKDAY_DATE = new Intl.DateTimeFormat("en-GB", {
  weekday: "short",
  day: "numeric",
  month: "short"
});

function startOfDay(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

/** Whole days between the date and today: 0 today, 1 yesterday, -1 tomorrow. */
function daysAgo(iso: string): number {
  return Math.round((startOfDay(new Date()) - startOfDay(new Date(iso))) / 86_400_000);
}

export function formatTime(iso: string): string {
  return TIME.format(new Date(iso));
}

export function isSameDay(a: string, b: string): boolean {
  return startOfDay(new Date(a)) === startOfDay(new Date(b));
}

/** Day divider label in a thread. */
export function formatDayLabel(iso: string): string {
  const diff = daysAgo(iso);
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  return DAY.format(new Date(iso));
}

/** Compact timestamp for lists: "10:05", "Yesterday", "5 Oct". */
export function formatShortTimestamp(iso: string): string {
  const diff = daysAgo(iso);
  if (diff === 0) return formatTime(iso);
  if (diff === 1) return "Yesterday";
  return SHORT_DATE.format(new Date(iso));
}

/** "today at 10:05", "yesterday at 16:31", "5 Oct at 09:00". */
export function formatTimestamp(iso: string): string {
  const diff = daysAgo(iso);
  const time = formatTime(iso);
  if (diff === 0) return `today at ${time}`;
  if (diff === 1) return `yesterday at ${time}`;
  return `${SHORT_DATE.format(new Date(iso))} at ${time}`;
}

/** "6 Oct 2026" style date for invites. */
export function formatDate(iso: string): string {
  const diff = daysAgo(iso);
  if (diff === 0) return "today";
  if (diff === 1) return "yesterday";
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric"
  }).format(new Date(iso));
}

export function formatDue(iso: string): { label: string; isOverdue: boolean } {
  const diff = daysAgo(iso);
  if (diff > 0) return { label: "Overdue", isOverdue: true };
  if (diff === 0) return { label: "Due today", isOverdue: false };
  if (diff === -1) return { label: "Due tomorrow", isOverdue: false };
  return { label: `Due ${WEEKDAY_DATE.format(new Date(iso))}`, isOverdue: false };
}
