"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ArticleEditor({
  articleId,
  initialMd,
  published,
}: {
  articleId: string;
  initialMd: string;
  published: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [md, setMd] = useState(initialMd);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    setBusy(true);
    setError(null);
    const res = await fetch(`/api/articles/${articleId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content_md: md }),
    });
    setBusy(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return setError(data.error || "Could not save");
    }
    setOpen(false);
    router.refresh();
  }

  if (!open) {
    return (
      <button className="btn-ghost" onClick={() => setOpen(true)}>
        Edit article
      </button>
    );
  }

  return (
    <div className="card w-full space-y-3">
      <div className="flex items-center justify-between">
        <p className="label">Editing Markdown</p>
        <p className="font-mono text-[11px] text-sage/70">
          {published
            ? "Already published? Publish again to push the update to your CMS."
            : "Saves as draft — HTML re-renders on save."}
        </p>
      </div>
      <textarea
        className="input min-h-[420px] font-mono text-[13px] leading-relaxed"
        value={md}
        onChange={(e) => setMd(e.target.value)}
        spellCheck={false}
      />
      {error && <p className="text-sm text-ember">{error}</p>}
      <div className="flex gap-2">
        <button className="btn" onClick={save} disabled={busy}>
          {busy ? <span className="working">Saving</span> : "Save changes"}
        </button>
        <button className="btn-ghost" onClick={() => { setOpen(false); setMd(initialMd); }}>
          Cancel
        </button>
      </div>
    </div>
  );
}
