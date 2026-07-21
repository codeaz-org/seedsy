import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { generateArticle } from "@/lib/generate";
import { publishArticle } from "@/lib/publish";
import { getPlanForUser, articlesGeneratedThisMonth, LIMITS } from "@/lib/billing";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

// Daily: pick due planned articles, generate, and auto-publish where an
// integration exists. Processes a small batch to stay inside serverless limits.
export async function GET(req: Request) {
  if (req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const db = supabaseAdmin();
  const today = new Date().toISOString().slice(0, 10);
  const { data: due } = await db
    .from("articles")
    .select("id, project_id")
    .eq("status", "planned")
    .lte("scheduled_for", today)
    .limit(2);

  const results: any[] = [];
  for (const a of due || []) {
    try {
      const { data: proj } = await db
        .from("projects").select("user_id").eq("id", a.project_id).single();
      const plan = proj ? await getPlanForUser(proj.user_id) : "free";
      if (!LIMITS[plan].autoPublish) {
        results.push({ id: a.id, skipped: "plan has no auto-publish" });
        continue;
      }
      if (proj && (await articlesGeneratedThisMonth(proj.user_id)) >= LIMITS[plan].articlesPerMonth) {
        results.push({ id: a.id, skipped: "monthly limit reached" });
        continue;
      }
      await generateArticle(a.id);
      const { data: integration } = await db
        .from("integrations").select("id")
        .eq("project_id", a.project_id).eq("active", true).limit(1).maybeSingle();
      if (integration) await publishArticle(a.id);
      results.push({ id: a.id, ok: true });
    } catch (e: any) {
      results.push({ id: a.id, error: String(e.message || e) });
    }
  }
  return NextResponse.json({ processed: results });
}
