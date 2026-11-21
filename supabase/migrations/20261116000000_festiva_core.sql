-- FESTIVA core schema
-- Target: Supabase (PostgreSQL 15+). Apply with `supabase db push` or paste into the SQL editor.
--
-- Principles
--   * UUID primary keys (gen_random_uuid, built into PostgreSQL 13+), foreign keys, CHECK constraints, timestamps and indexes throughout.
--   * Row Level Security is enabled on EVERY table.
--       - Catalogue tables: world-readable, writable only by the service role.
--       - User tables: private by default; only the owner can read or write their rows.
--       - Shared plans: never selectable by anonymous users. Public access goes through
--         get_shared_plan(token), which returns a single non-revoked snapshot.
--   * Provenance columns (source_url, verification_status, last_checked_at) on reference data.
--   * Products cannot carry a price without a currency and the time the price was checked.


-- ---------------------------------------------------------------------------
-- Shared helpers
-- ---------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'verification_status') then
    create type public.verification_status as enum ('verified', 'projected', 'reference', 'unchecked');
  end if;
end
$$;

-- ---------------------------------------------------------------------------
-- Catalogue: places
-- ---------------------------------------------------------------------------

create table if not exists public.regions (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.countries (
  id uuid primary key default gen_random_uuid(),
  code char(2) not null unique check (code ~ '^[A-Z]{2}$'),
  name text not null,
  region_id uuid not null references public.regions (id) on delete restrict,
  blurb text not null default '',
  languages text[] not null default '{}',
  currency_code char(3) check (currency_code ~ '^[A-Z]{3}$'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists countries_region_idx on public.countries (region_id);

-- ---------------------------------------------------------------------------
-- Catalogue: festivals
-- ---------------------------------------------------------------------------

create table if not exists public.festivals (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
  name text not null,
  local_name text,
  tagline text not null,
  summary text not null,
  region_id uuid not null references public.regions (id) on delete restrict,
  category text not null check (category in ('light', 'harvest', 'new-year', 'faith', 'spring', 'remembrance', 'arts', 'community')),
  observed_by text not null,
  -- How the date is determined: fixed, weekday rule, Easter offset, lunar table, seasonal…
  date_rule jsonb not null,
  date_note text not null,
  history text not null,
  significance text not null,
  etiquette text[] not null default '{}',
  genres text[] not null default '{}',
  palette text[] not null default '{}',
  latitude numeric(7, 4) check (latitude between -90 and 90),
  longitude numeric(7, 4) check (longitude between -180 and 180),
  source_url text check (source_url ~ '^https://'),
  verification_status public.verification_status not null default 'reference',
  last_checked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists festivals_region_idx on public.festivals (region_id);
create index if not exists festivals_category_idx on public.festivals (category);

create table if not exists public.festival_countries (
  festival_id uuid not null references public.festivals (id) on delete cascade,
  country_id uuid not null references public.countries (id) on delete cascade,
  primary key (festival_id, country_id)
);
create index if not exists festival_countries_country_idx on public.festival_countries (country_id);

-- One row per checked occurrence of a movable festival. Never extrapolated.
create table if not exists public.festival_dates (
  id uuid primary key default gen_random_uuid(),
  festival_id uuid not null references public.festivals (id) on delete cascade,
  starts_on date not null,
  ends_on date not null,
  status public.verification_status not null,
  note text,
  source_url text not null check (source_url ~ '^https://'),
  last_checked_at timestamptz,
  created_at timestamptz not null default now(),
  constraint festival_dates_order check (ends_on >= starts_on),
  constraint festival_dates_checked check (status = 'unchecked' or last_checked_at is not null),
  unique (festival_id, starts_on)
);
create index if not exists festival_dates_upcoming_idx on public.festival_dates (starts_on);

create table if not exists public.traditions (
  id uuid primary key default gen_random_uuid(),
  festival_id uuid not null references public.festivals (id) on delete cascade,
  kind text not null check (kind in ('tradition', 'regional_variation', 'decor', 'activity')),
  place text,
  activity_type text,
  body text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists traditions_festival_idx on public.traditions (festival_id, kind, sort_order);

create table if not exists public.greetings (
  id uuid primary key default gen_random_uuid(),
  festival_id uuid references public.festivals (id) on delete cascade,
  owner_id uuid references auth.users (id) on delete cascade,
  body text not null check (char_length(body) <= 600),
  language text not null,
  meaning text,
  created_at timestamptz not null default now()
);
create index if not exists greetings_festival_idx on public.greetings (festival_id);
create index if not exists greetings_owner_idx on public.greetings (owner_id);

-- ---------------------------------------------------------------------------
-- Catalogue: destinations, food, attire
-- ---------------------------------------------------------------------------

create table if not exists public.destinations (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
  name text not null,
  country_id uuid not null references public.countries (id) on delete restrict,
  kind text not null check (kind in ('city', 'heritage', 'region')),
  summary text not null,
  landmarks text[] not null default '{}',
  experiences text[] not null default '{}',
  itinerary text[] not null default '{}',
  latitude numeric(7, 4) not null check (latitude between -90 and 90),
  longitude numeric(7, 4) not null check (longitude between -180 and 180),
  source_url text check (source_url ~ '^https://'),
  verification_status public.verification_status not null default 'reference',
  last_checked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists destinations_country_idx on public.destinations (country_id);

create table if not exists public.festival_destinations (
  festival_id uuid not null references public.festivals (id) on delete cascade,
  destination_id uuid not null references public.destinations (id) on delete cascade,
  primary key (festival_id, destination_id)
);

create table if not exists public.foods (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
  name text not null,
  country_id uuid not null references public.countries (id) on delete restrict,
  type text not null check (type in ('sweet', 'main', 'snack', 'drink')),
  vegetarian boolean not null,
  vegan boolean not null,
  contains text[] not null default '{}',
  ingredients text[] not null default '{}',
  background text not null,
  source_url text check (source_url ~ '^https://'),
  verification_status public.verification_status not null default 'reference',
  last_checked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint foods_vegan_implies_vegetarian check (not vegan or vegetarian)
);
create index if not exists foods_country_idx on public.foods (country_id);

create table if not exists public.festival_foods (
  festival_id uuid not null references public.festivals (id) on delete cascade,
  food_id uuid not null references public.foods (id) on delete cascade,
  primary key (festival_id, food_id)
);

-- Recipes are only stored with a link to the reliable source they come from.
create table if not exists public.recipes (
  id uuid primary key default gen_random_uuid(),
  food_id uuid not null references public.foods (id) on delete cascade,
  title text not null,
  publisher text not null,
  source_url text not null check (source_url ~ '^https://'),
  verification_status public.verification_status not null default 'unchecked',
  last_checked_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists recipes_food_idx on public.recipes (food_id);

create table if not exists public.attire (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
  name text not null,
  country_id uuid not null references public.countries (id) on delete restrict,
  summary text not null,
  textiles text[] not null default '{}',
  craftsmanship text not null,
  wearing text not null,
  contemporary text not null,
  source_url text check (source_url ~ '^https://'),
  verification_status public.verification_status not null default 'reference',
  last_checked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists attire_country_idx on public.attire (country_id);

create table if not exists public.festival_attire (
  festival_id uuid not null references public.festivals (id) on delete cascade,
  attire_id uuid not null references public.attire (id) on delete cascade,
  primary key (festival_id, attire_id)
);

-- ---------------------------------------------------------------------------
-- Catalogue: shop
-- ---------------------------------------------------------------------------

create table if not exists public.brands (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
  name text not null,
  origin text not null,
  tier text not null check (tier in ('everyday', 'premium', 'elite')),
  categories text[] not null default '{}',
  about text not null,
  known_for text[] not null default '{}',
  official_url text not null check (official_url ~ '^https://'),
  -- Must stay false unless a signed partnership exists. The UI labels every brand as a catalogue example.
  is_partner boolean not null default false,
  source_url text check (source_url ~ '^https://'),
  verification_status public.verification_status not null default 'reference',
  last_checked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
  brand_id uuid references public.brands (id) on delete set null,
  title text not null,
  category text not null check (category in ('fashion', 'jewellery', 'sweets-gourmet', 'home-lifestyle', 'personalised', 'cultural')),
  tiers text[] not null default '{}',
  recipients text[] not null default '{}',
  interests text[] not null default '{}',
  festival_slugs text[] not null default '{}',
  note text not null default '',
  official_url text check (official_url ~ '^https://'),
  is_curated_example boolean not null default true,
  -- Prices are optional and only allowed with their currency, source and check time.
  price_minor bigint check (price_minor >= 0),
  currency_code char(3) check (currency_code ~ '^[A-Z]{3}$'),
  price_source_url text check (price_source_url ~ '^https://'),
  price_checked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint products_price_needs_provenance check (
    price_minor is null
    or (currency_code is not null and price_source_url is not null and price_checked_at is not null)
  )
);
create index if not exists products_brand_idx on public.products (brand_id);
create index if not exists products_category_idx on public.products (category);

-- ---------------------------------------------------------------------------
-- Catalogue: music and activities
-- ---------------------------------------------------------------------------

create table if not exists public.artists (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  genre text not null,
  country_name text not null,
  languages text[] not null default '{}',
  songs text[] not null default '{}',
  created_at timestamptz not null default now()
);
create index if not exists artists_genre_idx on public.artists (genre);

create table if not exists public.playlists (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
  title text not null,
  mood text not null default '',
  -- null owner = curated by FESTIVA
  owner_id uuid references auth.users (id) on delete cascade,
  is_public boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists playlists_owner_idx on public.playlists (owner_id);

create table if not exists public.playlist_tracks (
  id uuid primary key default gen_random_uuid(),
  playlist_id uuid not null references public.playlists (id) on delete cascade,
  artist_id uuid not null references public.artists (id) on delete cascade,
  song text not null,
  position integer not null check (position >= 0),
  unique (playlist_id, position)
);

create table if not exists public.activities (
  id uuid primary key default gen_random_uuid(),
  title text not null unique,
  detail text not null,
  type text not null check (type in ('cooking', 'music-dance', 'games', 'crafts', 'storytelling', 'gift-exchange', 'ritual', 'outdoors', 'giving-back')),
  audiences text[] not null default '{}',
  interests text[] not null default '{}',
  href text,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Users: profiles and private data
-- ---------------------------------------------------------------------------

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text check (char_length(display_name) <= 80),
  locale text not null default 'en-GB',
  currency_code char(3) not null default 'INR' check (currency_code ~ '^[A-Z]{3}$'),
  time_zone text not null default 'UTC',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.preferences (
  user_id uuid primary key references auth.users (id) on delete cascade,
  interests text[] not null default '{}',
  dietary text[] not null default '{}',
  default_country char(2) check (default_country ~ '^[A-Z]{2}$'),
  analytics_opt_out boolean not null default false,
  updated_at timestamptz not null default now()
);

create table if not exists public.saved_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  item_type text not null check (item_type in ('festival', 'destination', 'food', 'attire', 'product', 'artist', 'playlist')),
  item_slug text not null check (char_length(item_slug) <= 120),
  created_at timestamptz not null default now(),
  unique (user_id, item_type, item_slug)
);
create index if not exists saved_items_user_idx on public.saved_items (user_id, item_type);

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null default 'Conversation' check (char_length(title) <= 120),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists conversations_user_idx on public.conversations (user_id, updated_at desc);

create table if not exists public.conversation_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  body text not null check (char_length(body) <= 4000),
  mode text check (mode in ('offline', 'ai', 'ai-general', 'fallback')),
  created_at timestamptz not null default now()
);
create index if not exists conversation_messages_idx on public.conversation_messages (conversation_id, created_at);

create table if not exists public.celebration_plans (
  -- The client generates the UUID so a plan keeps its identity across devices.
  id uuid primary key,
  owner_id uuid not null references auth.users (id) on delete cascade,
  title text not null check (char_length(title) <= 200),
  plan jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint celebration_plans_shape check (jsonb_typeof(plan) = 'object' and plan ? 'sections' and plan ? 'budget')
);
create index if not exists celebration_plans_owner_idx on public.celebration_plans (owner_id, updated_at desc);

-- Normalised mirror of the items inside a plan, kept in step by a trigger, for querying and reporting.
create table if not exists public.plan_items (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references public.celebration_plans (id) on delete cascade,
  owner_id uuid not null references auth.users (id) on delete cascade,
  section text not null,
  position integer not null,
  title text not null,
  detail text not null default '',
  reason text not null default '',
  kind text not null check (kind in ('fact', 'suggestion')),
  href text,
  edited boolean not null default false,
  unique (plan_id, section, position)
);
create index if not exists plan_items_owner_idx on public.plan_items (owner_id);

create or replace function public.sync_plan_items()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from public.plan_items where plan_id = new.id;
  insert into public.plan_items (plan_id, owner_id, section, position, title, detail, reason, kind, href, edited)
  select
    new.id,
    new.owner_id,
    section ->> 'key',
    (item_row.ordinality - 1)::integer,
    left(item_row.item ->> 'title', 300),
    coalesce(item_row.item ->> 'detail', ''),
    coalesce(item_row.item ->> 'reason', ''),
    case when item_row.item ->> 'kind' = 'fact' then 'fact' else 'suggestion' end,
    item_row.item ->> 'href',
    coalesce((item_row.item ->> 'edited')::boolean, false)
  from jsonb_array_elements(new.plan -> 'sections') as section
  cross join lateral jsonb_array_elements(section -> 'items') with ordinality as item_row (item, ordinality);
  return new;
end;
$$;

create table if not exists public.shared_plans (
  id uuid primary key default gen_random_uuid(),
  token text not null unique check (token ~ '^[A-Za-z0-9_-]{16,64}$'),
  owner_id uuid not null references auth.users (id) on delete cascade,
  plan_id uuid references public.celebration_plans (id) on delete set null,
  title text not null check (char_length(title) <= 200),
  snapshot jsonb not null,
  created_at timestamptz not null default now(),
  expires_at timestamptz,
  revoked_at timestamptz
);
create index if not exists shared_plans_owner_idx on public.shared_plans (owner_id, created_at desc);

create table if not exists public.game_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  game text not null check (game in ('memory', 'quiz', 'rangoli', 'challenge', 'puzzle')),
  best_score integer not null default 0 check (best_score >= 0),
  plays integer not null default 0 check (plays >= 0),
  updated_at timestamptz not null default now(),
  unique (user_id, game)
);

-- Anonymous, first-party product analytics. No user id, IP address or user agent.
create table if not exists public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  name text not null check (name in ('page_view', 'festival_view', 'matchmaker_start', 'matchmaker_complete', 'plan_saved', 'plan_shared', 'greeting_created', 'returning_visit', 'referral_visit')),
  label text check (label ~ '^[a-z0-9-]{0,60}$'),
  path text check (char_length(path) <= 200),
  created_at timestamptz not null default now()
);
create index if not exists analytics_events_name_idx on public.analytics_events (name, created_at);

-- ---------------------------------------------------------------------------
-- Triggers
-- ---------------------------------------------------------------------------

do $$
declare
  t text;
begin
  foreach t in array array['countries', 'festivals', 'destinations', 'foods', 'attire', 'brands', 'products', 'playlists', 'profiles', 'preferences', 'conversations', 'celebration_plans', 'game_progress']
  loop
    execute format('drop trigger if exists %I on public.%I', t || '_set_updated_at', t);
    execute format('create trigger %I before update on public.%I for each row execute function public.set_updated_at()', t || '_set_updated_at', t);
  end loop;
end
$$;

drop trigger if exists celebration_plans_sync_items on public.celebration_plans;
create trigger celebration_plans_sync_items
  after insert or update of plan on public.celebration_plans
  for each row execute function public.sync_plan_items();

-- Create a profile and preferences row for every new auth user.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id) values (new.id) on conflict (id) do nothing;
  insert into public.preferences (user_id) values (new.id) on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Public access to a shared plan, by token only
-- ---------------------------------------------------------------------------

create or replace function public.get_shared_plan(p_token text)
returns table (snapshot jsonb, title text, created_at timestamptz)
language sql
stable
security definer
set search_path = public
as $$
  select s.snapshot, s.title, s.created_at
  from public.shared_plans s
  where s.token = p_token
    and s.revoked_at is null
    and (s.expires_at is null or s.expires_at > now())
  limit 1;
$$;

revoke all on function public.get_shared_plan(text) from public;
grant execute on function public.get_shared_plan(text) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

do $$
declare
  t text;
begin
  -- Catalogue: anyone may read; only the service role (which bypasses RLS) may write.
  foreach t in array array[
    'regions', 'countries', 'festivals', 'festival_countries', 'festival_dates', 'traditions',
    'destinations', 'festival_destinations', 'foods', 'festival_foods', 'recipes', 'attire',
    'festival_attire', 'brands', 'products', 'artists', 'playlist_tracks', 'activities'
  ]
  loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists "Catalogue is readable by everyone" on public.%I', t);
    execute format('create policy "Catalogue is readable by everyone" on public.%I for select using (true)', t);
  end loop;

  -- Private user data keyed by user_id.
  foreach t in array array['preferences', 'saved_items', 'conversations', 'game_progress']
  loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists "Owner has full access" on public.%I', t);
    execute format('create policy "Owner has full access" on public.%I for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id)', t);
  end loop;

  -- Private user data keyed by owner_id.
  foreach t in array array['celebration_plans', 'shared_plans']
  loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists "Owner has full access" on public.%I', t);
    execute format('create policy "Owner has full access" on public.%I for all to authenticated using (auth.uid() = owner_id) with check (auth.uid() = owner_id)', t);
  end loop;
end
$$;

alter table public.profiles enable row level security;
drop policy if exists "Owner has full access" on public.profiles;
create policy "Owner has full access" on public.profiles for all to authenticated using (auth.uid() = id) with check (auth.uid() = id);

-- Plan items are written only by the sync trigger; owners may read them.
alter table public.plan_items enable row level security;
drop policy if exists "Owner can read plan items" on public.plan_items;
create policy "Owner can read plan items" on public.plan_items for select to authenticated using (auth.uid() = owner_id);

alter table public.conversation_messages enable row level security;
drop policy if exists "Owner has full access" on public.conversation_messages;
create policy "Owner has full access" on public.conversation_messages for all to authenticated
  using (exists (select 1 from public.conversations c where c.id = conversation_id and c.user_id = auth.uid()))
  with check (exists (select 1 from public.conversations c where c.id = conversation_id and c.user_id = auth.uid()));

-- Greetings: FESTIVA's traditional greetings (no owner) are public; personal ones are private.
alter table public.greetings enable row level security;
drop policy if exists "Curated greetings are public" on public.greetings;
create policy "Curated greetings are public" on public.greetings for select using (owner_id is null);
drop policy if exists "Owner manages personal greetings" on public.greetings;
create policy "Owner manages personal greetings" on public.greetings for all to authenticated using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

-- Playlists: curated or explicitly public ones are readable; owners manage their own.
alter table public.playlists enable row level security;
drop policy if exists "Curated and public playlists are readable" on public.playlists;
create policy "Curated and public playlists are readable" on public.playlists for select using (owner_id is null or is_public);
drop policy if exists "Owner manages playlists" on public.playlists;
create policy "Owner manages playlists" on public.playlists for all to authenticated using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

-- Analytics: insert-only for clients. Nobody but the service role can read events.
alter table public.analytics_events enable row level security;
drop policy if exists "Anyone may record an event" on public.analytics_events;
create policy "Anyone may record an event" on public.analytics_events for insert to anon, authenticated with check (true);

-- Belt and braces: anonymous clients get no direct privileges on private tables at all.
revoke all on public.shared_plans, public.celebration_plans, public.plan_items, public.profiles, public.preferences,
  public.saved_items, public.conversations, public.conversation_messages, public.game_progress from anon;
revoke select, update, delete on public.analytics_events from anon, authenticated;
