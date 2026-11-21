/**
 * Applies the migration and seed to a real PostgreSQL engine (PGlite, Postgres
 * compiled to WebAssembly) and checks the Row Level Security rules behave as
 * documented. No Supabase project or network access is needed.
 *
 *   npm run db:verify
 *
 * Supabase-specific objects (the auth schema, auth.uid(), the anon and
 * authenticated roles, default grants) are recreated by a small shim so the
 * migration runs unmodified. This verifies the SQL and the policies; it is not
 * a substitute for testing against your own Supabase project.
 */
import { readFileSync, readdirSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";
import { generatePlan } from "../src/domain/matchmaker/engine";
import { DEFAULT_INPUT } from "../src/domain/matchmaker/schema";
import { festivals } from "../src/data/festivals";

const SHIM = `
create role anon nologin;
create role authenticated nologin;
create role service_role nologin bypassrls;
create schema auth;
create table auth.users (id uuid primary key default gen_random_uuid(), email text);
create function auth.uid() returns uuid language sql stable as $$
  select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid
$$;
grant usage on schema public to anon, authenticated, service_role;
grant usage on schema auth to anon, authenticated, service_role;
alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
alter default privileges in schema public grant execute on functions to anon, authenticated, service_role;
`;

let failures = 0;
const results: string[] = [];
function check(name: string, ok: boolean, detail = "") {
  results.push(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? `  (${detail})` : ""}`);
  if (!ok) failures += 1;
}

const db = new PGlite();

async function as<T>(role: "anon" | "authenticated", userId: string | null, fn: () => Promise<T>): Promise<T> {
  await db.exec(`set role ${role}; select set_config('request.jwt.claim.sub', '${userId ?? ""}', false);`);
  try {
    return await fn();
  } finally {
    await db.exec("reset role; select set_config('request.jwt.claim.sub', '', false);");
  }
}

async function count(sql: string, params: unknown[] = []): Promise<number> {
  const result = await db.query<{ n: number }>(sql, params);
  return Number(result.rows[0]?.n ?? 0);
}

async function denied(fn: () => Promise<unknown>): Promise<boolean> {
  try {
    await fn();
    return false;
  } catch {
    return true;
  }
}

async function main() {
  await db.exec(SHIM);
  const dir = new URL("../supabase/migrations/", import.meta.url);
  const migrations = readdirSync(dir).filter((f) => f.endsWith(".sql")).sort();
  for (const file of migrations) await db.exec(readFileSync(new URL(file, dir), "utf8"));
  check("migration applies cleanly", true, migrations.join(", "));
  for (const file of migrations) await db.exec(readFileSync(new URL(file, dir), "utf8"));
  check("migration is idempotent (applied twice)", true);

  const seed = readFileSync(new URL("../supabase/seed.sql", import.meta.url), "utf8");
  await db.exec(seed);
  await db.exec(seed);
  check("seed applies and is idempotent", true);
  check("festival count matches the app dataset", (await count("select count(*)::int as n from public.festivals")) === festivals.length, `${festivals.length} festivals`);
  check("every festival has at least one country", (await count("select count(*)::int as n from public.festivals f where not exists (select 1 from public.festival_countries fc where fc.festival_id = f.id)")) === 0);
  check("movable dates are stored with a source", (await count("select count(*)::int as n from public.festival_dates where source_url is null")) === 0);

  const rls = await db.query<{ n: number }>("select count(*)::int as n from pg_tables where schemaname = 'public' and not rowsecurity");
  check("Row Level Security is enabled on every public table", Number(rls.rows[0].n) === 0);

  const users = await db.query<{ id: string }>("insert into auth.users (email) values ('a@example.test'), ('b@example.test') returning id");
  const [A, B] = users.rows.map((r) => r.id);
  check("a profile is created for each new user", (await count("select count(*)::int as n from public.profiles")) === 2);

  const plan = generatePlan(DEFAULT_INPUT, { id: "11111111-1111-4111-8111-111111111111", now: new Date("2026-11-16T00:00:00Z") });
  const itemTotal = plan.sections.reduce((sum, s) => sum + s.items.length, 0);

  await as("authenticated", A, async () => {
    await db.query("insert into public.celebration_plans (id, owner_id, title, plan) values ($1, $2, $3, $4)", [plan.id, A, plan.title, JSON.stringify(plan)]);
  });
  check("owner can save a plan", (await count("select count(*)::int as n from public.celebration_plans")) === 1);
  check("plan items are mirrored by trigger", (await count("select count(*)::int as n from public.plan_items where plan_id = $1", [plan.id])) === itemTotal, `${itemTotal} items`);

  check("owner can read their own plan", (await as("authenticated", A, () => count("select count(*)::int as n from public.celebration_plans"))) === 1);
  check("another user cannot read the plan", (await as("authenticated", B, () => count("select count(*)::int as n from public.celebration_plans"))) === 0);
  check("another user cannot read its items", (await as("authenticated", B, () => count("select count(*)::int as n from public.plan_items"))) === 0);
  const hijack = await as("authenticated", B, async () => (await db.query("update public.celebration_plans set title = 'taken' where id = $1 returning id", [plan.id])).rows.length);
  check("another user cannot update the plan", hijack === 0);
  check(
    "a user cannot create a plan owned by someone else",
    await as("authenticated", B, () => denied(() => db.query("insert into public.celebration_plans (id, owner_id, title, plan) values (gen_random_uuid(), $1, 'x', $2)", [A, JSON.stringify(plan)]))),
  );
  check("anonymous clients cannot read plans", await as("anon", null, () => denied(() => db.query("select * from public.celebration_plans"))));

  const token = "tok_ABCDEFGHIJKLMNOP1234";
  await as("authenticated", A, async () => {
    await db.query("insert into public.shared_plans (token, owner_id, plan_id, title, snapshot) values ($1, $2, $3, $4, $5)", [token, A, plan.id, plan.title, JSON.stringify(plan)]);
  });
  check("anonymous clients cannot list shared plans", await as("anon", null, () => denied(() => db.query("select * from public.shared_plans"))));
  check("a shared plan opens by token", (await as("anon", null, () => count("select count(*)::int as n from public.get_shared_plan($1)", [token]))) === 1);
  check("a wrong token returns nothing", (await as("anon", null, () => count("select count(*)::int as n from public.get_shared_plan($1)", ["tok_wrongwrongwrongwrong"]))) === 0);
  const stolen = await as("authenticated", B, async () => (await db.query("update public.shared_plans set revoked_at = now() where token = $1 returning id", [token])).rows.length);
  check("another user cannot revoke the share", stolen === 0);
  const revoked = await as("authenticated", A, async () => (await db.query("update public.shared_plans set revoked_at = now() where token = $1 returning id", [token])).rows.length);
  check("the owner can revoke the share", revoked === 1);
  check("a revoked share no longer opens", (await as("anon", null, () => count("select count(*)::int as n from public.get_shared_plan($1)", [token]))) === 0);

  check("anonymous clients can read the catalogue", (await as("anon", null, () => count("select count(*)::int as n from public.festivals"))) === festivals.length);
  check("anonymous clients cannot write to the catalogue", await as("anon", null, () => denied(() => db.query("insert into public.regions (slug, name) values ('atlantis', 'Atlantis')"))));
  check("signed-in users cannot write to the catalogue", await as("authenticated", A, () => denied(() => db.query("update public.brands set is_partner = true returning id").then((r) => { if (r.rows.length === 0) throw new Error("no rows"); }))));

  check("a product price without currency and source is rejected", await denied(() => db.query("insert into public.products (slug, title, category, price_minor) values ('bad-price', 'Bad', 'fashion', 1000)")));
  check("no seeded product carries a price", (await count("select count(*)::int as n from public.products where price_minor is not null")) === 0);
  check("no seeded brand is marked as a partner", (await count("select count(*)::int as n from public.brands where is_partner")) === 0);

  await as("anon", null, () => db.query("insert into public.analytics_events (name, label, path) values ('festival_view', 'diwali', '/discover/diwali')"));
  check("anonymous clients can record an analytics event", (await count("select count(*)::int as n from public.analytics_events")) === 1);
  check("clients cannot read analytics events", await as("authenticated", A, () => denied(() => db.query("select * from public.analytics_events"))));
  check("unknown analytics event names are rejected", await denied(() => db.query("insert into public.analytics_events (name) values ('keystroke')")));

  await as("authenticated", A, () => db.query("insert into public.saved_items (user_id, item_type, item_slug) values ($1, 'festival', 'diwali')", [A]));
  check("saved items are private to their owner", (await as("authenticated", B, () => count("select count(*)::int as n from public.saved_items"))) === 0);

  // --- Gift Circles (server-only table) -----------------------------------
  const circleId = "22222222-2222-4222-8222-222222222222";
  const circleDoc = JSON.stringify({ id: circleId, name: "Diwali gift circle" });
  const circleSecrets = JSON.stringify({ organiserKeyHash: "a".repeat(64), participantKeyHashes: {}, invite: null });
  await db.exec("set role service_role");
  await db.query("insert into public.gift_circles (id, document, secrets) values ($1, $2, $3)", [circleId, circleDoc, circleSecrets]);
  const serverReads = await count("select count(*)::int as n from public.gift_circles");
  const versioned = (await db.query("update public.gift_circles set version = version + 1 where id = $1 and version = 1 returning id", [circleId])).rows.length;
  const stale = (await db.query("update public.gift_circles set version = version + 1 where id = $1 and version = 1 returning id", [circleId])).rows.length;
  await db.exec("reset role");
  check("the server (service role) can store and read a gift circle", serverReads === 1);
  check("optimistic concurrency: a stale version updates nothing", versioned === 1 && stale === 0);
  check("anonymous clients cannot read gift circles", await as("anon", null, () => denied(() => db.query("select * from public.gift_circles"))));
  check("signed-in users cannot read gift circles", await as("authenticated", B, () => denied(() => db.query("select * from public.gift_circles"))));
  check(
    "clients cannot create gift circles",
    await as("anon", null, () => denied(() => db.query("insert into public.gift_circles (id, document, secrets) values (gen_random_uuid(), '{}'::jsonb, $1)", [circleSecrets]))),
  );
  check("a circle document must carry its own id", await denied(() => db.query("insert into public.gift_circles (id, document, secrets) values (gen_random_uuid(), $1, $2)", [circleDoc, circleSecrets])));
  check("circle secrets must hold a SHA-256 organiser hash", await denied(() => db.query("insert into public.gift_circles (id, document, secrets) values ($1, $2, '{}'::jsonb)", ["33333333-3333-4333-8333-333333333333", JSON.stringify({ id: "33333333-3333-4333-8333-333333333333" })])));

  await db.query("delete from auth.users where id = $1", [A]);
  check("deleting a user removes their plans, shares and saved items", (await count("select (select count(*) from public.celebration_plans) + (select count(*) from public.shared_plans) + (select count(*) from public.saved_items) + (select count(*) from public.plan_items) as n")) === 0);

  console.log(results.join("\n"));
  console.log(`\n${results.length - failures} of ${results.length} database checks passed.`);
  await db.close();
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((error) => {
  console.log(results.join("\n"));
  console.error("\nDatabase verification crashed:", error);
  process.exit(1);
});
