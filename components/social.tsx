"use client";
import { useState } from "react";
import { CopyButton } from "./actions";
import { GrowthRings } from "./ai";

type Drafts = { x: string; linkedin: string };

export function SocialDrafts({ articleId }: { articleId: string }) {
  const [drafts, setDrafts] = useState<Drafts | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generate() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/articles/${articleId}/social`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not draft posts");
      setDrafts(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="label">Spread the seeds</p>
          <p className="mt-1 text-sm text-sage">
            Draft ready-to-paste posts for X and LinkedIn from this article.
          </p>
        </div>
        {!drafts && (
          <button className="btn-ghost" onClick={generate} disabled={busy}>
            {busy ? <span className="working">Drafting</span> : "Draft social posts"}
          </button>
        )}
      </div>
      {busy && (
        <div className="mt-5 flex justify-center py-4"><GrowthRings size={64} /></div>
      )}
      {error && <p className="mt-3 text-sm text-ember">{error}</p>}
      {drafts && (
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {(
            [
              ["X / Twitter", drafts.x],
              ["LinkedIn", drafts.linkedin],
            ] as const
          ).map(([name, text]) => (
            <div key={name} className="rounded-xl border border-parchment/10 bg-night/50 p-4">
              <div className="flex items-center justify-between">
                <p className="label">{name}</p>
                <CopyButton text={text} />
              </div>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-parchment/85">{text}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
