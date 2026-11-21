import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { rm, stat } from "node:fs/promises";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";
import { circleSchema, type Circle } from "@/domain/circle/schema";
import { publicEnv } from "../env";
import { serverEnv } from "../env.server";
import { dataDir, readJsonFile, serialise, writeJsonFile } from "../server/json-store";

/**
 * Gift Circle storage.
 *
 * A record holds the circle and, separately, its secrets: SHA-256 hashes of
 * the organiser key, each participant key and the current invitation token.
 * Raw keys are shown to their owner once and never stored.
 *
 * Two implementations:
 * - `file`: JSON on local disk. The default; right for one server instance.
 * - `supabase`: one row per circle in `public.gift_circles`, written with the
 *   service-role key from the server only. Row Level Security is enabled with
 *   no client policies, so browsers cannot read the table at all.
 */

export interface InviteSecret {
  tokenHash: string;
  createdAt: string;
  expiresAt: string;
  revokedAt: string | null;
}

export interface CircleSecrets {
  organiserKeyHash: string;
  participantKeyHashes: Record<string, string>;
  invite: InviteSecret | null;
}

export interface CircleRecord {
  circle: Circle;
  secrets: CircleSecrets;
  version: number;
}

export interface StoreHealth {
  ok: boolean;
  kind: "file" | "supabase";
  detail: string;
  ms: number;
}

export interface CircleRepository {
  kind: "file" | "supabase";
  create(record: CircleRecord): Promise<void>;
  get(id: string): Promise<CircleRecord | null>;
  /** Atomically read, change and write one record. */
  update<R>(id: string, change: (record: CircleRecord) => { record: CircleRecord; result: R }): Promise<R>;
  delete(id: string): Promise<boolean>;
  health(): Promise<StoreHealth>;
}

export class NotFoundError extends Error {
  constructor() {
    super("Circle not found");
    this.name = "NotFoundError";
  }
}

export const hashSecret = (value: string): string => createHash("sha256").update(value).digest("hex");
export const newSecret = (): string => randomBytes(24).toString("base64url");
export const SECRET_PATTERN = /^[A-Za-z0-9_-]{24,64}$/;
export const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function secretMatches(value: string, hash: string): boolean {
  const given = Buffer.from(hashSecret(value), "hex");
  const stored = Buffer.from(hash, "hex");
  return given.length === stored.length && timingSafeEqual(given, stored);
}

function validRecord(raw: unknown): CircleRecord | null {
  if (!raw || typeof raw !== "object") return null;
  const record = raw as CircleRecord;
  const circle = circleSchema.safeParse(record.circle);
  if (!circle.success || !record.secrets || typeof record.secrets.organiserKeyHash !== "string") return null;
  return { circle: circle.data, secrets: record.secrets, version: Number(record.version) || 1 };
}

/* ------------------------------------------------------------------ */

export class FileCircleRepository implements CircleRepository {
  kind = "file" as const;
  constructor(private root: string) {}

  private file(id: string): string {
    if (!UUID_PATTERN.test(id)) throw new NotFoundError();
    return path.join(this.root, "circles", `${id.toLowerCase()}.json`);
  }

  async create(record: CircleRecord): Promise<void> {
    const file = this.file(record.circle.id);
    await serialise(file, () => writeJsonFile(file, record));
  }

  async get(id: string): Promise<CircleRecord | null> {
    if (!UUID_PATTERN.test(id)) return null;
    return validRecord(await readJsonFile<unknown>(this.file(id), null));
  }

  update<R>(id: string, change: (record: CircleRecord) => { record: CircleRecord; result: R }): Promise<R> {
    const file = this.file(id);
    return serialise(file, async () => {
      const current = validRecord(await readJsonFile<unknown>(file, null));
      if (!current) throw new NotFoundError();
      const { record, result } = change(current);
      await writeJsonFile(file, { ...record, version: current.version + 1 });
      return result;
    });
  }

  async delete(id: string): Promise<boolean> {
    if (!UUID_PATTERN.test(id)) return false;
    const file = this.file(id);
    return serialise(file, async () => {
      try {
        await stat(file);
      } catch {
        return false;
      }
      await rm(file, { force: true });
      return true;
    });
  }

  async health(): Promise<StoreHealth> {
    const started = performance.now();
    const probe = path.join(this.root, "health", "probe.json");
    try {
      await writeJsonFile(probe, { at: new Date().toISOString() });
      const back = await readJsonFile<{ at?: string } | null>(probe, null);
      const ok = Boolean(back?.at);
      return { ok, kind: "file", detail: ok ? "Data directory is writable" : "Probe could not be read back", ms: Math.round(performance.now() - started) };
    } catch (error) {
      return { ok: false, kind: "file", detail: `Data directory is not writable (${(error as NodeJS.ErrnoException).code ?? "error"})`, ms: Math.round(performance.now() - started) };
    }
  }
}

/* ------------------------------------------------------------------ */

export class SupabaseCircleRepository implements CircleRepository {
  kind = "supabase" as const;
  private client;

  constructor(url: string, serviceRoleKey: string) {
    this.client = createClient(url, serviceRoleKey, { auth: { persistSession: false, autoRefreshToken: false } });
  }

  async create(record: CircleRecord): Promise<void> {
    const { error } = await this.client
      .from("gift_circles")
      .insert({ id: record.circle.id, document: record.circle, secrets: record.secrets, version: 1 });
    if (error) throw new Error("Could not create the circle");
  }

  async get(id: string): Promise<CircleRecord | null> {
    if (!UUID_PATTERN.test(id)) return null;
    const { data, error } = await this.client.from("gift_circles").select("document, secrets, version").eq("id", id).maybeSingle();
    if (error || !data) return null;
    return validRecord({ circle: data.document, secrets: data.secrets, version: data.version });
  }

  async update<R>(id: string, change: (record: CircleRecord) => { record: CircleRecord; result: R }): Promise<R> {
    // Optimistic concurrency: write only if nobody else wrote in between; retry a few times.
    for (let attempt = 0; attempt < 4; attempt += 1) {
      const current = await this.get(id);
      if (!current) throw new NotFoundError();
      const { record, result } = change(current);
      const { data, error } = await this.client
        .from("gift_circles")
        .update({ document: record.circle, secrets: record.secrets, version: current.version + 1, updated_at: new Date().toISOString() })
        .eq("id", id)
        .eq("version", current.version)
        .select("id");
      if (error) throw new Error("Could not save the circle");
      if (data && data.length === 1) return result;
    }
    throw new Error("The circle was changed by someone else at the same time. Try again.");
  }

  async delete(id: string): Promise<boolean> {
    const { data, error } = await this.client.from("gift_circles").delete().eq("id", id).select("id");
    return !error && (data?.length ?? 0) > 0;
  }

  async health(): Promise<StoreHealth> {
    const started = performance.now();
    const { error } = await this.client.from("gift_circles").select("id", { head: true, count: "exact" }).limit(1);
    return { ok: !error, kind: "supabase", detail: error ? "Supabase query failed" : "Supabase reachable", ms: Math.round(performance.now() - started) };
  }
}

/* ------------------------------------------------------------------ */

let cached: { key: string; repo: CircleRepository } | null = null;

export function circleRepository(): CircleRepository {
  const env = serverEnv();
  const wantsSupabase = env.FESTIVA_CIRCLE_STORE === "supabase";
  const key = wantsSupabase ? "supabase" : `file:${dataDir()}`;
  if (cached?.key === key) return cached.repo;
  let repo: CircleRepository;
  if (wantsSupabase) {
    if (!publicEnv.NEXT_PUBLIC_SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("FESTIVA_CIRCLE_STORE=supabase needs NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY");
    }
    repo = new SupabaseCircleRepository(publicEnv.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
  } else {
    repo = new FileCircleRepository(dataDir());
  }
  cached = { key, repo };
  return repo;
}
