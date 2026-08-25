import { Hero } from "@/components/sections/Hero";
import { KineticStatement } from "@/components/sections/KineticStatement";
import { ConfiguratorTeaser } from "@/components/sections/ConfiguratorTeaser";
import { LapTelemetry } from "@/components/sections/LapTelemetry";
import { SilhouetteEvolution } from "@/components/sections/SilhouetteEvolution";
import { AeroFlow } from "@/components/sections/AeroFlow";
import { ParticleAssembly } from "@/components/sections/ParticleAssembly";
import { StudioOutro } from "@/components/sections/StudioOutro";

export default function Home() {
  return (
    <>
      <Hero />
      <KineticStatement />
      <ConfiguratorTeaser />
      <LapTelemetry />
      <AeroFlow />
      <SilhouetteEvolution />
      <ParticleAssembly />
      <StudioOutro />
    </>
  );
}
