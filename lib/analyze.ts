import { chatJSON, MODELS } from "./openrouter";
import { crawlSite } from "./crawl";

export type BusinessAnalysis = {
  name: string;
  business_summary: string;
  niche: string;
  audience: string;
  brand_voice: string;
  keywords: string[];       // 20 target keywords
  competitors: string[];    // 5 likely competitors
  visibility_prompts: string[]; // 6 questions a buyer would ask an AI assistant
};

export async function analyzeBusiness(url: string): Promise<BusinessAnalysis> {
  const siteText = await crawlSite(url);
  return chatJSON<BusinessAnalysis>({
    model: MODELS.fast,
    system:
      "You are an SEO strategist. Analyze a business from its website text and return JSON with keys: " +
      "name, business_summary (2 sentences), niche, audience, brand_voice (one line), " +
      "keywords (array of 20 realistic mid/long-tail keywords the business could rank for), " +
      "competitors (array of 5 competitor names), " +
      "visibility_prompts (array of 6 natural questions a potential customer would ask ChatGPT/Claude where this business SHOULD be recommended — never mention the business name in the prompts).",
    user: `Website: ${url}\n\nSite text:\n${siteText}`,
    maxTokens: 2000,
  });
}
