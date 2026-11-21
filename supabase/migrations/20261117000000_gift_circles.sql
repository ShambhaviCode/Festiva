-- FESTIVA Gift Circle storage (used when FESTIVA_CIRCLE_STORE=supabase).
--
-- One row per circle. The circle document and its secrets (hashes of the
-- organiser key, participant keys and the current invitation token) are kept
-- in separate columns. Raw keys are never stored.
--
-- Access model: only the FESTIVA server reads or writes this table, using the
-- service-role key held in a server-only environment variable. Row Level
-- Security is enabled with NO policies for the anon or authenticated roles,
-- and their table privileges are revoked, so a browser holding the public
-- anon key cannot read or change any circle. Authorisation (organiser vs
-- participant) is enforced by the server.
--
-- Idempotent: safe to apply more than once.

create table if not exists public.gift_circles (
  id uuid primary key,
  document jsonb not null,
  secrets jsonb not null,
  version integer not null default 1 check (version > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint gift_circles_document_id check (document ->> 'id' = id::text),
  constraint gift_circles_secrets_shape check (coalesce(jsonb_typeof(secrets -> 'organiserKeyHash'), '') = 'string' and coalesce(length(secrets ->> 'organiserKeyHash'), 0) = 64),
  constraint gift_circles_document_size check (pg_column_size(document) < 1048576)
);

create index if not exists gift_circles_updated_at_idx on public.gift_circles (updated_at desc);

alter table public.gift_circles enable row level security;
revoke all on table public.gift_circles from anon, authenticated;

comment on table public.gift_circles is 'FESTIVA Gift Circles. Server-only (service role). No client policies by design.';
