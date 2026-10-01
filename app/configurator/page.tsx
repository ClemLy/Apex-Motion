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
    <section className="relative flex min-h-[100svh] flex-col pt-[4.5rem] sm:pt-24 lg:flex-row lg:pt-28 short:flex-row short:pt-0">
      <StudioHeading />
      {/* On phones the car stays pinned at the top while the options scroll
          underneath it, so every swatch tap is visible as it happens. A
          sideways phone gets the desktop's side-by-side split instead,
          with the stage pinned to the full (short) viewport height. */}
      <div className="sticky top-0 z-10 h-[48svh] w-full sm:h-[55svh] lg:relative lg:z-auto lg:h-[calc(100svh-7rem)] lg:flex-1 short:h-[100svh] short:flex-1 short:self-start">
        <ConfiguratorStage />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-[#020202] to-transparent lg:hidden short:hidden"
        />
      </div>
      <div className="flex w-full flex-col items-center justify-center gap-6 px-4 pb-[max(2.5rem,env(safe-area-inset-bottom))] pt-6 sm:px-6 sm:py-10 lg:h-[calc(100svh-7rem)] lg:w-[420px] lg:px-8 short:w-[min(380px,48vw)] short:shrink-0 short:justify-start short:px-4 short:pb-6 short:pt-16">
        <ConfiguratorPanel />
      </div>
      <VisualizerCanvas />
    </section>
  );
}
