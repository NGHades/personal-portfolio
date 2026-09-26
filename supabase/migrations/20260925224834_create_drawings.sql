create table public.drawings (
  id uuid primary key default gen_random_uuid(),
  name text not null,              -- "Generous Zebra"
  strokes jsonb not null,          -- stroke data for replay
  flagged boolean not null default false,
  submitter_hash text not null,    -- hashed IP, for rate limiting
  created_at timestamptz not null default now()
);

alter table public.drawings enable row level security;

-- Visitors can read; there's no insert policy, so only the Edge Function (secret key) can write
create policy "public read" on public.drawings
  for select using (not flagged);