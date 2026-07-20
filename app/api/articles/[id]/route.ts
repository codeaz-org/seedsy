import { NextResponse } from "next/server";
import { marked } from "marked";
import { supabaseServer } from "@/lib/supabase/server";

// PATCH { content_md } — saves an edited draft. HTML is re-rendered server-side
// so the stored pair never drifts apart. RLS scopes the update to the owner.
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const db = supabaseServer();
  const { data: { user } } = await db.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const { content_md } = await req.json();
  if (typeof content_md !== "string" || !content_md.trim()) {
    return NextResponse.json({ error: "content_md is required" }, { status: 400 });
  }

  const content_html = await marked.parse(content_md);
  const { data, error } = await db
    .from("articles")
    .update({ content_md, content_html })
    .eq("id", params.id)
    .select("id")
    .single();
  if (error || !data) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
