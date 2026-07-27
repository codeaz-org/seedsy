import { supabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: { projectId: string } }
) {
  const db = supabaseAdmin();
  const { data: articles } = await db
    .from("articles").select("slug, published_at")
    .eq("project_id", params.projectId).eq("status", "published");

  const base = `${process.env.NEXT_PUBLIC_APP_URL}/b/${params.projectId}`;
  const urls = (articles || [])
    .map(
      (a) =>
        `<url><loc>${base}/${a.slug}</loc><lastmod>${new Date(a.published_at).toISOString()}</lastmod></url>`
    )
    .join("");
  const xml = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${base}</loc></url>${urls}</urlset>`;
  return new Response(xml, { headers: { "Content-Type": "application/xml" } });
}
