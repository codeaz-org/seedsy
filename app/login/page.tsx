"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/client";
import { GrowthRings } from "@/components/ai";

type Mode = "signin" | "signup" | "forgot";

export default function Login() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Full-screen "check your inbox" states — a quiet inline note wasn't enough.
  const [sent, setSent] = useState<"confirm" | "reset" | null>(null);
  const [resent, setResent] = useState(false);

  // Errors handed back by /auth/callback (expired/used links).
  useEffect(() => {
    const err = new URLSearchParams(window.location.search).get("error");
    if (err) setError(err);
  }, []);

  const callbackUrl = (next: string) =>
    `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const supabase = supabaseBrowser();
    try {
      if (mode === "forgot") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: callbackUrl("/reset-password"),
        });
        if (error) throw error;
        setSent("reset");
        return;
      }

      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: callbackUrl("/dashboard") },
        });
        if (error) throw error;
        // Existing account: Supabase answers 200 with a user that has no
        // identities and no session (anti-enumeration). Say so plainly.
        if (!data.session && data.user?.identities?.length === 0) {
          setMode("signin");
          setError("That email already has an account — sign in instead, or use “Forgot password?”.");
          return;
        }
        // Email confirmation is on: no session until the link is clicked.
        if (!data.session) {
          setSent("confirm");
          return;
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          if (/confirm/i.test(error.message)) {
            setSent("confirm"); // unconfirmed account — route them to the inbox flow
            return;
          }
          throw error;
        }
      }

      router.push("/dashboard");
      router.refresh();
    } catch (e: any) {
      setError(e.message || "Something went wrong — try again.");
    } finally {
      setBusy(false);
    }
  }

  async function resend() {
    setBusy(true);
    setError(null);
    const { error } = await supabaseBrowser().auth.resend({
      type: "signup",
      email,
      options: { emailRedirectTo: callbackUrl("/dashboard") },
    });
    setBusy(false);
    if (error) return setError(error.message);
    setResent(true);
  }

  return (
    <main className="grid min-h-screen md:grid-cols-2">
      {/* Form side */}
      <div className="flex flex-col justify-center px-6 py-12 md:px-16">
        <div className="mx-auto w-full max-w-sm animate-fade-up">
          <Link href="/" className="inline-block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/seedsy-lockup.svg" alt="Seedsy" className="h-8 w-auto" />
          </Link>

          {sent ? (
            <div className="mt-10">
              <p className="font-display text-4xl" aria-hidden>✉</p>
              <h1 className="mt-4 font-display text-3xl">Check your inbox.</h1>
              <p className="mt-3 text-sm leading-relaxed text-sage">
                {sent === "confirm" ? (
                  <>We sent a confirmation link to <span className="text-parchment">{email}</span>.
                  Click it and you&rsquo;ll land in your dashboard, signed in.</>
                ) : (
                  <>We sent a password-reset link to <span className="text-parchment">{email}</span>.
                  It signs you in to choose a new password.</>
                )}
              </p>
              <p className="mt-2 text-xs text-sage/70">
                Nothing after a minute? Check spam — then resend.
              </p>
              {error && (
                <p className="mt-4 rounded-xl border border-ember/30 bg-ember/10 px-4 py-2.5 text-sm text-ember">
                  {error}
                </p>
              )}
              <div className="mt-6 flex flex-wrap items-center gap-3">
                {sent === "confirm" && (
                  <button className="btn-ghost" onClick={resend} disabled={busy || resent}>
                    {resent ? "Sent again ✓" : busy ? <span className="working">Sending</span> : "Resend email"}
                  </button>
                )}
                <button
                  className="text-sm text-sage underline decoration-sage/40 underline-offset-4 hover:text-signal"
                  onClick={() => { setSent(null); setResent(false); setError(null); }}
                >
                  Use a different email
                </button>
              </div>
            </div>
          ) : (
            <>
              <h1 className="mt-8 font-display text-3xl">
                {mode === "signin" ? "Welcome back."
                  : mode === "signup" ? "Plant your first project."
                  : "Reset your password."}
              </h1>
              <p className="mt-2 text-sm text-sage">
                {mode === "signin" ? "Sign in to tend your projects."
                  : mode === "signup" ? "Free plan, no card. Your first analysis takes about a minute."
                  : "We'll email you a link that signs you in to set a new one."}
              </p>
              <form onSubmit={submit} className="mt-8 space-y-3">
                <div>
                  <label className="label mb-1.5 block" htmlFor="email">Email</label>
                  <input id="email" className="input" type="email" placeholder="you@company.com"
                    value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
                </div>
                {mode !== "forgot" && (
                  <div>
                    <label className="label mb-1.5 block" htmlFor="password">Password</label>
                    <input id="password" className="input" type="password" placeholder="8+ characters"
                      value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8}
                      autoComplete={mode === "signin" ? "current-password" : "new-password"} />
                  </div>
                )}
                {error && (
                  <p className="rounded-xl border border-ember/30 bg-ember/10 px-4 py-2.5 text-sm text-ember">
                    {error}
                  </p>
                )}
                <button className="btn w-full !py-3" disabled={busy}>
                  {busy ? <span className="working">One moment</span>
                    : mode === "signin" ? "Sign in"
                    : mode === "signup" ? "Create account"
                    : "Email me a reset link"}
                </button>
              </form>
              <div className="mt-6 flex flex-col items-start gap-2">
                <button
                  className="text-sm text-sage underline decoration-sage/40 underline-offset-4 hover:text-signal"
                  onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setError(null); }}
                >
                  {mode === "signin" ? "New here? Create an account" : "Already have an account? Sign in"}
                </button>
                {mode === "signin" && (
                  <button
                    className="text-sm text-sage underline decoration-sage/40 underline-offset-4 hover:text-signal"
                    onClick={() => { setMode("forgot"); setError(null); }}
                  >
                    Forgot password?
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Atmosphere side */}
      <div className="relative hidden items-center justify-center overflow-hidden border-l border-parchment/10 bg-pine/50 md:flex">
        <div className="absolute inset-0" aria-hidden>
          <div className="absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-leaf/10 blur-3xl" />
        </div>
        <div className="relative flex flex-col items-center gap-10 px-12 text-center">
          <GrowthRings size={140} />
          <blockquote className="max-w-sm">
            <p className="font-display text-2xl leading-snug">
              &ldquo;The best time to plant a tree was twenty years ago.
              The second best time is <em className="italic text-signal">before your competitor does.</em>&rdquo;
            </p>
            <p className="label mt-5">— every SEO, eventually</p>
          </blockquote>
        </div>
      </div>
    </main>
  );
}
