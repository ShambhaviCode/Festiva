import { mkdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { serverEnv } from "../env.server";

/**
 * Small durable JSON documents on local disk, for single-instance deployments
 * (a VM, a container, `next start` on a laptop). Writes are atomic (write to a
 * temporary file, then rename) and serialised per file inside this process.
 *
 * Serverless platforms such as Vercel have no persistent disk: use the
 * Supabase store there (FESTIVA_CIRCLE_STORE=supabase).
 */

export function dataDir(): string {
  // Runtime data only: excluded from build-time file tracing.
  return path.resolve(/*turbopackIgnore: true*/ serverEnv().FESTIVA_DATA_DIR ?? path.join(/*turbopackIgnore: true*/ process.cwd(), ".festiva-data"));
}

const locks = new Map<string, Promise<unknown>>();

/** Run `task` after any earlier task on the same key has finished. */
export function serialise<T>(key: string, task: () => Promise<T>): Promise<T> {
  const previous = locks.get(key) ?? Promise.resolve();
  const next = previous.then(task, task);
  locks.set(
    key,
    next.catch(() => undefined),
  );
  return next;
}

export async function readJsonFile<T>(file: string, fallback: T): Promise<T> {
  try {
    return JSON.parse(await readFile(file, "utf8")) as T;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return fallback;
    throw error;
  }
}

/**
 * On Windows, replacing a file fails with EPERM, EBUSY or EACCES while another
 * process (typically an antivirus scanner or a search indexer) briefly holds
 * it open. These errors are transient, so the rename is retried a few times.
 */
const TRANSIENT_RENAME_ERRORS = new Set(["EPERM", "EBUSY", "EACCES"]);
const RENAME_RETRY_DELAYS_MS = [20, 50, 100, 200, 400];

export async function renameWithRetry(from: string, to: string, renameImpl: (from: string, to: string) => Promise<void> = rename): Promise<void> {
  for (let attempt = 0; ; attempt += 1) {
    try {
      await renameImpl(from, to);
      return;
    } catch (error) {
      const code = (error as NodeJS.ErrnoException).code ?? "";
      if (!TRANSIENT_RENAME_ERRORS.has(code) || attempt >= RENAME_RETRY_DELAYS_MS.length) throw error;
      await new Promise((resolve) => setTimeout(resolve, RENAME_RETRY_DELAYS_MS[attempt]));
    }
  }
}

export async function writeJsonFile(file: string, value: unknown): Promise<void> {
  await mkdir(path.dirname(file), { recursive: true, mode: 0o700 });
  const temp = `${file}.${process.pid}.${Date.now()}.tmp`;
  await writeFile(temp, JSON.stringify(value), { encoding: "utf8", mode: 0o600 });
  try {
    await renameWithRetry(temp, file);
  } catch (error) {
    await rm(temp, { force: true }).catch(() => undefined);
    throw error;
  }
}

/** Read-modify-write a JSON document under the per-file lock. */
export function updateJsonFile<T, R>(file: string, fallback: T, change: (current: T) => { next: T; result: R } | Promise<{ next: T; result: R }>): Promise<R> {
  return serialise(file, async () => {
    const current = await readJsonFile(file, fallback);
    const { next, result } = await change(current);
    await writeJsonFile(file, next);
    return result;
  });
}
