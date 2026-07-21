import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";
import { PlanButton } from "@/components/actions";

export const dynamic = "force-dynamic";

export default async function Overview({ params }: { params: { id: string } }) {
  const db = supabaseServer();
  const { data: p } = await db.from("projects").select("*").eq("id", params.id).single();
  const { data: articles } = await db
    .from("articles").select("status").eq("project_id", params.id);
  const total = articles?.length || 0;
  const published = articles?.filter((a) => a.status === "published").length || 0;
  const failed = articles?.filter((a) => a.status === "failed").length || 0;
  const { data: checks } = await db
    .from("visibility_checks").select("mentioned").eq("project_id", params.id).limit(200);
  const mentions = checks?.filter((c) => c.mentioned).length || 0;
  const share = checks?.length ? Math.round((mentions / checks.length) * 100) : null;

  const stats = [
    { k: "Articles planned", v: total },
    { k: "Published", v: published },
    { k: "AI share of voice", v: share === null ? "—" : `${share}%`, accent: share !== null && share > 0 },
  ];

  return (
    <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((s, i) => (
          <div key={s.k} className="card animate-fade-up" style={{ animationDelay: `${i * 0.05}s` }}>
            <p className="label">{s.k}</p>
            <p className={`mt-2 font-display text-4xl ${s.accent ? "text-signal" : ""}`}>{s.v}</p>
          </div>
        ))}
      </div>

      {total === 0 && (
        <div className="card-raise border-signal/30 animate-fade-up">
          <p className="label text-signal">Next step</p>
          <h2 className="mt-2 font-display text-2xl">Plant your 30-day calendar.</h2>
          <p className="mt-2 max-w-lg text-sm leading-relaxed text-sage">
            Seedsy picks 30 article ideas built to earn Google rankings and LLM
            citations — one per day. The daily cron writes and publishes each one
            when it comes due; you can also generate any of them on the spot.
          </p>
          <div className="mt-5"><PlanButton projectId={params.id} /></div>
        </div>
      )}

      {failed > 0 && (
        <Link href={`/p/${params.id}/articles`}
          className="card block border-ember/30 text-sm text-ember hover:border-ember/60">
          {failed} article{failed > 1 ? "s" : ""} failed to generate — open Articles to retry.
        </Link>
      )}

      <div className="card">
        <p className="label">What Seedsy learned about you</p>
        <p className="mt-3 max-w-2xl leading-relaxed text-parchment/90">{p?.business_summary}</p>
        <div className="mt-6 grid gap-x-8 gap-y-5 text-sm md:grid-cols-2">
          <div><p className="label">Niche</p><p className="mt-1.5">{p?.niche}</p></div>
          <div><p className="label">Audience</p><p className="mt-1.5">{p?.audience}</p></div>
          <div><p className="label">Brand voice</p><p className="mt-1.5">{p?.brand_voice}</p></div>
          <div>
            <p className="label">Competitors</p>
            <p className="mt-1.5">{(p?.competitors as string[])?.join(" · ")}</p>
          </div>
        </div>
        <div className="mt-6 border-t border-parchment/10 pt-5">
          <p className="label">Target keywords</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {(p?.keywords as string[])?.map((k) => (
              <span key={k} className="chip">{k}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
