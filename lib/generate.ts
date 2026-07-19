import { marked } from "marked";
import { chat, chatJSON, MODELS } from "./openrouter";
import { supabaseAdmin } from "./supabase/admin";

type Outline = {
  title: string;
  meta_description: string;
  sections: { heading: string; points: string[] }[];
  faq: string[];
};

// Full pipeline for one article:
// 1. Outline (fast model)
// 2. Draft (writer model) with GEO tactics: stats, quotable lines, cited sources,
//    FAQ section, internal links to the project's published posts, and any
//    pending backlink-exchange placements.
// 3. Markdown -> HTML + Article JSON-LD schema.
export async function generateArticle(articleId: string) {
  const db = supabaseAdmin();

  const { data: article } = await db.from("articles").select("*").eq("id", articleId).single();
  if (!article) throw new Error("Article not found");
  const { data: project } = await db.from("projects").select("*").eq("id", article.project_id).single();
  if (!project) throw new Error("Project not found");

  await db.from("articles").update({ status: "generating", error: null }).eq("id", articleId);

  try {
    // Internal linking: reuse this project's already-published URLs.
    const { data: published } = await db
      .from("articles")
      .select("title, published_url")
      .eq("project_id", project.id)
      .eq("status", "published")
      .not("published_url", "is", null)
      .limit(5);

    // Backlink exchange: pending placements this project owes the network.
    const { data: pendingLinks } = await db
      .from("backlink_exchanges")
      .select("id, anchor, target_url")
      .eq("from_project", project.id)
      .eq("status", "pending")
      .limit(2);

    // ---- 1. Outline ----
    const outline = await chatJSON<Outline>({
      model: MODELS.fast,
      system:
        "Create an article outline as JSON: {title, meta_description (max 155 chars), " +
        "sections: [{heading, points: [..]}] (5-7 sections), faq: [4 questions]}.",
      user:
        `Working title: ${article.title}\nTarget keyword: ${article.keyword}\nAngle: ${article.angle}\n` +
        `Business: ${project.business_summary}\nAudience: ${project.audience}\nLanguage: ${project.language}`,
      maxTokens: 2500, // headroom — truncated JSON was the top generation failure
    });

    // ---- 2. Draft ----
    const internalLinksNote = published?.length
      ? `Naturally link to these existing posts where relevant:\n${published
          .map((p) => `- [${p.title}](${p.published_url})`)
          .join("\n")}`
      : "";
    const backlinkNote = pendingLinks?.length
      ? `You MUST include each of these links once, in a natural, contextual sentence:\n${pendingLinks
          .map((l) => `- anchor "${l.anchor}" -> ${l.target_url}`)
          .join("\n")}`
      : "";

    const contentMd = await chat({
      model: MODELS.writer,
      messages: [
        {
          role: "system",
          content:
            "You are an expert writer producing content optimized for Google AND for citation by AI assistants " +
            "(ChatGPT, Claude, Perplexity). Rules:\n" +
            "- Write in Markdown. Start with a single # H1, use ## for sections.\n" +
            "- 1,200-1,600 words. Concrete, specific, zero fluff or filler phrases.\n" +
            "- Include 3+ specific statistics with their source named in the sentence (only real, verifiable stats you are confident about; if unsure, omit rather than invent).\n" +
            "- Include 1-2 short quotable, declarative sentences that stand alone.\n" +
            "- End with an FAQ section using the provided questions, each answered in 2-3 sentences.\n" +
            "- Match the brand voice. Mention the brand at most twice, naturally.\n" +
            "- Never invent quotes from named people.",
        },
        {
          role: "user",
          content:
            `Outline:\n${JSON.stringify(outline, null, 2)}\n\n` +
            `Brand: ${project.name} (${project.url})\nBrand voice: ${project.brand_voice}\n` +
            `Language: ${project.language}\n\n${internalLinksNote}\n\n${backlinkNote}`,
        },
      ],
      temperature: 0.7,
      maxTokens: 4000,
    });

    // ---- 3. HTML + schema ----
    const contentHtml = await marked.parse(contentMd);
    const schema = {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: outline.title,
      description: outline.meta_description,
      author: { "@type": "Organization", name: project.name, url: project.url },
      datePublished: new Date().toISOString(),
    };

    await db
      .from("articles")
      .update({
        title: outline.title,
        meta_description: outline.meta_description,
        outline,
        content_md: contentMd,
        content_html: contentHtml,
        schema_markup: schema,
        status: "draft",
      })
      .eq("id", articleId);

    // Mark exchanged links as placed in this article.
    if (pendingLinks?.length) {
      await db
        .from("backlink_exchanges")
        .update({ status: "placed", article_id: articleId, placed_at: new Date().toISOString() })
        .in("id", pendingLinks.map((l) => l.id));
    }

    return { ok: true };
  } catch (e: any) {
    await db.from("articles").update({ status: "failed", error: String(e.message || e) }).eq("id", articleId);
    throw e;
  }
}
