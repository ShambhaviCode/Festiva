"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabaseConfigured } from "@/lib/env";
import { syncPlansFromCloud } from "@/lib/plans";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabase } from "@/lib/supabase/client";

/**
 * Sign-in with Supabase Auth (email and password, or a one-time email link).
 * When the deployment has no Supabase project configured this says so plainly
 * and explains what still works without an account.
 */
export function AccountPanel() {
  const [supabase, setSupabase] = useState<SupabaseClient | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [ready, setReady] = useState(!supabaseConfigured);
  const [form, setForm] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    let cancelled = false;
    void getSupabase().then(async (client) => {
      if (!client || cancelled) return;
      const { data } = await client.auth.getSession();
      if (cancelled) return;
      setSupabase(client);
      setEmail(data.session?.user.email ?? null);
      setReady(true);
      unsubscribe = client.auth.onAuthStateChange((_event, session) => setEmail(session?.user.email ?? null)).data.subscription.unsubscribe;
    });
    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, []);

  if (!supabaseConfigured) {
    return (
      <div className="max-w-2xl" data-testid="account-unavailable">
        <h2 className="display-3">Accounts are not switched on in this deployment.</h2>
        <p className="mt-3 text-ink">
          FESTIVA uses Supabase for sign-in and private cloud storage, and this site is running without a Supabase project connected. Nothing is broken: everything you save stays in this browser instead.
        </p>
        <ul className="mt-4 list-disc space-y-1 pl-5 text-ink">
          <li>Saved festivals, places, wishlist and favourite artists are kept on this device.</li>
          <li>Celebration plans are kept on this device and can be exported or shared by link.</li>
          <li>Share links work in demo mode and reset when the server restarts.</li>
        </ul>
        <p className="mt-5 flex flex-wrap gap-x-6 gap-y-2">
          <Link href="/plans" className="link link-accent">
            My plans
          </Link>
          <Link href="/saved" className="link link-accent">
            Saved items
          </Link>
        </p>
        <p className="note mt-6">Site owner: add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY and apply the migration in supabase/migrations to enable accounts. See the README.</p>
      </div>
    );
  }

  if (!ready || !supabase) return <p className="note">Checking your session…</p>;

  const run = async (action: () => Promise<{ error: { message: string } | null }>, success: string) => {
    setBusy(true);
    setMessage("");
    const { error } = await action();
    setMessage(error ? error.message : success);
    setBusy(false);
  };

  if (email) {
    return (
      <div className="max-w-xl" data-testid="account-signed-in">
        <h2 className="display-3">Signed in</h2>
        <p className="mt-2 text-ink">{email}</p>
        <div className="mt-6 flex flex-wrap gap-2.5">
          <button type="button" className="btn btn-plum" disabled={busy} onClick={async () => setMessage(`Synced ${await syncPlansFromCloud()} plans from your account.`)}>
            Sync my plans
          </button>
          <button type="button" className="btn btn-line" disabled={busy} onClick={() => run(() => supabase.auth.signOut(), "Signed out.")}>
            Sign out
          </button>
        </div>
        <p className="mt-4 text-sm font-medium" role="status">
          {message}
        </p>
      </div>
    );
  }

  return (
    <form className="grid max-w-md gap-5" onSubmit={(e) => e.preventDefault()} data-testid="account-form">
      <label className="grid">
        <span className="field-label">Email</span>
        <input className="field" type="email" required autoComplete="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
      </label>
      <label className="grid">
        <span className="field-label">Password</span>
        <input className="field" type="password" minLength={8} autoComplete="current-password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        <span className="note mt-1">At least 8 characters. Leave empty to receive a one-time sign-in link instead.</span>
      </label>
      <div className="flex flex-wrap gap-2.5">
        <button
          type="button"
          className="btn btn-saffron"
          disabled={busy || !form.email}
          onClick={() =>
            form.password
              ? run(() => supabase.auth.signInWithPassword(form), "Signed in.")
              : run(() => supabase.auth.signInWithOtp({ email: form.email, options: { emailRedirectTo: `${window.location.origin}/account` } }), "Check your email for a sign-in link.")
          }
        >
          {form.password ? "Sign in" : "Email me a sign-in link"}
        </button>
        <button
          type="button"
          className="btn btn-line"
          disabled={busy || !form.email || form.password.length < 8}
          onClick={() => run(() => supabase.auth.signUp({ ...form, options: { emailRedirectTo: `${window.location.origin}/account` } }), "Account created. Check your email to confirm it.")}
        >
          Create account
        </button>
      </div>
      <p className="text-sm font-medium" role="status" aria-live="polite">
        {message}
      </p>
    </form>
  );
}
