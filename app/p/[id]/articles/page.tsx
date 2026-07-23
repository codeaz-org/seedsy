import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";
import { PlanButton } from "@/components/actions";

export const dynamic = "force-dynamic";

const STATUS: Record<string, { dot: string; text: string }> = {
  planned: { dot: "bg-sage/60", text: "text-sage" },
  generating: { dot: "bg-signal animate-breathe", text: "text-signal" },
  draft: { dot: "bg-signal", text: "text-signal" },
  published: { dot: "bg-leaf", text: "text-leaf" },
  failed: { dot: "bg-ember", text: "text-ember" },
};

export default async function Articles({ params }: { params: { id: string } }) {
  const db = supabaseServer();
  const { data: articles } = await db
    .from("articles").select("id, title, status, scheduled_for, keyword, published_url")
    .eq("project_id", params.id)
    .order("scheduled_for", { ascending: true });

  if (!articles?.length) {
    return (
      <div className="card-raise animate-fade-up">
        <h2 className="font-display text-2xl">No calendar yet.</h2>
        <p className="mt-2 max-w-md text-sm text-sage">
          Generate the 30-day plan — one article idea per day, chosen for Google
          rankings and LLM citations.
        </p>
        <div className="mt-5"><PlanButton projectId={params.id} /></div>
      </div>
    );
  }

  const counts = articles.reduce<Record<string, number>>((m, a) => {
    m[a.status] = (m[a.status] || 0) + 1;
    return m;
  }, {});
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2">
        {Object.entries(counts).map(([status, n]) => (
          <span key={status} className="chip font-mono !text-[11px]">
            <span className={`dot mr-1.5 ${STATUS[status]?.dot || "bg-sage/60"}`} />
            {n} {status}
          </span>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-parchment/10">
        {articles.map((a, i) => {
          const s = STATUS[a.status] || STATUS.planned;
          const isToday = a.scheduled_for === today;
          return (
            <Link key={a.id} href={`/p/${params.id}/articles/${a.id}`}
              className={`flex items-center gap-4 px-5 py-3.5 transition hover:bg-thicket ${
                i > 0 ? "border-t border-parchment/[0.07]" : ""
              } ${isToday ? "bg-signal/[0.04]" : "bg-pine/60"}`}>
              <span className={`w-24 shrink-0 font-mono text-[11px] ${isToday ? "text-signal" : "text-sage"}`}>
                {isToday ? "today" : a.scheduled_for}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{a.title}</p>
                {a.keyword && <p className="truncate font-mono text-[11px] text-sage/70">{a.keyword}</p>}
              </div>
              <span className={`flex shrink-0 items-center gap-1.5 font-mono text-[11px] ${s.text}`}>
                <span className={`dot ${s.dot}`} />
                {a.status}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
