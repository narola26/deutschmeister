import Link from "next/link";
import {
  Brain,
  Star,
  Wrench,
  Mic,
  Award,
  Zap,
  ArrowRight,
  GraduationCap,
  Clock,
  Target,
} from "lucide-react";

const features = [
  {
    icon: Star,
    title: "Stars, not streaks",
    description: "Every task scores nought to three stars. You always move forward, but the star count tells you the truth about what you can actually do.",
  },
  {
    icon: Wrench,
    title: "Nothing gets skipped",
    description: "Anything you scored badly comes back tomorrow, and keeps coming back until it sticks. No gaps compounding quietly into a fake B2.",
  },
  {
    icon: Mic,
    title: "You speak from day one",
    description: "Record yourself every night. The AI transcribes it, examines the grammar, and scores what you actually said — not what you meant.",
  },
  {
    icon: Brain,
    title: "Spaced repetition",
    description: "Every word you learn becomes a flashcard on the SM-2 schedule. Hard words return often, mastered words retire.",
  },
  {
    icon: Zap,
    title: "Grammar when it breaks",
    description: "Input first, rule second — the explanation arrives at the moment you make the mistake, which is the only moment it sticks.",
  },
  {
    icon: Award,
    title: "A certificate that counts",
    description: "Level tests in the exact Goethe and telc format, so when you sit the real exam there are no surprises left.",
  },
];

const levels = [
  { level: "A1", label: "Beginner", weeks: "1-10", color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" },
  { level: "A2", label: "Elementary", weeks: "11-20", color: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200" },
  { level: "B1", label: "Independent", weeks: "21-37", color: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200" },
  { level: "B2", label: "Work-ready", weeks: "38-61", color: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200" },
  { level: "C1", label: "Fluent", weeks: "62-85", color: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200" },
  { level: "C2", label: "Effortless", weeks: "86-113", color: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Nav */}
      <nav className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-7 h-7 text-primary" />
            <span className="text-lg font-semibold text-foreground">DeutschMeister</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors px-4 py-2"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="text-sm bg-primary text-primary-foreground px-5 py-2 rounded-lg hover:opacity-90 transition-opacity font-medium"
            >
              Start learning
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-20 pb-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-light text-primary text-sm font-medium mb-6">
            <Zap className="w-4 h-4" />
            AI-powered German tutor
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6">
            German from{" "}
            <span className="text-primary">zero to C2</span>
            <br />
            the whole road
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            Every other app is built for beginners and abandoned after B1. This one
            goes all the way — six levels, ninety minutes a night, and a star on every
            task that tells you the truth about what you can actually do.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/signup"
              className="flex items-center gap-2 bg-primary text-primary-foreground px-8 py-3.5 rounded-xl text-base font-medium hover:opacity-90 transition-opacity"
            >
              Start learning for free
              <ArrowRight className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                90 min/day
              </span>
              <span className="flex items-center gap-1.5">
                <Target className="w-4 h-4" />
                Goethe exam ready
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Level progress preview */}
      <section className="pb-16 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="bg-card border border-border rounded-2xl p-6 sm:p-8">
            <div className="flex items-baseline justify-between mb-4 gap-4">
              <h3 className="text-sm font-medium text-muted-foreground">
                Six levels, roughly 26 months
              </h3>
              <span className="text-xs text-muted-foreground">
                honest numbers, not marketing
              </span>
            </div>
            <div className="flex gap-1.5 mb-4">
              {levels.map((l) => (
                <div key={l.level} className="flex-1">
                  <div className="h-3 rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full bg-primary w-0" />
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-1.5">
              {levels.map((l) => (
                <div key={l.level} className="flex-1 text-center">
                  <span className={`inline-block text-xs font-medium px-2 py-1 rounded-full ${l.color}`}>
                    {l.level}
                  </span>
                  <p className="text-[11px] text-muted-foreground mt-1 hidden sm:block">{l.label}</p>
                  <p className="text-[11px] text-muted-foreground tabular-nums">Wk {l.weeks}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features grid */}
      <section className="pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
              Built around why people fail
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Learners understand at B1 and write at A2, because tapping the right box is
              recognition, not production. Every module here exists to fix that.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f) => (
              <div
                key={f.title}
                className="bg-card border border-border rounded-xl p-6 hover:border-primary/30 transition-colors"
              >
                <f.icon className="w-8 h-8 text-primary mb-3" />
                <h3 className="font-semibold text-foreground mb-1.5">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="pb-20 px-6">
        <div className="max-w-3xl mx-auto text-center bg-primary rounded-2xl p-10 sm:p-14">
          <h2 className="text-2xl sm:text-3xl font-bold text-primary-foreground mb-3">
            Start your German journey tonight
          </h2>
          <p className="text-primary-foreground/80 mb-8 max-w-lg mx-auto">
            Every day you wait is a day you could have learned 30 new German words.
            Your AI tutor is ready.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 bg-accent text-accent-foreground px-8 py-3.5 rounded-xl text-base font-semibold hover:opacity-90 transition-opacity"
          >
            Create free account
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5" />
            <span>DeutschMeister</span>
          </div>
          <p>Built with AI, made in Germany</p>
        </div>
      </footer>
    </div>
  );
}
