import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { IS_CLOUD } from "@/lib/mode";

export const dynamic = "force-dynamic";

// Stripe webhook: keeps the subscriptions table in sync.
// Events to enable in the Stripe dashboard:
//   checkout.session.completed, customer.subscription.updated, customer.subscription.deleted
export async function POST(req: Request) {
  if (!IS_CLOUD) {
    return NextResponse.json({ error: "Billing is disabled in self-hosted mode" }, { status: 404 });
  }
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");
  let event: Stripe.Event;
  try {
    event = stripe().webhooks.constructEvent(body, sig!, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (e: any) {
    return NextResponse.json({ error: `Invalid signature: ${e.message}` }, { status: 400 });
  }

  const db = supabaseAdmin();

  if (event.type === "checkout.session.completed") {
    const s = event.data.object as Stripe.Checkout.Session;
    if (s.client_reference_id && s.customer) {
      // Pull the subscription now so price/period land immediately instead of
      // waiting for the first customer.subscription.updated event.
      let status = "active";
      let priceId: string | null = null;
      let periodEnd: string | null = null;
      if (s.subscription) {
        try {
          const sub = await stripe().subscriptions.retrieve(String(s.subscription));
          status = sub.status;
          priceId = sub.items.data[0]?.price?.id ?? null;
          const pe = (sub as any).current_period_end;
          periodEnd = pe ? new Date(pe * 1000).toISOString() : null;
        } catch {
          // keep defaults; the next subscription.updated event will sync them
        }
      }
      await db.from("subscriptions").upsert({
        user_id: s.client_reference_id,
        stripe_customer_id: String(s.customer),
        stripe_subscription_id: s.subscription ? String(s.subscription) : null,
        status,
        price_id: priceId,
        current_period_end: periodEnd,
        updated_at: new Date().toISOString(),
      });
    }
  }

  if (event.type === "customer.subscription.updated" || event.type === "customer.subscription.deleted") {
    const sub = event.data.object as Stripe.Subscription;
    const periodEnd = (sub as any).current_period_end
      ? new Date((sub as any).current_period_end * 1000).toISOString()
      : null;
    await db
      .from("subscriptions")
      .update({
        stripe_subscription_id: sub.id,
        status: event.type.endsWith("deleted") ? "canceled" : sub.status,
        price_id: sub.items.data[0]?.price?.id ?? null,
        current_period_end: periodEnd,
        updated_at: new Date().toISOString(),
      })
      .eq("stripe_customer_id", String(sub.customer));
  }

  return NextResponse.json({ received: true });
}
