"use client";

import Link from "next/link";
import { ArrowRight, Wrench, Flame } from "lucide-react";
import StarRating from "@/components/star-rating";
import { POINTS, STAR_BANDS, MAX_TASK_POINTS, MAX_SESSION_POINTS } from "@/lib/stars";
import type { Stars } from "@/lib/types";

const BANDS: { stars: Stars; range: string }[] = [
  { stars: 0, range: "under 50%" },
  { stars: 1, range: "50 to 69%" },
  { stars: 2, range: "70 to 89%" },
  { stars: 3, range: "90% and above" },
];

export default function ScoringPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">What the stars mean</h1>
        <p className="text-muted-foreground mt-1">
          Points measure that you turned up. Stars measure whether it stuck. They are
          deliberately different numbers.
        </p>
      </div>

      <div className="bg-primary-light border border-border rounded-xl p-5 mb-6">
        <p className="text-sm text-foreground">
          <strong>You are never blocked.</strong> Every task can be finished with zero
          stars and you still move on. The star count is not a gate — it is an honest
          record of what you can actually do, and it decides what comes back tomorrow.
        </p>
      </div>

      <div className="bg-card border border-border rounded-xl mb-6 overflow-hidden">
        {BANDS.map(({ stars, range }) => (
          <div
            key={stars}
            className="flex items-start gap-4 px-5 py-4 border-b border-border last:border-b-0"
          >
            <div className="flex-shrink-0 pt-0.5">
              <StarRating stars={stars} size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">
                {STAR_BANDS[stars].label}
                <span className="text-muted-foreground font-normal"> &middot; {range}</span>
              </p>
              <p className="text-sm text-muted-foreground mt-0.5">
                {STAR_BANDS[stars].meaning}
              </p>
            </div>
            <span className="text-sm text-amber-500 tabular-nums flex-shrink-0">
              {POINTS.taskCompleted + stars * POINTS.perStar} pts
            </span>
          </div>
        ))}
      </div>

      <h2 className="text-lg font-semibold text-foreground mb-3">
        Why your first night scores low
      </h2>
      <p className="text-sm text-muted-foreground mb-3">
        It is meant to. The first time you meet thirty new words, you will not remember
        most of them, and a system that told you otherwise would be lying. One star on
        night one is normal and not a sign you are bad at this.
      </p>
      <p className="text-sm text-muted-foreground mb-6">
        What matters is the second time you see those words, and the fifth. Everything
        you scored badly is queued and comes back until it clears — so the score you care
        about is the one a week from now, not tonight.
      </p>

      <div className="grid sm:grid-cols-2 gap-3 mb-6">
        <div className="bg-card border border-border rounded-xl p-5">
          <Wrench aria-hidden="true" className="w-5 h-5 text-warning mb-2" />
          <h3 className="text-sm font-semibold text-foreground mb-1">The repair queue</h3>
          <p className="text-sm text-muted-foreground">
            Anything under two stars goes in and keeps coming back until you clear it.
            Clearing an old weakness is worth {POINTS.repairCleared} points — more than a
            fresh easy win, on purpose.
          </p>
        </div>
        <div className="bg-card border border-border rounded-xl p-5">
          <Flame aria-hidden="true" className="w-5 h-5 text-orange-500 mb-2" />
          <h3 className="text-sm font-semibold text-foreground mb-1">The streak</h3>
          <p className="text-sm text-muted-foreground">
            It only breaks if you genuinely skipped a day, never for finishing late.
            Every seventh day in a row is worth {POINTS.weeklyStreak} points.
          </p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-5 mb-6">
        <h3 className="text-sm font-semibold text-foreground mb-3">The numbers</h3>
        <dl className="text-sm space-y-2">
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Finishing a task at all</dt>
            <dd className="text-foreground tabular-nums">{POINTS.taskCompleted} pts</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Each star</dt>
            <dd className="text-foreground tabular-nums">+{POINTS.perStar} pts</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Best possible task</dt>
            <dd className="text-foreground tabular-nums">{MAX_TASK_POINTS} pts</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">A perfect night</dt>
            <dd className="text-foreground tabular-nums">{MAX_SESSION_POINTS} pts</dd>
          </div>
        </dl>
      </div>

      <Link
        href="/dashboard"
        className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3 rounded-xl font-medium text-sm hover:opacity-90 transition-opacity"
      >
        Back to tonight&apos;s plan
        <ArrowRight aria-hidden="true" className="w-4 h-4" />
      </Link>
    </div>
  );
}
