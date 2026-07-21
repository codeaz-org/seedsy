import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { generateContentPlan } from "@/lib/plan";

export const maxDuration = 60;

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const db = supabaseServer();
  const { data: { user } } = await db.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  // Ownership check under RLS.
  const { data: project } = await db.from("projects").select("id").eq("id", params.id).single();
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

  try {
    const count = await generateContentPlan(params.id);
    return NextResponse.json({ planned: count });
  } catch (e: any) {
    return NextResponse.json({ error: String(e.message || e) }, { status: 500 });
  }
}
