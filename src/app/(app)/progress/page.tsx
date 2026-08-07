"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Loader2,
  Star,
  Flame,
  BookOpen,
  Wrench,
  Trophy,
  Target,
  ArrowRight,
} from "lucide-react";
import {
  getProfile,
  getOpenRepairCount,
  countDueFlashcards,
  isGuest,
} from "@/lib/db";
import {
  LEVEL_DAYS,
  LEVEL_LABELS,
  LEVEL_EXAMS,
  levelProgress,
  certificateTier,
  examReadiness,
  MAX_SESSION_POINTS,
} from "@/lib/stars";
import { LEVELS } from "@/lib/types";
import type { Profile } from "@/lib/types";

export default function ProgressPage() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [repairs, setRepairs] = useState(0);
  const [due, setDue] = useState(0);
  const [guest, setGuest] = useState(false);

  useEffect(() => {
    (async () => {
      const p = await getProfile();
      setProfile(p);
      const [r, d, g] = await Promise.all([
        getOpenRepairCount(),
        countDueFlashcards(),
        isGuest(),
      ]);
      setRepairs(r);
      setDue(d);
      setGuest(g);
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

  const pct = levelProgress(profile.current_level, profile.current_day);
  const daysLeft = Math.max(0, LEVEL_DAYS[profile.current_level] - profile.current_day);

  // Average stars so far, from lifetime points and tasks completed.
  const tasksDone = Math.max(1, profile.sessions_completed * 6 + 1);
  const avgStars = Math.min(3, (profile.three_star_count * 3) / tasksDone || 0);
  const readiness = examReadiness(avgStars);

  const stats = [
    { label: "Total points", value: profile.total_points.toLocaleString(), icon: Star, tone: "text-amber-500" },
    { label: "Current streak", value: profile.streak_count, icon: Flame, tone: "text-orange-500" },
    { label: "Longest streak", value: profile.longest_streak, icon: Trophy, tone: "text-purple-500" },
    { label: "Words learned", value: profile.words_learned, icon: BookOpen, tone: "text-blue-500" },
    { label: "Three-star tasks", value: profile.three_star_count, icon: Star, tone: "text-emerald-500" },
    { label: "Sessions finished", value: profile.sessions_completed, icon: Target, tone: "text-cyan-500" },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Your progress</h1>
        <p className="text-muted-foreground mt-1">
          The honest version. Points measure effort; stars measure whether it stuck.
        </p>
      </div>

      {guest && (
        <div className="flex flex-wrap items-center gap-3 mb-6 px-4 py-3 rounded-xl border border-border bg-card">
          <p className="text-sm text-muted-foreground flex-1 min-w-[240px]">
            This is guest progress, kept in this browser only.
          </p>
          <Link
            href="/signup"
            className="text-sm bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity whitespace-nowrap"
          >
            Save my progress
          </Link>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
        {stats.map((s) => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <s.icon aria-hidden="true" className={`w-4 h-4 ${s.tone}`} />
              <span className="text-xs text-muted-foreground">{s.label}</span>
            </div>
            <p className="text-2xl font-bold text-foreground tabular-nums">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-4 mb-6">
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-baseline justify-between mb-1">
            <h2 className="font-semibold text-foreground">{profile.current_level}</h2>
            <span className="text-sm text-muted-foreground tabular-nums">{pct}%</span>
          </div>
          <p className="text-sm text-muted-foreground mb-3">
            {LEVEL_LABELS[profile.current_level]}
          </p>
          <div className="h-2.5 bg-muted rounded-full overflow-hidden mb-3">
            <div
              className="h-full bg-primary rounded-full transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
          <dl className="text-sm space-y-1.5">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Day</dt>
              <dd className="text-foreground tabular-nums">
                {profile.current_day} of {LEVEL_DAYS[profile.current_level]}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Nights remaining</dt>
              <dd className="text-foreground tabular-nums">{daysLeft}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Leads to</dt>
              <dd className="text-foreground text-right">{LEVEL_EXAMS[profile.current_level]}</dd>
            </div>
          </dl>
        </div>

        <div className="bg-card border border-border rounded-xl p-5">
          <h2 className="font-semibold text-foreground mb-1">Exam readiness</h2>
          <p className="text-sm text-muted-foreground mb-3">
            Based on how many tasks you have actually mastered, not how many you opened.
          </p>
          <p className="text-2xl font-bold text-foreground mb-1">
            {certificateTier(avgStars)}
          </p>
          <p className="text-sm text-muted-foreground mb-4">{readiness.advice}</p>
          <div
            className={`text-xs px-3 py-1.5 rounded-full inline-block ${
              readiness.ready
                ? "bg-success-bg text-success"
                : "bg-warning-bg text-warning"
            }`}
          >
            {readiness.ready ? "Ready to book the exam" : "Not exam-ready yet"}
          </div>
        </div>
      </div>

      {(repairs > 0 || due > 0) && (
        <div className="grid sm:grid-cols-2 gap-3 mb-6">
          <Link
            href="/flashcards"
            className="flex items-center gap-3 px-5 py-4 rounded-xl border border-warning bg-warning-bg hover:opacity-80 transition-opacity"
          >
            <Wrench aria-hidden="true" className="w-5 h-5 text-warning flex-shrink-0" />
            <span className="flex-1">
              <span className="block text-lg font-bold text-warning tabular-nums">{repairs}</span>
              <span className="block text-xs text-warning">items still in repair</span>
            </span>
            <ArrowRight aria-hidden="true" className="w-4 h-4 text-warning" />
          </Link>
          <Link
            href="/flashcards"
            className="flex items-center gap-3 px-5 py-4 rounded-xl border border-border bg-card hover:border-primary/40 transition-colors"
          >
            <BookOpen aria-hidden="true" className="w-5 h-5 text-primary flex-shrink-0" />
            <span className="flex-1">
              <span className="block text-lg font-bold text-foreground tabular-nums">{due}</span>
              <span className="block text-xs text-muted-foreground">cards due today</span>
            </span>
            <ArrowRight aria-hidden="true" className="w-4 h-4 text-muted-foreground" />
          </Link>
        </div>
      )}

      <div className="bg-card border border-border rounded-xl p-5">
        <h2 className="font-semibold text-foreground mb-4">The whole road</h2>
        <div className="space-y-3">
          {LEVELS.map((l) => {
            const reached = LEVELS.indexOf(l) < LEVELS.indexOf(profile.current_level);
            const current = l === profile.current_level;
            const p = reached ? 100 : current ? pct : 0;
            return (
              <div key={l}>
                <div className="flex items-baseline justify-between text-sm mb-1 gap-3">
                  <span
                    className={
                      current
                        ? "font-medium text-primary"
                        : reached
                          ? "text-foreground"
                          : "text-muted-foreground"
                    }
                  >
                    {l} &middot;{" "}
                    <span className="text-muted-foreground text-xs">{LEVEL_LABELS[l]}</span>
                  </span>
                  <span className="text-muted-foreground tabular-nums text-xs flex-shrink-0">
                    {LEVEL_DAYS[l]} nights
                  </span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      reached ? "bg-success" : "bg-primary"
                    }`}
                    style={{ width: `${p}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
        <p className="text-xs text-muted-foreground mt-4">
          A perfect night is {MAX_SESSION_POINTS} points. Total nights to C2:{" "}
          {LEVELS.reduce((sum, l) => sum + LEVEL_DAYS[l], 0)}.
        </p>
      </div>
    </div>
  );
}
