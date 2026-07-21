import Link from "next/link";

const GITHUB_URL = "https://github.com/your-org/seedsy"; // update when the repo is public
const DOCS_URL = `${GITHUB_URL}/tree/main/docs`;

function Wordmark() {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src="/seedsy-lockup.svg" alt="Seedsy" className="h-7 w-auto" />;
}

function Day({
  n,
  title,
  children,
}: {
  n: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="relative">
      <span
        aria-hidden
        className="pointer-events-none absolute -top-16 right-0 select-none font-display text-[9rem] leading-none text-parchment/[0.045] md:text-[12rem]"
      >
        {n}
      </span>
      <span className="absolute -left-[45px] top-1.5 h-[9px] w-[9px] rounded-full bg-signal shadow-[0_0_12px_rgba(201,241,78,0.6)]" />
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-signal">
        Day {n} <span className="text-sage/60">— {title}</span>
      </p>
      <div className="relative mt-4">{children}</div>
    </div>
  );
}

export default function Landing() {
  return (
    <main className="overflow-x-clip">
      <header className="border-b border-parchment/10">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Wordmark />
          <nav className="hidden items-center gap-6 font-mono text-[11px] uppercase tracking-[0.16em] text-sage md:flex">
            <a href="#almanac" className="hover:text-parchment">The 30 days</a>
            <a href="#seeds" className="hover:text-parchment">Open source</a>
            <a href="#pricing" className="hover:text-parchment">Pricing</a>
            <a href={DOCS_URL} target="_blank" rel="noreferrer" className="hover:text-parchment">Docs ↗</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-sage hover:text-parchment">Sign in</Link>
            <Link href="/login" className="btn !px-4 !py-2">Start free</Link>
          </div>
        </div>
      </header>

      {/* ---------- MASTHEAD ---------- */}
      <section className="mx-auto max-w-6xl px-6 pt-14 md:pt-20">
        <div className="flex items-baseline justify-between border-b border-parchment/15 pb-3 font-mono text-[10px] uppercase tracking-[0.2em] text-sage/70">
          <span>A field almanac</span>
          <span className="hidden sm:inline">SEO + GEO, on autopilot</span>
          <span>AGPL-3.0 · open source</span>
        </div>

        <h1 className="mt-12 font-display text-[2.9rem] leading-[1.02] tracking-tight sm:text-6xl md:max-w-4xl md:text-7xl">
          When someone asks an AI who to use,{" "}
          <em className="italic text-signal">be the answer.</em>
        </h1>

        <div className="mt-12 grid gap-10 pb-20 md:grid-cols-[1.2fr_1fr] md:gap-20">
          <p className="max-w-lg leading-relaxed text-sage first-letter:float-left first-letter:mr-3 first-letter:font-display first-letter:text-5xl first-letter:leading-[0.85] first-letter:text-parchment">
            Buyers stopped clicking ten blue links. They ask ChatGPT, Claude,
            Gemini and Perplexity — and one name gets recommended. Seedsy reads
            your site, then plants, writes and publishes the kind of content
            those models cite, one article a day, and reports whether the
            answer is you. What follows is your first month, as it will
            actually happen.
          </p>
          <div>
            <form action="/login" className="flex overflow-hidden rounded-full border border-parchment/20 bg-night/60 p-1.5 transition focus-within:border-signal/70">
              <input
                placeholder="https://yourbrand.com"
                aria-label="Your website URL"
                className="w-full bg-transparent px-4 text-sm text-parchment outline-none placeholder:text-sage/50"
              />
              <button className="btn shrink-0 !px-5 !py-2.5">Analyze</button>
            </form>
            <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.16em] text-sage/60">
              fig. 0 — one URL in, a growing search presence out
            </p>
          </div>
        </div>
      </section>

      {/* ---------- THE ALMANAC ---------- */}
      <section id="almanac" className="border-t border-parchment/10">
        <div className="mx-auto max-w-3xl scroll-mt-16 px-6 py-24">
          <div className="relative space-y-28 border-l border-parchment/15 pl-10">

            <Day n="00" title="the reading">
              <p className="max-w-md leading-relaxed text-parchment/85">
                You paste a URL. Seedsy crawls it and writes the file on your
                business — no forms, no onboarding questionnaire.
              </p>
              <div className="mt-5 flex max-w-lg flex-wrap gap-2">
                {["niche", "audience", "brand voice", "20 target keywords", "5 competitors", "6 questions buyers ask AIs"].map((t) => (
                  <span key={t} className="chip font-mono !text-[11px]">{t}</span>
                ))}
              </div>
            </Day>

            <Day n="01" title="06:00, first article">
              <div className="card-raise max-w-lg">
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-sage/60">
                  scheduled · written · published — while you slept
                </p>
                <p className="mt-3 font-display text-xl leading-snug">
                  Best oat milk for latte art: 7 tested by baristas
                </p>
                <p className="mt-3 font-mono text-[11px] leading-relaxed text-sage">
                  1,431 words · 4 named-source stats · FAQ block · Article
                  JSON-LD · internal links
                </p>
                <p className="mt-3 flex items-center gap-1.5 font-mono text-[11px] text-leaf">
                  <span className="dot bg-leaf" /> live on your WordPress
                </p>
              </div>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-sage">
                Webflow, Shopify, Ghost and plain webhooks work too. No CMS?
                Every project ships with a hosted blog and sitemap.
              </p>
            </Day>

            <Day n="07" title="first citation">
              <div className="max-w-lg space-y-3">
                <p className="w-fit rounded-2xl rounded-bl-sm border border-parchment/15 bg-pine px-4 py-2.5 text-sm text-parchment/90">
                  &ldquo;what&rsquo;s a good oat milk that won&rsquo;t split in coffee?&rdquo;
                </p>
                <div className="rounded-2xl rounded-br-sm bg-thicket px-4 py-3 text-sm leading-relaxed text-parchment/85">
                  …for latte art specifically, the most consistent
                  recommendation is{" "}
                  <mark className="rounded bg-signal px-1 font-semibold text-night">yourbrand.com</mark>
                  , whose barista tests are widely cited…
                  <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.16em] text-sage/60">
                    — Perplexity, sourcing the live web
                  </p>
                </div>
                <p className="pt-1 text-sm leading-relaxed text-sage">
                  Seedsy interviews all four models with your buyers&rsquo;
                  questions every week and records who they recommend.
                </p>
              </div>
            </Day>

            <Day n="14" title="the network (cloud)">
              <div className="flex max-w-lg items-center gap-3 font-mono text-xs">
                <span className="flex-1 rounded-xl border border-parchment/15 bg-pine px-4 py-3 text-parchment/85">yourbrand.com</span>
                <span className="text-signal">⇄</span>
                <span className="flex-1 rounded-xl border border-parchment/15 bg-pine px-4 py-3 text-parchment/85">a related site</span>
              </div>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-sage">
                Topically-related Seedsy sites host contextual links to each
                other inside real articles — both directions, opt-in, visible
                in your dashboard, off with one switch. Link exchanges carry
                SEO risk; we say so on the tin.
              </p>
            </Day>

            <div className="relative -ml-10 border-l-0 py-2 pl-10">
              <p className="max-w-xl font-display text-3xl italic leading-snug text-parchment/90 md:text-4xl">
                Search didn&rsquo;t die. It moved inside the answer.
              </p>
            </div>

            <Day n="30" title="the measure">
              <div className="max-w-lg">
                <div className="flex h-32 items-end gap-3">
                  {[14, 34, 58, 82].map((h, i) => (
                    <div key={i} className="flex flex-1 flex-col items-center gap-2">
                      <div
                        className="w-full rounded-t-sm bg-gradient-to-t from-leaf-deep to-signal"
                        style={{ height: `${h}%` }}
                      />
                      <span className="font-mono text-[10px] uppercase tracking-widest text-sage/60">wk {i + 1}</span>
                    </div>
                  ))}
                </div>
                <p className="mt-4 border-t border-parchment/10 pt-3 font-mono text-[11px] text-sage">
                  share of AI answers — your prompts × ChatGPT, Claude, Gemini, Perplexity
                </p>
              </div>
            </Day>

            <Day n="31" title="it keeps going">
              <p className="max-w-md leading-relaxed text-parchment/85">
                The calendar refills. The cron wakes at six. You read the log,
                not the to-do list.
              </p>
              <Link href="/login" className="btn mt-6 !px-6 !py-3">Start your Day 00 — free</Link>
            </Day>
          </div>
        </div>
      </section>

      {/* ---------- OPEN SOURCE ---------- */}
      <section id="seeds" className="border-t border-parchment/10">
        <div className="mx-auto max-w-6xl scroll-mt-16 px-6 py-24">
          <div className="grid gap-12 md:grid-cols-2 md:gap-20">
            <div>
              <p className="label">Or take the seeds</p>
              <h2 className="mt-4 font-display text-4xl leading-tight">
                The whole thing is open source.
              </h2>
              <p className="mt-5 max-w-md leading-relaxed text-sage">
                One AGPL repo, no private fork. The two cloud-only features —
                billing and the backlink network — are gated by one env var in{" "}
                <code className="font-mono text-xs text-parchment/80">lib/mode.ts</code>,
                in the open, where you can read them. Self-host with your own
                OpenRouter key and every limit disappears.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <a href={GITHUB_URL} target="_blank" rel="noreferrer" className="btn-ghost">Read the source ↗</a>
                <a href={DOCS_URL} target="_blank" rel="noreferrer" className="btn-ghost">Self-hosting guide ↗</a>
              </div>
            </div>
            <div>
              <div className="rounded-xl border border-parchment/10 bg-[#080D0A] p-5 font-mono text-[13px] leading-7 text-parchment/85">
                <p><span className="text-sage/60">$</span> git clone {GITHUB_URL.replace("https://", "")}</p>
                <p><span className="text-sage/60">$</span> cp .env.example .env</p>
                <p><span className="text-sage/60">$</span> docker compose up -d</p>
                <p className="mt-2 text-leaf">✓ seedsy on :3000 — no limits, no billing, your keys</p>
              </div>
              <dl className="mt-6 grid grid-cols-2 gap-x-8 gap-y-3 border-t border-parchment/10 pt-5 text-sm">
                <dt className="text-sage">License</dt>
                <dd className="text-right font-mono text-xs text-parchment/85">AGPL-3.0</dd>
                <dt className="text-sage">Stack</dt>
                <dd className="text-right font-mono text-xs text-parchment/85">Next.js · Supabase · OpenRouter</dd>
                <dt className="text-sage">Cloud-only</dt>
                <dd className="text-right font-mono text-xs text-parchment/85">billing · backlink network</dd>
                <dt className="text-sage">Everything else</dt>
                <dd className="text-right font-mono text-xs text-signal">yours, unlocked</dd>
              </dl>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- PRICING ---------- */}
      <section id="pricing" className="border-t border-parchment/10">
        <div className="mx-auto max-w-6xl scroll-mt-16 px-6 py-24">
          <p className="label">Pricing</p>
          <div className="mt-10 grid divide-y divide-parchment/10 md:grid-cols-3 md:divide-x md:divide-y-0">
            {[
              {
                num: "I",
                name: "Self-hosted",
                price: "Free forever",
                lines: ["Everything unlocked, no limits", "Your infra, your OpenRouter key", "AGPL-3.0 — modify freely"],
                cta: <a href={GITHUB_URL} target="_blank" rel="noreferrer" className="btn-ghost mt-8">GitHub ↗</a>,
              },
              {
                num: "II",
                name: "Cloud — Seed",
                price: "$0",
                lines: ["1 project · 10 articles a month", "Managed keys, zero ops", "Publish manually to any CMS"],
                cta: <Link href="/login" className="btn-ghost mt-8">Start free</Link>,
              },
              {
                num: "III",
                name: "Cloud — Pro",
                price: "$49/mo",
                lines: ["10 projects · 400 articles a month", "Daily auto-write + auto-publish", "Backlink network access"],
                cta: <Link href="/login" className="btn mt-8">Go Pro</Link>,
              },
            ].map((p) => (
              <div key={p.num} className="flex flex-col items-start py-10 md:px-10 md:py-2 md:first:pl-0 md:last:pr-0">
                <p className="font-display text-2xl text-signal">{p.num}</p>
                <p className="label mt-4">{p.name}</p>
                <p className="mt-2 font-display text-3xl">{p.price}</p>
                <ul className="mt-5 space-y-2 text-sm leading-relaxed text-sage">
                  {p.lines.map((l) => <li key={l}>{l}</li>)}
                </ul>
                {p.cta}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- COLOPHON ---------- */}
      <footer className="border-t border-parchment/10">
        <div className="mx-auto max-w-6xl px-6 py-14">
          <div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-end">
            <div>
              <Wordmark />
              <p className="mt-4 max-w-sm text-sm leading-relaxed text-sage">
                Publish responsibly. Google treats scaled spam and link schemes
                as violations; Seedsy is built for quality at a sane volume,
                with you as the editor.
              </p>
            </div>
            <div className="font-mono text-[11px] leading-6 text-sage/70">
              <p>Set in Fraunces &amp; Karla · built on Next.js + Supabase</p>
              <p>
                © {new Date().getFullYear()} · AGPL-3.0 ·{" "}
                <a href={GITHUB_URL} target="_blank" rel="noreferrer" className="underline hover:text-signal">GitHub</a> ·{" "}
                <a href={DOCS_URL} target="_blank" rel="noreferrer" className="underline hover:text-signal">Docs</a> ·{" "}
                <Link href="/terms" className="underline hover:text-signal">Terms</Link> ·{" "}
                <Link href="/privacy" className="underline hover:text-signal">Privacy</Link> ·{" "}
                <Link href="/refunds" className="underline hover:text-signal">Refunds</Link>
              </p>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
