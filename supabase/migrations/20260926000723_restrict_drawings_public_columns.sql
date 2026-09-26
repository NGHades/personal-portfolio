-- Visitors only need what the gallery renders. submitter_hash would let anyone
-- group drawings by visitor, and flagged is moderation-only.
revoke select on public.drawings from anon, authenticated;

grant select (id, name, strokes, created_at) on public.drawings to anon, authenticated;
