import { supabaseServer } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { GenerateButton, PublishButton, CopyButton } from "@/components/actions";
import { SocialDrafts } from "@/components/social";
import ArticleEditor from "@/components/ArticleEditor";

export const dynamic = "force-dynamic";

const STATUS_TEXT: Record<string, string> = {
  planned: "text-sage",
  generating: "text-signal",
  draft: "text-signal",
  published: "text-leaf",
  failed: "text-ember",
};

export default async function ArticlePage({
  params,
}: { params: { id: string; articleId: string } }) {
  const db = supabaseServer();
  const { data: a } = await db
    .from("articles").select("*").eq("id", params.articleId).single();
  if (!a) notFound();

  return (
    <div className="space-y-5">
      <div className="card-raise">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <p className={`label ${STATUS_TEXT[a.status] || ""}`}>
              {a.status} · scheduled {a.scheduled_for}
              {a.keyword ? ` · ${a.keyword}` : ""}
            </p>
            <h2 className="mt-2 font-display text-3xl leading-tight">{a.title}</h2>
            {a.meta_description && (
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-sage">{a.meta_description}</p>
            )}
          </div>
        </div>
        <div className="mt-5 flex flex-wrap items-center gap-2">
          {(a.status === "planned" || a.status === "failed") && (
            <GenerateButton articleId={a.id} label={a.status === "failed" ? "Retry generation" : "Generate now"} />
          )}
          {a.status === "draft" && (
            <>
              <PublishButton articleId={a.id} />
              <GenerateButton articleId={a.id} label="Rewrite draft" />
            </>
          )}
          {a.published_url && a.published_url.startsWith("http") && (
            <a className="btn-ghost" href={a.published_url} target="_blank" rel="noreferrer">
              View live ↗
            </a>
          )}
          {a.content_md && <CopyButton text={a.content_md} label="Copy Markdown" />}
          {a.content_md && (
            <ArticleEditor articleId={a.id} initialMd={a.content_md} published={a.status === "published"} />
          )}
        </div>
      </div>

      {a.error && (
        <div className="card border-ember/30 text-sm text-ember">
          <p className="label !text-ember">Last error</p>
          <p className="mt-2">{a.error}</p>
        </div>
      )}

      {a.content_html ? (
        <>
          <article
            className="card prose-article !p-8"
            dangerouslySetInnerHTML={{ __html: a.content_html }}
          />
          <SocialDrafts articleId={a.id} />
        </>
      ) : (
        <div className="card flex flex-col items-start gap-2 py-8">
          <p className="font-display text-xl">Not written yet.</p>
          <p className="text-sm text-sage">
            Generate it now, or the daily cron will write it on {a.scheduled_for}.
          </p>
        </div>
      )}
    </div>
  );
}
