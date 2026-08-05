// ============================================================
// A learner's "day" is their LOCAL day, not a UTC day.
//
// toISOString() returns the UTC date. For a learner in Germany
// studying at 00:30 CEST, that is still yesterday in UTC — so
// mixing toISOString() with new Date() makes the two disagree
// by one day for the first two hours after midnight, which
// silently inflates streaks and misdates reviews.
//
// Every date in this app goes through these helpers.
// ============================================================

/** YYYY-MM-DD in the learner's own timezone. */
export function toLocalDate(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Today, in the learner's own timezone. */
export function todayLocal(): string {
  return toLocalDate();
}

/**
 * Parse YYYY-MM-DD as local midnight.
 * new Date("2026-08-05") parses as UTC midnight — this does not.
 */
export function parseLocalDate(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

/** Whole days between two local date strings. */
export function daysBetween(from: string, to: string): number {
  const a = parseLocalDate(from);
  const b = parseLocalDate(to);
  return Math.round((b.getTime() - a.getTime()) / 86_400_000);
}

/** A local date string N days from today. */
export function addDays(days: number, from: Date = new Date()): string {
  const d = new Date(from);
  d.setDate(d.getDate() + days);
  return toLocalDate(d);
}
