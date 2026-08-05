"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Flame,
  BookOpen,
  Star,
  Target,
  ArrowRight,
  MessageCircle,
  Zap,
  Clock,
  CheckCircle2,
  Circle,
  Loader2,
  Wrench,
  Brain,
} from "lucide-react";
import {
  getProfile,
  getOrCreateSession,
  getSessionTasks,
  countDueFlashcards,
  getOpenRepairCount,
  getCurriculumDay,
  isGuest,
} from "@/lib/db";
import { MAX_SESSION_POINTS, LEVEL_LABELS, LEVEL_DAYS, levelProgress } from "@/lib/stars";
import { LEVELS } from "@/lib/types";
import StarRating from "@/components/star-rating";
import type { Profile, DailySession, SessionTask, CurriculumDay, Stars } from "@/lib/types";

const PLAN = [
  { kind: "repair", label: "Repair queue", detail: "Yesterday's weak items", time: "10 min", href: "/flashcards", icon: Wrench },
  { kind: "vocabulary", label: "New vocabulary", detail: "30 words with sentences", time: "15 min", href: "/vocabulary", icon: Zap },
  { kind: "lesson", label: "Core lesson", detail: "Grammar and reading", time: "30 min", href: "/lessons", icon: BookOpen },
  { kind: "production", label: "Production task", detail: "Write from nothing", time: "15 min", href: "/writing", icon: Brain },
  { kind: "speaking", label: "Speaking recording", detail: "Record, analyse, score", time: "15 min", href: "/speaking", icon: MessageCircle },
  { kind: "closeout", label: "Close out", detail: "Bank the streak", time: "5 min", href: "/flashcards", icon: CheckCircle2 },
] as const;

function greeting() {
  const h = new Date().getHours();
  if (h < 11) return "Guten Morgen";
  if (h < 18) return "Guten Tag";
  return "Guten Abend";
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<DailySession | null>(null);
  const [tasks, setTasks] = useState<SessionTask[]>([]);
  const [due, setDue] = useState(0);
  const [repairs, setRepairs] = useState(0);
  const [day, setDay] = useState<CurriculumDay | null>(null);
  const [guest, setGuest] = useState(false);

  useEffect(() => {
    (async () => {
      const p = await getProfile();
      setProfile(p);
      setGuest(await isGuest());

      const [s, d, r, c] = await Promise.all([
        getOrCreateSession(p),
        countDueFlashcards(),
        getOpenRepairCount(),
        getCurriculumDay(p.current_level, p.current_day),
      ]);

      setSession(s);
      setDue(d);
      setRepairs(r);
      setDay(c);
      if (s) setTasks((await getSessionTasks(s.id)) as SessionTask[]);
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!profile) return null;

  const doneKinds = new Set(tasks.filter((t) => t.completed).map((t) => t.kind));
  const pointsToday = session?.points_earned ?? 0;
  const progress = levelProgress(profile.current_level, profile.current_day);

  const stats = [
    { label: "Total points", value: profile.total_points.toLocaleString(), icon: Star, color: "text-amber-500" },
    { label: "Day streak", value: profile.streak_count, icon: Flame, color: "text-orange-500" },
    { label: "Words learned", value: profile.words_learned, icon: BookOpen, color: "text-blue-500" },
    { label: "Level", value: profile.current_level, icon: Target, color: "text-emerald-500" },
  ];

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">
          {greeting()}
          {profile.full_name ? `, ${profile.full_name.split(" ")[0]}` : ""}!
        </h1>
        <p className="text-muted-foreground mt-1">
          {day ? (
            <>
              Day {profile.current_day} &middot; <span className="text-foreground">{day.title}</span>
              {day.grammar_focus && ` — ${day.grammar_focus}`}
            </>
          ) : (
            `Day ${profile.current_day} of ${profile.current_level}`
          )}
        </p>
      </div>

      {guest && (
        <div className="flex flex-wrap items-center gap-3 mb-6 px-4 py-3 rounded-xl border border-border bg-card">
          <p className="text-sm text-muted-foreground flex-1 min-w-[240px]">
            You&apos;re learning as a guest — progress is saved in this browser only.
            Create an account to keep it safe and join the leaderboard.
          </p>
          <Link
            href="/signup"
            className="text-sm bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity whitespace-nowrap"
          >
            Save my progress
          </Link>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {stats.map((s) => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <s.icon className={`w-4 h-4 ${s.color}`} />
              <span className="text-xs text-muted-foreground">{s.label}</span>
            </div>
            <p className="text-2xl font-bold text-foreground tabular-nums">{s.value}</p>
          </div>
        ))}
      </div>

      {(repairs > 0 || due > 0) && (
        <div className="flex flex-wrap gap-3 mb-6">
          {repairs > 0 && (
            <Link
              href="/flashcards"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-warning bg-warning-bg text-warning text-sm hover:opacity-80 transition-opacity"
            >
              <Wrench className="w-4 h-4" />
              <span className="font-medium tabular-nums">{repairs}</span> items in repair
            </Link>
          )}
          {due > 0 && (
            <Link
              href="/flashcards"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-card text-foreground text-sm hover:border-primary/40 transition-colors"
            >
              <Brain className="w-4 h-4 text-primary" />
              <span className="font-medium tabular-nums">{due}</span> cards due today
            </Link>
          )}
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-card border border-border rounded-xl">
            <div className="px-5 py-4 border-b border-border flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                <h2 className="font-semibold text-foreground">Tonight&apos;s plan</h2>
              </div>
              <span className="text-xs text-muted-foreground tabular-nums">
                {pointsToday} / {MAX_SESSION_POINTS} pts
              </span>
            </div>

            <div className="h-1 bg-muted">
              <div
                className="h-full bg-amber-400 transition-all"
                style={{ width: `${Math.min(100, (pointsToday / MAX_SESSION_POINTS) * 100)}%` }}
              />
            </div>

            <div className="divide-y divide-border">
              {PLAN.map((item) => {
                const task = tasks.find((t) => t.kind === item.kind && t.completed);
                const done = doneKinds.has(item.kind);
                return (
                  <Link
                    key={item.kind}
                    href={item.href}
                    className="flex items-center gap-3 px-5 py-3.5 hover:bg-muted/50 transition-colors group"
                  >
                    {done ? (
                      <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0" />
                    ) : (
                      <Circle className="w-5 h-5 text-border flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${done ? "text-muted-foreground" : "text-foreground"}`}>
                        {item.label}
                      </p>
                      <p className="text-xs text-muted-foreground">{item.detail}</p>
                    </div>
                    {done && task?.stars != null ? (
                      <StarRating stars={task.stars as Stars} size={14} />
                    ) : (
                      <span className="text-xs text-muted-foreground flex-shrink-0">{item.time}</span>
                    )}
                    <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-baseline justify-between mb-1">
              <h3 className="text-sm font-medium text-foreground">{profile.current_level}</h3>
              <span className="text-xs text-muted-foreground tabular-nums">{progress}%</span>
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              {LEVEL_LABELS[profile.current_level]}
            </p>
            <div className="h-2 bg-muted rounded-full overflow-hidden mb-2">
              <div
                className="h-full bg-primary rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground tabular-nums">
              Day {profile.current_day} of {LEVEL_DAYS[profile.current_level]}
            </p>
          </div>

          <div className="bg-card border border-border rounded-xl p-5">
            <h3 className="text-sm font-medium text-foreground mb-3">The whole road</h3>
            <div className="space-y-2.5">
              {LEVELS.map((l) => {
                const reached = LEVELS.indexOf(l) < LEVELS.indexOf(profile.current_level);
                const current = l === profile.current_level;
                const pct = reached ? 100 : current ? progress : 0;
                return (
                  <div key={l}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span
                        className={
                          current
                            ? "font-medium text-primary"
                            : reached
                              ? "text-foreground"
                              : "text-muted-foreground"
                        }
                      >
                        {l}
                      </span>
                      <span className="text-muted-foreground tabular-nums">{pct}%</span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          reached ? "bg-success" : "bg-primary"
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-5">
            <h3 className="text-sm font-medium text-foreground mb-3">Lifetime</h3>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Three-star tasks</dt>
                <dd className="text-foreground tabular-nums">{profile.three_star_count}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Sessions finished</dt>
                <dd className="text-foreground tabular-nums">{profile.sessions_completed}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Longest streak</dt>
                <dd className="text-foreground tabular-nums">{profile.longest_streak}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
