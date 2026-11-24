/** @jest-environment node */
// The route is wrapped in FESTIVA's telemetry, which marks it dynamic with Next.js's connection(); outside a
// real request that call has nothing to attach to, so it is a no-op here.
jest.mock("next/server", () => ({ ...jest.requireActual("next/server"), connection: async () => undefined }));

import { POST } from "@/app/api/speak/route";

const call = (body: unknown) =>
  POST(new Request("http://localhost/api/speak", { method: "POST", headers: { "content-type": "application/json", origin: "http://localhost" }, body: JSON.stringify(body) }), {} as never);

describe("POST /api/speak", () => {
  test("refuses languages Sarvam cannot voice", async () => {
    expect((await call({ text: "hola", language: "es-ES" })).status).toBe(422);
  });
  test("says plainly when Sarvam is not configured, instead of failing silently", async () => {
    const res = await call({ text: "Your plan is ready.", language: "en-IN" });
    expect(res.status).toBe(503);
    expect((await res.json()).error).toMatch(/not configured/);
  });
  test("rejects empty or oversized text", async () => {
    expect((await call({ text: "", language: "en-IN" })).status).toBe(400);
    expect((await call({ text: "a".repeat(600), language: "en-IN" })).status).toBe(400);
  });
});
