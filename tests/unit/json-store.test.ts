import { mkdtempSync, readdirSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { renameWithRetry, writeJsonFile } from "@/lib/server/json-store";

const errno = (code: string) => Object.assign(new Error(code), { code });

describe("json-store on Windows-style file locks", () => {
  it("retries a rename that fails while the file is briefly locked", async () => {
    let calls = 0;
    await renameWithRetry("a", "b", async () => {
      calls += 1;
      if (calls < 3) throw errno(calls === 1 ? "EPERM" : "EBUSY");
    });
    expect(calls).toBe(3);
  });

  it("gives up after a bounded number of attempts", async () => {
    let calls = 0;
    await expect(
      renameWithRetry("a", "b", async () => {
        calls += 1;
        throw errno("EACCES");
      }),
    ).rejects.toMatchObject({ code: "EACCES" });
    expect(calls).toBe(6);
  });

  it("does not retry errors that are not transient", async () => {
    let calls = 0;
    await expect(
      renameWithRetry("a", "b", async () => {
        calls += 1;
        throw errno("ENOENT");
      }),
    ).rejects.toMatchObject({ code: "ENOENT" });
    expect(calls).toBe(1);
  });

  it("writes a document atomically and leaves no temporary file", async () => {
    const dir = mkdtempSync(path.join(tmpdir(), "festiva-store-"));
    const file = path.join(dir, "doc.json");
    await writeJsonFile(file, { a: 1 });
    await writeJsonFile(file, { a: 2 });
    expect(JSON.parse(readFileSync(file, "utf8"))).toEqual({ a: 2 });
    expect(readdirSync(dir)).toEqual(["doc.json"]);
  });
});
