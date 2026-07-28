"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/client";

// Landing page of the password-recovery email link (via /auth/callback).
export default function ResetPassword() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const { error } = await supabaseBrowser().auth.updateUser({ password });
    setBusy(false);
    if (error) return setError(error.message);
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-6">
      <h1 className="font-display text-3xl">Set a new password.</h1>
      <p className="mt-2 text-sm text-sage">
        You&rsquo;re signed in via the recovery link — choose a new password to finish.
      </p>
      <form onSubmit={submit} className="mt-6 space-y-3">
        <div>
          <label className="label mb-1.5 block" htmlFor="password">New password</label>
          <input id="password" className="input" type="password" placeholder="8+ characters"
            value={password} onChange={(e) => setPassword(e.target.value)}
            required minLength={8} autoComplete="new-password" />
        </div>
        {error && (
          <p className="rounded-xl border border-ember/30 bg-ember/10 px-4 py-2.5 text-sm text-ember">
            {error} — the link may have expired; request a new one from the sign-in page.
          </p>
        )}
        <button className="btn w-full !py-3" disabled={busy}>
          {busy ? <span className="working">Saving</span> : "Save and continue"}
        </button>
      </form>
    </main>
  );
}
