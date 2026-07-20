import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { generateArticle } from "@/lib/generate";
import { getPlanForUser, articlesGeneratedThisMonth, LIMITS } from "@/lib/billing";

export const maxDuration = 60;

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const db = supabaseServer();
  const { data: { user } } = await db.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const { data: article } = await db.from("articles").select("id").eq("id", params.id).single();
  if (!article) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const plan = await getPlanForUser(user.id);
  const used = await articlesGeneratedThisMonth(user.id);
  if (used >= LIMITS[plan].articlesPerMonth) {
    return NextResponse.json(
      { error: `Monthly article limit reached (${LIMITS[plan].articlesPerMonth} on ${plan}). Upgrade on the Billing page.` },
      { status: 402 }
    );
  }

  try {
    await generateArticle(params.id);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: String(e.message || e) }, { status: 500 });
  }
}
