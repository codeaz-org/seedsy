import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { publishArticle } from "@/lib/publish";

export const maxDuration = 60;

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const db = supabaseServer();
  const { data: { user } } = await db.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const { data: article } = await db.from("articles").select("id").eq("id", params.id).single();
  if (!article) return NextResponse.json({ error: "Not found" }, { status: 404 });

  try {
    const { url } = await publishArticle(params.id);
    return NextResponse.json({ ok: true, url });
  } catch (e: any) {
    return NextResponse.json({ error: String(e.message || e) }, { status: 500 });
  }
}
