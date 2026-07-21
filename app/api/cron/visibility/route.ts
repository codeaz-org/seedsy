import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { runVisibilityChecks } from "@/lib/visibility";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

// Weekly: run AI-visibility checks for every project.
export async function GET(req: Request) {
  if (req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const db = supabaseAdmin();
  const { data: projects } = await db.from("projects").select("id").limit(10);
  const out: any[] = [];
  for (const p of projects || []) {
    try {
      out.push({ id: p.id, checks: await runVisibilityChecks(p.id) });
    } catch (e: any) {
      out.push({ id: p.id, error: String(e.message || e) });
    }
  }
  return NextResponse.json({ projects: out });
}
