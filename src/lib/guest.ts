import type { Profile, Level, Stars } from "./types";
import { todayLocal } from "./dates";

// ============================================================
// Guest mode. Everything works without an account — progress
// lives in this browser until the visitor decides to sign up.
// Deliberately mirrors the database shape so db.ts can swap
// between the two without the pages knowing which is in use.
// ============================================================

// Deliberately still the old name. This key holds real guest progress in
// people's browsers, and renaming it on the rebrand would silently wipe
// everyone's points and review schedules.
const KEY = "deutschmeister.guest.v1";

export type GuestWordState = {
  ease_factor: number;
  interval_days: number;
  repetitions: number;
  next_review: string;
  best_stars: number;
  times_correct: number;
  times_wrong: number;
};

export type GuestRepairItem = {
  word_id: string;
  description: string;
  stars_when_queued: number;
  cleared: boolean;
};

export type GuestState = {
  full_name: string | null;
  current_level: Level;
  current_day: number;
  total_points: number;
  three_star_count: number;
  streak_count: number;
  longest_streak: number;
  last_session_date: string | null;
  words_learned: number;
  sessions_completed: number;
  created_at: string;

  session_date: string | null;
  session_points: number;
  session_stars: number;
  session_tasks: {
    kind: string;
    title: string;
    stars: Stars;
    points: number;
    completed: boolean;
  }[];

  vocab: Record<string, GuestWordState>;
  repair: GuestRepairItem[];
};

function blank(): GuestState {
  return {
    full_name: null,
    current_level: "A1",
    current_day: 1,
    total_points: 0,
    three_star_count: 0,
    streak_count: 0,
    longest_streak: 0,
    last_session_date: null,
    words_learned: 0,
    sessions_completed: 0,
    created_at: new Date().toISOString(),
    session_date: null,
    session_points: 0,
    session_stars: 0,
    session_tasks: [],
    vocab: {},
    repair: [],
  };
}

export function isBrowser(): boolean {
  return typeof window !== "undefined";
}

export function loadGuest(): GuestState {
  if (!isBrowser()) return blank();
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return blank();
    return { ...blank(), ...(JSON.parse(raw) as GuestState) };
  } catch {
    return blank();
  }
}

export function saveGuest(state: GuestState): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // Storage full or blocked — progress simply will not persist.
  }
}

export function updateGuest(fn: (s: GuestState) => GuestState): GuestState {
  const next = fn(loadGuest());
  saveGuest(next);
  return next;
}

export function clearGuest(): void {
  if (!isBrowser()) return;
  window.localStorage.removeItem(KEY);
}

export function hasGuestProgress(): boolean {
  if (!isBrowser()) return false;
  return window.localStorage.getItem(KEY) !== null;
}

/** Present the guest state as a Profile so pages need no special case. */
export function guestProfile(state: GuestState = loadGuest()): Profile {
  return {
    id: "guest",
    full_name: state.full_name,
    current_level: state.current_level,
    current_day: state.current_day,
    session_hour: 20,
    total_points: state.total_points,
    three_star_count: state.three_star_count,
    streak_count: state.streak_count,
    longest_streak: state.longest_streak,
    last_session_date: state.last_session_date,
    words_learned: state.words_learned,
    sessions_completed: state.sessions_completed,
    created_at: state.created_at,
    updated_at: state.created_at,
  };
}

export { todayLocal as today } from "./dates";

/** Reset the per-day counters when the calendar day rolls over. */
export function ensureTodaySession(state: GuestState): GuestState {
  const d = todayLocal();
  if (state.session_date === d) return state;
  return { ...state, session_date: d, session_points: 0, session_stars: 0, session_tasks: [] };
}
