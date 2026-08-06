"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  Loader2,
  ArrowRight,
  Check,
  X,
  Volume2,
  AlertTriangle,
  BookOpen,
  Trophy,
  Lightbulb,
} from "lucide-react";
import {
  getProfile,
  getCurriculumDay,
  getGrammarTopic,
  getOrCreateSession,
  completeTask,
} from "@/lib/db";
import { MAX_TASK_POINTS, STAR_BANDS } from "@/lib/stars";
import StarRating from "@/components/star-rating";
import type {
  Profile,
  DailySession,
  CurriculumDay,
  GrammarTopic,
  Stars,
} from "@/lib/types";

type Phase = "loading" | "teach" | "drill" | "done" | "empty";

type Drill = {
  question: string;
  hint: string;
  options: string[];
  answer: string;
  why: string;
};

function speak(text: string) {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "de-DE";
  u.rate = 0.85;
  window.speechSynthesis.speak(u);
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Drills come from the fixed grammar content — the verified examples
 * and the catalogue of common mistakes. Nothing here is generated,
 * so a drill can never teach a wrong rule.
 */
function buildDrills(topic: GrammarTopic): Drill[] {
  const fromMistakes: Drill[] = topic.common_mistakes.map((m) => ({
    question: "Which one is correct?",
    hint: m.why,
    options: shuffle([m.right, m.wrong]),
    answer: m.right,
    why: m.why,
  }));

  const fromExamples: Drill[] = topic.examples.slice(0, 4).map((ex, i) => {
    const others = topic.examples.filter((_, j) => j !== i).map((e) => e.en);
    return {
      question: ex.de,
      hint: "What does this mean?",
      options: shuffle([ex.en, ...shuffle(others).slice(0, 2)]),
      answer: ex.en,
      why: `${ex.de} — ${ex.en}`,
    };
  });

  return [...fromMistakes, ...fromExamples];
}

export default function LessonsPage() {
  const [phase, setPhase] = useState<Phase>("loading");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<DailySession | null>(null);
  const [day, setDay] = useState<CurriculumDay | null>(null);
  const [topic, setTopic] = useState<GrammarTopic | null>(null);

  const [drills, setDrills] = useState<Drill[]>([]);
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [correct, setCorrect] = useState(0);

  const [earned, setEarned] = useState<{ stars: Stars; points: number } | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const p = await getProfile();
      setProfile(p);

      const d = await getCurriculumDay(p.current_level, p.current_day);
      if (!d) return setPhase("empty");
      setDay(d);

      const t = d.grammar_slug ? await getGrammarTopic(d.grammar_slug) : null;
      if (!t) return setPhase("empty");
      setTopic(t);

      setSession(await getOrCreateSession(p));
      setPhase("teach");
    })();
  }, []);

  const finish = useCallback(
    async (right: number, total: number) => {
      if (!profile || !session || !topic) return;
      setSaving(true);

      const res = await completeTask({
        profile,
        session,
        kind: "lesson",
        position: 3,
        title: topic.title,
        score: right / total,
        payload: { correct: right, total, grammar_slug: topic.slug },
      });

      setEarned({ stars: res.stars, points: res.points });
      setSaving(false);
      setPhase("done");
    },
    [profile, session, topic]
  );

  function answer(option: string) {
    if (picked) return;
    setPicked(option);
    const isRight = option === drills[index].answer;
    const right = correct + (isRight ? 1 : 0);
    setCorrect(right);

    setTimeout(() => {
      if (index + 1 < drills.length) {
        setIndex(index + 1);
        setPicked(null);
      } else {
        finish(right, drills.length);
      }
    }, 1600);
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
        <h1 className="text-xl font-bold text-foreground mb-2">No lesson for today yet</h1>
        <p className="text-sm text-muted-foreground mb-6">
          The curriculum currently covers A1 days 1 to 7. More is being written.
        </p>
        <Link href="/dashboard" className="text-sm text-primary hover:underline">
          Back to dashboard
        </Link>
      </div>
    );
  }

  // ---------- TEACH ----------
  if (phase === "teach" && topic && day) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <p className="text-sm text-muted-foreground mb-1">
            Day {profile?.current_day} &middot; {day.title}
          </p>
          <h1 className="text-2xl font-bold text-foreground">{topic.title}</h1>
        </div>

        <div className="bg-primary-light border border-border rounded-xl p-5 mb-6">
          <p className="text-sm text-foreground leading-relaxed">{topic.summary}</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="w-4 h-4 text-primary" />
            <h2 className="font-semibold text-foreground">How it works</h2>
          </div>
          {topic.explanation.split("\n\n").map((para, i) => (
            <p key={i} className="text-sm text-muted-foreground leading-relaxed mb-3 last:mb-0">
              {para}
            </p>
          ))}
        </div>

        <div className="bg-card border border-border rounded-xl mb-6">
          <div className="px-6 py-4 border-b border-border flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-amber-500" />
            <h2 className="font-semibold text-foreground">In use</h2>
          </div>
          <div className="divide-y divide-border">
            {topic.examples.map((ex, i) => (
              <button
                key={i}
                onClick={() => speak(ex.de)}
                className="w-full text-left px-6 py-3.5 hover:bg-muted/50 transition-colors group flex items-start gap-3"
              >
                <Volume2 className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div>
                  <p className="text-foreground">{ex.de}</p>
                  <p className="text-sm text-muted-foreground">{ex.en}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-card border border-warning rounded-xl mb-8">
          <div className="px-6 py-4 border-b border-border flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-warning" />
            <h2 className="font-semibold text-foreground">Where people go wrong</h2>
          </div>
          <div className="divide-y divide-border">
            {topic.common_mistakes.map((m, i) => (
              <div key={i} className="px-6 py-4">
                <div className="flex items-center gap-2 mb-1.5">
                  <X className="w-4 h-4 text-danger flex-shrink-0" />
                  <span className="text-sm text-muted-foreground line-through">{m.wrong}</span>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <Check className="w-4 h-4 text-success flex-shrink-0" />
                  <span className="text-sm text-foreground">{m.right}</span>
                </div>
                <p className="text-xs text-muted-foreground pl-6">{m.why}</p>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={() => {
            setDrills(buildDrills(topic));
            setPhase("drill");
          }}
          className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3 rounded-xl font-medium text-sm hover:opacity-90 transition-opacity"
        >
          Now prove it — start the exercises
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  // ---------- DRILL ----------
  if (phase === "drill") {
    const d = drills[index];
    return (
      <div className="max-w-xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-foreground">Exercises</h1>
          <span className="text-sm text-muted-foreground tabular-nums">
            {index + 1} / {drills.length}
          </span>
        </div>

        <div className="h-1.5 bg-muted rounded-full mb-8 overflow-hidden">
          <div
            className="h-full bg-amber-400 rounded-full transition-all"
            style={{ width: `${((index + 1) / drills.length) * 100}%` }}
          />
        </div>

        <div className="bg-card border border-border rounded-2xl p-7 mb-5 text-center">
          <p className="text-xs uppercase tracking-wide text-muted-foreground mb-3">
            {d.hint === d.why ? "Choose the correct sentence" : d.hint}
          </p>
          <p className="text-2xl font-bold text-foreground">{d.question}</p>
        </div>

        <div className="grid gap-2.5">
          {d.options.map((opt) => {
            const isAnswer = opt === d.answer;
            const isPicked = picked === opt;
            let style = "border-border hover:border-primary/40 hover:bg-muted";
            if (picked) {
              if (isAnswer) style = "border-success bg-success-bg text-success";
              else if (isPicked) style = "border-danger bg-danger-bg text-danger";
              else style = "border-border opacity-50";
            }
            return (
              <button
                key={opt}
                onClick={() => answer(opt)}
                disabled={!!picked}
                className={`flex items-center justify-between gap-3 px-5 py-3.5 rounded-xl border text-left text-sm transition-colors ${style}`}
              >
                <span>{opt}</span>
                {picked && isAnswer && <Check className="w-4 h-4 flex-shrink-0" />}
                {picked && isPicked && !isAnswer && <X className="w-4 h-4 flex-shrink-0" />}
              </button>
            );
          })}
        </div>

        {picked && (
          <div className="mt-5 px-5 py-4 rounded-xl bg-primary-light border border-border">
            <p className="text-sm text-foreground">{d.why}</p>
          </div>
        )}
      </div>
    );
  }

  // ---------- DONE ----------
  return (
    <div className="max-w-xl mx-auto py-8 text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-100 dark:bg-amber-950 mb-5">
        <Trophy className="w-8 h-8 text-amber-500" />
      </div>
      <h1 className="text-2xl font-bold text-foreground mb-2">
        {correct} of {drills.length} correct
      </h1>
      <p className="text-sm text-muted-foreground mb-4">{topic?.title}</p>

      {saving ? (
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground mx-auto" />
      ) : (
        earned && (
          <>
            <div className="flex justify-center mb-3">
              <StarRating stars={earned.stars} size={28} />
            </div>
            <p className="text-sm text-muted-foreground mb-1">
              {STAR_BANDS[earned.stars].meaning}
            </p>
            <p className="text-lg font-semibold text-amber-500 tabular-nums mb-8">
              +{earned.points} points
              <span className="text-sm text-muted-foreground font-normal"> of {MAX_TASK_POINTS}</span>
            </p>
          </>
        )
      )}

      <div className="flex gap-3">
        <Link
          href="/dashboard"
          className="flex-1 text-center px-5 py-2.5 rounded-lg border border-border text-sm text-foreground hover:bg-muted transition-colors"
        >
          Back to dashboard
        </Link>
        <Link
          href="/writing"
          className="flex-1 flex items-center justify-center gap-2 bg-primary text-primary-foreground py-2.5 rounded-lg font-medium text-sm hover:opacity-90 transition-opacity"
        >
          Production task
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
