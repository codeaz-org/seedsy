import { supabaseAdmin } from "./supabase/admin";
import { IS_CLOUD } from "./mode";

// Nightly matcher for the backlink exchange network.
// Balanced trade: each pass creates reciprocal-ish pairs across DIFFERENT users
// in overlapping niches, keeping give/take roughly even per project.
export async function matchBacklinks() {
  if (!IS_CLOUD) return 0; // network needs many tenants in one DB — cloud only
  const db = supabaseAdmin();
  const { data: projects } = await db
    .from("projects")
    .select("id, user_id, name, url, niche, keywords, backlinks_enabled")
    .eq("backlinks_enabled", true);
  if (!projects || projects.length < 2) return 0;

  // Outstanding pending placements per project (don't overload anyone).
  const { data: pending } = await db
    .from("backlink_exchanges").select("from_project").eq("status", "pending");
  const load = new Map<string, number>();
  pending?.forEach((p) => load.set(p.from_project, (load.get(p.from_project) || 0) + 1));

  const words = (p: any) =>
    new Set(
      `${p.niche || ""} ${(p.keywords || []).join(" ")}`
        .toLowerCase().split(/[^a-z0-9]+/).filter((w) => w.length > 3)
    );

  let created = 0;
  for (let i = 0; i < projects.length; i++) {
    for (let j = i + 1; j < projects.length; j++) {
      const a = projects[i], b = projects[j];
      if (a.user_id === b.user_id) continue; // links must cross accounts
      if ((load.get(a.id) || 0) >= 2 || (load.get(b.id) || 0) >= 2) continue;

      const wa = words(a), wb = words(b);
      const overlap = [...wa].filter((w) => wb.has(w)).length;
      if (overlap < 2) continue; // require topical relevance

      const rows = [
        { from_project: a.id, to_project: b.id, anchor: b.name, target_url: b.url },
        { from_project: b.id, to_project: a.id, anchor: a.name, target_url: a.url },
      ];
      const { error } = await db.from("backlink_exchanges").insert(rows);
      if (!error) {
        created += 2;
        load.set(a.id, (load.get(a.id) || 0) + 1);
        load.set(b.id, (load.get(b.id) || 0) + 1);
      }
    }
  }
  return created;
}
