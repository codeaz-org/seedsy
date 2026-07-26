import Link from "next/link";

export default function Terms() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <Link href="/" className="label hover:text-signal">← Seedsy</Link>
      <div className="prose-article mt-6">
        <h1 className="font-display text-4xl">Terms of Service</h1>
        <p className="mt-3 rounded-xl border border-signal/30 bg-signal/5 px-4 py-2.5 text-sm text-sage">
          Template — review with a lawyer and replace the bracketed values before charging customers.
        </p>
        <h2>1. The service</h2>
        <p>Seedsy (&ldquo;we&rdquo;) provides AI-assisted content generation, publishing, link exchange, and AI-visibility reporting (&ldquo;the Service&rdquo;), operated by [YOUR COMPANY], [ADDRESS].</p>
        <h2>2. Your content and responsibility</h2>
        <p>You own the content generated for your projects. AI-generated content may contain errors; you are responsible for reviewing content before relying on it and for its compliance with laws and third-party platform policies (including search engine guidelines) where you publish it.</p>
        <h2>3. Backlink exchange</h2>
        <p>The exchange places links between customer sites. It is optional and can be disabled per project. You accept that search engines may treat link schemes unfavorably and that we make no ranking guarantees.</p>
        <h2>4. Billing</h2>
        <p>Paid plans bill monthly via Stripe and can be canceled any time; access continues until the period ends. Refunds are handled per our <a href="/refunds">Refund Policy</a>, including a 14-day money-back guarantee on your first payment.</p>
        <h2>5. Acceptable use</h2>
        <p>No unlawful, deceptive, or harmful content; no use targeting regulated advice (medical, legal, financial) without qualified human review.</p>
        <h2>6. Liability</h2>
        <p>The Service is provided &ldquo;as is&rdquo;. To the maximum extent permitted by law, our liability is limited to fees paid in the preceding 3 months.</p>
        <p className="mt-8 font-mono text-xs text-sage">Last updated: [DATE]. Contact: [EMAIL].</p>
      </div>
    </main>
  );
}
