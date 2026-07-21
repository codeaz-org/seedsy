import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { ProjectNav, SignOutButton } from "@/components/nav";
import { IS_CLOUD } from "@/lib/mode";

export default async function ProjectLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { id: string };
}) {
  const db = supabaseServer();
  const { data: project } = await db
    .from("projects").select("id, name, domain, url").eq("id", params.id).single();
  if (!project) notFound();

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <header className="flex items-center justify-between">
        <Link href="/dashboard" className="label hover:text-signal">← All projects</Link>
        <div className="flex items-center gap-5">
          {IS_CLOUD && (
            <Link href="/billing" className="font-mono text-[11px] uppercase tracking-[0.16em] text-sage hover:text-signal">
              Billing
            </Link>
          )}
          <SignOutButton />
        </div>
      </header>
      <div className="mt-8 flex items-baseline gap-4">
        <h1 className="font-display text-4xl tracking-tight">{project.name}</h1>
        <a href={project.url} target="_blank" rel="noreferrer"
          className="font-mono text-xs text-sage hover:text-signal">
          {project.domain} ↗
        </a>
      </div>
      <ProjectNav projectId={project.id} />
      <div className="mt-8">{children}</div>
    </div>
  );
}
