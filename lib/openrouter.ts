// OpenRouter gives access to every major model through one API key.
// The writer model drafts articles; the fast model handles analysis and planning;
// VISIBILITY_MODELS are the "AI search engines" we test brand visibility against.

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

export const MODELS = {
  fast: process.env.OPENROUTER_FAST_MODEL || "openai/gpt-4o-mini",
  writer: process.env.OPENROUTER_WRITER_MODEL || "anthropic/claude-sonnet-4",
};

// Adjust freely — any OpenRouter model ID works.
export const VISIBILITY_MODELS = [
  "openai/gpt-4o",            // ChatGPT
  "anthropic/claude-sonnet-4", // Claude
  "google/gemini-2.5-flash",  // Gemini
  "perplexity/sonar",         // Perplexity (searches the live web)
];

type Msg = { role: "system" | "user" | "assistant"; content: string };

export async function chat(opts: {
  model: string;
  messages: Msg[];
  temperature?: number;
  maxTokens?: number;
}): Promise<string> {
  const res = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
      "X-Title": "Seedsy",
    },
    body: JSON.stringify({
      model: opts.model,
      messages: opts.messages,
      temperature: opts.temperature ?? 0.7,
      max_tokens: opts.maxTokens ?? 4000,
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`OpenRouter ${res.status}: ${body.slice(0, 300)}`);
  }
  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? "";
}

// Ask for JSON, tolerate markdown fences and stray prose around it.
// Retries once — models occasionally truncate or malform JSON output.
export async function chatJSON<T>(opts: {
  model: string;
  system: string;
  user: string;
  maxTokens?: number;
}): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt < 2; attempt++) {
    const raw = await chat({
      model: opts.model,
      messages: [
        { role: "system", content: opts.system + "\nRespond with valid JSON only. No markdown fences, no commentary." },
        { role: "user", content: opts.user },
      ],
      temperature: 0.4,
      maxTokens: opts.maxTokens,
    });
    try {
      const cleaned = raw.replace(/```(?:json)?/g, "").trim();
      const start = Math.min(
        ...[cleaned.indexOf("{"), cleaned.indexOf("[")].filter((i) => i >= 0)
      );
      const end = Math.max(cleaned.lastIndexOf("}"), cleaned.lastIndexOf("]"));
      return JSON.parse(cleaned.slice(start, end + 1)) as T;
    } catch (e) {
      lastError = e;
    }
  }
  throw new Error(`Model returned invalid JSON twice — try again. (${String((lastError as Error)?.message || lastError)})`);
}
