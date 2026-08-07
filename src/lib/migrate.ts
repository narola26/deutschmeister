import { createClient } from "./supabase/client";
import { loadGuest, clearGuest, hasGuestProgress } from "./guest";
import { todayLocal } from "./dates";

/**
 * Carry a guest's work into their new account.
 *
 * Someone can study for a week before deciding to sign up. Throwing
 * that away at the moment they commit is the worst possible time to
 * lose it, so everything moves: vocabulary schedules, the repair
 * queue, points, streak and today's session.
 *
 * Safe to call on every login — it no-ops when there is nothing local.
 */
export async function migrateGuestToAccount(
  userId: string
): Promise<{ migrated: boolean; words: number; points: number }> {
  if (!hasGuestProgress()) return { migrated: false, words: 0, points: 0 };

  const g = loadGuest();
  const wordIds = Object.keys(g.vocab);

  if (wordIds.length === 0 && g.total_points === 0) {
    clearGuest();
    return { migrated: false, words: 0, points: 0 };
  }

  const supabase = createClient();

  // Vocabulary schedules. Existing rows win — an account that has
  // already been studied on should not be rewound by stale local data.
  if (wordIds.length > 0) {
    await supabase.from("user_vocabulary").upsert(
      wordIds.map((wordId) => {
        const s = g.vocab[wordId];
        return {
          user_id: userId,
          word_id: wordId,
          ease_factor: s.ease_factor,
          interval_days: s.interval_days,
          repetitions: s.repetitions,
          next_review: s.next_review,
          best_stars: s.best_stars,
          times_correct: s.times_correct,
          times_wrong: s.times_wrong,
        };
      }),
      { onConflict: "user_id,word_id", ignoreDuplicates: true }
    );
  }

  const open = g.repair.filter((r) => !r.cleared);
  if (open.length > 0) {
    await supabase.from("repair_queue").insert(
      open.map((r) => ({
        user_id: userId,
        source_kind: "vocabulary" as const,
        word_id: r.word_id,
        description: r.description,
        stars_when_queued: r.stars_when_queued,
      }))
    );
  }

  // The whole calendar history, so signing up does not blank it. Each
  // archived guest day becomes a daily_sessions row.
  const rows = [...(g.history ?? [])].map((d) => ({
    user_id: userId,
    session_date: d.date,
    level: g.current_level,
    day_number: g.current_day,
    points_earned: d.points,
    stars_earned: d.stars,
    tasks_done: d.tasks_done,
    completed: d.completed,
  }));

  // Today's live session too, so the day's points are not counted twice.
  if (g.session_date === todayLocal() && g.session_points > 0) {
    const done = g.session_tasks.filter((t) => t.completed).length;
    rows.push({
      user_id: userId,
      session_date: g.session_date,
      level: g.current_level,
      day_number: g.current_day,
      points_earned: g.session_points,
      stars_earned: g.session_stars,
      tasks_done: done,
      completed: done >= 6,
    });
  }

  if (rows.length > 0) {
    await supabase
      .from("daily_sessions")
      .upsert(rows, { onConflict: "user_id,session_date", ignoreDuplicates: true });
  }

  const { data: existing } = await supabase
    .from("profiles")
    .select("total_points, words_learned, streak_count, longest_streak, three_star_count, sessions_completed")
    .eq("id", userId)
    .single();

  await supabase
    .from("profiles")
    .update({
      current_level: g.current_level,
      current_day: Math.max(existing?.words_learned ? 1 : g.current_day, g.current_day),
      total_points: (existing?.total_points ?? 0) + g.total_points,
      words_learned: Math.max(existing?.words_learned ?? 0, wordIds.length),
      streak_count: Math.max(existing?.streak_count ?? 0, g.streak_count),
      longest_streak: Math.max(existing?.longest_streak ?? 0, g.longest_streak),
      three_star_count: (existing?.three_star_count ?? 0) + g.three_star_count,
      sessions_completed: (existing?.sessions_completed ?? 0) + g.sessions_completed,
      last_session_date: g.last_session_date,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);

  clearGuest();

  return { migrated: true, words: wordIds.length, points: g.total_points };
}
