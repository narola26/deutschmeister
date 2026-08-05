"use client";

import Link from "next/link";
import {
  Flame,
  BookOpen,
  Brain,
  Target,
  ArrowRight,
  MessageCircle,
  Zap,
  Trophy,
  Clock,
  CheckCircle2,
  Circle,
} from "lucide-react";

const stats = [
  { label: "Day streak", value: "1", icon: Flame, color: "text-orange-500" },
  { label: "Words learned", value: "0", icon: BookOpen, color: "text-blue-500" },
  { label: "Lessons done", value: "0", icon: Trophy, color: "text-amber-500" },
  { label: "Current level", value: "A1", icon: Target, color: "text-emerald-500" },
];

const todayTasks = [
  { time: "10 min", task: "Review flashcards", href: "/flashcards", done: false, icon: Brain },
  { time: "15 min", task: "Learn 30 new words", href: "/vocabulary", done: false, icon: Zap },
  { time: "30 min", task: "Daily lesson: Greetings & introductions", href: "/lessons", done: false, icon: BookOpen },
  { time: "15 min", task: "Practice task", href: "/homework", done: false, icon: Target },
  { time: "15 min", task: "Conversation practice", href: "/conversation", done: false, icon: MessageCircle },
  { time: "5 min", task: "Quick review", href: "/flashcards", done: false, icon: CheckCircle2 },
];

const quickActions = [
  { label: "Start today's lesson", href: "/lessons", icon: BookOpen, primary: true },
  { label: "Practice vocabulary", href: "/vocabulary", icon: Zap, primary: false },
  { label: "Chat in German", href: "/conversation", icon: MessageCircle, primary: false },
  { label: "Review flashcards", href: "/flashcards", icon: Brain, primary: false },
];

export default function DashboardPage() {
  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Guten Abend!</h1>
        <p className="text-muted-foreground mt-1">
          Ready for tonight&apos;s German session? Here&apos;s your plan.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-card border border-border rounded-xl p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <stat.icon className={`w-4.5 h-4.5 ${stat.color}`} />
              <span className="text-xs text-muted-foreground">{stat.label}</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Today's plan */}
        <div className="lg:col-span-2">
          <div className="bg-card border border-border rounded-xl">
            <div className="px-5 py-4 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4.5 h-4.5 text-primary" />
                <h2 className="font-semibold text-foreground">Tonight&apos;s plan</h2>
              </div>
              <span className="text-xs text-muted-foreground">90 min total</span>
            </div>
            <div className="divide-y divide-border">
              {todayTasks.map((task, i) => (
                <Link
                  key={i}
                  href={task.href}
                  className="flex items-center gap-3 px-5 py-3.5 hover:bg-muted/50 transition-colors group"
                >
                  {task.done ? (
                    <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0" />
                  ) : (
                    <Circle className="w-5 h-5 text-border flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${task.done ? "text-muted-foreground line-through" : "text-foreground"}`}>
                      {task.task}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground flex-shrink-0">{task.time}</span>
                  <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <div>
          <div className="bg-card border border-border rounded-xl">
            <div className="px-5 py-4 border-b border-border">
              <h2 className="font-semibold text-foreground">Quick start</h2>
            </div>
            <div className="p-3 space-y-2">
              {quickActions.map((action) => (
                <Link
                  key={action.label}
                  href={action.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors ${
                    action.primary
                      ? "bg-primary text-primary-foreground hover:opacity-90"
                      : "hover:bg-muted text-foreground"
                  }`}
                >
                  <action.icon className="w-4.5 h-4.5" />
                  {action.label}
                  <ArrowRight className="w-4 h-4 ml-auto" />
                </Link>
              ))}
            </div>
          </div>

          {/* Level progress */}
          <div className="bg-card border border-border rounded-xl p-5 mt-4">
            <h3 className="text-sm font-medium text-foreground mb-3">Level progress</h3>
            <div className="space-y-3">
              {[
                { level: "A1", progress: 5, color: "bg-blue-500" },
                { level: "A2", progress: 0, color: "bg-emerald-500" },
                { level: "B1", progress: 0, color: "bg-amber-500" },
                { level: "B2", progress: 0, color: "bg-purple-500" },
              ].map((l) => (
                <div key={l.level}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-medium text-foreground">{l.level}</span>
                    <span className="text-muted-foreground">{l.progress}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${l.color} transition-all`}
                      style={{ width: `${l.progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
