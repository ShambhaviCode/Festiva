"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import type { IntelligenceReply } from "@/lib/intelligence-service";
import { ListenButton } from "@/components/ListenButton";

type Message = { role: "user"; text: string } | { role: "assistant"; reply: IntelligenceReply & { voice?: boolean } } | { role: "error"; text: string };

const STARTERS = ["When is Diwali?", "What do people eat at Hanukkah?", "What should I wear to Onam?", "Where can I experience Día de Muertos?", "Tell me about Nowruz traditions", "Gift ideas for Eid al-Fitr"];

const MODE_LABEL: Record<IntelligenceReply["mode"], string> = {
  offline: "From FESTIVA's guide",
  ai: "Written by AI from FESTIVA's guide",
  "ai-general": "AI general knowledge, not verified by FESTIVA",
  fallback: "From FESTIVA's guide",
};

export function Chat({ aiEnabled }: { aiEnabled: boolean }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  const ask = async (question: string) => {
    const text = question.trim();
    if (!text || busy) return;
    const context = messages.flatMap((m) => (m.role === "user" ? [m.text] : [])).slice(-2);
    setMessages((m) => [...m, { role: "user", text }]);
    setDraft("");
    setBusy(true);
    try {
      const response = await fetch("/api/intelligence", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ question: text.slice(0, 500), context }) });
      const data = (await response.json()) as IntelligenceReply & { error?: string };
      setMessages((m) => [...m, response.ok ? { role: "assistant", reply: data } : { role: "error", text: data.error ?? "Something went wrong. Try again." }]);
    } catch {
      setMessages((m) => [...m, { role: "error", text: "FESTIVA could not be reached. Check your connection and try again." }]);
    } finally {
      setBusy(false);
      requestAnimationFrame(() => endRef.current?.scrollIntoView({ block: "nearest" }));
    }
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_18rem] lg:gap-14">
      <div>
        <p className="rounded-2xl bg-cream p-4 text-[0.95rem]" data-testid="chat-mode">
          {aiEnabled
            ? "An AI model writes the answers from FESTIVA's curated guide. Each reply shows the entries it drew on. If the guide has nothing, the reply is marked as unverified general knowledge."
            : "No AI model is connected to this deployment. Answers are assembled directly from FESTIVA's curated guide, so they are limited to what the guide holds, and FESTIVA says so when it has nothing."}
        </p>

        <div className="mt-6 grid gap-6" aria-live="polite" aria-label="Conversation" data-testid="chat-log">
          {messages.length === 0 && <p className="text-ink">Ask about a festival, its food, dress, music, places or gifts, or how to plan a celebration.</p>}
          {messages.map((message, index) =>
            message.role === "user" ? (
              <p key={index} className="ml-auto max-w-[85%] rounded-2xl rounded-br-sm bg-plum px-4 py-3 text-ivory">
                <span className="sr-only-focusable">You asked: </span>
                {message.text}
              </p>
            ) : message.role === "error" ? (
              <p key={index} className="max-w-[90%] rounded-2xl border border-vermilion/50 px-4 py-3 text-vermilion" role="alert">
                {message.text}
              </p>
            ) : (
              <article key={index} className="max-w-[92%]" data-testid="chat-answer" data-mode={message.reply.mode}>
                <p className="text-sm font-semibold text-saffron-deep">{MODE_LABEL[message.reply.mode]}</p>
                <p className="mt-1.5">{message.reply.answer}</p>
                {message.reply.voice && <ListenButton text={message.reply.answer} language="en-IN" label="Listen to the answer" className="mt-3" />}
                {message.reply.notice && <p className="note mt-2">{message.reply.notice}</p>}
                {message.reply.facts.length > 0 && (
                  <>
                    <p className="mt-4 text-sm font-semibold">Facts from the guide</p>
                    <ul className="mt-1.5 grid gap-2">
                      {message.reply.facts.map((fact) => (
                        <li key={fact.text} className="rule border-l-2 pl-3">
                          {fact.text}{" "}
                          {fact.href && (
                            <Link href={fact.href} className="link link-accent text-sm">
                              Open
                            </Link>
                          )}
                        </li>
                      ))}
                    </ul>
                  </>
                )}
                {message.reply.suggestions.length > 0 && (
                  <>
                    <p className="mt-4 text-sm font-semibold">Suggestions</p>
                    <ul className="mt-1.5 flex flex-wrap gap-2">
                      {message.reply.suggestions.map((s) => (
                        <li key={s.href + s.label}>
                          <Link href={s.href} className="chip">
                            {s.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
                {message.reply.sources.length > 0 && (
                  <p className="note mt-4">
                    Further reading:{" "}
                    {message.reply.sources.map((source, i) => (
                      <span key={source.url}>
                        {i > 0 && "; "}
                        <a className="link" href={source.url} target="_blank" rel="noopener noreferrer">
                          {source.title}
                        </a>
                      </span>
                    ))}
                  </p>
                )}
              </article>
            ),
          )}
          {busy && (
            <p className="note flex items-center gap-2.5" role="status">
              <span aria-hidden="true" className="typing-dots"><span /><span /><span /></span>
              Looking that up…
            </p>
          )}
          <div ref={endRef} />
        </div>

        <form
          className="mt-8 flex flex-wrap items-end gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            void ask(draft);
          }}
        >
          <label className="grid min-w-0 flex-1">
            <span className="field-label">Your question</span>
            <input className="field" value={draft} onChange={(e) => setDraft(e.target.value)} maxLength={500} placeholder="For example: when is the Mid-Autumn Festival?" data-testid="chat-input" autoComplete="off" />
          </label>
          <button type="submit" className="btn btn-saffron" disabled={busy || draft.trim().length < 2} data-testid="chat-send">
            Ask
          </button>
        </form>
        <p className="note mt-2">Do not include personal details. Questions are used to answer you and are not stored by FESTIVA.</p>
      </div>

      <aside aria-label="Questions to try">
        <h2 className="font-[family-name:var(--font-sans)] text-base font-semibold tracking-normal">Questions to try</h2>
        <ul className="mt-3 grid gap-2">
          {STARTERS.map((q) => (
            <li key={q}>
              <button type="button" className="link text-left" onClick={() => void ask(q)} disabled={busy}>
                {q}
              </button>
            </li>
          ))}
        </ul>
      </aside>
    </div>
  );
}
