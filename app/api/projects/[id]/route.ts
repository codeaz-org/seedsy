import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const db = supabaseServer();
  const { data: { user } } = await db.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const body = await req.json();
  const allowed: Record<string, any> = {};
  if (typeof body.backlinks_enabled === "boolean") allowed.backlinks_enabled = body.backlinks_enabled;
  if (typeof body.brand_voice === "string") allowed.brand_voice = body.brand_voice;

  const { data, error } = await db
    .from("projects").update(allowed).eq("id", params.id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ project: data });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const db = supabaseServer();
  const { data: { user } } = await db.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const { error } = await db.from("projects").delete().eq("id", params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
