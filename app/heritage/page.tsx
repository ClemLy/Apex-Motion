import type { Metadata } from "next";
import { Heritage } from "@/components/sections/Heritage";
import { HeritageStats } from "@/components/sections/HeritageStats";
import { HeritageFleet } from "@/components/sections/HeritageFleet";

export const metadata: Metadata = {
  title: "Héritage",
  description:
    "Sept décennies d'ingénierie flat-6 Porsche, de la 356 originelle à la 911 GT3 RS moderne, avec fiche technique pour chaque ère.",
};

export default function HeritagePage() {
  return (
    <div className="pt-28">
      <Heritage />
      <HeritageStats />
      <HeritageFleet />
    </div>
  );
}
