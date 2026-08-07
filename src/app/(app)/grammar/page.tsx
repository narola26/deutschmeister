"use client";

import { useEffect, useState } from "react";
import {
  Loader2,
  Search,
  ChevronDown,
  Check,
  X,
  Volume2,
  AlertTriangle,
} from "lucide-react";
import { getProfile, getGrammarTopics } from "@/lib/db";
import { speak } from "@/lib/speech";
import VoiceNotice from "@/components/voice-notice";
import type { GrammarTopic, Level } from "@/lib/types";

export default function GrammarPage() {
  const [loading, setLoading] = useState(true);
  const [topics, setTopics] = useState<GrammarTopic[]>([]);
  const [level, setLevel] = useState<Level>("A1");
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const p = await getProfile();
      setLevel(p.current_level);
      setTopics(await getGrammarTopics(p.current_level));
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

  const q = query.trim().toLowerCase();
  const shown = q
    ? topics.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.summary.toLowerCase().includes(q) ||
          t.explanation.toLowerCase().includes(q) ||
          t.examples.some((e) => e.de.toLowerCase().includes(q))
      )
    : topics;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Grammar decoder</h1>
        <p className="text-muted-foreground mt-1">
          Every rule in {level}, with the mistakes people actually make. Look anything
          up without waiting for the day it is taught.
        </p>
      </div>

      <VoiceNotice />

      <div className="relative mb-6">
        <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
        <label htmlFor="grammar-search" className="sr-only">
          Search grammar topics
        </label>
        <input
          id="grammar-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search — try Akkusativ, seit, word order…"
          className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring text-sm"
        />
      </div>

      {shown.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-12">
          Nothing matches &ldquo;{query}&rdquo;.
        </p>
      ) : (
        <div className="space-y-2.5">
          {shown.map((t, i) => {
            const isOpen = open === t.slug;
            return (
              <div key={t.slug} className="bg-card border border-border rounded-xl overflow-hidden">
                <button
                  onClick={() => setOpen(isOpen ? null : t.slug)}
                  aria-expanded={isOpen}
                  className="w-full flex items-start gap-3 px-5 py-4 text-left hover:bg-muted/50 transition-colors"
                >
                  <span className="text-xs text-muted-foreground tabular-nums mt-1 w-6 flex-shrink-0">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="block font-semibold text-foreground">{t.title}</span>
                    <span className="block text-sm text-muted-foreground mt-0.5">
                      {t.summary}
                    </span>
                  </span>
                  <ChevronDown
                    aria-hidden="true"
                    className={`w-4 h-4 text-muted-foreground flex-shrink-0 mt-1 transition-transform ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 border-t border-border pt-4">
                    {t.explanation.split("\n\n").map((para, j) => (
                      <p key={j} className="text-sm text-muted-foreground leading-relaxed mb-3">
                        {para}
                      </p>
                    ))}

                    <h3 className="text-sm font-semibold text-foreground mt-5 mb-2">
                      Examples
                    </h3>
                    <div className="space-y-1.5 mb-5">
                      {t.examples.map((ex, j) => (
                        <button
                          key={j}
                          onClick={() => speak(ex.de)}
                          className="w-full text-left flex items-start gap-2.5 px-3 py-2 rounded-lg hover:bg-muted transition-colors group"
                        >
                          <Volume2
                            aria-hidden="true"
                            className="w-3.5 h-3.5 text-muted-foreground mt-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          />
                          <span>
                            <span className="block text-sm text-foreground">{ex.de}</span>
                            <span className="block text-xs text-muted-foreground">{ex.en}</span>
                          </span>
                        </button>
                      ))}
                    </div>

                    <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-1.5">
                      <AlertTriangle aria-hidden="true" className="w-3.5 h-3.5 text-warning" />
                      Where people go wrong
                    </h3>
                    <div className="space-y-3">
                      {t.common_mistakes.map((m, j) => (
                        <div key={j} className="text-sm">
                          <span className="flex items-center gap-2">
                            <X aria-hidden="true" className="w-3.5 h-3.5 text-danger flex-shrink-0" />
                            <span className="text-muted-foreground line-through">{m.wrong}</span>
                          </span>
                          <span className="flex items-center gap-2 mt-0.5">
                            <Check aria-hidden="true" className="w-3.5 h-3.5 text-success flex-shrink-0" />
                            <span className="text-foreground">{m.right}</span>
                          </span>
                          <p className="text-xs text-muted-foreground mt-1 pl-[22px]">{m.why}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
