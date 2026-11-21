import type { Provenance, SourceRef } from "@/domain/types";

const VERIFICATION_TEXT: Record<Provenance["verification"], string> = {
  verified: "Checked against the sources below",
  projected: "Based on projections that may change",
  reference: "Written from general reference knowledge. The links below are for further reading and were not individually audited.",
};

export function Sources({ provenance, extra = [] }: { provenance: Provenance; extra?: SourceRef[] }) {
  const all = [...provenance.sources, ...extra].filter((s, i, list) => list.findIndex((x) => x.url === s.url) === i);
  return (
    <section aria-labelledby="sources-heading" className="rule border-t pt-6">
      <h2 id="sources-heading" className="font-[family-name:var(--font-sans)] text-base font-semibold tracking-normal">
        Sources and reliability
      </h2>
      <p className="note mt-2 max-w-prose">
        {VERIFICATION_TEXT[provenance.verification]}
        {provenance.lastChecked ? ` Last checked ${provenance.lastChecked}.` : ""}
      </p>
      <ul className="mt-3 grid gap-1.5 text-[0.95rem]">
        {all.map((source) => (
          <li key={source.url}>
            <a className="link link-accent" href={source.url} target="_blank" rel="noopener noreferrer">
              {source.title}
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function SourceLink({ source }: { source: SourceRef }) {
  return (
    <p className="note">
      Further reading:{" "}
      <a className="link link-accent" href={source.url} target="_blank" rel="noopener noreferrer">
        {source.title}
      </a>
      . A pointer for readers, not an audited citation.
    </p>
  );
}
