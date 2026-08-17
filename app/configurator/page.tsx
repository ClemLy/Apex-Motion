import type { Metadata } from "next";
import { ConfiguratorCanvas } from "@/components/three/ConfiguratorCanvas";
import { ConfiguratorPanel } from "@/components/configurator/ConfiguratorPanel";

export const metadata: Metadata = {
  title: "Studio - APEX // MOTION",
};

export default function ConfiguratorPage() {
  return (
    <section className="relative flex min-h-[100svh] flex-col pt-28 lg:flex-row">
      <div className="relative h-[55vh] w-full lg:h-[calc(100svh-7rem)] lg:flex-1">
        <ConfiguratorCanvas />
      </div>
      <div className="flex w-full flex-col items-center justify-center gap-6 px-6 py-10 lg:h-[calc(100svh-7rem)] lg:w-[420px] lg:px-8">
        <ConfiguratorPanel />
      </div>
    </section>
  );
}
