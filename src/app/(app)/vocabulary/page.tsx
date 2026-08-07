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
  Rabbit,
  Info,
} from "lucide-react";
import {
  getProfile,
  getWordsForDay,
  getOrCreateSession,
  completeTask,
  saveVocabularyResults,
} from "@/lib/db";
import { MAX_TASK_POINTS, STAR_BANDS } from "@/lib/stars";
import { speak } from "@/lib/speech";
import StarRating from "@/components/star-rating";
import VoiceNotice from "@/components/voice-notice";
import { GENDER_CLASS } from "@/components/gender-word";
import type { MasterWord, Profile, DailySession, Stars } from "@/lib/types";

type Phase = "loading" | "study" | "batch-check" | "quiz" | "done" | "empty";

/** Below this, a day is treated as still being written rather than a session. */
const MIN_WORDS_PER_DAY = 10;

/**
 * Words are taught in small batches with a check after each one.
 *
 * The previous version showed all thirty words once and then tested
 * them, which nobody can pass — a beginner scored the same as random
 * guessing and was told they had failed. Six at a time, each one seen
 * again immediately, is how the words actually stick.
 */
const BATCH_SIZE = 6;

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

function buildQuestions(
  pool: MasterWord[],
  from: MasterWord[],
  count: number
): Question[] {
  return shuffle(from)
    .slice(0, count)
    .map((word) => {
      const direction: "de-en" | "en-de" = Math.random() > 0.5 ? "de-en" : "en-de";
      const answer = direction === "de-en" ? word.english : word.german;
      const others = pool
        .filter((w) => w.id !== word.id)
        .map((w) => (direction === "de-en" ? w.english : w.german));
      const distractors = shuffle(others).slice(0, Math.min(3, others.length));
      return { word, options: shuffle([...distractors, answer]), answer, direction };
    });
}

export default function VocabularyPage() {
  const [phase, setPhase] = useState<Phase>("loading");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<DailySession | null>(null);
  const [words, setWords] = useState<MasterWord[]>([]);

  const [batch, setBatch] = useState(0);
  const [index, setIndex] = useState(0);

  const [questions, setQuestions] = useState<Question[]>([]);
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
      if (w.length < MIN_WORDS_PER_DAY) return setPhase("empty");
      setWords(w);
      setSession(await getOrCreateSession(p));
      setPhase("study");
    })();
  }, []);

  const batches = Math.ceil(words.length / BATCH_SIZE);
  const batchWords = words.slice(batch * BATCH_SIZE, (batch + 1) * BATCH_SIZE);
  const isLastBatch = batch >= batches - 1;

  const finish = useCallback(
    async (finalResults: { word: MasterWord; correct: boolean }[]) => {
      if (!profile || !session) return;
      setSaving(true);

      const score =
        finalResults.filter((r) => r.correct).length / finalResults.length;
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
        payload: {
          correct: finalResults.filter((r) => r.correct).length,
          total: finalResults.length,
        },
      });

      setEarned({ stars: res.stars, points: res.points });
      setSaving(false);
      setPhase("done");
    },
    [profile, session, words]
  );

  function answer(option: string) {
    if (picked) return;
    setPicked(option);
    const q = questions[qIndex];
    const correct = option === q.answer;
    const next = [...results, { word: q.word, correct }];
    setResults(next);

    setTimeout(() => {
      if (qIndex + 1 < questions.length) {
        setQIndex(qIndex + 1);
        setPicked(null);
        return;
      }
      if (phase === "batch-check") {
        if (isLastBatch) {
          setQuestions(buildQuestions(words, words, 12));
          setQIndex(0);
          setPicked(null);
          setResults([]);
          setPhase("quiz");
        } else {
          setBatch(batch + 1);
          setIndex(0);
          setPicked(null);
          setPhase("study");
        }
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
          A1 runs to 30 days, and the vocabulary is written one checked word at a time
          rather than generated. This day is not finished yet — review what you already
          have while the rest is written.
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
    const w = batchWords[index];
    const lastInBatch = index === batchWords.length - 1;
    const seen = batch * BATCH_SIZE + index + 1;

    return (
      <div className="max-w-xl mx-auto">
        <div className="flex items-center justify-between mb-2 gap-4">
          <div>
            <h1 className="text-xl font-bold text-foreground">New vocabulary</h1>
            <p className="text-sm text-muted-foreground">
              Day {profile?.current_day} &middot; group {batch + 1} of {batches}
            </p>
          </div>
          <span className="text-sm text-muted-foreground tabular-nums">
            {seen} / {words.length}
          </span>
        </div>

        <div className="h-1.5 bg-muted rounded-full mb-6 overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all"
            style={{ width: `${(seen / words.length) * 100}%` }}
          />
        </div>

        <VoiceNotice />

        <div className="bg-card border border-border rounded-2xl p-8 mb-6 min-h-[300px] flex flex-col">
          <div className="flex items-start justify-between gap-4 mb-1">
            <div>
              {w.article && (
                <span className={`text-lg mr-1 ${GENDER_CLASS[w.article] ?? ""}`}>
                  {w.article}{" "}
                </span>
              )}
              <span className="text-3xl font-bold text-foreground">{w.german}</span>
            </div>
            <div className="flex gap-1 flex-shrink-0">
              <button
                onClick={() => speak(w.article ? `${w.article} ${w.german}` : w.german, { slow: true })}
                aria-label="Hear it slowly"
                className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              >
                <Rabbit className="w-5 h-5 rotate-180" aria-hidden="true" />
              </button>
              <button
                onClick={() => speak(w.article ? `${w.article} ${w.german}` : w.german)}
                aria-label="Hear it"
                className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              >
                <Volume2 className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>
          </div>

          {w.plural && (
            <p className="text-sm text-muted-foreground mb-3">Plural: die {w.plural}</p>
          )}

          <p className="text-lg text-foreground mb-6">{w.english}</p>

          <div className="mt-auto pt-6 border-t border-border">
            <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">
              {w.word_type}
            </p>
            <button onClick={() => speak(w.example_de)} className="text-left w-full group">
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
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            Back
          </button>
          <button
            onClick={() => {
              if (lastInBatch) {
                setQuestions(buildQuestions(words, batchWords, batchWords.length));
                setQIndex(0);
                setPicked(null);
                setResults([]);
                setPhase("batch-check");
              } else {
                setIndex(index + 1);
              }
            }}
            className="flex-1 flex items-center justify-center gap-2 bg-primary text-primary-foreground py-2.5 rounded-lg font-medium text-sm hover:opacity-90 transition-opacity"
          >
            {lastInBatch ? `Practise these ${batchWords.length}` : "Next word"}
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    );
  }

  // ---------- CHECKS ----------
  if (phase === "batch-check" || phase === "quiz") {
    const q = questions[qIndex];
    const prompt = q.direction === "de-en" ? q.word.german : q.word.english;
    const promptArticle = q.direction === "de-en" ? q.word.article : null;
    const isFinal = phase === "quiz";

    return (
      <div className="max-w-xl mx-auto">
        <div className="flex items-center justify-between mb-2 gap-4">
          <div>
            <h1 className="text-xl font-bold text-foreground">
              {isFinal ? "Final check" : "Quick practice"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {isFinal
                ? "All of today's words"
                : `The ${batchWords.length} you just met`}
            </p>
          </div>
          <span className="text-sm text-muted-foreground tabular-nums">
            {qIndex + 1} / {questions.length}
          </span>
        </div>

        <div className="h-1.5 bg-muted rounded-full mb-6 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${isFinal ? "bg-amber-400" : "bg-primary"}`}
            style={{ width: `${((qIndex + 1) / questions.length) * 100}%` }}
          />
        </div>

        {!isFinal && (
          <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-primary-light border border-border mb-5">
            <Info aria-hidden="true" className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground">
              This practice round is not scored. It is here so the words are already
              familiar by the time the real check arrives.
            </p>
          </div>
        )}

        <div className="bg-card border border-border rounded-2xl p-8 mb-5 text-center">
          <p className="text-xs uppercase tracking-wide text-muted-foreground mb-3">
            {q.direction === "de-en" ? "What does this mean?" : "How do you say this?"}
          </p>
          <p className="text-3xl font-bold text-foreground">
            {promptArticle && (
              <span className={`text-xl ${GENDER_CLASS[promptArticle] ?? ""}`}>
                {promptArticle}{" "}
              </span>
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
                {picked && isAnswer && <Check className="w-4 h-4 flex-shrink-0" aria-hidden="true" />}
                {picked && isPicked && !isAnswer && <X className="w-4 h-4 flex-shrink-0" aria-hidden="true" />}
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
          <Trophy className="w-8 h-8 text-amber-500" aria-hidden="true" />
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
              <Link
                href="/how-scoring-works"
                className="text-xs text-muted-foreground hover:text-foreground underline mt-2 inline-block"
              >
                What do the stars mean?
              </Link>
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
                    <span className={GENDER_CLASS[word.article] ?? ""}>{word.article} </span>
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
          href="/lessons"
          className="flex-1 flex items-center justify-center gap-2 bg-primary text-primary-foreground py-2.5 rounded-lg font-medium text-sm hover:opacity-90 transition-opacity"
        >
          Today&apos;s lesson
          <ArrowRight className="w-4 h-4" aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}
