import Link from "next/link";
import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getPlanForUser } from "@/lib/billing";
import { shouldStamp, stampHtml } from "@/lib/stamp";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

async function getArticle(projectId: string, slug: string) {
  const db = supabaseAdmin();
  const { data } = await db
    .from("articles").select("*")
    .eq("project_id", projectId).eq("slug", slug).eq("status", "published")
    .maybeSingle();
  return data;
}

export async function generateMetadata(
  { params }: { params: { projectId: string; slug: string } }
): Promise<Metadata> {
  const a = await getArticle(params.projectId, params.slug);
  return a
    ? { title: a.title, description: a.meta_description ?? undefined }
    : { title: "Not found" };
}

export default async function HostedArticle(
  { params }: { params: { projectId: string; slug: string } }
) {
  const a = await getArticle(params.projectId, params.slug);
  if (!a) notFound();

  // Attribution is injected at render time, never stored — see lib/stamp.ts.
  const { data: owner } = await supabaseAdmin()
    .from("projects").select("user_id").eq("id", params.projectId).single();
  const plan = owner ? await getPlanForUser(owner.user_id) : "free";
  const stamped = shouldStamp(plan);

  return (
    <div className="paper">
      <main className="mx-auto max-w-2xl px-6 py-14">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(a.schema_markup) }}
        />
        <Link href={`/b/${params.projectId}`} className="label hover:text-leaf-deep">
          ← All posts
        </Link>
        {a.published_at && (
          <p className="mt-6 font-mono text-[11px] uppercase tracking-widest text-bark">
            {new Date(a.published_at).toLocaleDateString("en-US", {
              year: "numeric", month: "long", day: "numeric",
            })}
          </p>
        )}
        <article
          className="prose-article mt-2"
          dangerouslySetInnerHTML={{ __html: a.content_html || "" }}
        />
        {stamped && <div dangerouslySetInnerHTML={{ __html: stampHtml() }} />}
      </main>
    </div>
  );
}
