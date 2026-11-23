/** Tiny app-wide notification bus. Any client component can call toast(); <Toaster /> shows it. */
export interface ToastOptions { tone?: "success" | "info" | "error"; action?: { label: string; href: string } | { label: string; onClick: () => void } }
export interface ToastEvent extends ToastOptions { id: number; message: string }

let next = 1;
export function toast(message: string, options: ToastOptions = {}): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent<ToastEvent>("festiva:toast", { detail: { id: next++, message, ...options } }));
}
