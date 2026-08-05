import { createClient } from "./supabase/client";
import {
  starsFromScore,
  pointsForTask,
  needsRepair,
  updateStreak,
  isStreakBonusDay,
  POINTS,
} from "./stars";
import type {
  Profile,
  MasterWord,
  UserVocabulary,
  DailySession,
  TaskKind,
  Stars,
  CurriculumDay,
} from "./types";

export async function getProfile(): Promise<Profile | null> {
  const supabase = createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return null;

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", auth.user.id)
    .single();

  return data as Profile | null;
}

export async function getCurriculumDay(
  level: string,
  day: number
): Promise<CurriculumDay | null> {
  const supabase = createClient();
  const { data } = await supabase
    .from("curriculum_days")
    .select("*")
    .eq("level", level)
    .eq("day_number", day)
    .maybeSingle();

  return data as CurriculumDay | null;
}

export async function getWordsForDay(
  level: string,
  day: number
): Promise<MasterWord[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("vocabulary_master")
    .select("*")
    .eq("level", level)
    .eq("day_number", day)
    .order("german");

  return (data ?? []) as MasterWord[];
}

/** Cards due for review today, newest-struggling first. */
export async function getDueFlashcards(limit = 30): Promise<UserVocabulary[]> {
  const supabase = createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return [];

  const today = new Date().toISOString().slice(0, 10);

  const { data } = await supabase
    .from("user_vocabulary")
    .select("*, vocabulary_master(*)")
    .eq("user_id", auth.user.id)
    .lte("next_review", today)
    .order("best_stars", { ascending: true })
    .limit(limit);

  return (data ?? []) as UserVocabulary[];
}

export async function countDueFlashcards(): Promise<number> {
  const supabase = createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return 0;

  const today = new Date().toISOString().slice(0, 10);

  const { count } = await supabase
    .from("user_vocabulary")
    .select("*", { count: "exact", head: true })
    .eq("user_id", auth.user.id)
    .lte("next_review", today);

  return count ?? 0;
}

/** Get or create today's session. */
export async function getOrCreateSession(
  profile: Profile
): Promise<DailySession | null> {
  const supabase = createClient();
  const today = new Date().toISOString().slice(0, 10);

  const { data: existing } = await supabase
    .from("daily_sessions")
    .select("*")
    .eq("user_id", profile.id)
    .eq("session_date", today)
    .maybeSingle();

  if (existing) return existing as DailySession;

  const { data: created } = await supabase
    .from("daily_sessions")
    .insert({
      user_id: profile.id,
      session_date: today,
      level: profile.current_level,
      day_number: profile.current_day,
    })
    .select()
    .single();

  return created as DailySession | null;
}

export async function getSessionTasks(sessionId: string) {
  const supabase = createClient();
  const { data } = await supabase
    .from("session_tasks")
    .select("*")
    .eq("session_id", sessionId)
    .order("position");
  return data ?? [];
}

/**
 * Record a finished task. Awards stars and points, updates the
 * profile, and rolls the streak. This is the single write path
 * for everything the star economy touches.
 */
export async function completeTask(opts: {
  profile: Profile;
  session: DailySession;
  kind: TaskKind;
  position: number;
  title: string;
  score: number;
  payload?: Record<string, unknown>;
}): Promise<{ stars: Stars; points: number; streakBonus: number }> {
  const supabase = createClient();
  const stars = starsFromScore(opts.score);
  let points = pointsForTask(stars);

  await supabase.from("session_tasks").insert({
    session_id: opts.session.id,
    user_id: opts.profile.id,
    kind: opts.kind,
    position: opts.position,
    title: opts.title,
    score: opts.score,
    stars,
    points,
    completed: true,
    payload: opts.payload ?? {},
    completed_at: new Date().toISOString(),
  });

  const tasksDone = opts.session.tasks_done + 1;
  const sessionComplete = tasksDone >= opts.session.tasks_total;
  if (sessionComplete) points += POINTS.fullSession;

  await supabase
    .from("daily_sessions")
    .update({
      points_earned: opts.session.points_earned + points,
      stars_earned: opts.session.stars_earned + stars,
      tasks_done: tasksDone,
      completed: sessionComplete,
    })
    .eq("id", opts.session.id);

  const { streak } = updateStreak(
    opts.profile.last_session_date,
    opts.profile.streak_count
  );
  let streakBonus = 0;
  if (sessionComplete && isStreakBonusDay(streak)) {
    streakBonus = POINTS.weeklyStreak;
    points += streakBonus;
  }

  await supabase
    .from("profiles")
    .update({
      total_points: opts.profile.total_points + points,
      three_star_count:
        opts.profile.three_star_count + (stars === 3 ? 1 : 0),
      streak_count: streak,
      longest_streak: Math.max(opts.profile.longest_streak, streak),
      last_session_date: new Date().toISOString().slice(0, 10),
      sessions_completed:
        opts.profile.sessions_completed + (sessionComplete ? 1 : 0),
      updated_at: new Date().toISOString(),
    })
    .eq("id", opts.profile.id);

  return { stars, points, streakBonus };
}

/**
 * Register the day's words as flashcards and queue anything the
 * learner got wrong for repair.
 */
export async function saveVocabularyResults(
  userId: string,
  results: { word: MasterWord; correct: boolean }[]
): Promise<void> {
  const supabase = createClient();

  const rows = results.map(({ word, correct }) => ({
    user_id: userId,
    word_id: word.id,
    best_stars: correct ? 2 : 0,
    times_correct: correct ? 1 : 0,
    times_wrong: correct ? 0 : 1,
    interval_days: correct ? 1 : 0,
    repetitions: correct ? 1 : 0,
    next_review: new Date(Date.now() + (correct ? 86_400_000 : 0))
      .toISOString()
      .slice(0, 10),
  }));

  await supabase
    .from("user_vocabulary")
    .upsert(rows, { onConflict: "user_id,word_id", ignoreDuplicates: false });

  const failed = results.filter((r) => !r.correct);
  if (failed.length > 0) {
    await supabase.from("repair_queue").insert(
      failed.map(({ word }) => ({
        user_id: userId,
        source_kind: "vocabulary" as TaskKind,
        word_id: word.id,
        description: `${word.article ? word.article + " " : ""}${word.german} — ${word.english}`,
        stars_when_queued: 0,
      }))
    );
  }

  const { count } = await supabase
    .from("user_vocabulary")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId);

  await supabase
    .from("profiles")
    .update({ words_learned: count ?? 0 })
    .eq("id", userId);
}

/** Update a flashcard after a review, and clear repair if it passed. */
export async function saveFlashcardReview(
  card: UserVocabulary,
  stars: Stars,
  nextState: { ease_factor: number; interval_days: number; repetitions: number; next_review: string }
): Promise<void> {
  const supabase = createClient();

  await supabase
    .from("user_vocabulary")
    .update({
      ...nextState,
      last_review: new Date().toISOString().slice(0, 10),
      best_stars: Math.max(card.best_stars, stars),
      times_correct: card.times_correct + (stars >= 2 ? 1 : 0),
      times_wrong: card.times_wrong + (stars >= 2 ? 0 : 1),
    })
    .eq("id", card.id);

  if (!needsRepair(stars)) {
    await supabase
      .from("repair_queue")
      .update({ cleared: true, cleared_at: new Date().toISOString() })
      .eq("user_id", card.user_id)
      .eq("word_id", card.word_id)
      .eq("cleared", false);
  }
}

export async function getOpenRepairCount(): Promise<number> {
  const supabase = createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return 0;

  const { count } = await supabase
    .from("repair_queue")
    .select("*", { count: "exact", head: true })
    .eq("user_id", auth.user.id)
    .eq("cleared", false);

  return count ?? 0;
}

export async function getLeaderboard(limit = 20) {
  const supabase = createClient();
  const { data } = await supabase
    .from("leaderboard")
    .select("*")
    .order("points_this_week", { ascending: false })
    .limit(limit);
  return data ?? [];
}
