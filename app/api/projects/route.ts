import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { analyzeBusiness } from "@/lib/analyze";
import { toDomain } from "@/lib/crawl";
import { getPlanForUser, projectCount, LIMITS } from "@/lib/billing";

export const maxDuration = 60;

// POST { url, language? } -> crawls + analyzes the site, creates the project
// and its AI-visibility prompts.
export async function POST(req: Request) {
  const db = supabaseServer();
  const { data: { user } } = await db.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const { url, language } = await req.json();
  if (!url) return NextResponse.json({ error: "url is required" }, { status: 400 });

  const plan = await getPlanForUser(user.id);
  if ((await projectCount(user.id)) >= LIMITS[plan].projects) {
    return NextResponse.json(
      { error: `Your ${plan} plan allows ${LIMITS[plan].projects} project(s). Upgrade on the Billing page.` },
      { status: 402 }
    );
  }

  try {
    const a = await analyzeBusiness(url);
    const { data: project, error } = await db
      .from("projects")
      .insert({
        user_id: user.id,
        name: a.name,
        url: url.startsWith("http") ? url : `https://${url}`,
        domain: toDomain(url),
        language: language || "en",
        brand_voice: a.brand_voice,
        business_summary: a.business_summary,
        niche: a.niche,
        audience: a.audience,
        keywords: a.keywords,
        competitors: a.competitors,
      })
      .select()
      .single();
    if (error) throw error;

    await db.from("visibility_prompts").insert(
      a.visibility_prompts.map((p) => ({ project_id: project.id, prompt: p }))
    );

    return NextResponse.json({ project });
  } catch (e: any) {
    return NextResponse.json({ error: String(e.message || e) }, { status: 500 });
  }
}
