"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { migrateGuestToAccount } from "@/lib/migrate";
import { loadGuest, hasGuestProgress } from "@/lib/guest";
import { UserPlus, Loader2, MailCheck, Star } from "lucide-react";

export default function SignupPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [needsConfirm, setNeedsConfirm] = useState(false);
  const [carryOver, setCarryOver] = useState<{ words: number; points: number } | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!hasGuestProgress()) return;
    const g = loadGuest();
    const words = Object.keys(g.vocab).length;
    if (words > 0 || g.total_points > 0) {
      setCarryOver({ words, points: g.total_points });
    }
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
          // After they click the link in the email, land them in the app.
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (error) {
        setError(
          /invalid/i.test(error.message)
            ? "That email address was rejected. Try a different one — some domains are blocked."
            : error.message
        );
        return;
      }

      // No session means the project requires email confirmation.
      // Say so plainly rather than dropping them on a logged-out dashboard.
      if (!data.session) {
        setNeedsConfirm(true);
        return;
      }

      if (data.user) await migrateGuestToAccount(data.user.id);
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (needsConfirm) {
    return (
      <div className="w-full max-w-sm">
        <div className="bg-card border border-border rounded-2xl p-8 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary-light mb-5">
            <MailCheck className="w-7 h-7 text-primary" />
          </div>
          <h1 className="text-xl font-bold text-foreground mb-2">Confirm your email</h1>
          <p className="text-sm text-muted-foreground mb-6">
            We sent a link to <span className="text-foreground">{email}</span>. Click it,
            then come back and log in.
          </p>
          <p className="text-xs text-muted-foreground mb-6">
            Your progress is safe in this browser and will move across once you log in.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center justify-center w-full bg-primary text-primary-foreground py-2.5 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Go to log in
          </Link>
        </div>
        <p className="text-center text-sm text-muted-foreground mt-4">
          <Link href="/dashboard" className="text-primary hover:underline">
            Keep learning as a guest
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm">
      {carryOver && (
        <div className="mb-4 px-4 py-3 rounded-xl border border-border bg-card flex items-start gap-2.5">
          <Star className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground">
            Your <span className="text-foreground">{carryOver.words} words</span> and{" "}
            <span className="text-foreground">{carryOver.points} points</span> will move
            into this account.
          </p>
        </div>
      )}

      <div className="bg-card border border-border rounded-2xl p-8">
        <h1 className="text-2xl font-bold text-foreground mb-1">Create your account</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Keep your progress safe and join the leaderboard
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-foreground mb-1.5">
              Full name
            </label>
            <input
              id="name"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              placeholder="Your name"
              className="w-full px-3.5 py-2.5 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring text-sm"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1.5">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              className="w-full px-3.5 py-2.5 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring text-sm"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-foreground mb-1.5">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="At least 6 characters"
              className="w-full px-3.5 py-2.5 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring text-sm"
            />
          </div>

          {error && (
            <p className="text-sm text-danger bg-danger-bg px-3 py-2 rounded-lg">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-2.5 rounded-lg font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>
      </div>

      <p className="text-center text-sm text-muted-foreground mt-4">
        Already have an account?{" "}
        <Link href="/login" className="text-primary hover:underline font-medium">
          Log in
        </Link>
      </p>
      <p className="text-center text-sm text-muted-foreground mt-2">
        <Link href="/dashboard" className="hover:underline">
          Or keep learning without an account
        </Link>
      </p>
    </div>
  );
}
