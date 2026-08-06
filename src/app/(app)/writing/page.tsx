"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Loader2,
  ArrowRight,
  PenTool,
  Check,
  Sparkles,
  Trophy,
  AlertCircle,
} from "lucide-react";
import {
  getProfile,
  getCurriculumDay,
  getWordsForDay,
  getOrCreateSession,
  completeTask,
} from "@/lib/db";
import { MAX_TASK_POINTS, STAR_BANDS } from "@/lib/stars";
import StarRating from "@/components/star-rating";
import type {
  Profile,
  DailySession,
  CurriculumDay,
  MasterWord,
  Stars,
} from "@/lib/types";

type Correction = {
  original: string;
  corrected: string;
  explanation: string;
  rule: string;
};

type Result = {
  score: number;
  corrections: Correction[];
  feedback: string;
  strengths: string[];
};

type Phase = "loading" | "write" | "marking" | "done" | "empty";

export default function WritingPage() {
  const [phase, setPhase] = useState<Phase>("loading");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<DailySession | null>(null);
  const [day, setDay] = useState<CurriculumDay | null>(null);
  const [words, setWords] = useState<MasterWord[]>([]);

  const [text, setText] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [earned, setEarned] = useState<{ stars: Stars; points: number } | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      const p = await getProfile();
      setProfile(p);

      const d = await getCurriculumDay(p.current_level, p.current_day);
      if (!d) return setPhase("empty");
      setDay(d);
      setWords(await getWordsForDay(p.current_level, p.current_day));
      setSession(await getOrCreateSession(p));
      setPhase("write");
    })();
  }, []);

  async function submit() {
    if (!profile || !session || !day) return;
    if (text.trim().length < 10) {
      setError("Write at least a sentence or two first.");
      return;
    }

    setError("");
    setPhase("marking");

    try {
      const res = await fetch("/api/ai/correct", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          prompt: day.production_prompt,
          level: profile.current_level,
          grammarFocus: day.grammar_focus,
          vocabulary: words.map((w) =>
            w.article ? `${w.article} ${w.german}` : w.german
          ),
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body.error ?? "Could not mark that. Please try again.");
        setPhase("write");
        return;
      }

      const marked = (await res.json()) as Result;
      setResult(marked);

      const scored = await completeTask({
        profile,
        session,
        kind: "production",
        position: 4,
        title: "Production task",
        score: marked.score,
        payload: { corrections: marked.corrections.length, text },
      });

      setEarned({ stars: scored.stars, points: scored.points });
      setPhase("done");
    } catch {
      setError("Could not reach the tutor. Check your connection and try again.");
      setPhase("write");
    }
  }

  if (phase === "loading") {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (phase === "empty") {
    return (
      <div className="max-w-md mx-auto text-center py-24">
        <h1 className="text-xl font-bold text-foreground mb-2">No task for today yet</h1>
        <p className="text-sm text-muted-foreground mb-6">
          The curriculum currently covers A1 days 1 to 7.
        </p>
        <Link href="/dashboard" className="text-sm text-primary hover:underline">
          Back to dashboard
        </Link>
      </div>
    );
  }

  if (phase === "marking") {
    return (
      <div className="max-w-xl mx-auto py-24 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
        <p className="text-foreground font-medium mb-1">Marking your German</p>
        <p className="text-sm text-muted-foreground">
          Checking grammar, word order and word choice
        </p>
      </div>
    );
  }

  // ---------- WRITE ----------
  if (phase === "write") {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <PenTool className="w-4 h-4 text-primary" />
            <p className="text-sm text-muted-foreground">
              Day {profile?.current_day} &middot; Production task
            </p>
          </div>
          <h1 className="text-2xl font-bold text-foreground">Write it yourself</h1>
          <p className="text-sm text-muted-foreground mt-1">
            No options to choose from. Build the sentences from nothing — this is the
            part that actually makes you able to speak.
          </p>
        </div>

        <div className="bg-primary-light border border-border rounded-xl p-5 mb-5">
          <p className="text-xs uppercase tracking-wide text-primary mb-2">Your task</p>
          <p className="text-foreground">{day?.production_prompt}</p>
          {day?.grammar_focus && (
            <p className="text-sm text-muted-foreground mt-2">
              Use today&apos;s grammar: {day.grammar_focus}
            </p>
          )}
        </div>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={9}
          placeholder="Schreiben Sie hier auf Deutsch…"
          className="w-full px-4 py-3.5 bg-card border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring text-base leading-relaxed resize-y mb-2"
        />

        <div className="flex items-center justify-between mb-5">
          <span className="text-xs text-muted-foreground tabular-nums">
            {text.trim() ? text.trim().split(/\s+/).length : 0} words
          </span>
          {words.length > 0 && (
            <span className="text-xs text-muted-foreground">
              {words.length} words available from today
            </span>
          )}
        </div>

        {error && (
          <p className="text-sm text-danger bg-danger-bg px-4 py-2.5 rounded-lg mb-4 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </p>
        )}

        <button
          onClick={submit}
          className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3 rounded-xl font-medium text-sm hover:opacity-90 transition-opacity"
        >
          <Sparkles className="w-4 h-4" />
          Mark my German
        </button>
      </div>
    );
  }

  // ---------- DONE ----------
  return (
    <div className="max-w-2xl mx-auto py-4">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-100 dark:bg-amber-950 mb-5">
          <Trophy className="w-8 h-8 text-amber-500" />
        </div>
        {earned && (
          <>
            <div className="flex justify-center mb-3">
              <StarRating stars={earned.stars} size={28} />
            </div>
            <p className="text-sm text-muted-foreground mb-1">
              {STAR_BANDS[earned.stars].meaning}
            </p>
            <p className="text-lg font-semibold text-amber-500 tabular-nums">
              +{earned.points} points
              <span className="text-sm text-muted-foreground font-normal"> of {MAX_TASK_POINTS}</span>
            </p>
          </>
        )}
      </div>

      {result?.feedback && (
        <div className="bg-primary-light border border-border rounded-xl p-5 mb-5">
          <p className="text-foreground">{result.feedback}</p>
        </div>
      )}

      {result && result.strengths.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-5 mb-5">
          <h2 className="text-sm font-semibold text-foreground mb-3">What you did well</h2>
          <ul className="space-y-1.5">
            {result.strengths.map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                <Check className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                {s}
              </li>
            ))}
          </ul>
        </div>
      )}

      {result && result.corrections.length > 0 ? (
        <div className="bg-card border border-border rounded-xl mb-6">
          <div className="px-5 py-4 border-b border-border">
            <h2 className="text-sm font-semibold text-foreground">
              {result.corrections.length} correction
              {result.corrections.length === 1 ? "" : "s"}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Read the reason, not just the fix — that is what stops it happening again.
            </p>
          </div>
          <div className="divide-y divide-border">
            {result.corrections.map((c, i) => (
              <div key={i} className="px-5 py-4">
                <div className="flex items-center justify-between gap-3 mb-2">
                  <span className="text-xs font-medium text-primary bg-primary-light px-2 py-0.5 rounded-full">
                    {c.rule}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground line-through mb-1">{c.original}</p>
                <p className="text-sm text-foreground mb-2">{c.corrected}</p>
                <p className="text-xs text-muted-foreground">{c.explanation}</p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-success-bg border border-success rounded-xl p-5 mb-6 text-center">
          <Check className="w-6 h-6 text-success mx-auto mb-2" />
          <p className="text-sm text-success">
            No corrections. Your German was clean.
          </p>
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={() => {
            setText("");
            setResult(null);
            setEarned(null);
            setPhase("write");
          }}
          className="flex-1 px-5 py-2.5 rounded-lg border border-border text-sm text-foreground hover:bg-muted transition-colors"
        >
          Write it again
        </button>
        <Link
          href="/dashboard"
          className="flex-1 flex items-center justify-center gap-2 bg-primary text-primary-foreground py-2.5 rounded-lg font-medium text-sm hover:opacity-90 transition-opacity"
        >
          Back to dashboard
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
