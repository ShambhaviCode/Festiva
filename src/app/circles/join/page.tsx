"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { GiftCircleGate } from "@/components/circles/Gate";
import { CircleRing, Notice } from "@/components/circles/ui";
import { DEFAULT_LANGUAGE, LANGUAGES } from "@/domain/languages";
import { api, ApiError, rememberCircle, type ClientFlags } from "@/lib/client/circles";

interface InviteInfo {
  name: string;
  occasion: { label: string };
  celebrationDate: string;
  organiser: string;
  organiserLanguage: string;
  spotsLeft: number;
  participants: number;
  multilingual: boolean;
}

function readFragment(): { circleId: string; token: string } | null {
  const params = new URLSearchParams(window.location.hash.slice(1));
  const circleId = params.get("c") ?? "";
  const token = params.get("t") ?? "";
  return /^[0-9a-f-]{36}$/i.test(circleId) && /^[A-Za-z0-9_-]{24,64}$/.test(token) ? { circleId, token } : null;
}

function Join({ flags }: { flags: ClientFlags }) {
  const router = useRouter();
  const [invite, setInvite] = useState<{ circleId: string; token: string } | null>(null);
  const [info, setInfo] = useState<InviteInfo | null>(null);
  const [problem, setProblem] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [language, setLanguage] = useState(DEFAULT_LANGUAGE);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    // Opening a different invitation link in the same tab only changes the fragment: start over.
    const onHash = () => window.location.reload();
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  useEffect(() => {
    // Reads the invitation from the URL fragment, which only exists in the browser.
    const parsed = readFragment();
    if (!parsed) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time read of window.location.hash
      setProblem("This link is incomplete. Ask the organiser to send it again.");
      return;
    }
    setInvite(parsed);
    // Keep the invitation token out of the address bar and browser history.
    window.history.replaceState(null, "", window.location.pathname);
    api<InviteInfo>(`/api/circles/${parsed.circleId}/invite`, { method: "PUT", body: JSON.stringify({ token: parsed.token }) })
      .then(setInfo)
      .catch((err) => setProblem(err instanceof ApiError ? err.message : "This invitation could not be checked."));
  }, []);

  async function join(event: FormEvent) {
    event.preventDefault();
    if (!invite || !name.trim()) return;
    setBusy(true);
    setProblem(null);
    try {
      const result = await api<{ participantId: string; participantKey: string }>(`/api/circles/${invite.circleId}/join`, {
        method: "POST",
        body: JSON.stringify({ token: invite.token, name: name.trim(), language: flags.flags.multilingual_onboarding_enabled ? language : DEFAULT_LANGUAGE }),
      });
      rememberCircle({ circleId: invite.circleId, role: "participant", key: result.participantKey, participantId: result.participantId, name: info?.name ?? "Gift circle", savedAt: new Date().toISOString() });
      router.replace(`/circles/${invite.circleId}/me`);
    } catch (err) {
      setProblem(err instanceof ApiError ? err.message : "You could not be added. Try again.");
      setBusy(false);
    }
  }

  if (problem && !info) {
    return (
      <div data-testid="join-problem">
        <h1 className="display-2">This invitation cannot be used.</h1>
        <p className="lede mt-4 max-w-xl">{problem}</p>
        <Link href="/circles" className="btn btn-line mt-6">
          About Gift Circle
        </Link>
      </div>
    );
  }
  if (!info) return <p className="note min-h-[50vh]">Checking your invitation…</p>;

  return (
    <div className="grid items-start gap-10 lg:grid-cols-[1fr_auto]">
      <div>
        <p className="note">{info.organiser} invited you to</p>
        <h1 className="display-1 mt-2" data-testid="join-circle-name">
          {info.name}
        </h1>
        <p className="lede mt-4">
          {info.occasion.label}, on {new Date(`${info.celebrationDate}T00:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}.
        </p>
        {info.spotsLeft === 0 ? (
          <div className="mt-8">
            <Notice tone="warn">This circle is full. Ask {info.organiser} to make room.</Notice>
          </div>
        ) : (
          <form onSubmit={join} className="mt-8 grid max-w-lg gap-5" data-testid="join-form">
            <div>
              <label htmlFor="j-name" className="field-label">
                Your name, as the circle will see it
              </label>
              <input id="j-name" className="field" maxLength={60} autoComplete="given-name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            {flags.flags.multilingual_onboarding_enabled && (
              <div>
                <label htmlFor="j-lang" className="field-label">
                  The language you would like to use
                </label>
                <select id="j-lang" className="field" value={language} onChange={(e) => setLanguage(e.target.value)}>
                  {LANGUAGES.map((l) => (
                    <option key={l.tag} value={l.tag} lang={l.tag}>
                      {l.nativeName === l.name ? l.name : `${l.nativeName} (${l.name})`}
                      {l.availability === "text-only" ? ", typing only" : ""}
                    </option>
                  ))}
                </select>
              </div>
            )}
            {problem && <Notice tone="warn">{problem}</Notice>}
            <button type="submit" className="btn btn-saffron justify-self-start" disabled={busy || !name.trim()}>
              {busy ? "Joining…" : "Join the circle"}
            </button>
            <p className="note text-[0.85rem]">Joining saves a private key in this browser. Use the same browser to come back.</p>
            <p className="note text-[0.85rem]">Gift Circle is for adults. A parent or guardian can join on a child&rsquo;s behalf. <a className="link" href="/privacy#children">Privacy and children</a></p>
          </form>
        )}
      </div>
      <div aria-hidden="true">
        <CircleRing names={Array.from({ length: info.participants }, (_, i) => (i === 0 ? info.organiser : "•"))} total={info.participants + info.spotsLeft} centre={info.occasion.label} />
      </div>
    </div>
  );
}

export default function JoinPage() {
  return (
    <div className="shell pb-24 pt-12">
      <GiftCircleGate>{(flags) => <Join flags={flags} />}</GiftCircleGate>
    </div>
  );
}
