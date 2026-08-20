import type { Metadata } from "next";
import { Heritage } from "@/components/sections/Heritage";
import { HeritageStats } from "@/components/sections/HeritageStats";
import { HeritageFleet } from "@/components/sections/HeritageFleet";

export const metadata: Metadata = {
  title: "Heritage - APEX // MOTION",
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
