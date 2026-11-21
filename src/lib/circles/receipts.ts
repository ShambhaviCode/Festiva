import { createHash, createHmac, hkdfSync, timingSafeEqual } from "node:crypto";
import { serverEnv } from "@/lib/env.server";

/**
 * Provider receipts: proof that a transcript, translation or set of
 * structured fields really came back from this server's call to Sarvam.
 *
 * When a Sarvam route answers, it signs a small receipt naming the circle,
 * the participant, the model and a hash of exactly what Sarvam returned. When
 * the participant later saves their preference, the server checks the receipt
 * and takes the model, request ID and language details from it, never from the
 * browser. It also works out for itself whether the participant edited the text.
 * Without a valid receipt, nothing can be saved under Sarvam's name.
 *
 * The signing key is derived from the Sarvam API key with HKDF, so it exists
 * exactly when Sarvam is configured, is the same on every instance, needs no
 * extra setting, and changes when the Sarvam key is rotated.
 */

export type ReceiptKind = "transcript" | "translation" | "structure";

export type ReceiptPayload = {
  v: 1;
  kind: ReceiptKind;
  circleId: string;
  participantId: string;
  model: string;
  requestId: string | null;
  /** Language of the output (translation target, detected speech language). */
  language: string | null;
  languageProbability: number | null;
  /** SHA-256 of the input sent to Sarvam (translations only). */
  inputHash: string | null;
  /** SHA-256 of what Sarvam returned. */
  outputHash: string;
  /** Issued at, milliseconds since the epoch. */
  iat: number;
};

/** Receipts are only needed between a Sarvam call and the save that follows it. */
export const RECEIPT_TTL_MS = 6 * 60 * 60 * 1000;

function key(
  apiKey: string | undefined = serverEnv().SARVAM_API_KEY,
): Buffer | null {
  if (!apiKey) return null;
  return Buffer.from(
    hkdfSync("sha256", apiKey, "festiva", "festiva-provider-receipt-v1", 32),
  );
}

export function sha256(text: string): string {
  return createHash("sha256").update(text, "utf8").digest("base64url");
}

/** JSON with object keys sorted at every level, so the same value always hashes the same way. */
export function canonical(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
  if (value && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>)
      .filter(([, v]) => v !== undefined)
      .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
    return `{${entries.map(([k, v]) => `${JSON.stringify(k)}:${canonical(v)}`).join(",")}}`;
  }
  return JSON.stringify(value);
}

export function issueReceipt(
  payload: Omit<ReceiptPayload, "v" | "iat">,
  now = Date.now(),
  apiKey?: string,
): string {
  const k = key(apiKey);
  if (!k) throw new Error("Receipts need Sarvam to be configured.");
  const body = Buffer.from(
    JSON.stringify({ ...payload, v: 1, iat: now } satisfies ReceiptPayload),
  ).toString("base64url");
  const sig = createHmac("sha256", k).update(body).digest("base64url");
  return `${body}.${sig}`;
}

/** The receipt's payload if it is genuine, unexpired and for this kind, circle and participant; otherwise null. */
export function verifyReceipt(
  receipt: string | null | undefined,
  expect: { kind: ReceiptKind; circleId: string; participantId: string },
  now = Date.now(),
  apiKey?: string,
): ReceiptPayload | null {
  const k = key(apiKey);
  if (!k || typeof receipt !== "string" || receipt.length > 4000) return null;
  const [body, sig, extra] = receipt.split(".");
  if (!body || !sig || extra !== undefined) return null;
  const expected = createHmac("sha256", k).update(body).digest();
  let given: Buffer;
  try {
    given = Buffer.from(sig, "base64url");
  } catch {
    return null;
  }
  if (given.length !== expected.length || !timingSafeEqual(given, expected))
    return null;
  let payload: ReceiptPayload;
  try {
    payload = JSON.parse(
      Buffer.from(body, "base64url").toString("utf8"),
    ) as ReceiptPayload;
  } catch {
    return null;
  }
  if (
    payload.v !== 1 ||
    payload.kind !== expect.kind ||
    payload.circleId !== expect.circleId ||
    payload.participantId !== expect.participantId
  )
    return null;
  if (
    typeof payload.iat !== "number" ||
    payload.iat > now + 60_000 ||
    now - payload.iat > RECEIPT_TTL_MS
  )
    return null;
  return payload;
}
