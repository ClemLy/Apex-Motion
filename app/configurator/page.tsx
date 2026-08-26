import type { Metadata } from "next";
import { ConfiguratorStage } from "@/components/three/ConfiguratorStage";
import { VisualizerCanvas } from "@/components/three/VisualizerCanvas";
import { ConfiguratorPanel } from "@/components/configurator/ConfiguratorPanel";
import { StudioHeading } from "@/components/configurator/StudioHeading";

export const metadata: Metadata = {
  title: "Studio",
  description:
    "Personnalisez une Porsche 911 GT3 RS en temps réel : peinture, jantes, étriers et aileron, sur un modèle 3D réel avec export HD.",
};

export default function ConfiguratorPage() {
  return (
    <section className="relative flex min-h-[100svh] flex-col pt-28 lg:flex-row">
      <StudioHeading />
      <div className="relative h-[55vh] w-full lg:h-[calc(100svh-7rem)] lg:flex-1">
        <ConfiguratorStage />
      </div>
      <div className="flex w-full flex-col items-center justify-center gap-6 px-6 py-10 lg:h-[calc(100svh-7rem)] lg:w-[420px] lg:px-8">
        <ConfiguratorPanel />
      </div>
      <VisualizerCanvas />
    </section>
  );
}
