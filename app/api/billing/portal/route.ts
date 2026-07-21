import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { stripe } from "@/lib/stripe";
import { IS_CLOUD } from "@/lib/mode";

export async function POST() {
  if (!IS_CLOUD) {
    return NextResponse.json({ error: "Billing is disabled in self-hosted mode" }, { status: 404 });
  }
  const db = supabaseServer();
  const { data: { user } } = await db.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const { data: sub } = await supabaseAdmin()
    .from("subscriptions").select("stripe_customer_id").eq("user_id", user.id).maybeSingle();
  if (!sub?.stripe_customer_id) {
    return NextResponse.json({ error: "No subscription yet" }, { status: 400 });
  }
  const session = await stripe().billingPortal.sessions.create({
    customer: sub.stripe_customer_id,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing`,
  });
  return NextResponse.json({ url: session.url });
}
