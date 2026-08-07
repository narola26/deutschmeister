"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Loader2,
  ChevronLeft,
  ChevronRight,
  Flame,
  Trophy,
  CalendarCheck,
  Star,
} from "lucide-react";
import { getProfile, getActivity, type ActivityDay } from "@/lib/db";
import { toLocalDate, parseLocalDate } from "@/lib/dates";
import type { Profile } from "@/lib/types";

// German weekday and month names. The calendar is a natural place to keep
// meeting day-4 vocabulary (Montag, Dienstag …) without it being a lesson.
const WEEKDAYS = [
  { short: "Mo", full: "Montag" },
  { short: "Di", full: "Dienstag" },
  { short: "Mi", full: "Mittwoch" },
  { short: "Do", full: "Donnerstag" },
  { short: "Fr", full: "Freitag" },
  { short: "Sa", full: "Samstag" },
  { short: "So", full: "Sonntag" },
];

const MONTHS = [
  "Januar", "Februar", "März", "April", "Mai", "Juni",
  "Juli", "August", "September", "Oktober", "November", "Dezember",
];

type Level = "none" | "started" | "solid" | "full";

function levelFor(day: ActivityDay | undefined): Level {
  if (!day || day.points === 0) return "none";
  if (day.completed) return "full";
  if (day.points >= 150) return "solid";
  return "started";
}

const CELL_STYLE: Record<Level, string> = {
  none: "bg-muted/50 text-muted-foreground",
  started: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200",
  solid: "bg-amber-300 text-amber-900 dark:bg-amber-800 dark:text-amber-100",
  full: "bg-amber-400 text-amber-950 dark:bg-amber-500 dark:text-amber-950 font-semibold",
};

/** Monday-first index: JS getDay() is 0=Sun, we want 0=Mon. */
function mondayIndex(d: Date): number {
  return (d.getDay() + 6) % 7;
}

export default function CalendarPage() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [activity, setActivity] = useState<ActivityDay[]>([]);
  const [cursor, setCursor] = useState(() => {
    const n = new Date();
    return { year: n.getFullYear(), month: n.getMonth() };
  });

  useEffect(() => {
    (async () => {
      const [p, a] = await Promise.all([getProfile(), getActivity()]);
      setProfile(p);
      setActivity(a);
      setLoading(false);
    })();
  }, []);

  const byDate = useMemo(() => {
    const m = new Map<string, ActivityDay>();
    for (const d of activity) m.set(d.date, d);
    return m;
  }, [activity]);

  // The first day the learner did anything — days before this are never
  // counted as "missed", because they weren't learning yet.
  const startDate = useMemo(
    () => (activity.length ? activity[0].date : toLocalDate()),
    [activity]
  );

  const stats = useMemo(() => {
    const active = activity.filter((d) => d.points > 0);
    const totalDays = active.length;
    const totalPoints = active.reduce((s, d) => s + d.points, 0);

    const monthActive = active.filter((d) => {
      const dt = parseLocalDate(d.date);
      return dt.getFullYear() === cursor.year && dt.getMonth() === cursor.month;
    }).length;

    // Missed = days from start to today with no activity.
    const start = parseLocalDate(startDate);
    const today = parseLocalDate(toLocalDate());
    let missed = 0;
    for (let d = new Date(start); d <= today; d.setDate(d.getDate() + 1)) {
      const key = toLocalDate(d);
      if (!byDate.get(key)?.points) missed++;
    }

    return { totalDays, totalPoints, monthActive, missed };
  }, [activity, byDate, cursor, startDate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }
  if (!profile) return null;

  const first = new Date(cursor.year, cursor.month, 1);
  const daysInMonth = new Date(cursor.year, cursor.month + 1, 0).getDate();
  const leadingBlanks = mondayIndex(first);
  const todayKey = toLocalDate();
  const startKey = startDate;

  const cells: (number | null)[] = [
    ...Array(leadingBlanks).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  function shiftMonth(delta: number) {
    setCursor((c) => {
      const m = c.month + delta;
      return { year: c.year + Math.floor(m / 12), month: ((m % 12) + 12) % 12 };
    });
  }

  const now = new Date();
  const isCurrentMonth =
    cursor.year === now.getFullYear() && cursor.month === now.getMonth();

  const statCards = [
    { label: "Current streak", value: profile.streak_count, icon: Flame, tone: "text-orange-500" },
    { label: "Longest streak", value: profile.longest_streak, icon: Trophy, tone: "text-purple-500" },
    { label: "Days practised", value: stats.totalDays, icon: CalendarCheck, tone: "text-emerald-500" },
    { label: "Days missed", value: stats.missed, icon: Star, tone: "text-muted-foreground" },
  ];

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Your calendar</h1>
        <p className="text-muted-foreground mt-1">
          Every day you showed up, and every day you didn&apos;t. The streak only
          survives if the chain is unbroken.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {statCards.map((s) => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <s.icon aria-hidden="true" className={`w-4 h-4 ${s.tone}`} />
              <span className="text-xs text-muted-foreground">{s.label}</span>
            </div>
            <p className="text-2xl font-bold text-foreground tabular-nums">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-card border border-border rounded-xl p-5">
        <div className="flex items-center justify-between mb-5">
          <button
            onClick={() => shiftMonth(-1)}
            aria-label="Previous month"
            className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft className="w-5 h-5" aria-hidden="true" />
          </button>
          <h2 className="font-semibold text-foreground tabular-nums">
            {MONTHS[cursor.month]} {cursor.year}
          </h2>
          <button
            onClick={() => shiftMonth(1)}
            aria-label="Next month"
            disabled={isCurrentMonth}
            className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
          >
            <ChevronRight className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1.5 mb-1.5">
          {WEEKDAYS.map((w) => (
            <div
              key={w.short}
              title={w.full}
              className="text-center text-xs font-medium text-muted-foreground py-1"
            >
              {w.short}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1.5">
          {cells.map((day, i) => {
            if (day === null) return <div key={`b${i}`} />;
            const date = new Date(cursor.year, cursor.month, day);
            const key = toLocalDate(date);
            const record = byDate.get(key);
            const isToday = key === todayKey;
            const isFuture = key > todayKey;
            const beforeStart = key < startKey;
            const level = levelFor(record);

            // A past day after the learner started, with nothing done.
            const missed = level === "none" && !isFuture && !beforeStart && !isToday;

            let style: string;
            if (isFuture || beforeStart) style = "bg-transparent text-muted-foreground/40";
            else if (missed) style = "bg-muted/40 text-muted-foreground border border-dashed border-border";
            else style = CELL_STYLE[level];

            const title = record
              ? `${key}: ${record.points} points${record.completed ? ", full day" : ""}`
              : missed
                ? `${key}: nothing done`
                : key;

            return (
              <div
                key={key}
                title={title}
                className={`aspect-square rounded-lg flex items-center justify-center text-sm tabular-nums transition-colors ${style} ${
                  isToday ? "ring-2 ring-primary ring-offset-1 ring-offset-card" : ""
                }`}
              >
                {day}
              </div>
            );
          })}
        </div>

        <div className="flex items-center flex-wrap gap-x-4 gap-y-2 mt-5 pt-4 border-t border-border">
          <span className="text-xs text-muted-foreground">Less</span>
          <span className="w-4 h-4 rounded bg-muted/50" title="nothing" />
          <span className={`w-4 h-4 rounded ${CELL_STYLE.started}`} title="started" />
          <span className={`w-4 h-4 rounded ${CELL_STYLE.solid}`} title="solid day" />
          <span className={`w-4 h-4 rounded ${CELL_STYLE.full}`} title="full day" />
          <span className="text-xs text-muted-foreground">More</span>
          <span className="w-4 h-4 rounded bg-muted/40 border border-dashed border-border ml-2" title="missed" />
          <span className="text-xs text-muted-foreground">Missed</span>
        </div>
      </div>
    </div>
  );
}
