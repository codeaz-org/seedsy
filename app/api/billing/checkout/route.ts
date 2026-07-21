import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe";
import { IS_CLOUD } from "@/lib/mode";

export async function POST() {
  if (!IS_CLOUD) {
    return NextResponse.json({ error: "Billing is disabled in self-hosted mode" }, { status: 404 });
  }
  const db = supabaseServer();
  const { data: { user } } = await db.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const app = process.env.NEXT_PUBLIC_APP_URL!;
  const session = await stripe().checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: process.env.STRIPE_PRICE_ID!, quantity: 1 }],
    client_reference_id: user.id,
    customer_email: user.email ?? undefined,
    success_url: `${app}/billing?upgraded=1`,
    cancel_url: `${app}/billing`,
  });
  return NextResponse.json({ url: session.url });
}
