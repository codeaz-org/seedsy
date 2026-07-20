import { chat, VISIBILITY_MODELS } from "./openrouter";
import { supabaseAdmin } from "./supabase/admin";

// Runs every visibility prompt for a project against each AI model
// (ChatGPT, Claude, Gemini, Perplexity via OpenRouter) and records
// whether the brand or domain was mentioned in the answer.
export async function runVisibilityChecks(projectId: string) {
  const db = supabaseAdmin();
  const { data: project } = await db.from("projects").select("*").eq("id", projectId).single();
  if (!project) throw new Error("Project not found");
  const { data: prompts } = await db
    .from("visibility_prompts").select("*").eq("project_id", projectId);
  if (!prompts?.length) return 0;

  const needles = [project.name.toLowerCase(), project.domain.toLowerCase()];
  let count = 0;

  for (const prompt of prompts) {
    for (const model of VISIBILITY_MODELS) {
      try {
        const answer = await chat({
          model,
          messages: [{ role: "user", content: prompt.prompt }],
          temperature: 0.3,
          maxTokens: 700,
        });
        const lower = answer.toLowerCase();
        const mentioned = needles.some((n) => n && lower.includes(n));
        let excerpt: string | null = null;
        if (mentioned) {
          const idx = needles.map((n) => lower.indexOf(n)).find((i) => i >= 0) ?? 0;
          excerpt = answer.slice(Math.max(0, idx - 80), idx + 160);
        }
        await db.from("visibility_checks").insert({
          project_id: projectId,
          prompt_id: prompt.id,
          model,
          mentioned,
          excerpt,
        });
        count++;
      } catch {
        // One model failing shouldn't kill the whole run.
      }
    }
  }
  return count;
}
