-- Hosted projects don't auto-grant new public tables to service_role (local does),
-- so the submit-drawing Edge Function needs these explicitly: select for the
-- cooldown check, insert for the drawing itself.
grant select, insert on public.drawings to service_role;
