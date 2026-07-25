"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/client";

export function SignOutButton() {
  return (
    <button
      className="font-mono text-[11px] uppercase tracking-[0.16em] text-sage transition hover:text-ember"
      onClick={async () => {
        await supabaseBrowser().auth.signOut();
        window.location.href = "/login";
      }}
    >
      Sign out
    </button>
  );
}

export function ProjectNav({ projectId }: { projectId: string }) {
  const pathname = usePathname();
  const base = `/p/${projectId}`;
  const tabs = [
    { href: base, label: "Overview" },
    { href: `${base}/articles`, label: "Articles" },
    { href: `${base}/integrations`, label: "Integrations" },
    { href: `${base}/backlinks`, label: "Backlinks" },
    { href: `${base}/visibility`, label: "AI visibility" },
    { href: `${base}/settings`, label: "Settings" },
  ];
  return (
    <nav className="mt-8 flex flex-wrap gap-1 border-b border-parchment/10">
      {tabs.map((t) => {
        const active =
          t.href === base
            ? pathname === base
            : pathname.startsWith(t.href);
        return (
          <Link
            key={t.href}
            href={t.href}
            className={`-mb-px border-b-2 px-4 py-2.5 text-sm transition ${
              active
                ? "border-signal font-medium text-signal"
                : "border-transparent text-sage hover:text-parchment"
            }`}
          >
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
