-- "Send me a message" submissions. The email is the real delivery; this table is
-- the send-message Edge Function's cooldown record and a backup if an email is lost.
create table public.messages (
  id uuid primary key default gen_random_uuid(),
  message text not null,
  contact text not null,           -- name or email, whatever the visitor typed
  submitter_hash text not null,    -- hashed IP, for rate limiting
  created_at timestamptz not null default now()
);

-- No policies and no anon/authenticated grants: messages are private, so only the
-- Edge Function (secret key) can touch this table.
alter table public.messages enable row level security;

revoke all on public.messages from anon, authenticated;

grant select, insert on public.messages to service_role;
