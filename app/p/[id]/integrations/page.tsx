import { supabaseServer } from "@/lib/supabase/server";
import IntegrationForm from "@/components/IntegrationForm";

export const dynamic = "force-dynamic";

export default async function Integrations({ params }: { params: { id: string } }) {
  const db = supabaseServer();
  const { data: integrations } = await db
    .from("integrations").select("*").eq("project_id", params.id)
    .order("created_at", { ascending: false });
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "";

  return (
    <div className="grid gap-5 md:grid-cols-2">
      <IntegrationForm projectId={params.id} />

      <div className="space-y-5">
        <div className="card">
          <p className="label">Connected</p>
          {!integrations?.length && (
            <p className="mt-3 rounded-xl border border-dashed border-parchment/15 px-4 py-6 text-center text-sm text-sage/70">
              Nothing connected yet.
            </p>
          )}
          <div className="mt-3 space-y-2">
            {integrations?.map((i) => (
              <div key={i.id} className="flex items-center justify-between rounded-xl bg-night/50 px-4 py-3">
                <p className="text-sm font-medium capitalize">{i.kind}</p>
                <span className={`flex items-center gap-1.5 font-mono text-[11px] ${i.active ? "text-leaf" : "text-sage/60"}`}>
                  <span className={`dot ${i.active ? "bg-leaf" : "bg-sage/40"}`} />
                  {i.active ? "active" : "inactive"}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <p className="label">No CMS? No problem.</p>
          <p className="mt-2 text-sm leading-relaxed text-sage">
            Until you connect one, published articles go live on your
            Seedsy-hosted blog — clean URLs, schema, and a sitemap included.
          </p>
          <a
            href={`${appUrl}/b/${params.id}`}
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-block font-mono text-xs text-signal underline decoration-signal/40 underline-offset-4 hover:decoration-signal"
          >
            {appUrl.replace(/^https?:\/\//, "")}/b/… ↗
          </a>
        </div>

        <div className="card">
          <p className="label">Everywhere else</p>
          <p className="mt-2 text-sm leading-relaxed text-sage">
            The webhook integration sends full article JSON on publish — point
            it at Zapier or Make to auto-post to Medium, Notion, a newsletter,
            or 7,000 other apps. And on every written article, Seedsy drafts
            X and LinkedIn posts for you.
          </p>
        </div>
      </div>
    </div>
  );
}
