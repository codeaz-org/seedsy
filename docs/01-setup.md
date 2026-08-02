# Setup: zero to deployed

## Prerequisites
Accounts (all free tiers): Supabase, Vercel, OpenRouter (add ~$10 credit), Stripe (for billing).

## 1. Supabase
1. Create a project → SQL Editor → run `supabase/schema.sql`, then `supabase/schema-v2.sql`.
2. Authentication → Providers → Email → disable "Confirm email" (or set up SMTP; the
   `/auth/callback` route handles confirmations).
3. Authentication → URL Configuration → set Site URL to your production URL and add
   `https://your-app.vercel.app/**` to redirect URLs.
4. Copy from Project Settings → API: project URL, `anon` key, `service_role` key.

## 2. OpenRouter
Create a key at openrouter.ai/keys. Defaults (change via env or `lib/openrouter.ts`):
- Analysis/planning: `openai/gpt-4o-mini` (cheap)
- Writing: `anthropic/claude-sonnet-4` (best prose)
- Visibility panel: gpt-4o, claude-sonnet-4, gemini-2.5-flash, perplexity/sonar

## 3. Stripe
1. Create a Product "Seedsy Pro" with a **recurring monthly Price** → copy the `price_...` ID.
2. Developers → Webhooks → add endpoint `https://your-app.vercel.app/api/billing/webhook`
   with events: `checkout.session.completed`, `customer.subscription.updated`,
   `customer.subscription.deleted` → copy the signing secret (`whsec_...`).
3. For local testing: `stripe listen --forward-to localhost:3000/api/billing/webhook`.

## 4. Deploy
```bash
npm install
cp .env.example .env.local    # fill every value
npm run dev                   # verify locally
npx vercel                    # add the same env vars in the Vercel dashboard
npx vercel --prod
```
Crons are pinged by the Cloudflare Worker in `/cron-worker` (free; Vercel Hobby
caps projects at 2 cron jobs, we have 3). Setup: edit `APP_URL` in
`cron-worker/wrangler.toml`, then `npx wrangler login`,
`npx wrangler secret put CRON_SECRET` (same value as the env var), and
`npx wrangler deploy`. Endpoints require `Authorization: Bearer CRON_SECRET`.

## 5. Smoke test checklist
- [ ] Sign up, onboard a real public URL → analysis appears
- [ ] Generate 30-day plan → 30 articles listed
- [ ] Generate one article → draft with FAQ renders
- [ ] Publish with no integration → live at `/b/{projectId}/{slug}`, in the sitemap
- [ ] Connect WordPress → publish → post is live on the WP site
- [ ] Run visibility check → cited/absent chips per model
- [ ] Upgrade via Stripe test card 4242 4242 4242 4242 → plan shows "pro"
