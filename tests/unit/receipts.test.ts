import {
  canonical,
  issueReceipt,
  RECEIPT_TTL_MS,
  sha256,
  verifyReceipt,
} from "@/lib/circles/receipts";

const KEY = "test-sarvam-key-not-real";
const WHO = { circleId: "c1", participantId: "p1" };
const base = {
  kind: "translation" as const,
  ...WHO,
  model: "sarvam-translate:v1",
  requestId: "r1",
  language: "hi-IN",
  languageProbability: null,
  inputHash: sha256("a"),
  outputHash: sha256("b"),
};
const NOW = 1_800_000_000_000;

describe("provider receipts", () => {
  test("a receipt issued by the server verifies for the same kind, circle and participant", () => {
    const r = issueReceipt(base, NOW, KEY);
    expect(
      verifyReceipt(r, { kind: "translation", ...WHO }, NOW + 1000, KEY),
    ).toMatchObject({ model: "sarvam-translate:v1", outputHash: sha256("b") });
  });

  test("tampering, another participant, another kind, expiry or another key all fail", () => {
    const r = issueReceipt(base, NOW, KEY);
    const [body, sig] = r.split(".");
    const forgedBody = Buffer.from(
      JSON.stringify({
        ...JSON.parse(Buffer.from(body, "base64url").toString()),
        model: "fake",
      }),
    ).toString("base64url");
    expect(
      verifyReceipt(
        `${forgedBody}.${sig}`,
        { kind: "translation", ...WHO },
        NOW,
        KEY,
      ),
    ).toBeNull();
    expect(
      verifyReceipt(
        r,
        { kind: "translation", circleId: "c1", participantId: "p2" },
        NOW,
        KEY,
      ),
    ).toBeNull();
    expect(
      verifyReceipt(r, { kind: "transcript", ...WHO }, NOW, KEY),
    ).toBeNull();
    expect(
      verifyReceipt(
        r,
        { kind: "translation", ...WHO },
        NOW + RECEIPT_TTL_MS + 1,
        KEY,
      ),
    ).toBeNull();
    expect(
      verifyReceipt(r, { kind: "translation", ...WHO }, NOW, "a-different-key"),
    ).toBeNull();
    expect(
      verifyReceipt("not-a-receipt", { kind: "translation", ...WHO }, NOW, KEY),
    ).toBeNull();
    expect(
      verifyReceipt(undefined, { kind: "translation", ...WHO }, NOW, KEY),
    ).toBeNull();
  });

  test("without Sarvam configured, receipts can be neither issued nor accepted", () => {
    expect(() => issueReceipt(base, NOW, "")).toThrow();
    const r = issueReceipt(base, NOW, KEY);
    expect(
      verifyReceipt(r, { kind: "translation", ...WHO }, NOW, ""),
    ).toBeNull();
  });

  test("canonical JSON ignores key order", () => {
    expect(canonical({ b: [1, { y: 2, x: 1 }], a: "z" })).toBe(
      canonical({ a: "z", b: [1, { x: 1, y: 2 }] }),
    );
  });
});
