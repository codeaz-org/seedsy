// Lightweight crawler: fetches the homepage (and /about if reachable),
// strips markup, and returns clean text for the analysis prompt.

function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;|&amp;|&quot;|&#39;|&lt;|&gt;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

async function fetchPage(url: string): Promise<string> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; SeedsyBot/1.0)" },
      signal: AbortSignal.timeout(10000),
      redirect: "follow",
    });
    if (!res.ok) return "";
    return stripHtml(await res.text());
  } catch {
    return "";
  }
}

export async function crawlSite(url: string): Promise<string> {
  const base = url.startsWith("http") ? url : `https://${url}`;
  const origin = new URL(base).origin;
  const [home, about] = await Promise.all([
    fetchPage(base),
    fetchPage(`${origin}/about`),
  ]);
  const text = `${home}\n\n${about}`.trim();
  if (!text) throw new Error("Could not read the site. Check the URL is public.");
  return text.slice(0, 9000);
}

export function toDomain(url: string): string {
  const u = url.startsWith("http") ? url : `https://${url}`;
  return new URL(u).hostname.replace(/^www\./, "");
}

export function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);
}
