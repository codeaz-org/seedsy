import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { runVisibilityChecks } from "@/lib/visibility";

export const maxDuration = 60;

export async function POST(req: Request) {
  const db = supabaseServer();
  const { data: { user } } = await db.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const { project_id } = await req.json();
  const { data: project } = await db.from("projects").select("id").eq("id", project_id).single();
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Each run = prompts × 4 paid model calls, so cap manual runs at 3/day/project.
  const dayStart = new Date();
  dayStart.setHours(0, 0, 0, 0);
  const { count: promptCount } = await db
    .from("visibility_prompts").select("*", { count: "exact", head: true })
    .eq("project_id", project_id);
  const { count: checksToday } = await db
    .from("visibility_checks").select("*", { count: "exact", head: true })
    .eq("project_id", project_id)
    .gte("checked_at", dayStart.toISOString());
  if ((checksToday || 0) >= (promptCount || 1) * 4 * 3) {
    return NextResponse.json(
      { error: "Daily limit reached (3 manual runs). The weekly cron keeps tracking automatically." },
      { status: 429 }
    );
  }

  try {
    const count = await runVisibilityChecks(project_id);
    return NextResponse.json({ checks: count });
  } catch (e: any) {
    return NextResponse.json({ error: String(e.message || e) }, { status: 500 });
  }
}
