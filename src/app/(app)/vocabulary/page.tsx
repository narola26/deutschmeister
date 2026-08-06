"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ArrowLeft,
  Check,
  X,
  Loader2,
  Volume2,
  Trophy,
} from "lucide-react";
import {
  getProfile,
  getWordsForDay,
  getOrCreateSession,
  completeTask,
  saveVocabularyResults,
} from "@/lib/db";
import { MAX_TASK_POINTS, STAR_BANDS } from "@/lib/stars";
import StarRating from "@/components/star-rating";
import type { MasterWord, Profile, DailySession, Stars } from "@/lib/types";

type Phase = "loading" | "study" | "quiz" | "done" | "empty";

type Question = {
  word: MasterWord;
  options: string[];
  answer: string;
  direction: "de-en" | "en-de";
};

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildQuiz(words: MasterWord[], count = 12): Question[] {
  return shuffle(words)
    .slice(0, count)
    .map((word) => {
      const direction: "de-en" | "en-de" =
        Math.random() > 0.5 ? "de-en" : "en-de";
      const answer = direction === "de-en" ? word.english : word.german;
      const pool = words
        .filter((w) => w.id !== word.id)
        .map((w) => (direction === "de-en" ? w.english : w.german));
      const options = shuffle([...shuffle(pool).slice(0, 3), answer]);
      return { word, options, answer, direction };
    });
}

function speak(text: string) {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = "de-DE";
  utter.rate = 0.85;
  window.speechSynthesis.speak(utter);
}

export default function VocabularyPage() {
  const [phase, setPhase] = useState<Phase>("loading");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<DailySession | null>(null);
  const [words, setWords] = useState<MasterWord[]>([]);
  const [index, setIndex] = useState(0);

  const [quiz, setQuiz] = useState<Question[]>([]);
  const [qIndex, setQIndex] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [results, setResults] = useState<{ word: MasterWord; correct: boolean }[]>([]);

  const [earned, setEarned] = useState<{ stars: Stars; points: number } | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const p = await getProfile();
      setProfile(p);

      const w = await getWordsForDay(p.current_level, p.current_day);
      if (w.length === 0) return setPhase("empty");
      setWords(w);

      const s = await getOrCreateSession(p);
      setSession(s);
      setPhase("study");
    })();
  }, []);

  const finish = useCallback(
    async (finalResults: { word: MasterWord; correct: boolean }[]) => {
      if (!profile || !session) return;
      setSaving(true);

      // The quiz samples 12 of the 30, but all 30 were studied — every one
      // of them enters spaced repetition. Untested words start on the normal
      // one-day interval; tested ones carry their real result.
      const score = finalResults.filter((r) => r.correct).length / finalResults.length;
      const tested = new Set(finalResults.map((r) => r.word.id));
      const untested = words
        .filter((w) => !tested.has(w.id))
        .map((word) => ({ word, correct: true }));

      await saveVocabularyResults([...finalResults, ...untested]);
      const res = await completeTask({
        profile,
        session,
        kind: "vocabulary",
        position: 2,
        title: `${words.length} new words — day ${profile.current_day}`,
        score,
        payload: { correct: finalResults.filter((r) => r.correct).length, total: finalResults.length },
      });

      setEarned({ stars: res.stars, points: res.points });
      setSaving(false);
      setPhase("done");
    },
    [profile, session, words.length]
  );

  function answer(option: string) {
    if (picked) return;
    setPicked(option);
    const q = quiz[qIndex];
    const correct = option === q.answer;
    const next = [...results, { word: q.word, correct }];
    setResults(next);

    setTimeout(() => {
      if (qIndex + 1 < quiz.length) {
        setQIndex(qIndex + 1);
        setPicked(null);
      } else {
        finish(next);
      }
    }, 900);
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
        <h1 className="text-xl font-bold text-foreground mb-2">
          Day {profile?.current_day} is still being written
        </h1>
        <p className="text-sm text-muted-foreground mb-6">
          A1 runs to 30 days and the vocabulary is being written day by day, checked
          word for word. Everything up to day 12 is ready — review what you have while
          the rest is finished.
        </p>
        <div className="flex gap-3 justify-center">
          <Link
            href="/flashcards"
            className="px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Review flashcards
          </Link>
          <Link
            href="/dashboard"
            className="px-5 py-2.5 rounded-lg border border-border text-sm text-foreground hover:bg-muted transition-colors"
          >
            Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // ---------- STUDY ----------
  if (phase === "study") {
    const w = words[index];
    const isLast = index === words.length - 1;

    return (
      <div className="max-w-xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-foreground">New vocabulary</h1>
            <p className="text-sm text-muted-foreground">
              Day {profile?.current_day} &middot; {profile?.current_level}
            </p>
          </div>
          <span className="text-sm text-muted-foreground tabular-nums">
            {index + 1} / {words.length}
          </span>
        </div>

        <div className="h-1.5 bg-muted rounded-full mb-8 overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all"
            style={{ width: `${((index + 1) / words.length) * 100}%` }}
          />
        </div>

        <div className="bg-card border border-border rounded-2xl p-8 mb-6 min-h-[320px] flex flex-col">
          <div className="flex items-start justify-between gap-4 mb-1">
            <div>
              {w.article && (
                <span className="text-lg text-muted-foreground">{w.article} </span>
              )}
              <span className="text-3xl font-bold text-foreground">{w.german}</span>
            </div>
            <button
              onClick={() => speak(w.article ? `${w.article} ${w.german}` : w.german)}
              className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
              aria-label="Listen to pronunciation"
            >
              <Volume2 className="w-5 h-5" />
            </button>
          </div>

          {w.plural && (
            <p className="text-sm text-muted-foreground mb-3">Plural: die {w.plural}</p>
          )}

          <p className="text-lg text-foreground mb-6">{w.english}</p>

          <div className="mt-auto pt-6 border-t border-border">
            <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">
              {w.word_type}
            </p>
            <button
              onClick={() => speak(w.example_de)}
              className="text-left w-full group"
            >
              <p className="text-foreground mb-1 group-hover:text-primary transition-colors">
                {w.example_de}
              </p>
            </button>
            <p className="text-sm text-muted-foreground">{w.example_en}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIndex(Math.max(0, index - 1))}
            disabled={index === 0}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-border text-sm text-foreground hover:bg-muted disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <button
            onClick={() => {
              if (isLast) {
                setQuiz(buildQuiz(words));
                setPhase("quiz");
              } else {
                setIndex(index + 1);
              }
            }}
            className="flex-1 flex items-center justify-center gap-2 bg-primary text-primary-foreground py-2.5 rounded-lg font-medium text-sm hover:opacity-90 transition-opacity"
          >
            {isLast ? "Start the quiz" : "Next word"}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // ---------- QUIZ ----------
  if (phase === "quiz") {
    const q = quiz[qIndex];
    const prompt = q.direction === "de-en" ? q.word.german : q.word.english;
    const promptArticle = q.direction === "de-en" ? q.word.article : null;

    return (
      <div className="max-w-xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-foreground">Quick check</h1>
          <span className="text-sm text-muted-foreground tabular-nums">
            {qIndex + 1} / {quiz.length}
          </span>
        </div>

        <div className="h-1.5 bg-muted rounded-full mb-8 overflow-hidden">
          <div
            className="h-full bg-amber-400 rounded-full transition-all"
            style={{ width: `${((qIndex + 1) / quiz.length) * 100}%` }}
          />
        </div>

        <div className="bg-card border border-border rounded-2xl p-8 mb-5 text-center">
          <p className="text-xs uppercase tracking-wide text-muted-foreground mb-3">
            {q.direction === "de-en" ? "What does this mean?" : "How do you say this?"}
          </p>
          <p className="text-3xl font-bold text-foreground">
            {promptArticle && (
              <span className="text-muted-foreground text-xl">{promptArticle} </span>
            )}
            {prompt}
          </p>
        </div>

        <div className="grid gap-2.5">
          {q.options.map((opt) => {
            const isAnswer = opt === q.answer;
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
      </div>
    );
  }

  // ---------- DONE ----------
  const correct = results.filter((r) => r.correct).length;
  const wrong = results.filter((r) => !r.correct);

  return (
    <div className="max-w-xl mx-auto py-8">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-100 dark:bg-amber-950 mb-5">
          <Trophy className="w-8 h-8 text-amber-500" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">
          {correct} of {results.length} correct
        </h1>
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
              <p className="text-lg font-semibold text-amber-500 tabular-nums">
                +{earned.points} points
                <span className="text-sm text-muted-foreground font-normal">
                  {" "}of {MAX_TASK_POINTS}
                </span>
              </p>
            </>
          )
        )}
      </div>

      {wrong.length > 0 && (
        <div className="bg-card border border-border rounded-xl mb-6">
          <div className="px-5 py-3.5 border-b border-border">
            <h2 className="text-sm font-semibold text-foreground">
              Queued for repair ({wrong.length})
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              These come back in tomorrow&apos;s first block until they stick.
            </p>
          </div>
          <div className="divide-y divide-border">
            {wrong.map(({ word }) => (
              <div key={word.id} className="px-5 py-3 flex items-baseline justify-between gap-4">
                <span className="text-sm text-foreground">
                  {word.article && (
                    <span className="text-muted-foreground">{word.article} </span>
                  )}
                  {word.german}
                </span>
                <span className="text-sm text-muted-foreground text-right">{word.english}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <Link
          href="/dashboard"
          className="flex-1 text-center px-5 py-2.5 rounded-lg border border-border text-sm text-foreground hover:bg-muted transition-colors"
        >
          Back to dashboard
        </Link>
        <Link
          href="/flashcards"
          className="flex-1 flex items-center justify-center gap-2 bg-primary text-primary-foreground py-2.5 rounded-lg font-medium text-sm hover:opacity-90 transition-opacity"
        >
          Review flashcards
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
