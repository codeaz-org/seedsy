import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";
import { SignOutButton } from "@/components/nav";
import { IS_CLOUD } from "@/lib/mode";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const db = supabaseServer();
  const { data: projects } = await db
    .from("projects").select("*").order("created_at", { ascending: false });

  // One query for all article statuses, grouped per project in JS.
  const stats = new Map<string, { total: number; published: number }>();
  if (projects?.length) {
    const { data: articles } = await db
      .from("articles")
      .select("project_id, status")
      .in("project_id", projects.map((p) => p.id));
    articles?.forEach((a) => {
      const s = stats.get(a.project_id) || { total: 0, published: 0 };
      s.total++;
      if (a.status === "published") s.published++;
      stats.set(a.project_id, s);
    });
  }

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <header className="flex items-center justify-between">
        <Link href="/dashboard" className="inline-block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/seedsy-lockup.svg" alt="Seedsy" className="h-7 w-auto" />
        </Link>
        <div className="flex items-center gap-5">
          {IS_CLOUD && (
            <Link href="/billing" className="font-mono text-[11px] uppercase tracking-[0.16em] text-sage hover:text-signal">
              Billing
            </Link>
          )}
          <SignOutButton />
        </div>
      </header>

      <div className="mt-12 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="label">Your garden</p>
          <h1 className="mt-2 font-display text-4xl">Projects</h1>
        </div>
        <Link href="/onboarding" className="btn">+ New project</Link>
      </div>

      {!projects?.length ? (
        <div className="card-raise mt-10 flex flex-col items-start gap-4 p-10 animate-fade-up">
          <p className="font-display text-2xl">Nothing planted yet.</p>
          <p className="max-w-md text-sm leading-relaxed text-sage">
            Point Seedsy at your website. It reads the site, maps your niche and
            keywords, and builds a 30-day publishing plan — in about a minute.
          </p>
          <Link href="/onboarding" className="btn mt-2">Analyze a site</Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {projects.map((p, i) => {
            const s = stats.get(p.id) || { total: 0, published: 0 };
            const pct = s.total ? Math.round((s.published / s.total) * 100) : 0;
            return (
              <Link key={p.id} href={`/p/${p.id}`}
                className="card group block transition hover:border-signal/50 animate-fade-up"
                style={{ animationDelay: `${i * 0.06}s` }}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="label">{p.domain}</p>
                    <h2 className="mt-1 truncate font-display text-2xl group-hover:text-signal">{p.name}</h2>
                  </div>
                  <span className="font-mono text-xs text-sage">→</span>
                </div>
                <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-sage">{p.business_summary}</p>
                <div className="mt-5">
                  <div className="flex items-center justify-between font-mono text-[11px] text-sage">
                    <span>{s.published} published / {s.total} planned</span>
                    <span className="text-signal">{pct}%</span>
                  </div>
                  <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-night">
                    <div className="h-full rounded-full bg-signal transition-all" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}
