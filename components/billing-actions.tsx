"use client";
import { useState } from "react";

function useRedirect(path: string) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  async function go() {
    setBusy(true);
    setError(null);
    const res = await fetch(path, { method: "POST" });
    const data = await res.json();
    if (!res.ok) { setError(data.error || "Something went wrong"); setBusy(false); return; }
    window.location.href = data.url;
  }
  return { go, busy, error };
}

export function UpgradeButton() {
  const { go, busy, error } = useRedirect("/api/billing/checkout");
  return (
    <span>
      <button className="btn" onClick={go} disabled={busy}>
        {busy ? "Opening checkout…" : "Upgrade to Pro"}
      </button>
      {error && <span className="ml-3 text-sm text-ember">{error}</span>}
    </span>
  );
}

export function PortalButton() {
  const { go, busy, error } = useRedirect("/api/billing/portal");
  return (
    <span>
      <button className="btn-ghost" onClick={go} disabled={busy}>
        {busy ? "Opening portal…" : "Manage subscription"}
      </button>
      {error && <span className="ml-3 text-sm text-ember">{error}</span>}
    </span>
  );
}
