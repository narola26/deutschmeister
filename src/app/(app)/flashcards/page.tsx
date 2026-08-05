"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Loader2, Volume2, RotateCcw, Trophy, ArrowRight, CheckCircle2 } from "lucide-react";
import {
  getProfile,
  getDueFlashcards,
  getOrCreateSession,
  completeTask,
  saveFlashcardReview,
} from "@/lib/db";
import { nextReview, STAR_BANDS, MAX_TASK_POINTS } from "@/lib/stars";
import StarRating from "@/components/star-rating";
import type { UserVocabulary, Profile, DailySession, Stars } from "@/lib/types";

type Phase = "loading" | "review" | "done" | "empty";

const RATINGS: { stars: Stars; label: string; hint: string; style: string }[] = [
  { stars: 0, label: "No idea", hint: "again tomorrow", style: "border-danger text-danger hover:bg-danger-bg" },
  { stars: 1, label: "Hard", hint: "still shaky", style: "border-warning text-warning hover:bg-warning-bg" },
  { stars: 2, label: "Good", hint: "got it", style: "border-primary text-primary hover:bg-primary-light" },
  { stars: 3, label: "Easy", hint: "mastered", style: "border-success text-success hover:bg-success-bg" },
];

function speak(text: string) {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = "de-DE";
  utter.rate = 0.85;
  window.speechSynthesis.speak(utter);
}

export default function FlashcardsPage() {
  const [phase, setPhase] = useState<Phase>("loading");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<DailySession | null>(null);
  const [cards, setCards] = useState<UserVocabulary[]>([]);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [scores, setScores] = useState<Stars[]>([]);
  const [earned, setEarned] = useState<{ stars: Stars; points: number } | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const p = await getProfile();
      setProfile(p);

      const due = await getDueFlashcards(30);
      if (due.length === 0) return setPhase("empty");
      setCards(due);

      const s = await getOrCreateSession(p);
      setSession(s);
      setPhase("review");
    })();
  }, []);

  const finish = useCallback(
    async (allScores: Stars[]) => {
      if (!profile || !session) return;
      setSaving(true);

      const score =
        allScores.reduce<number>((sum, s) => sum + s, 0) / (allScores.length * 3);
      const res = await completeTask({
        profile,
        session,
        kind: "repair",
        position: 1,
        title: `${allScores.length} cards reviewed`,
        score,
        payload: { cards: allScores.length },
      });

      setEarned({ stars: res.stars, points: res.points });
      setSaving(false);
      setPhase("done");
    },
    [profile, session]
  );

  async function rate(stars: Stars) {
    const card = cards[index];
    const state = nextReview(
      {
        ease_factor: card.ease_factor,
        interval_days: card.interval_days,
        repetitions: card.repetitions,
      },
      stars
    );
    await saveFlashcardReview(card, stars, state);

    const next = [...scores, stars];
    setScores(next);

    if (index + 1 < cards.length) {
      setIndex(index + 1);
      setFlipped(false);
    } else {
      finish(next);
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
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-success-bg mb-5">
          <CheckCircle2 className="w-7 h-7 text-success" />
        </div>
        <h1 className="text-xl font-bold text-foreground mb-2">Nothing due right now</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Learn today&apos;s new words first — they become flashcards automatically and
          come back on the schedule the algorithm sets.
        </p>
        <Link
          href="/vocabulary"
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
        >
          Learn today&apos;s words
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  if (phase === "review") {
    const card = cards[index];
    const w = card.vocabulary_master;
    if (!w) return null;

    return (
      <div className="max-w-xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-foreground">Flashcard review</h1>
            <p className="text-sm text-muted-foreground">Spaced repetition &middot; due today</p>
          </div>
          <span className="text-sm text-muted-foreground tabular-nums">
            {index + 1} / {cards.length}
          </span>
        </div>

        <div className="h-1.5 bg-muted rounded-full mb-8 overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all"
            style={{ width: `${((index + 1) / cards.length) * 100}%` }}
          />
        </div>

        <button
          onClick={() => !flipped && setFlipped(true)}
          className={`w-full bg-card border border-border rounded-2xl p-8 mb-6 min-h-[300px] flex flex-col items-center justify-center text-center transition-colors ${
            flipped ? "cursor-default" : "cursor-pointer hover:border-primary/40"
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            {w.article && (
              <span className="text-xl text-muted-foreground">{w.article}&nbsp;</span>
            )}
            <span className="text-4xl font-bold text-foreground">{w.german}</span>
            <span
              role="button"
              tabIndex={0}
              onClick={(e) => {
                e.stopPropagation();
                speak(w.article ? `${w.article} ${w.german}` : w.german);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.stopPropagation();
                  speak(w.german);
                }
              }}
              className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Listen"
            >
              <Volume2 className="w-5 h-5" />
            </span>
          </div>

          {!flipped ? (
            <p className="text-sm text-muted-foreground mt-6 flex items-center gap-2">
              <RotateCcw className="w-4 h-4" />
              Tap to reveal
            </p>
          ) : (
            <div className="mt-4 w-full">
              <p className="text-xl text-foreground mb-1">{w.english}</p>
              {w.plural && (
                <p className="text-xs text-muted-foreground mb-5">Plural: die {w.plural}</p>
              )}
              <div className="pt-5 border-t border-border mt-5">
                <p className="text-foreground mb-1">{w.example_de}</p>
                <p className="text-sm text-muted-foreground">{w.example_en}</p>
              </div>
            </div>
          )}
        </button>

        {flipped && (
          <div>
            <p className="text-xs text-center text-muted-foreground mb-3">
              How well did you know it? This sets when the card returns.
            </p>
            <div className="grid grid-cols-4 gap-2">
              {RATINGS.map((r) => (
                <button
                  key={r.stars}
                  onClick={() => rate(r.stars)}
                  className={`flex flex-col items-center gap-1 px-2 py-3 rounded-xl border text-xs font-medium transition-colors ${r.style}`}
                >
                  <span>{r.label}</span>
                  <span className="text-[10px] opacity-70 font-normal">{r.hint}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  const mastered = scores.filter((s) => s === 3).length;
  const repaired = scores.filter((s) => s < 2).length;

  return (
    <div className="max-w-xl mx-auto py-8 text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-100 dark:bg-amber-950 mb-5">
        <Trophy className="w-8 h-8 text-amber-500" />
      </div>
      <h1 className="text-2xl font-bold text-foreground mb-2">
        {scores.length} cards reviewed
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
            <p className="text-lg font-semibold text-amber-500 tabular-nums mb-8">
              +{earned.points} points
              <span className="text-sm text-muted-foreground font-normal"> of {MAX_TASK_POINTS}</span>
            </p>
          </>
        )
      )}

      <div className="grid grid-cols-2 gap-3 mb-8">
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-2xl font-bold text-success tabular-nums">{mastered}</p>
          <p className="text-xs text-muted-foreground mt-1">Mastered — retired to long review</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-2xl font-bold text-warning tabular-nums">{repaired}</p>
          <p className="text-xs text-muted-foreground mt-1">Back tomorrow in repair</p>
        </div>
      </div>

      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2.5 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
      >
        Back to dashboard
        <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}
