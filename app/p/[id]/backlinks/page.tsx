import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";
import { IS_CLOUD, CLOUD_URL } from "@/lib/mode";

export const dynamic = "force-dynamic";

function StatusChip({ status }: { status: string }) {
  const placed = status === "placed";
  return (
    <span className={`flex items-center gap-1.5 font-mono text-[11px] ${placed ? "text-leaf" : "text-sage"}`}>
      <span className={`dot ${placed ? "bg-leaf" : "bg-sage/60 animate-breathe"}`} />
      {placed ? "placed" : "pending"}
    </span>
  );
}

export default async function Backlinks({ params }: { params: { id: string } }) {
  if (!IS_CLOUD) {
    return (
      <div className="card-raise max-w-xl animate-fade-up">
        <p className="label">Cloud-only feature</p>
        <h2 className="mt-2 font-display text-2xl">The exchange needs a network.</h2>
        <p className="mt-3 text-sm leading-relaxed text-sage">
          Backlinks are traded between topically-related projects across many
          accounts in one database — that only exists on the hosted cloud. Your
          self-hosted Seedsy does everything else: analysis, planning, daily
          writing, publishing and AI visibility tracking.
        </p>
        <a href={CLOUD_URL} target="_blank" rel="noreferrer" className="btn-ghost mt-5">
          Visit the hosted cloud ↗
        </a>
      </div>
    );
  }
  const db = supabaseServer();
  const { data: project } = await db
    .from("projects").select("backlinks_enabled").eq("id", params.id).single();
  const { data: earned } = await db
    .from("backlink_exchanges").select("*")
    .eq("to_project", params.id).order("created_at", { ascending: false }).limit(50);
  const { data: owed } = await db
    .from("backlink_exchanges").select("*")
    .eq("from_project", params.id).order("created_at", { ascending: false }).limit(50);

  return (
    <div className="space-y-5">
      {!project?.backlinks_enabled && (
        <div className="card border-signal/30 text-sm">
          Backlink exchange is <span className="text-signal">off</span> for this project.
          Turn it on in{" "}
          <Link href={`/p/${params.id}/settings`} className="text-signal underline underline-offset-2">
            Settings
          </Link>{" "}
          to start earning links from related sites.
        </div>
      )}

      <div className="grid gap-5 md:grid-cols-2">
        <div className="card">
          <p className="label">← Links pointing to you</p>
          <p className="mt-2 text-sm leading-relaxed text-sage">
            Placed inside articles on topically-related sites in the network.
          </p>
          <div className="mt-4 space-y-2">
            {!earned?.length && (
              <p className="rounded-xl border border-dashed border-parchment/15 px-4 py-6 text-center text-sm text-sage/70">
                None yet — the nightly matcher pairs you as related sites join.
              </p>
            )}
            {earned?.map((b) => (
              <div key={b.id} className="flex items-center justify-between gap-3 rounded-xl bg-night/50 px-4 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">&ldquo;{b.anchor}&rdquo;</p>
                  <p className="font-mono text-[11px] text-sage/70">
                    {new Date(b.created_at).toLocaleDateString()}
                  </p>
                </div>
                <StatusChip status={b.status} />
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <p className="label">Links you&rsquo;ll host →</p>
          <p className="mt-2 text-sm leading-relaxed text-sage">
            Seedsy weaves these into your upcoming articles — a fair trade for
            the links you receive.
          </p>
          <div className="mt-4 space-y-2">
            {!owed?.length && (
              <p className="rounded-xl border border-dashed border-parchment/15 px-4 py-6 text-center text-sm text-sage/70">
                Nothing queued.
              </p>
            )}
            {owed?.map((b) => (
              <div key={b.id} className="flex items-center justify-between gap-3 rounded-xl bg-night/50 px-4 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">&ldquo;{b.anchor}&rdquo;</p>
                  <p className="truncate font-mono text-[11px] text-sage/70">{b.target_url}</p>
                </div>
                <StatusChip status={b.status} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
