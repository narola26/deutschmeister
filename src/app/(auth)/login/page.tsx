"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { migrateGuestToAccount } from "@/lib/migrate";
import { LogIn, Loader2, MailCheck } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  // Shown only when the account exists but the email was never confirmed.
  const [needsConfirm, setNeedsConfirm] = useState(false);
  const [resendState, setResendState] = useState<"idle" | "sending" | "sent">("idle");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setNeedsConfirm(false);
    setResendState("idle");
    setLoading(true);

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (/email not confirmed/i.test(error.message)) {
          setNeedsConfirm(true);
        } else if (/invalid login credentials/i.test(error.message)) {
          setError("That email and password don't match. Check them and try again.");
        } else {
          setError(error.message);
        }
        return;
      }

      // Anything learned as a guest moves across now.
      if (data.user) await migrateGuestToAccount(data.user.id);

      router.push("/dashboard");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function resendConfirmation() {
    if (!email) return;
    setResendState("sending");
    try {
      await createClient().auth.resend({
        type: "signup",
        email,
        options: { emailRedirectTo: `${window.location.origin}/dashboard` },
      });
      setResendState("sent");
    } catch {
      setResendState("idle");
      setError("Could not resend the email. Please try again in a minute.");
    }
  }

  return (
    <div className="w-full max-w-sm">
      <div className="bg-card border border-border rounded-2xl p-8">
        <h1 className="text-2xl font-bold text-foreground mb-1">Welcome back</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Log in to continue your German journey
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
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
              placeholder="Your password"
              className="w-full px-3.5 py-2.5 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring text-sm"
            />
          </div>

          {error && (
            <p className="text-sm text-danger bg-danger-bg px-3 py-2 rounded-lg">{error}</p>
          )}

          {needsConfirm && (
            <div className="text-sm bg-warning-bg border border-warning/30 rounded-lg px-3.5 py-3">
              <p className="text-warning font-medium mb-1 flex items-center gap-1.5">
                <MailCheck className="w-4 h-4" aria-hidden="true" />
                Confirm your email first
              </p>
              <p className="text-warning/90 mb-2.5 text-xs leading-relaxed">
                This account exists, but the email hasn&apos;t been confirmed yet. Click the
                link we emailed you, then log in. Can&apos;t find it? Check spam, or resend it.
              </p>
              {resendState === "sent" ? (
                <p className="text-xs text-success flex items-center gap-1.5">
                  <MailCheck className="w-3.5 h-3.5" aria-hidden="true" />
                  Sent. Check your inbox and spam folder.
                </p>
              ) : (
                <button
                  type="button"
                  onClick={resendConfirmation}
                  disabled={resendState === "sending"}
                  className="text-xs font-medium text-warning underline disabled:opacity-50"
                >
                  {resendState === "sending" ? "Sending…" : "Resend confirmation email"}
                </button>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-2.5 rounded-lg font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <LogIn className="w-4 h-4" />
            )}
            {loading ? "Logging in..." : "Log in"}
          </button>
        </form>
      </div>

      <p className="text-center text-sm text-muted-foreground mt-4">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="text-primary hover:underline font-medium">
          Sign up
        </Link>
      </p>
    </div>
  );
}
