import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";
import { getPlanForUser, articlesGeneratedThisMonth, LIMITS } from "@/lib/billing";
import { UpgradeButton, PortalButton } from "@/components/billing-actions";
import { IS_CLOUD, CLOUD_URL } from "@/lib/mode";

export const dynamic = "force-dynamic";

export default async function Billing({
  searchParams,
}: {
  searchParams?: { upgraded?: string };
}) {
  const db = supabaseServer();
  const { data: { user } } = await db.auth.getUser();
  if (!user) return null; // middleware redirects

  if (!IS_CLOUD) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-10">
        <Link href="/dashboard" className="label hover:text-signal">← Dashboard</Link>
        <h1 className="mt-4 font-display text-4xl">Billing</h1>
        <div className="card-raise mt-8">
          <p className="label">Self-hosted</p>
          <p className="mt-3 leading-relaxed text-parchment/90">
            All features unlocked. There&rsquo;s nothing to pay for here.
          </p>
          <p className="mt-2 text-sm leading-relaxed text-sage">
            The hosted cloud at{" "}
            <a href={CLOUD_URL} className="text-signal underline decoration-signal/40 underline-offset-2">
              {CLOUD_URL.replace(/^https?:\/\//, "")}
            </a>{" "}
            funds development.
          </p>
        </div>
      </main>
    );
  }

  const plan = await getPlanForUser(user.id);
  const used = await articlesGeneratedThisMonth(user.id);
  const limits = LIMITS[plan];
  const pct = Math.min(100, Math.round((used / limits.articlesPerMonth) * 100));

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <Link href="/dashboard" className="label hover:text-signal">← Dashboard</Link>
      <h1 className="mt-4 font-display text-4xl">Billing</h1>
      <p className="mt-1 font-mono text-xs text-sage">{user.email}</p>

      {searchParams?.upgraded === "1" && (
        <div className="card mt-6 border-leaf/40 bg-leaf/5 text-sm text-leaf">
          Payment confirmed — welcome to Pro. If the plan below still says free,
          Stripe&rsquo;s confirmation is seconds behind; refresh shortly.
        </div>
      )}

      <div className={`card-raise mt-8 ${plan === "pro" ? "border-signal/40" : ""}`}>
        <div className="flex items-center justify-between">
          <p className="label">Current plan</p>
          {plan === "pro" && (
            <span className="rounded-full bg-signal px-3 py-0.5 font-mono text-[10px] font-bold uppercase tracking-widest text-night">
              Pro
            </span>
          )}
        </div>
        <p className="mt-2 font-display text-3xl capitalize">{plan === "free" ? "Seed · Free" : "Seedsy · Pro"}</p>

        <div className="mt-6">
          <div className="flex items-center justify-between font-mono text-[11px] text-sage">
            <span>Articles this month</span>
            <span className={pct >= 90 ? "text-ember" : "text-signal"}>
              {used} / {limits.articlesPerMonth}
            </span>
          </div>
          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-night">
            <div
              className={`h-full rounded-full transition-all ${pct >= 90 ? "bg-ember" : "bg-signal"}`}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        <ul className="mt-6 space-y-2 text-sm text-parchment/85">
          <li>Projects: up to {limits.projects}</li>
          <li>
            Daily auto-publish:{" "}
            {limits.autoPublish
              ? <span className="text-leaf">on — the cron writes and publishes for you</span>
              : <span className="text-sage">off — generate manually, or upgrade</span>}
          </li>
        </ul>
        <div className="mt-6">
          {plan === "free" ? <UpgradeButton /> : <PortalButton />}
        </div>
      </div>

      {plan === "free" && (
        <div className="card mt-5">
          <p className="label">Seedsy · Pro — $49/mo</p>
          <p className="mt-2 text-sm leading-relaxed text-sage">
            10 projects, 400 articles a month, daily automatic writing and
            publishing, backlink network priority. Cancel any time from the
            billing portal.
          </p>
        </div>
      )}
    </main>
  );
}
