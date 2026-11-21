"use client";

import { PageSkeleton } from "@/components/Skeleton";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState, type FormEvent, type ReactNode } from "react";

/**
 * Wraps every admin page: loads data from an admin endpoint and, if the
 * browser is not signed in, shows the sign-in form instead. Admin access is
 * separate from Gift Circle keys; organisers and participants never get it.
 */

export async function adminFetch<T>(path: string, init: RequestInit = {}): Promise<{ status: number; data: T | null; error: string | null }> {
  const response = await fetch(path, { ...init, credentials: "same-origin", cache: "no-store", headers: { "content-type": "application/json", ...(init.headers ?? {}) } });
  const body = (await response.json().catch(() => null)) as (T & { error?: string }) | null;
  return { status: response.status, data: response.ok ? body : null, error: response.ok ? null : body?.error ?? `Request failed (${response.status})` };
}

function SignIn({ onDone }: { onDone: () => void }) {
  const [token, setToken] = useState("");
  const [error, setError] = useState<string | null>(null);
  async function submit(event: FormEvent) {
    event.preventDefault();
    const result = await adminFetch("/api/admin/session", { method: "POST", body: JSON.stringify({ token }) });
    if (result.status === 200) {
      setToken("");
      onDone();
    } else setError(result.error);
  }
  return (
    <form onSubmit={submit} className="grid max-w-md gap-4" data-testid="admin-sign-in">
      <h1 className="display-2">Administrator sign-in</h1>
      <p className="note">Use the token set as FESTIVA_ADMIN_TOKEN on this server. It is exchanged for a session cookie and not stored in the browser.</p>
      <label htmlFor="admin-token" className="field-label">
        Admin token
      </label>
      <input id="admin-token" type="password" autoComplete="current-password" className="field" value={token} onChange={(e) => setToken(e.target.value)} />
      {error && (
        <p role="alert" className="text-vermilion" data-testid="admin-error">
          {error}
        </p>
      )}
      <button type="submit" className="btn btn-plum justify-self-start" disabled={!token}>
        Sign in
      </button>
    </form>
  );
}

const LINKS = [
  { href: "/admin/integrations", label: "Integrations" },
  { href: "/admin/operations", label: "Operations" },
];

export function AdminFrame<T>({ endpoint, refreshMs, children }: { endpoint: string; refreshMs?: number; children: (data: T, reload: () => Promise<void>) => ReactNode }) {
  const pathname = usePathname();
  const [state, setState] = useState<{ status: number; data: T | null; error: string | null } | null>(null);
  const reload = useCallback(async () => setState(await adminFetch<T>(endpoint)), [endpoint]);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- loads from the server; state is set after the request resolves
    void reload();
    if (!refreshMs) return;
    const timer = setInterval(() => void reload(), refreshMs);
    return () => clearInterval(timer);
  }, [reload, refreshMs]);

  if (!state) return <PageSkeleton label="Loading…" variant="admin" />;
  if (state.status === 404)
    return (
      <div data-testid="admin-not-configured">
        <h1 className="display-2">Admin access is not configured.</h1>
        <p className="lede mt-4 max-w-2xl">Set FESTIVA_ADMIN_TOKEN (at least 24 random characters) in this server&rsquo;s environment and restart it. Until then these pages are closed to everyone.</p>
      </div>
    );
  if (state.status === 401) return <SignIn onDone={reload} />;
  if (!state.data) return <p className="text-vermilion">{state.error}</p>;
  return (
    <div>
      <nav aria-label="Admin" className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <ul className="flex gap-6">
          {LINKS.map((l) => (
            <li key={l.href}>
              <Link href={l.href} aria-current={pathname === l.href ? "page" : undefined} className="border-b-2 border-transparent pb-1 aria-[current=page]:border-saffron aria-[current=page]:font-semibold">
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
        <button
          type="button"
          className="link note"
          onClick={async () => {
            await fetch("/api/admin/session", { method: "DELETE", credentials: "same-origin" });
            await reload();
          }}
        >
          Sign out
        </button>
      </nav>
      {children(state.data, reload)}
    </div>
  );
}

export function StateBadge({ state }: { state: string }) {
  const map: Record<string, [string, string]> = {
    connected: ["Connected", "bg-emerald text-ivory"],
    degraded: ["Connected, last request failed", "bg-saffron text-plum-deep"],
    configured_unverified: ["Configured, not yet verified", "bg-gold-soft text-charcoal"],
    offline_document: ["Offline document (not live)", "bg-gold-soft text-charcoal"],
    test_stub: ["Local test double, not the real service", "bg-vermilion text-ivory"],
    not_configured: ["Not configured", "bg-cream text-charcoal"],
  };
  const [label, colour] = map[state] ?? [state, "bg-cream"];
  return (
    <span className={`inline-block rounded-full px-3 py-1 text-[0.85rem] font-semibold ${colour}`} data-testid="state-badge" data-state={state}>
      {label}
    </span>
  );
}

export function when(iso: string | null | undefined): string {
  if (!iso) return "never";
  return new Date(iso).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", second: "2-digit" });
}
