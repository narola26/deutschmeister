"use client";

import Link from "next/link";
import { Volume2, ArrowRight, Lightbulb } from "lucide-react";
import { speak } from "@/lib/speech";
import VoiceNotice from "@/components/voice-notice";

type Rule = {
  letters: string;
  sounds: string;
  like: string;
  examples: { de: string; say: string; en: string }[];
};

/**
 * German spelling is regular. Once these rules are known, almost every
 * word in the course can be read aloud correctly on sight — which is
 * the difference between vocabulary that can be learned and vocabulary
 * that is just shapes on a screen.
 */
const VOWEL_RULES: Rule[] = [
  {
    letters: "ei",
    sounds: "EYE",
    like: "like the i in wine",
    examples: [
      { de: "nein", say: "nine", en: "no" },
      { de: "heißen", say: "HYE-sen", en: "to be called" },
      { de: "eins", say: "eyness", en: "one" },
    ],
  },
  {
    letters: "ie",
    sounds: "EE",
    like: "like the ee in see",
    examples: [
      { de: "sieben", say: "ZEE-ben", en: "seven" },
      { de: "die", say: "dee", en: "the" },
      { de: "Miete", say: "MEE-teh", en: "rent" },
    ],
  },
  {
    letters: "eu / äu",
    sounds: "OY",
    like: "like the oy in boy",
    examples: [
      { de: "neun", say: "noyn", en: "nine" },
      { de: "Leute", say: "LOY-teh", en: "people" },
      { de: "Häuser", say: "HOY-zer", en: "houses" },
    ],
  },
  {
    letters: "ä",
    sounds: "EH",
    like: "like the e in bed",
    examples: [
      { de: "Väter", say: "FEH-ter", en: "fathers" },
      { de: "spät", say: "shpeht", en: "late" },
    ],
  },
  {
    letters: "ö",
    sounds: "UR",
    like: "say ay, then round your lips",
    examples: [
      { de: "schön", say: "shurn", en: "beautiful" },
      { de: "hören", say: "HUR-ren", en: "to hear" },
    ],
  },
  {
    letters: "ü",
    sounds: "EW",
    like: "say ee, then round your lips",
    examples: [
      { de: "über", say: "EW-ber", en: "over" },
      { de: "Tür", say: "tewr", en: "door" },
      { de: "fünf", say: "fewnf", en: "five" },
    ],
  },
];

const CONSONANT_RULES: Rule[] = [
  {
    letters: "w",
    sounds: "V",
    like: "always a v, never an English w",
    examples: [
      { de: "Wasser", say: "VAS-ser", en: "water" },
      { de: "wohnen", say: "VOH-nen", en: "to live" },
      { de: "wie", say: "vee", en: "how" },
    ],
  },
  {
    letters: "v",
    sounds: "F",
    like: "usually an f",
    examples: [
      { de: "Vater", say: "FAH-ter", en: "father" },
      { de: "vier", say: "feer", en: "four" },
      { de: "verstehen", say: "fer-SHTAY-en", en: "to understand" },
    ],
  },
  {
    letters: "z",
    sounds: "TS",
    like: "like the ts in cats",
    examples: [
      { de: "Zeit", say: "tsite", en: "time" },
      { de: "zwei", say: "tsvy", en: "two" },
      { de: "Zimmer", say: "TSIM-mer", en: "room" },
    ],
  },
  {
    letters: "s + vowel",
    sounds: "Z",
    like: "an s before a vowel is a z",
    examples: [
      { de: "sieben", say: "ZEE-ben", en: "seven" },
      { de: "Sonne", say: "ZON-neh", en: "sun" },
      { de: "sagen", say: "ZAH-gen", en: "to say" },
    ],
  },
  {
    letters: "ß",
    sounds: "SS",
    like: "just a sharp s, never a b",
    examples: [
      { de: "Straße", say: "SHTRAH-seh", en: "street" },
      { de: "groß", say: "grohss", en: "big" },
      { de: "heißen", say: "HYE-sen", en: "to be called" },
    ],
  },
  {
    letters: "sch",
    sounds: "SH",
    like: "like the sh in ship",
    examples: [
      { de: "Schule", say: "SHOO-leh", en: "school" },
      { de: "schnell", say: "shnell", en: "fast" },
    ],
  },
  {
    letters: "st / sp",
    sounds: "SHT / SHP",
    like: "at the start of a word the s becomes sh",
    examples: [
      { de: "Stadt", say: "shtat", en: "city" },
      { de: "sprechen", say: "SHPREH-khen", en: "to speak" },
      { de: "Stuhl", say: "shtool", en: "chair" },
    ],
  },
  {
    letters: "ch",
    sounds: "KH",
    like: "after a, o, u it is throaty; elsewhere it is soft, near sh",
    examples: [
      { de: "Buch", say: "bookh", en: "book" },
      { de: "ich", say: "ikh", en: "I" },
      { de: "Küche", say: "KEW-kheh", en: "kitchen" },
    ],
  },
  {
    letters: "r",
    sounds: "uh",
    like: "at the end of a word it softens almost to uh",
    examples: [
      { de: "Vater", say: "FAH-tuh", en: "father" },
      { de: "aber", say: "AH-buh", en: "but" },
    ],
  },
  {
    letters: "final d / b / g",
    sounds: "T / P / K",
    like: "at the end of a word they harden",
    examples: [
      { de: "und", say: "unt", en: "and" },
      { de: "Tag", say: "tahk", en: "day" },
      { de: "halb", say: "halp", en: "half" },
    ],
  },
];

function RuleCard({ rule }: { rule: Rule }) {
  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <div className="flex items-baseline gap-3 mb-1 flex-wrap">
        <span className="text-2xl font-bold text-primary">{rule.letters}</span>
        <span className="text-muted-foreground">sounds like</span>
        <span className="text-lg font-semibold text-foreground tracking-wide">
          {rule.sounds}
        </span>
      </div>
      <p className="text-sm text-muted-foreground mb-4">{rule.like}</p>
      <div className="space-y-1">
        {rule.examples.map((ex) => (
          <button
            key={ex.de}
            onClick={() => speak(ex.de)}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted transition-colors group text-left"
          >
            <Volume2
              aria-hidden="true"
              className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
            />
            <span className="font-medium text-foreground w-28 flex-shrink-0">{ex.de}</span>
            <span className="text-sm text-primary w-32 flex-shrink-0">{ex.say}</span>
            <span className="text-sm text-muted-foreground">{ex.en}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default function PronunciationPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <p className="text-sm text-muted-foreground mb-1">Before day 1</p>
        <h1 className="text-2xl font-bold text-foreground">How German sounds</h1>
        <p className="text-muted-foreground mt-1">
          German spelling is far more regular than English. Learn these rules once and
          you can read almost any German word aloud correctly the first time you see it.
        </p>
      </div>

      <VoiceNotice />

      <div className="bg-primary-light border border-border rounded-xl p-5 mb-6 flex gap-3">
        <Lightbulb aria-hidden="true" className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
        <p className="text-sm text-foreground">
          The single most useful fact: <strong>German is read exactly as it is written</strong>.
          There are no silent letters and no surprises like English &ldquo;though&rdquo; and
          &ldquo;through&rdquo;. Once you know what each letter does, spelling tells you the
          sound every single time.
        </p>
      </div>

      <h2 className="text-lg font-semibold text-foreground mb-3">
        Vowels — the ones that catch everyone
      </h2>
      <div className="space-y-3 mb-8">
        {VOWEL_RULES.map((r) => (
          <RuleCard key={r.letters} rule={r} />
        ))}
      </div>

      <h2 className="text-lg font-semibold text-foreground mb-3">Consonants</h2>
      <div className="space-y-3 mb-8">
        {CONSONANT_RULES.map((r) => (
          <RuleCard key={r.letters} rule={r} />
        ))}
      </div>

      <div className="bg-card border border-border rounded-xl p-5 mb-6">
        <h2 className="font-semibold text-foreground mb-2">The one rule to remember</h2>
        <p className="text-sm text-muted-foreground mb-3">
          <strong className="text-foreground">ei</strong> says the name of the second
          letter — EYE. <strong className="text-foreground">ie</strong> says the name of
          the second letter too — EE. If you remember only that, you will read most
          German words correctly.
        </p>
        <button
          onClick={() => speak("Nein, ich heiße Sieben. Wie viele? Vier.")}
          className="flex items-center gap-2 text-sm text-primary hover:underline"
        >
          <Volume2 aria-hidden="true" className="w-4 h-4" />
          Hear ei and ie side by side
        </button>
      </div>

      <Link
        href="/vocabulary"
        className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3 rounded-xl font-medium text-sm hover:opacity-90 transition-opacity"
      >
        I can read German now — start day 1
        <ArrowRight aria-hidden="true" className="w-4 h-4" />
      </Link>
    </div>
  );
}
