import Link from "next/link";
import {
  BookOpen,
  Brain,
  MessageCircle,
  BarChart3,
  Zap,
  Globe,
  ArrowRight,
  GraduationCap,
  Clock,
  Target,
} from "lucide-react";

const features = [
  {
    icon: BookOpen,
    title: "Daily lessons",
    description: "30-minute structured lessons mixing grammar, vocabulary, and practice tailored to your level.",
  },
  {
    icon: Brain,
    title: "Smart flashcards",
    description: "Spaced repetition algorithm ensures you remember every word. 30 new words daily.",
  },
  {
    icon: MessageCircle,
    title: "Real conversations",
    description: "Practice speaking German with AI in real scenarios — job interviews, shopping, doctor visits.",
  },
  {
    icon: BarChart3,
    title: "Progress tracking",
    description: "Weekly quizzes measure your skills. AI identifies weak areas and adjusts your plan.",
  },
  {
    icon: Zap,
    title: "Grammar decoder",
    description: "German grammar explained simply. Common mistakes highlighted. Interactive exercises.",
  },
  {
    icon: Globe,
    title: "Immersion engine",
    description: "Translate real texts, read German documents, and practice with authentic materials.",
  },
];

const levels = [
  { level: "A1", label: "Beginner", weeks: "1-4", color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" },
  { level: "A2", label: "Elementary", weeks: "5-9", color: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200" },
  { level: "B1", label: "Intermediate", weeks: "10-17", color: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200" },
  { level: "B2", label: "Upper-intermediate", weeks: "18-26", color: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200" },
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
            Master German from{" "}
            <span className="text-primary">zero to B2</span>
            <br />
            in 6 months
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            Your AI tutor creates personalized daily lessons, tracks your progress,
            and adapts to your learning speed. Built for people living in Germany
            who need the language for work and life.
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
                Job-ready German
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Level progress preview */}
      <section className="pb-16 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="bg-card border border-border rounded-2xl p-6 sm:p-8">
            <h3 className="text-sm font-medium text-muted-foreground mb-4">Your 26-week journey</h3>
            <div className="flex gap-2 mb-4">
              {levels.map((l) => (
                <div key={l.level} className="flex-1">
                  <div className="h-3 rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full bg-primary w-0" />
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              {levels.map((l) => (
                <div key={l.level} className="flex-1 text-center">
                  <span className={`inline-block text-xs font-medium px-2.5 py-1 rounded-full ${l.color}`}>
                    {l.level}
                  </span>
                  <p className="text-xs text-muted-foreground mt-1">Weeks {l.weeks}</p>
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
              Everything you need to learn German
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              12 integrated modules that work together to build your skills every day.
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
