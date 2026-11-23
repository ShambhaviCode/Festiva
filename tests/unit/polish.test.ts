/** @jest-environment node */
import { confirmAction, type ConfirmRequest } from "@/lib/confirm";

/** A minimal browser window: an event target with a native confirm. */
function fakeWindow(answer: boolean) {
  const target = new EventTarget() as EventTarget & { confirm: jest.Mock };
  target.confirm = jest.fn(() => answer);
  return target;
}

describe("confirmAction", () => {
  const original = (globalThis as { window?: unknown }).window;
  afterEach(() => {
    (globalThis as { window?: unknown }).window = original;
  });

  test("on the server it never confirms", async () => {
    delete (globalThis as { window?: unknown }).window;
    await expect(confirmAction({ title: "Delete?" })).resolves.toBe(false);
  });

  test("with no dialog host mounted it falls back to the browser's confirm, so the check is never skipped", async () => {
    const w = fakeWindow(true);
    (globalThis as { window?: unknown }).window = w;
    await expect(confirmAction({ title: "Delete this circle?", body: "This cannot be undone." })).resolves.toBe(true);
    expect(w.confirm).toHaveBeenCalledWith("Delete this circle?\n\nThis cannot be undone.");
  });

  test("a mounted host answers instead, and the browser's confirm is not shown", async () => {
    const w = fakeWindow(true);
    (globalThis as { window?: unknown }).window = w;
    const seen: ConfirmRequest[] = [];
    w.addEventListener("festiva:confirm", (e) => {
      e.preventDefault();
      const req = (e as CustomEvent<ConfirmRequest>).detail;
      seen.push(req);
      req.resolve(false);
    });
    await expect(confirmAction({ title: "Clear data?", tone: "danger", confirmLabel: "Clear data" })).resolves.toBe(false);
    expect(w.confirm).not.toHaveBeenCalled();
    expect(seen[0]).toMatchObject({ title: "Clear data?", tone: "danger", confirmLabel: "Clear data" });
  });
});
