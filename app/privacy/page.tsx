import Link from "next/link";

export default function Privacy() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <Link href="/" className="label hover:text-signal">← Seedsy</Link>
      <div className="prose-article mt-6">
        <h1 className="font-display text-4xl">Privacy Policy</h1>
        <p className="mt-3 rounded-xl border border-signal/30 bg-signal/5 px-4 py-2.5 text-sm text-sage">
          Template — review with a lawyer and adapt to your jurisdiction (GDPR/CCPA) before launch.
        </p>
        <h2>What we collect</h2>
        <p>Account email and password (via Supabase Auth), the website URLs and business details you submit, generated content, CMS credentials you connect (stored to publish on your behalf), and subscription status (via Stripe — we never see card numbers).</p>
        <h2>How it&rsquo;s used</h2>
        <p>To analyze your site, generate and publish content, run visibility checks, and bill you. Site text and prompts are sent to model providers through OpenRouter to generate content; they are not used to train models where providers offer that control.</p>
        <h2>Cookies</h2>
        <p>Seedsy sets only strictly-necessary cookies: the Supabase authentication session that keeps you signed in. We set no advertising, analytics, or cross-site tracking cookies. Your dismissal of the cookie notice is stored in your browser&rsquo;s local storage, not a cookie. Blogs hosted for customers at /b/… set no Seedsy cookies for their readers.</p>
        <h2>Sub-processors</h2>
        <p>Supabase (database, auth), Vercel (hosting), OpenRouter and its underlying model providers (generation), Stripe (payments).</p>
        <h2>Your rights</h2>
        <p>Export or delete your data any time by deleting projects or contacting [EMAIL]. Deleting your account removes all associated data.</p>
        <p className="mt-8 font-mono text-xs text-sage">Last updated: [DATE]. Contact: [EMAIL].</p>
      </div>
    </main>
  );
}
