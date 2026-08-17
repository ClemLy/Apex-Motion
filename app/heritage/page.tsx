import type { Metadata } from "next";
import { Heritage } from "@/components/sections/Heritage";

export const metadata: Metadata = {
  title: "Heritage - APEX // MOTION",
};

export default function HeritagePage() {
  return (
    <div className="pt-28">
      <Heritage />
    </div>
  );
}
