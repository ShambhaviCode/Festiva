import Link from "next/link";
import { ViewTransition, type ReactNode } from "react";
import { photoFor } from "@/data/photos";
import { ArtImage, frameClass, type Art } from "./art/Art";

export function PageIntro({
  title,
  lede,
  children,
}: {
  title: string;
  lede: string;
  children?: ReactNode;
}) {
  return (
    <section className="shell pb-10 pt-14 lg:pt-20">
      <h1 className="display-1 max-w-4xl">{title}</h1>
      <p className="lede mt-5 max-w-2xl text-ink">{lede}</p>
      {children}
    </section>
  );
}

interface DetailHeroProps {
  back: { href: string; label: string };
  title: string;
  subtitle?: string;
  summary: string;
  seed: string;
  palette: readonly [string, string, string];
  meta?: ReactNode;
  actions?: ReactNode;
  art?: Art;
  /** Same name as the catalogue card, so the artwork carries over between pages. */
  transitionName?: string;
}

export function DetailHero({
  back,
  title,
  subtitle,
  summary,
  seed,
  palette,
  meta,
  actions,
  art = { kind: "rosette" },
  transitionName,
}: DetailHeroProps) {
  return (
    <section className="shell grid gap-10 pb-12 pt-10 lg:grid-cols-[1.25fr_0.75fr] lg:gap-16 lg:pt-14">
      <div>
        <nav aria-label="Breadcrumb">
          <Link href={back.href} className="link note">
            Back to {back.label}
          </Link>
        </nav>
        <h1 className="display-1 mt-5">{title}</h1>
        {subtitle && (
          <p className="mt-3 font-[family-name:var(--font-display)] text-2xl italic text-ink">
            {subtitle}
          </p>
        )}
        <p className="lede mt-6 max-w-2xl">{summary}</p>
        {meta && <div className="mt-6">{meta}</div>}
        {actions && (
          <div className="no-print mt-8 flex flex-wrap gap-3">{actions}</div>
        )}
      </div>
      <ViewTransition name={transitionName ?? `art-${seed}`}>
        <div
          className={`${frameClass(art.kind)} mx-auto w-full ${art.kind === "plate" ? "max-w-xs lg:max-w-md" : "max-w-sm lg:max-w-none"} self-start`}
        >
          <ArtImage
            art={art}
            seed={seed}
            palette={palette}
            className="h-full w-full"
            sizes="(max-width: 1024px) 90vw, 30vw"
          />
        </div>
      </ViewTransition>
      <PhotoCredit kind={art.kind} seed={seed} />
    </section>
  );
}

/** Credit line for a freely licensed photograph, as its licence requires. */
function PhotoCredit({ kind, seed }: { kind: Art["kind"]; seed: string }) {
  const photo = photoFor(kind, seed);
  if (!photo) return null;
  return (
    <p className="note -mt-6 text-xs lg:col-start-2">
      Photo:{" "}
      <a href={photo.source} className="link" rel="noopener noreferrer" target="_blank">
        {photo.artist}
      </a>
      ,{" "}
      {photo.licenseUrl ? (
        <a href={photo.licenseUrl} className="link" rel="noopener noreferrer license" target="_blank">
          {photo.license}
        </a>
      ) : (
        photo.license
      )}
      , via Wikimedia Commons
    </p>
  );
}

export function Block({
  title,
  children,
  id,
}: {
  title: string;
  children: ReactNode;
  id?: string;
}) {
  return (
    <section className="rule border-t py-8" aria-labelledby={id}>
      <div className="grid gap-4 lg:grid-cols-[0.42fr_1fr] lg:gap-12">
        <h2 id={id} className="display-3">
          {title}
        </h2>
        <div className="prose-festiva">{children}</div>
      </div>
    </section>
  );
}

type RowArt = {
  art: Art;
  seed: string;
  palette: readonly [string, string, string];
};

/** Thumbnail frames are a fixed size per kind, so rows line up and nothing shifts while art draws. */
const THUMB: Record<Art["kind"], string> = {
  rosette: "arch h-[4.4rem] w-14",
  plate: "size-14 overflow-hidden rounded-full",
  textile: "h-[4.4rem] w-14 overflow-hidden rounded-[0.3rem]",
  locator: "h-12 w-16 overflow-hidden rounded-lg",
  brand: "h-12 w-16 overflow-hidden rounded-lg",
};

export function LinkRows({
  items,
}: {
  items: { href: string; title: string; text?: string; thumb?: RowArt }[];
}) {
  if (items.length === 0)
    return <p className="note">Nothing in the guide yet.</p>;
  return (
    <ul>
      {items.map((item) => (
        <li
          key={item.href + item.title}
          className="rule border-t first:border-t-0"
        >
          <Link
            href={item.href}
            className={`group py-3 ${item.thumb ? "grid grid-cols-[4rem_1fr] items-center gap-4" : "block"}`}
          >
            {item.thumb && (
              <span
                className={`block justify-self-center ${THUMB[item.thumb.art.kind]}`}
              >
                <ArtImage
                  art={item.thumb.art}
                  seed={item.thumb.seed}
                  palette={item.thumb.palette}
                  sizes="64px"
                />
              </span>
            )}
            <span className="min-w-0">
              <span className="font-semibold group-hover:underline group-hover:decoration-gold group-hover:underline-offset-4">
                {item.title}
              </span>
              {item.text && (
                <span className="note mt-0.5 block">{item.text}</span>
              )}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
