-- Seedsy schema. Paste this whole file into Supabase SQL Editor and run once.

create extension if not exists "pgcrypto";

-- ============ PROJECTS ============
create table public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  url text not null,
  domain text not null,
  language text not null default 'en',
  brand_voice text,
  business_summary text,
  niche text,
  audience text,
  keywords jsonb not null default '[]',
  competitors jsonb not null default '[]',
  backlinks_enabled boolean not null default true,
  created_at timestamptz not null default now()
);

-- ============ ARTICLES ============
create table public.articles (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  title text not null,
  slug text not null,
  keyword text,
  angle text,
  status text not null default 'planned', -- planned | generating | draft | published | failed
  scheduled_for date,
  outline jsonb,
  content_md text,
  content_html text,
  meta_description text,
  schema_markup jsonb,
  published_url text,
  published_at timestamptz,
  error text,
  created_at timestamptz not null default now()
);
create index articles_project_idx on public.articles(project_id);
create index articles_due_idx on public.articles(status, scheduled_for);

-- ============ CMS INTEGRATIONS ============
create table public.integrations (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  kind text not null, -- wordpress | webflow | shopify | webhook
  config jsonb not null default '{}',
  active boolean not null default true,
  created_at timestamptz not null default now()
);
create index integrations_project_idx on public.integrations(project_id);

-- ============ BACKLINK EXCHANGE ============
-- A row = "from_project will place a contextual link to to_project in an upcoming article."
create table public.backlink_exchanges (
  id uuid primary key default gen_random_uuid(),
  from_project uuid not null references public.projects(id) on delete cascade,
  to_project uuid not null references public.projects(id) on delete cascade,
  anchor text not null,
  target_url text not null,
  status text not null default 'pending', -- pending | placed
  article_id uuid references public.articles(id) on delete set null,
  created_at timestamptz not null default now(),
  placed_at timestamptz
);
create index backlinks_from_idx on public.backlink_exchanges(from_project, status);

-- ============ AI VISIBILITY ============
create table public.visibility_prompts (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  prompt text not null,
  created_at timestamptz not null default now()
);

create table public.visibility_checks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  prompt_id uuid not null references public.visibility_prompts(id) on delete cascade,
  model text not null,        -- e.g. openai/gpt-4o, anthropic/claude-sonnet-4
  mentioned boolean not null default false,
  excerpt text,
  checked_at timestamptz not null default now()
);
create index visibility_checks_idx on public.visibility_checks(project_id, checked_at desc);

-- ============ ROW LEVEL SECURITY ============
alter table public.projects enable row level security;
alter table public.articles enable row level security;
alter table public.integrations enable row level security;
alter table public.backlink_exchanges enable row level security;
alter table public.visibility_prompts enable row level security;
alter table public.visibility_checks enable row level security;

create policy "own projects" on public.projects
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own articles" on public.articles
  for all using (exists (select 1 from public.projects p where p.id = project_id and p.user_id = auth.uid()))
  with check (exists (select 1 from public.projects p where p.id = project_id and p.user_id = auth.uid()));

create policy "own integrations" on public.integrations
  for all using (exists (select 1 from public.projects p where p.id = project_id and p.user_id = auth.uid()))
  with check (exists (select 1 from public.projects p where p.id = project_id and p.user_id = auth.uid()));

create policy "own backlinks" on public.backlink_exchanges
  for select using (
    exists (select 1 from public.projects p where (p.id = from_project or p.id = to_project) and p.user_id = auth.uid())
  );

create policy "own prompts" on public.visibility_prompts
  for all using (exists (select 1 from public.projects p where p.id = project_id and p.user_id = auth.uid()))
  with check (exists (select 1 from public.projects p where p.id = project_id and p.user_id = auth.uid()));

create policy "own checks" on public.visibility_checks
  for select using (exists (select 1 from public.projects p where p.id = project_id and p.user_id = auth.uid()));
