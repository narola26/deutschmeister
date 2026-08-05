import type { Stars, CertificateTier, Level } from "./types";

// ============================================================
// The star economy. Every rule in the blueprint lives here.
// ============================================================

export const POINTS = {
  taskCompleted: 10,
  perStar: 15,
  fullSession: 25,
  weeklyStreak: 100,
  repairCleared: 40,
  levelTestPerfect: 500,
} as const;

/** A task scored below 2 stars comes back in the repair queue. */
export const REPAIR_THRESHOLD: Stars = 2;

/**
 * Score (0.0 - 1.0) to stars.
 * Under 50% is a failure you still get credit for attempting.
 */
export function starsFromScore(score: number): Stars {
  if (score >= 0.9) return 3;
  if (score >= 0.7) return 2;
  if (score >= 0.5) return 1;
  return 0;
}

/** Points for a single finished task. */
export function pointsForTask(stars: Stars): number {
  return POINTS.taskCompleted + stars * POINTS.perStar;
}

/** Maximum a single task can be worth. */
export const MAX_TASK_POINTS = pointsForTask(3);

/** Maximum for a full six-task night, ignoring streak bonuses. */
export const MAX_SESSION_POINTS = MAX_TASK_POINTS * 6 + POINTS.fullSession;

export function needsRepair(stars: Stars): boolean {
  return stars < REPAIR_THRESHOLD;
}

export const STAR_BANDS: Record<Stars, { label: string; meaning: string }> = {
  0: { label: "Nicht bestanden", meaning: "Completed but failed. Repeats tomorrow." },
  1: { label: "Knapp bestanden", meaning: "Passed shakily. Still queued for repair." },
  2: { label: "Gut", meaning: "Solid. Clears the repair queue." },
  3: { label: "Gemeistert", meaning: "Mastered. Retires to long-interval review." },
};

// ------------------------------------------------------------
// Level grading
// ------------------------------------------------------------

export function certificateTier(averageStars: number): CertificateTier {
  if (averageStars >= 2.7) return "Ausgezeichnet";
  if (averageStars >= 2.3) return "Sehr gut";
  if (averageStars >= 1.8) return "Gut";
  return "Bestanden";
}

export function examReadiness(averageStars: number): {
  tier: CertificateTier;
  ready: boolean;
  advice: string;
} {
  const tier = certificateTier(averageStars);
  switch (tier) {
    case "Ausgezeichnet":
      return { tier, ready: true, advice: "Book the official exam now. You will pass comfortably." };
    case "Sehr gut":
      return { tier, ready: true, advice: "Ready. Do two weeks of exam-format drilling first." };
    case "Gut":
      return { tier, ready: false, advice: "Real ability at this level. Clear your repair queue before booking." };
    default:
      return { tier, ready: false, advice: "You finished, but you are not exam-ready yet." };
  }
}

// ------------------------------------------------------------
// Level structure — days per level at 90 min/night
// ------------------------------------------------------------

export const LEVEL_DAYS: Record<Level, number> = {
  A1: 70,
  A2: 70,
  B1: 119,
  B2: 168,
  C1: 168,
  C2: 196,
};

export const LEVEL_LABELS: Record<Level, string> = {
  A1: "Survive the first conversation",
  A2: "Handle the routine of a life",
  B1: "Become independent",
  B2: "Work in German",
  C1: "Say what you actually mean",
  C2: "Effortless",
};

export function levelProgress(level: Level, day: number): number {
  return Math.min(100, Math.round((day / LEVEL_DAYS[level]) * 100));
}

// ------------------------------------------------------------
// SM-2 spaced repetition
// ------------------------------------------------------------

export type ReviewState = {
  ease_factor: number;
  interval_days: number;
  repetitions: number;
};

/**
 * SM-2. Quality is derived from stars so the two systems agree:
 * 3 stars = 5, 2 stars = 4, 1 star = 2, 0 stars = 0.
 */
export function qualityFromStars(stars: Stars): number {
  return [0, 2, 4, 5][stars];
}

export function nextReview(state: ReviewState, stars: Stars): ReviewState & { next_review: string } {
  const q = qualityFromStars(stars);
  let { ease_factor, interval_days, repetitions } = state;

  if (q < 3) {
    // Failed — start the ladder again, but keep the ease factor's memory.
    repetitions = 0;
    interval_days = 1;
  } else {
    repetitions += 1;
    if (repetitions === 1) interval_days = 1;
    else if (repetitions === 2) interval_days = 6;
    else interval_days = Math.round(interval_days * ease_factor);
  }

  ease_factor = Math.max(
    1.3,
    ease_factor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  );

  const due = new Date();
  due.setDate(due.getDate() + interval_days);

  return {
    ease_factor: Number(ease_factor.toFixed(2)),
    interval_days,
    repetitions,
    next_review: due.toISOString().slice(0, 10),
  };
}

// ------------------------------------------------------------
// Streaks
// ------------------------------------------------------------

/**
 * The streak breaks only when a day was genuinely skipped —
 * never for finishing late.
 */
export function updateStreak(
  lastSessionDate: string | null,
  currentStreak: number
): { streak: number; broken: boolean } {
  if (!lastSessionDate) return { streak: 1, broken: false };

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const last = new Date(lastSessionDate);
  last.setHours(0, 0, 0, 0);

  const days = Math.round((today.getTime() - last.getTime()) / 86_400_000);

  if (days === 0) return { streak: currentStreak, broken: false };
  if (days === 1) return { streak: currentStreak + 1, broken: false };
  return { streak: 1, broken: true };
}

export function isStreakBonusDay(streak: number): boolean {
  return streak > 0 && streak % 7 === 0;
}
