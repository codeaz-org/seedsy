import Link from "next/link";

export default function Refunds() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <Link href="/" className="label hover:text-signal">← Seedsy</Link>
      <div className="prose-article mt-6">
        <h1 className="font-display text-4xl">Refund Policy</h1>
        <p className="mt-3 rounded-xl border border-signal/30 bg-signal/5 px-4 py-2.5 text-sm text-sage">
          Template — review with a lawyer and adapt to your jurisdiction before charging customers.
        </p>
        <h2>Monthly subscriptions</h2>
        <p>Pro is billed monthly and can be canceled at any time from the billing portal. After cancellation, access continues until the end of the paid period. We don&rsquo;t bill again after that.</p>
        <h2>14-day money-back guarantee</h2>
        <p>If Seedsy isn&rsquo;t right for you, email [EMAIL] within 14 days of your <em>first</em> Pro payment and we&rsquo;ll refund it in full. This applies once per customer, to the first payment only.</p>
        <h2>Renewals</h2>
        <p>Renewal payments are non-refundable except where required by law. Cancel before your renewal date to avoid the next charge — the billing portal shows the exact date.</p>
        <h2>EU/UK consumers</h2>
        <p>You may have a statutory 14-day right of withdrawal. By starting the service immediately, you consent to the service beginning within that period; the 14-day guarantee above meets or exceeds the statutory protection in most cases. Statutory rights remain unaffected.</p>
        <h2>Service failures</h2>
        <p>If a billing error or an extended outage on our side charges you for a service you couldn&rsquo;t use, contact us — we&rsquo;ll refund or credit the affected period.</p>
        <h2>How refunds are issued</h2>
        <p>To the original payment method via Stripe, typically within 5–10 business days.</p>
        <p className="mt-8 font-mono text-xs text-sage">Last updated: [DATE]. Contact: [EMAIL].</p>
      </div>
    </main>
  );
}
