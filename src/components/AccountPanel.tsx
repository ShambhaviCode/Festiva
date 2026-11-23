"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabaseConfigured } from "@/lib/env";
import { syncPlansFromCloud } from "@/lib/plans";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabase } from "@/lib/supabase/client";
import { toast } from "@/lib/toast";

type Busy = "in" | "up" | "out" | "sync" | null;
type Msg = { tone: "success" | "error"; text: string } | null;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
  const [message, setMessage] = useState<Msg>(null);
  const [busy, setBusy] = useState<Busy>(null);
  const [touched, setTouched] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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

  if (!ready || !supabase) {
    return (
      <p className="note flex items-center gap-2" role="status">
        <span aria-hidden="true" className="h-4 w-4 animate-spin rounded-full border-2 border-plum border-r-transparent" />
        Checking your session…
      </p>
    );
  }

  /** One Supabase call: the button shows it is working, errors and successes look different, and a failure never leaves the form stuck. */
  const run = async (which: Busy, action: () => Promise<{ error: { message: string } | null }>, success: string) => {
    setBusy(which);
    setMessage(null);
    try {
      const { error } = await action();
      if (error) setMessage({ tone: "error", text: friendly(error.message) });
      else {
        setMessage({ tone: "success", text: success });
        toast(success);
      }
    } catch {
      setMessage({ tone: "error", text: "We could not reach the sign-in service. Check your connection and try again." });
    } finally {
      setBusy(null);
    }
  };

  if (email) {
    return (
      <div className="max-w-xl" data-testid="account-signed-in">
        <h2 className="display-3">Signed in</h2>
        <p className="mt-2 text-ink">{email}</p>
        <div className="mt-6 flex flex-wrap gap-2.5">
          <button
            type="button"
            className="btn btn-plum"
            disabled={busy !== null}
            aria-busy={busy === "sync"}
            onClick={async () => {
              setBusy("sync");
              setMessage(null);
              try {
                const n = await syncPlansFromCloud();
                const text = n === 1 ? "Synced 1 plan from your account." : `Synced ${n} plans from your account.`;
                setMessage({ tone: "success", text });
                toast(text, { action: { label: "My plans", href: "/plans" } });
              } catch {
                setMessage({ tone: "error", text: "Your plans could not be synced. Check your connection and try again." });
              } finally {
                setBusy(null);
              }
            }}
          >
            {busy === "sync" ? "Syncing…" : "Sync my plans"}
          </button>
          <button type="button" className="btn btn-line" disabled={busy !== null} aria-busy={busy === "out"} onClick={() => run("out", () => supabase.auth.signOut(), "Signed out.")}>
            {busy === "out" ? "Signing out…" : "Sign out"}
          </button>
        </div>
        <Message message={message} />
      </div>
    );
  }

  const emailOk = EMAIL.test(form.email.trim());
  const emailInvalid = touched && !emailOk;
  const passwordShort = form.password.length > 0 && form.password.length < 8;
  const failed = message?.tone === "error";
  const left = 8 - form.password.length;

  const signIn = () =>
    form.password
      ? run("in", () => supabase.auth.signInWithPassword({ email: form.email.trim(), password: form.password }), "Signed in.")
      : run("in", () => supabase.auth.signInWithOtp({ email: form.email.trim(), options: { emailRedirectTo: `${window.location.origin}/account` } }), "Check your email for a sign-in link.");

  return (
    <form
      className="grid max-w-md gap-5"
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        setTouched(true);
        if (!emailOk || passwordShort || busy) return;
        void signIn();
      }}
      data-testid="account-form"
    >
      <div className="grid">
        <label htmlFor="account-email" className="field-label">
          Email
        </label>
        <input
          id="account-email"
          className="field"
          type="email"
          inputMode="email"
          required
          autoComplete="email"
          value={form.email}
          aria-invalid={emailInvalid || failed}
          aria-describedby={emailInvalid ? "account-email-error" : undefined}
          onBlur={() => form.email && setTouched(true)}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        {emailInvalid && (
          <p id="account-email-error" className="mt-1.5 text-sm font-medium text-vermilion">
            Enter an email address like name@example.com.
          </p>
        )}
      </div>
      <div className="grid">
        <label htmlFor="account-password" className="field-label">
          Password <span className="font-normal text-ink">(optional)</span>
        </label>
        <div className="relative">
          <input
            id="account-password"
            className="field pr-20"
            type={showPassword ? "text" : "password"}
            minLength={8}
            autoComplete="current-password"
            value={form.password}
            aria-invalid={passwordShort || failed}
            aria-describedby="account-password-hint"
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          <button
            type="button"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-full px-3 py-1.5 text-sm font-semibold text-plum hover:bg-plum/10"
            aria-pressed={showPassword}
            aria-label={showPassword ? "Hide password" : "Show password"}
            onClick={() => setShowPassword((v) => !v)}
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>
        <span id="account-password-hint" className={`mt-1.5 text-sm ${passwordShort ? "font-medium text-vermilion" : "note"}`}>
          {passwordShort ? `${left} more character${left === 1 ? "" : "s"} needed.` : "At least 8 characters. Leave it empty and we email you a one-time sign-in link instead."}
        </span>
      </div>
      <div className="flex flex-wrap gap-2.5">
        <button type="submit" className="btn btn-saffron" disabled={busy !== null || !form.email} aria-busy={busy === "in"}>
          {busy === "in" ? (form.password ? "Signing in…" : "Sending…") : form.password ? "Sign in" : "Email me a sign-in link"}
        </button>
        <button
          type="button"
          className="btn btn-line"
          disabled={busy !== null || !emailOk || form.password.length < 8}
          aria-busy={busy === "up"}
          onClick={() => run("up", () => supabase.auth.signUp({ email: form.email.trim(), password: form.password, options: { emailRedirectTo: `${window.location.origin}/account` } }), "Account created. Check your email to confirm it.")}
        >
          {busy === "up" ? "Creating…" : "Create account"}
        </button>
      </div>
      <Message message={message} />
    </form>
  );
}

/** Supabase's messages are accurate but terse; say what to do next for the common ones. */
function friendly(text: string): string {
  if (/invalid login credentials/i.test(text)) return "That email and password do not match. Try again, or leave the password empty to get a sign-in link.";
  if (/email not confirmed/i.test(text)) return "Confirm your email first: open the link we sent you, then sign in.";
  if (/already registered/i.test(text)) return "There is already an account with this email. Sign in instead.";
  if (/rate limit/i.test(text)) return "Too many attempts. Wait a minute and try again.";
  return text;
}

function Message({ message }: { message: Msg }) {
  return (
    <p role={message?.tone === "error" ? "alert" : "status"} aria-live="polite" className={`min-h-5 text-sm font-medium ${message?.tone === "error" ? "text-vermilion" : "text-emerald-deep"}`}>
      {message?.text}
    </p>
  );
}
