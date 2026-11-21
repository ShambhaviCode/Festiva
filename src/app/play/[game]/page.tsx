import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { GameHost } from "@/components/play/GameHost";
import { GAMES } from "@/components/play/games";
import { festivals } from "@/data/festivals";

type Props = { params: Promise<{ game: string }> };

export function generateStaticParams() {
  return GAMES.map((g) => ({ game: g.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { game } = await params;
  const meta = GAMES.find((g) => g.slug === game);
  if (!meta) return { title: "Game not found" };
  return { title: meta.title, description: meta.blurb, alternates: { canonical: `/play/${meta.slug}` } };
}

const memoryFestivals = festivals.map((f) => ({ slug: f.slug, name: f.name, palette: f.palette }));

export default async function GamePage({ params }: Props) {
  const { game } = await params;
  const meta = GAMES.find((g) => g.slug === game);
  if (!meta) notFound();
  return (
    <div className="shell pb-24 pt-10 lg:pt-14">
      <nav aria-label="Breadcrumb">
        <Link href="/play" className="link note">
          Back to Play
        </Link>
      </nav>
      <h1 className="display-1 mt-5">{meta.title}</h1>
      <p className="lede mb-10 mt-4 max-w-2xl text-ink">{meta.blurb}</p>
      <div className="min-h-[80vh]">
        <GameHost game={meta.slug} festivals={memoryFestivals} />
      </div>
    </div>
  );
}
