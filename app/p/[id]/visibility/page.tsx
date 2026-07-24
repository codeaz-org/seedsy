import { supabaseServer } from "@/lib/supabase/server";
import { RunVisibilityButton } from "@/components/actions";

export const dynamic = "force-dynamic";

const MODEL_LABEL: Record<string, string> = {
  "openai/gpt-4o": "ChatGPT",
  "anthropic/claude-sonnet-4": "Claude",
  "google/gemini-2.5-flash": "Gemini",
  "perplexity/sonar": "Perplexity",
};

export default async function Visibility({ params }: { params: { id: string } }) {
  const db = supabaseServer();
  const { data: prompts } = await db
    .from("visibility_prompts").select("*").eq("project_id", params.id);
  const { data: checks } = await db
    .from("visibility_checks").select("*")
    .eq("project_id", params.id)
    .order("checked_at", { ascending: false })
    .limit(400);

  // Latest result per (prompt, model)
  const latest = new Map<string, any>();
  checks?.forEach((c) => {
    const key = `${c.prompt_id}:${c.model}`;
    if (!latest.has(key)) latest.set(key, c);
  });
  const models = Array.from(new Set(checks?.map((c) => c.model) || []));
  const latestArr = Array.from(latest.values());
  const share = latestArr.length
    ? Math.round((latestArr.filter((c) => c.mentioned).length / latestArr.length) * 100)
    : null;
  const lastRun = checks?.[0]?.checked_at;

  return (
    <div className="space-y-5">
      <div className="card-raise flex flex-wrap items-center justify-between gap-6">
        <div className="flex items-center gap-8">
          <div>
            <p className="label">Share of AI answers</p>
            <p className={`mt-1 font-display text-5xl ${share && share > 0 ? "text-signal" : ""}`}>
              {share === null ? "—" : `${share}%`}
            </p>
          </div>
          <div className="max-w-xs text-sm leading-relaxed text-sage">
            Seedsy asks each model your buyers&rsquo; questions and records
            whether you were recommended. Runs weekly, or on demand.
            {lastRun && (
              <p className="mt-2 font-mono text-[11px] text-sage/70">
                last run {new Date(lastRun).toLocaleString()}
              </p>
            )}
          </div>
        </div>
        <RunVisibilityButton projectId={params.id} />
      </div>

      {!prompts?.length ? (
        <p className="text-sm text-sage">No prompts yet — they&rsquo;re created during onboarding.</p>
      ) : (
        <div className="space-y-3">
          {prompts.map((p) => {
            const results = (models.length ? models : []).map((m) => ({
              m,
              c: latest.get(`${p.id}:${m}`),
            }));
            const excerpt = results.find((r) => r.c?.mentioned && r.c?.excerpt)?.c?.excerpt;
            return (
              <div key={p.id} className="card">
                <p className="font-display text-lg leading-snug">&ldquo;{p.prompt}&rdquo;</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {!models.length && <span className="chip font-mono !text-[11px] text-sage">not run yet</span>}
                  {results.map(({ m, c }) => (
                    <span
                      key={m}
                      className={`chip font-mono !text-[11px] ${
                        !c ? "!text-sage/60"
                          : c.mentioned ? "!border-leaf/40 !text-leaf" : "!text-sage"
                      }`}
                    >
                      <span className={`dot mr-1.5 ${!c ? "bg-sage/40" : c.mentioned ? "bg-leaf" : "bg-ember/70"}`} />
                      {MODEL_LABEL[m] || m} · {!c ? "not run" : c.mentioned ? "cited" : "absent"}
                    </span>
                  ))}
                </div>
                {excerpt && (
                  <blockquote className="mt-4 border-l-2 border-leaf/50 pl-4 text-sm italic leading-relaxed text-parchment/75">
                    …{excerpt}…
                  </blockquote>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
