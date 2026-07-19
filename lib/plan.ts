import { chatJSON, MODELS } from "./openrouter";
import { slugify } from "./crawl";
import { supabaseAdmin } from "./supabase/admin";

type PlanItem = { title: string; keyword: string; angle: string };

// Generates a 30-day content calendar and inserts one planned article per day.
export async function generateContentPlan(projectId: string) {
  const db = supabaseAdmin();
  const { data: project, error } = await db
    .from("projects").select("*").eq("id", projectId).single();
  if (error || !project) throw new Error("Project not found");

  const items = await chatJSON<PlanItem[]>({
    model: MODELS.fast,
    system:
      "You are a content strategist optimizing for both Google and AI search engines (ChatGPT, Perplexity). " +
      "Return a JSON array of exactly 30 article ideas: {title, keyword, angle}. " +
      "Mix formats known to earn LLM citations: comparisons, statistics roundups, how-to guides, " +
      "'best X for Y' lists, FAQs, and definitional posts. Titles must be specific, not generic.",
    user:
      `Business: ${project.business_summary}\nNiche: ${project.niche}\nAudience: ${project.audience}\n` +
      `Target keywords: ${JSON.stringify(project.keywords)}\nLanguage: ${project.language}`,
    maxTokens: 5000,
  });

  const today = new Date();
  const rows = items.slice(0, 30).map((item, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() + i + 1);
    return {
      project_id: projectId,
      title: item.title,
      slug: slugify(item.title),
      keyword: item.keyword,
      angle: item.angle,
      status: "planned",
      scheduled_for: d.toISOString().slice(0, 10),
    };
  });

  const { error: insErr } = await db.from("articles").insert(rows);
  if (insErr) throw insErr;
  return rows.length;
}
