import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { encryptJSON } from "@/lib/crypto";

// POST { project_id, kind, config } — saves a CMS integration (RLS enforces ownership).
export async function POST(req: Request) {
  const db = supabaseServer();
  const { data: { user } } = await db.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const { project_id, kind, config } = await req.json();
  if (!project_id || !kind) {
    return NextResponse.json({ error: "project_id and kind are required" }, { status: 400 });
  }

  // One active integration per project: deactivate old ones.
  await db.from("integrations").update({ active: false }).eq("project_id", project_id);
  const { data, error } = await db
    .from("integrations")
    .insert({ project_id, kind, config: encryptJSON(config), active: true })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ integration: data });
}
