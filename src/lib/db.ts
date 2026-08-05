import { createClient } from "./supabase/client";
import {
  starsFromScore,
  pointsForTask,
  needsRepair,
  updateStreak,
  isStreakBonusDay,
  POINTS,
} from "./stars";
import {
  loadGuest,
  saveGuest,
  guestProfile,
  ensureTodaySession,
  type GuestState,
} from "./guest";
import { todayLocal as today, addDays } from "./dates";
import type {
  Profile,
  MasterWord,
  UserVocabulary,
  DailySession,
  SessionTask,
  TaskKind,
  Stars,
  CurriculumDay,
} from "./types";

/** null means nobody is signed in — guest mode. */
async function currentUserId(): Promise<string | null> {
  const { data } = await createClient().auth.getUser();
  return data.user?.id ?? null;
}

export async function isGuest(): Promise<boolean> {
  return (await currentUserId()) === null;
}

// ------------------------------------------------------------
// Profile
// ------------------------------------------------------------

export async function getProfile(): Promise<Profile> {
  const uid = await currentUserId();
  if (!uid) return guestProfile();

  const { data } = await createClient()
    .from("profiles")
    .select("*")
    .eq("id", uid)
    .single();

  // Signed in but the profile row is missing — fall back rather than crash.
  return (data as Profile) ?? guestProfile();
}

// ------------------------------------------------------------
// Fixed content — readable by everyone, signed in or not
// ------------------------------------------------------------

export async function getCurriculumDay(
  level: string,
  day: number
): Promise<CurriculumDay | null> {
  const { data } = await createClient()
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
  const { data } = await createClient()
    .from("vocabulary_master")
    .select("*")
    .eq("level", level)
    .eq("day_number", day)
    .order("german");

  return (data ?? []) as MasterWord[];
}

async function getWordsByIds(ids: string[]): Promise<MasterWord[]> {
  if (ids.length === 0) return [];
  const { data } = await createClient()
    .from("vocabulary_master")
    .select("*")
    .in("id", ids);
  return (data ?? []) as MasterWord[];
}

// ------------------------------------------------------------
// Flashcards
// ------------------------------------------------------------

export async function getDueFlashcards(limit = 30): Promise<UserVocabulary[]> {
  const uid = await currentUserId();

  if (!uid) {
    const g = loadGuest();
    const dueIds = Object.entries(g.vocab)
      .filter(([, s]) => s.next_review <= today())
      .sort((a, b) => a[1].best_stars - b[1].best_stars)
      .slice(0, limit)
      .map(([id]) => id);

    const words = await getWordsByIds(dueIds);
    const byId = new Map(words.map((w) => [w.id, w]));

    return dueIds
      .filter((id) => byId.has(id))
      .map((id) => {
        const s = g.vocab[id];
        return {
          id,
          user_id: "guest",
          word_id: id,
          ease_factor: s.ease_factor,
          interval_days: s.interval_days,
          repetitions: s.repetitions,
          next_review: s.next_review,
          last_review: null,
          best_stars: s.best_stars,
          times_correct: s.times_correct,
          times_wrong: s.times_wrong,
          created_at: g.created_at,
          vocabulary_master: byId.get(id)!,
        } satisfies UserVocabulary;
      });
  }

  const { data } = await createClient()
    .from("user_vocabulary")
    .select("*, vocabulary_master(*)")
    .eq("user_id", uid)
    .lte("next_review", today())
    .order("best_stars", { ascending: true })
    .limit(limit);

  return (data ?? []) as UserVocabulary[];
}

export async function countDueFlashcards(): Promise<number> {
  const uid = await currentUserId();

  if (!uid) {
    const g = loadGuest();
    return Object.values(g.vocab).filter((s) => s.next_review <= today()).length;
  }

  const { count } = await createClient()
    .from("user_vocabulary")
    .select("*", { count: "exact", head: true })
    .eq("user_id", uid)
    .lte("next_review", today());

  return count ?? 0;
}

// ------------------------------------------------------------
// Sessions
// ------------------------------------------------------------

function guestSession(g: GuestState, profile: Profile): DailySession {
  return {
    id: "guest-session",
    user_id: "guest",
    session_date: g.session_date ?? today(),
    level: profile.current_level,
    day_number: profile.current_day,
    points_earned: g.session_points,
    stars_earned: g.session_stars,
    tasks_total: 6,
    tasks_done: g.session_tasks.filter((t) => t.completed).length,
    completed: g.session_tasks.filter((t) => t.completed).length >= 6,
    created_at: g.created_at,
  };
}

export async function getOrCreateSession(
  profile: Profile
): Promise<DailySession> {
  const uid = await currentUserId();

  if (!uid) {
    const g = ensureTodaySession(loadGuest());
    saveGuest(g);
    return guestSession(g, profile);
  }

  const supabase = createClient();
  const { data: existing } = await supabase
    .from("daily_sessions")
    .select("*")
    .eq("user_id", uid)
    .eq("session_date", today())
    .maybeSingle();

  if (existing) return existing as DailySession;

  const { data: created } = await supabase
    .from("daily_sessions")
    .insert({
      user_id: uid,
      session_date: today(),
      level: profile.current_level,
      day_number: profile.current_day,
    })
    .select()
    .single();

  return (created as DailySession) ?? guestSession(loadGuest(), profile);
}

export async function getSessionTasks(sessionId: string): Promise<SessionTask[]> {
  const uid = await currentUserId();

  if (!uid) {
    const g = ensureTodaySession(loadGuest());
    return g.session_tasks.map((t, i) => ({
      id: `guest-task-${i}`,
      session_id: "guest-session",
      user_id: "guest",
      kind: t.kind as TaskKind,
      position: i,
      title: t.title,
      score: null,
      stars: t.stars,
      points: t.points,
      completed: t.completed,
      payload: {},
      completed_at: null,
      created_at: g.created_at,
    }));
  }

  const { data } = await createClient()
    .from("session_tasks")
    .select("*")
    .eq("session_id", sessionId)
    .order("position");

  return (data ?? []) as SessionTask[];
}

// ------------------------------------------------------------
// The single write path for the star economy
// ------------------------------------------------------------

export async function completeTask(opts: {
  profile: Profile;
  session: DailySession;
  kind: TaskKind;
  position: number;
  title: string;
  score: number;
  payload?: Record<string, unknown>;
}): Promise<{ stars: Stars; points: number; streakBonus: number }> {
  const uid = await currentUserId();
  const stars = starsFromScore(opts.score);
  let points = pointsForTask(stars);

  const tasksDone = opts.session.tasks_done + 1;
  const sessionComplete = tasksDone >= opts.session.tasks_total;
  if (sessionComplete) points += POINTS.fullSession;

  const { streak } = updateStreak(
    opts.profile.last_session_date,
    opts.profile.streak_count
  );
  let streakBonus = 0;
  if (sessionComplete && isStreakBonusDay(streak)) {
    streakBonus = POINTS.weeklyStreak;
    points += streakBonus;
  }

  if (!uid) {
    const g = ensureTodaySession(loadGuest());
    saveGuest({
      ...g,
      session_points: g.session_points + points,
      session_stars: g.session_stars + stars,
      session_tasks: [
        ...g.session_tasks.filter((t) => t.kind !== opts.kind),
        { kind: opts.kind, title: opts.title, stars, points, completed: true },
      ],
      total_points: g.total_points + points,
      three_star_count: g.three_star_count + (stars === 3 ? 1 : 0),
      streak_count: streak,
      longest_streak: Math.max(g.longest_streak, streak),
      last_session_date: today(),
      sessions_completed: g.sessions_completed + (sessionComplete ? 1 : 0),
    });
    return { stars, points, streakBonus };
  }

  const supabase = createClient();

  await supabase.from("session_tasks").insert({
    session_id: opts.session.id,
    user_id: uid,
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

  await supabase
    .from("daily_sessions")
    .update({
      points_earned: opts.session.points_earned + points,
      stars_earned: opts.session.stars_earned + stars,
      tasks_done: tasksDone,
      completed: sessionComplete,
    })
    .eq("id", opts.session.id);

  await supabase
    .from("profiles")
    .update({
      total_points: opts.profile.total_points + points,
      three_star_count: opts.profile.three_star_count + (stars === 3 ? 1 : 0),
      streak_count: streak,
      longest_streak: Math.max(opts.profile.longest_streak, streak),
      last_session_date: today(),
      sessions_completed:
        opts.profile.sessions_completed + (sessionComplete ? 1 : 0),
      updated_at: new Date().toISOString(),
    })
    .eq("id", uid);

  return { stars, points, streakBonus };
}

// ------------------------------------------------------------
// Vocabulary results
// ------------------------------------------------------------

export async function saveVocabularyResults(
  results: { word: MasterWord; correct: boolean }[]
): Promise<void> {
  const uid = await currentUserId();
  const tomorrow = addDays(1);

  if (!uid) {
    const g = loadGuest();
    const vocab = { ...g.vocab };
    const repair = [...g.repair];

    for (const { word, correct } of results) {
      vocab[word.id] = {
        ease_factor: 2.5,
        interval_days: correct ? 1 : 0,
        repetitions: correct ? 1 : 0,
        next_review: correct ? tomorrow : today(),
        best_stars: Math.max(vocab[word.id]?.best_stars ?? 0, correct ? 2 : 0),
        times_correct: (vocab[word.id]?.times_correct ?? 0) + (correct ? 1 : 0),
        times_wrong: (vocab[word.id]?.times_wrong ?? 0) + (correct ? 0 : 1),
      };
      if (!correct) {
        repair.push({
          word_id: word.id,
          description: `${word.article ? word.article + " " : ""}${word.german} — ${word.english}`,
          stars_when_queued: 0,
          cleared: false,
        });
      }
    }

    saveGuest({ ...g, vocab, repair, words_learned: Object.keys(vocab).length });
    return;
  }

  const supabase = createClient();

  await supabase.from("user_vocabulary").upsert(
    results.map(({ word, correct }) => ({
      user_id: uid,
      word_id: word.id,
      best_stars: correct ? 2 : 0,
      times_correct: correct ? 1 : 0,
      times_wrong: correct ? 0 : 1,
      interval_days: correct ? 1 : 0,
      repetitions: correct ? 1 : 0,
      next_review: correct ? tomorrow : today(),
    })),
    { onConflict: "user_id,word_id" }
  );

  const failed = results.filter((r) => !r.correct);
  if (failed.length > 0) {
    await supabase.from("repair_queue").insert(
      failed.map(({ word }) => ({
        user_id: uid,
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
    .eq("user_id", uid);

  await supabase.from("profiles").update({ words_learned: count ?? 0 }).eq("id", uid);
}

// ------------------------------------------------------------
// Flashcard review
// ------------------------------------------------------------

export async function saveFlashcardReview(
  card: UserVocabulary,
  stars: Stars,
  next: {
    ease_factor: number;
    interval_days: number;
    repetitions: number;
    next_review: string;
  }
): Promise<void> {
  const uid = await currentUserId();

  if (!uid) {
    const g = loadGuest();
    saveGuest({
      ...g,
      vocab: {
        ...g.vocab,
        [card.word_id]: {
          ...next,
          best_stars: Math.max(card.best_stars, stars),
          times_correct: card.times_correct + (stars >= 2 ? 1 : 0),
          times_wrong: card.times_wrong + (stars >= 2 ? 0 : 1),
        },
      },
      repair: needsRepair(stars)
        ? g.repair
        : g.repair.map((r) =>
            r.word_id === card.word_id ? { ...r, cleared: true } : r
          ),
    });
    return;
  }

  const supabase = createClient();

  await supabase
    .from("user_vocabulary")
    .update({
      ...next,
      last_review: today(),
      best_stars: Math.max(card.best_stars, stars),
      times_correct: card.times_correct + (stars >= 2 ? 1 : 0),
      times_wrong: card.times_wrong + (stars >= 2 ? 0 : 1),
    })
    .eq("id", card.id);

  if (!needsRepair(stars)) {
    await supabase
      .from("repair_queue")
      .update({ cleared: true, cleared_at: new Date().toISOString() })
      .eq("user_id", uid)
      .eq("word_id", card.word_id)
      .eq("cleared", false);
  }
}

export async function getOpenRepairCount(): Promise<number> {
  const uid = await currentUserId();

  if (!uid) {
    return loadGuest().repair.filter((r) => !r.cleared).length;
  }

  const { count } = await createClient()
    .from("repair_queue")
    .select("*", { count: "exact", head: true })
    .eq("user_id", uid)
    .eq("cleared", false);

  return count ?? 0;
}

export async function getLeaderboard(limit = 20) {
  const { data } = await createClient()
    .from("leaderboard")
    .select("*")
    .order("points_this_week", { ascending: false })
    .limit(limit);
  return data ?? [];
}
