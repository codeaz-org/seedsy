"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SettingsForm({
  project,
}: {
  project: { id: string; backlinks_enabled: boolean; brand_voice: string | null };
}) {
  const router = useRouter();
  const [backlinks, setBacklinks] = useState(project.backlinks_enabled);
  const [voice, setVoice] = useState(project.brand_voice || "");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function save() {
    setBusy(true);
    setMsg(null);
    const res = await fetch(`/api/projects/${project.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ backlinks_enabled: backlinks, brand_voice: voice }),
    });
    setBusy(false);
    setMsg(res.ok ? "Saved." : "Could not save.");
    router.refresh();
  }

  async function remove() {
    if (!confirm("Delete this project and all its articles? This can't be undone.")) return;
    await fetch(`/api/projects/${project.id}`, { method: "DELETE" });
    window.location.href = "/dashboard";
  }

  return (
    <div className="max-w-xl space-y-5">
      <div className="card space-y-6">
        <label className="flex cursor-pointer items-start justify-between gap-6">
          <span>
            <span className="font-medium">Backlink exchange</span>
            <span className="mt-1.5 block text-sm leading-relaxed text-sage">
              Host contextual links to related sites in your articles, and
              receive links back. Link exchanges carry SEO risk — this is your
              call.
            </span>
          </span>
          {/* ponytail: native checkbox styled as a switch — no toggle lib */}
          <span className={`relative mt-0.5 inline-flex h-6 w-11 shrink-0 items-center rounded-full transition ${backlinks ? "bg-signal" : "bg-thicket border border-parchment/20"}`}>
            <input
              type="checkbox"
              checked={backlinks}
              onChange={(e) => setBacklinks(e.target.checked)}
              className="absolute inset-0 cursor-pointer opacity-0"
            />
            <span className={`pointer-events-none ml-0.5 h-5 w-5 rounded-full transition-transform ${backlinks ? "translate-x-5 bg-night" : "translate-x-0 bg-sage/70"}`} />
          </span>
        </label>

        <div>
          <label className="label mb-1.5 block" htmlFor="voice">Brand voice</label>
          <input id="voice" className="input" value={voice} onChange={(e) => setVoice(e.target.value)}
            placeholder="e.g. Plainspoken, practical, lightly witty" />
          <p className="mt-1.5 text-xs text-sage/70">
            Every future article is written in this voice.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <button className="btn" onClick={save} disabled={busy}>
            {busy ? <span className="working">Saving</span> : "Save settings"}
          </button>
          {msg && <p className="text-sm text-sage">{msg}</p>}
        </div>
      </div>

      <div className="card border-ember/20">
        <p className="label !text-ember">Danger zone</p>
        <p className="mt-2 text-sm text-sage">
          Deletes the project, its calendar, drafts and visibility history. Published
          articles on your CMS stay where they are.
        </p>
        <button onClick={remove} className="btn-danger mt-4">Delete project</button>
      </div>
    </div>
  );
}
