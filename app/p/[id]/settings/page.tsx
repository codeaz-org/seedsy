import { supabaseServer } from "@/lib/supabase/server";
import SettingsForm from "@/components/SettingsForm";

export const dynamic = "force-dynamic";

export default async function Settings({ params }: { params: { id: string } }) {
  const db = supabaseServer();
  const { data: p } = await db
    .from("projects").select("id, backlinks_enabled, brand_voice").eq("id", params.id).single();
  if (!p) return null;
  return <SettingsForm project={p} />;
}
