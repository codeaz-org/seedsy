# Seedsy

> Open-source SEO + GEO autopilot. Analyzes your site, writes and publishes an
> article a day, and tracks whether ChatGPT, Claude, Gemini and Perplexity
> recommend your brand.

[![License: AGPL-3.0](https://img.shields.io/badge/license-AGPL--3.0-blue)](LICENSE)
[![CI](https://github.com/your-org/seedsy/actions/workflows/ci.yml/badge.svg)](https://github.com/your-org/seedsy/actions)
[![PRs welcome](https://img.shields.io/badge/PRs-welcome-brightgreen)](CONTRIBUTING.md)

**Stack:** Next.js 14 · Supabase (auth + Postgres + RLS) · OpenRouter (one key
for all LLMs) · Stripe (cloud mode only)

## What it does

- **Analyze** — crawls your site: niche, audience, brand voice, 20 target keywords, competitors, buyer questions
- **Plan** — 30-day calendar of formats LLMs cite: comparisons, statistics, how-tos, FAQs
- **Write** — daily article with named-source stats, FAQ block, internal links, Article JSON-LD
- **Publish** — WordPress, Webflow, Shopify, Ghost, webhook (→ Zapier/Make), or a built-in hosted blog with sitemap
- **Measure** — weekly share-of-voice across ChatGPT, Claude, Gemini, Perplexity
- **Extras** — one-click X/LinkedIn drafts per article, 5 languages, backlink exchange network (cloud)

## Local development

Prereqs: Node 20+, a free [Supabase](https://supabase.com) project, an
[OpenRouter](https://openrouter.ai/keys) key.

```bash
git clone https://github.com/your-org/seedsy && cd seedsy
npm install
cp .env.example .env.local
```

1. **Supabase** — in your project's SQL Editor, run `supabase/schema.sql`,
   then `supabase/schema-v2.sql`. Under Authentication → Providers → Email,
   turn off "Confirm email" for local dev. Copy the URL, anon key and
   service_role key (Project Settings → API) into `.env.local`.
2. **OpenRouter** — put your key in `OPENROUTER_API_KEY` ($10 of credits goes
   far; each article ≈ $0.03–0.15).
3. Set `CRON_SECRET` to any random string. Leave the Stripe block empty —
   self-hosted mode (the default) never touches it.

```bash
npm run dev    # http://localhost:3000
```

Sign up → paste any public site URL → you should land on a project overview
with keywords and a plan button in about a minute.

## Deploy

**Docker (self-host):**

```bash
cp .env.example .env   # same values as above
docker compose up --build -d
```

Crons don't schedule themselves off-Vercel — see the comments in
`docker-compose.yml` and the full guide in
[docs/07-self-hosting.md](docs/07-self-hosting.md).

**Vercel:**

```bash
npx vercel && npx vercel --prod   # add the same env vars in Vercel
```

Schedule the crons with the free Cloudflare Worker in [`cron-worker/`](cron-worker)
(set `APP_URL` in its `wrangler.toml`, `wrangler secret put CRON_SECRET`,
`wrangler deploy`). Set `NEXT_PUBLIC_APP_URL` to
your production URL and add it in Supabase → Authentication → URL Configuration.

## Self-hosted vs cloud

Everything ships in this repo. Cloud behavior is enabled by
`NEXT_PUBLIC_DEPLOYMENT_MODE=cloud` (`lib/mode.ts`) — not hidden code.

| | Self-hosted | Cloud |
|---|---|---|
| Analysis · planning · daily writing · publishing | ✅ | ✅ |
| AI visibility tracking | ✅ | ✅ |
| Hosted blog + sitemap | ✅ | ✅ |
| Plan limits | None | Free / Pro |
| LLM keys | Bring your own | Managed |
| Backlink exchange network | — | ✅ |
| "Published with Seedsy" line | On by default, `SEEDSY_ATTRIBUTION=false` to remove | Removed on Pro |

## Docs

[`/docs`](docs) — setup, integrations, billing, architecture, API reference,
production checklist, self-hosting.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Security issues → [SECURITY.md](SECURITY.md).

## License

[AGPL-3.0](LICENSE). Self-host it, modify it, even run it commercially — if
you serve a modified version over a network, you must open your modifications.
The hosted cloud is a commercial offering by the maintainer (see [NOTICE](NOTICE)).

## Limitations & responsible use

- Google explicitly treats **scaled content abuse** and **link exchanges** as
  spam policy violations; sites doing this can be deranked. Keep humans
  reviewing drafts, keep the backlink exchange opt-in, keep volume sane.
- LLMs invent things. **Verify statistics before publishing**, and don't
  publish unreviewed AI content in health, finance, or legal niches.
- CMS credentials live in Postgres (`integrations.config`). Before serving
  third parties: rate limiting, encrypted credentials, legal review — see
  [docs/06-going-to-production.md](docs/06-going-to-production.md).
