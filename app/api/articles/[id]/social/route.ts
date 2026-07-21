import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { chatJSON, MODELS } from "@/lib/openrouter";

export const maxDuration = 30;

// ponytail: per-instance in-memory cap — swap for a DB counter if abuse shows up
const hits = new Map<string, { day: string; n: number }>();
function overLimit(userId: string, max = 20): boolean {
  const day = new Date().toISOString().slice(0, 10);
  const h = hits.get(userId);
  if (!h || h.day !== day) {
    hits.set(userId, { day, n: 1 });
    return false;
  }
  h.n++;
  return h.n > max;
}

// Drafts X + LinkedIn posts for a written article. Returned, not stored.
export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const db = supabaseServer();
  const { data: { user } } = await db.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  if (overLimit(user.id)) {
    return NextResponse.json({ error: "Daily social-draft limit reached — try tomorrow." }, { status: 429 });
  }

  // RLS scopes this to the user's own articles.
  const { data: article } = await db
    .from("articles")
    .select("title, meta_description, content_md, published_url, project_id")
    .eq("id", params.id)
    .single();
  if (!article) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!article.content_md) {
    return NextResponse.json({ error: "Generate the article first." }, { status: 400 });
  }

  const { data: project } = await db
    .from("projects").select("name, brand_voice").eq("id", article.project_id).single();

  try {
    const drafts = await chatJSON<{ x: string; linkedin: string }>({
      model: MODELS.fast,
      system:
        "Write social posts promoting an article. Return JSON {x, linkedin}. " +
        "x: under 260 characters, one sharp hook plus one concrete takeaway, no hashtag spam (max 1). " +
        "linkedin: 3 short paragraphs, first line is a hook, ends with an invitation to read. " +
        "No emojis unless the brand voice implies them. Include the article link at the end of each post if provided.",
      user:
        `Brand: ${project?.name}\nVoice: ${project?.brand_voice || "clear, practical"}\n` +
        `Title: ${article.title}\nSummary: ${article.meta_description}\n` +
        `Link: ${article.published_url?.startsWith("http") ? article.published_url : "(not published yet — omit link)"}\n\n` +
        `Article:\n${article.content_md.slice(0, 4000)}`,
      maxTokens: 700,
    });
    return NextResponse.json(drafts);
  } catch (e: any) {
    return NextResponse.json({ error: String(e.message || e) }, { status: 500 });
  }
}
