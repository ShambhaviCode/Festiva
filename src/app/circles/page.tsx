import type { Metadata } from "next";
import { CirclesLanding } from "@/components/circles/Landing";

export const metadata: Metadata = {
  title: "Gift Circle",
  description: "Organise a festival gift exchange with family or friends: preferences in your own language, wishlists, Secret Santa and a shared budget, in one place.",
  alternates: { canonical: "/circles" },
};

export default function CirclesPage() {
  return <CirclesLanding />;
}
