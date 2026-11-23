/**
 * App-wide confirmation dialog, used instead of the browser's window.confirm.
 *   if (!(await confirmAction({ title: "Draw again?", confirmLabel: "Draw again", tone: "danger" }))) return;
 * <ConfirmHost /> in the root layout shows it. If no host is mounted (for example in a unit test), it falls
 * back to window.confirm so the safety check is never silently skipped.
 */
export interface ConfirmOptions {
  title: string;
  body?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** "danger" for actions that delete or cannot be undone. */
  tone?: "default" | "danger";
}
export interface ConfirmRequest extends ConfirmOptions { id: number; resolve: (ok: boolean) => void }

let next = 1;
export function confirmAction(options: ConfirmOptions): Promise<boolean> {
  if (typeof window === "undefined") return Promise.resolve(false);
  return new Promise((resolve) => {
    const detail: ConfirmRequest = { id: next++, ...options, resolve };
    const handled = !window.dispatchEvent(new CustomEvent<ConfirmRequest>("festiva:confirm", { detail, cancelable: true }));
    if (!handled) resolve(window.confirm([options.title, options.body].filter(Boolean).join("\n\n")));
  });
}
