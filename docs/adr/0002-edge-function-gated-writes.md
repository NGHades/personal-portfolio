# Route Visitor Gallery and message writes through Supabase Edge Functions

Visitor Gallery submissions and the private "Send me a message" email are the only writes the site performs, both from unauthenticated public visitors. Supabase supports writing straight from the browser into Postgres via row-level security policies, which would be the simplest path. Instead, we decided both writes go through a Supabase Edge Function rather than a direct client-side insert/call.

The site needs to deter spam/abuse on these public write paths, and RLS policies can't reason about submission cadence or session/IP history the way server-side code can. Routing both through Edge Functions gives us one consistent place to enforce a cooldown and keeps the site's only two pieces of server-side logic (rate-limiting, sending the message email) together instead of splitting "some writes are direct, one goes through a function."

## Considered Options

- **Direct client inserts guarded only by RLS policies.** Rejected: simplest to build, but leaves no way to enforce a submission cooldown — spam/abuse deterrence would rely entirely on manual cleanup after the fact.

## Consequences

- Any new write path added later (beyond the gallery and messages) should default to going through an Edge Function too, so rate-limiting stays centralized rather than ad hoc per feature.
