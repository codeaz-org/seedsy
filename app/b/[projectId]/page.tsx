import Link from "next/link";
import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

// Public hosted blog index for a project (used when no CMS is connected).
export default async function HostedBlog({ params }: { params: { projectId: string } }) {
  const db = supabaseAdmin();
  const { data: project } = await db
    .from("projects").select("name, url").eq("id", params.projectId).single();
  if (!project) notFound();

  const { data: articles } = await db
    .from("articles")
    .select("title, slug, meta_description, published_at")
    .eq("project_id", params.projectId)
    .eq("status", "published")
    .order("published_at", { ascending: false });

  return (
    <div className="paper">
      <main className="mx-auto max-w-2xl px-6 py-14">
        <header className="border-b-2 border-ink pb-8">
          <p className="label">Journal</p>
          <h1 className="mt-2 font-display text-4xl">{project.name}</h1>
          <a href={project.url} className="mt-2 inline-block font-mono text-xs text-leaf-deep underline underline-offset-4">
            {project.url}
          </a>
        </header>
        <div className="mt-10 space-y-10">
          {!articles?.length && <p className="text-sm text-bark">No posts yet.</p>}
          {articles?.map((a) => (
            <Link key={a.slug} href={`/b/${params.projectId}/${a.slug}`} className="group block">
              {a.published_at && (
                <p className="font-mono text-[11px] uppercase tracking-widest text-bark">
                  {new Date(a.published_at).toLocaleDateString("en-US", {
                    year: "numeric", month: "long", day: "numeric",
                  })}
                </p>
              )}
              <h2 className="mt-1.5 font-display text-2xl leading-snug group-hover:text-leaf-deep">
                {a.title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-bark">{a.meta_description}</p>
              <p className="mt-2 font-mono text-xs text-leaf-deep opacity-0 transition group-hover:opacity-100">
                Read →
              </p>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
