"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AIWorking } from "@/components/ai";

const STAGES = [
  "Fetching and reading your site…",
  "Mapping niche, audience and brand voice…",
  "Choosing 20 target keywords…",
  "Naming your likely competitors…",
  "Writing your AI-visibility questions…",
];

export default function Onboarding() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [language, setLanguage] = useState("en");
  const [stage, setStage] = useState(-1);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setStage(0);
    const ticker = setInterval(
      () => setStage((s) => Math.min(s + 1, STAGES.length - 1)),
      6000
    );
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, language }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Analysis failed");
      router.push(`/p/${data.project.id}`);
    } catch (e: any) {
      setError(e.message);
      setStage(-1);
    } finally {
      clearInterval(ticker);
    }
  }

  if (stage >= 0) {
    return (
      <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6">
        <AIWorking title={`Reading ${url.replace(/^https?:\/\//, "")}`} stages={STAGES} stage={stage} />
        <p className="mt-4 text-center font-mono text-[11px] text-sage/70">
          Usually under a minute. Don&rsquo;t close this tab.
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6">
      <div className="animate-fade-up">
        <Link href="/dashboard" className="label hover:text-signal">← All projects</Link>
        <h1 className="mt-4 font-display text-4xl leading-tight">
          Point Seedsy at your site.
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-sage">
          Seedsy reads your website and builds the whole growth plan from what it
          finds — niche, audience, keywords, competitors, and the questions
          buyers ask AI assistants.
        </p>
        <form onSubmit={submit} className="mt-8 space-y-3">
          <div>
            <label className="label mb-1.5 block" htmlFor="url">Website URL</label>
            <input id="url" className="input" placeholder="https://yourbrand.com"
              value={url} onChange={(e) => setUrl(e.target.value)} required />
          </div>
          <div>
            <label className="label mb-1.5 block" htmlFor="lang">Content language</label>
            <select id="lang" className="input" value={language} onChange={(e) => setLanguage(e.target.value)}>
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="de">German</option>
              <option value="fr">French</option>
              <option value="pt">Portuguese</option>
            </select>
          </div>
          {error && (
            <p className="rounded-xl border border-ember/30 bg-ember/10 px-4 py-2.5 text-sm text-ember">
              {error}
            </p>
          )}
          <button className="btn w-full !py-3">Analyze my site</button>
        </form>
      </div>
    </main>
  );
}
