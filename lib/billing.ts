import { supabaseAdmin } from "./supabase/admin";
import { IS_CLOUD } from "./mode";

export type Plan = "free" | "pro";

export const LIMITS: Record<Plan, {
  projects: number;
  articlesPerMonth: number;   // generations, manual or cron
  autoPublish: boolean;       // daily cron writes+publishes for you
}> = {
  free: { projects: 1, articlesPerMonth: 10, autoPublish: false },
  pro:  { projects: 10, articlesPerMonth: 400, autoPublish: true },
};

export async function getPlanForUser(userId: string): Promise<Plan> {
  if (!IS_CLOUD) return "pro"; // self-hosted: everything unlocked, no billing
  const db = supabaseAdmin();
  const { data } = await db
    .from("subscriptions").select("status, current_period_end")
    .eq("user_id", userId).maybeSingle();
  const active =
    data &&
    ["active", "trialing", "past_due"].includes(data.status) &&
    (!data.current_period_end || new Date(data.current_period_end) > new Date());
  return active ? "pro" : "free";
}

export async function articlesGeneratedThisMonth(userId: string): Promise<number> {
  const db = supabaseAdmin();
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);
  const { data: projects } = await db.from("projects").select("id").eq("user_id", userId);
  if (!projects?.length) return 0;
  const { count } = await db
    .from("articles")
    .select("*", { count: "exact", head: true })
    .in("project_id", projects.map((p) => p.id))
    .not("content_md", "is", null)
    .gte("created_at", monthStart.toISOString());
  return count || 0;
}

export async function projectCount(userId: string): Promise<number> {
  const db = supabaseAdmin();
  const { count } = await db
    .from("projects").select("*", { count: "exact", head: true }).eq("user_id", userId);
  return count || 0;
}
