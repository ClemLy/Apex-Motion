import type { Metadata } from "next";
import { CommunityGarage } from "@/components/sections/CommunityGarage";

export const metadata: Metadata = {
  title: "Garage - APEX // MOTION",
};

export default function GaragePage() {
  return (
    <div className="pt-28">
      <CommunityGarage />
    </div>
  );
}
