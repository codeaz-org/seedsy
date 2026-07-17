-- Seedsy v2 migration: billing. Run AFTER schema.sql in the Supabase SQL editor.

create table public.subscriptions (
  user_id uuid primary key references auth.users(id) on delete cascade,
  stripe_customer_id text unique,
  stripe_subscription_id text,
  status text not null default 'inactive', -- active | trialing | past_due | canceled | inactive
  price_id text,
  current_period_end timestamptz,
  updated_at timestamptz not null default now()
);

alter table public.subscriptions enable row level security;
create policy "own subscription" on public.subscriptions
  for select using (auth.uid() = user_id);
-- Writes happen only via the Stripe webhook using the service role.
