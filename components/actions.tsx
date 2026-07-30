"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { AIWorking } from "./ai";

function useStagedAction(path: string, body: object | undefined, stageCount: number, msPerStage: number) {
  const router = useRouter();
  const [stage, setStage] = useState(-1);
  const [error, setError] = useState<string | null>(null);
  async function run() {
    setStage(0);
    setError(null);
    const ticker = setInterval(() => setStage((s) => Math.min(s + 1, stageCount - 1)), msPerStage);
    try {
      const res = await fetch(path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: body ? JSON.stringify(body) : undefined,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Request failed");
      router.refresh();
    } catch (e: any) {
      setError(e.message);
    } finally {
      clearInterval(ticker);
      setStage(-1);
    }
  }
  return { run, busy: stage >= 0, stage, error };
}

const PLAN_STAGES = [
  "Reading your niche and keywords…",
  "Picking formats LLMs actually cite…",
  "Balancing comparisons, stats, how-tos…",
  "Scheduling one article per day…",
];

export function PlanButton({ projectId }: { projectId: string }) {
  const { run, busy, stage, error } = useStagedAction(
    `/api/projects/${projectId}/plan`, undefined, PLAN_STAGES.length, 5000
  );
  if (busy) return <AIWorking title="Planting your 30-day calendar" stages={PLAN_STAGES} stage={stage} />;
  return (
    <span>
      <button className="btn" onClick={run}>Generate 30-day plan</button>
      {error && <span className="ml-3 text-sm text-ember">{error}</span>}
    </span>
  );
}

const WRITE_STAGES = [
  "Outlining sections and FAQ…",
  "Writing the full draft…",
  "Weaving internal links…",
  "Adding schema markup…",
];

export function GenerateButton({ articleId, label = "Generate now" }: { articleId: string; label?: string }) {
  const { run, busy, stage, error } = useStagedAction(
    `/api/articles/${articleId}/generate`, undefined, WRITE_STAGES.length, 12000
  );
  if (busy) return <AIWorking title="The writer is working — 1–2 min" stages={WRITE_STAGES} stage={stage} />;
  return (
    <span>
      <button className="btn" onClick={run}>{label}</button>
      {error && <span className="ml-3 text-sm text-ember">{error}</span>}
    </span>
  );
}

export function PublishButton({ articleId }: { articleId: string }) {
  const { run, busy, error } = useStagedAction(`/api/articles/${articleId}/publish`, undefined, 1, 5000);
  return (
    <span>
      <button className="btn-ghost" onClick={run} disabled={busy}>
        {busy ? <span className="working">Publishing</span> : "Publish"}
      </button>
      {error && <span className="ml-3 text-sm text-ember">{error}</span>}
    </span>
  );
}

const VIS_STAGES = [
  "Asking ChatGPT your buyers' questions…",
  "Asking Claude…",
  "Asking Gemini…",
  "Asking Perplexity (live web)…",
];

export function RunVisibilityButton({ projectId }: { projectId: string }) {
  const { run, busy, stage, error } = useStagedAction(
    "/api/visibility/run", { project_id: projectId }, VIS_STAGES.length, 8000
  );
  if (busy) return <AIWorking title="Interviewing the models" stages={VIS_STAGES} stage={stage} />;
  return (
    <span>
      <button className="btn" onClick={run}>Run visibility check</button>
      {error && <span className="ml-3 text-sm text-ember">{error}</span>}
    </span>
  );
}

export function CopyButton({ text, label = "Copy" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      className="btn-ghost !px-4 !py-1.5 text-xs"
      onClick={async () => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1600);
      }}
    >
      {copied ? "Copied ✓" : label}
    </button>
  );
}
