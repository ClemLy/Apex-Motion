import dynamic from "next/dynamic";
import { Hero } from "@/components/sections/Hero";
import { KineticStatement } from "@/components/sections/KineticStatement";
import { ConfiguratorTeaser } from "@/components/sections/ConfiguratorTeaser";
import { LapTelemetry } from "@/components/sections/LapTelemetry";

// Below-fold sections with significant JS weight are split into their own
// chunks so the hero and first fold parse/evaluate without waiting for them.
// Server-side HTML is still generated (no ssr:false), so there is no CLS —
// only the client-side JS bundle is deferred.
const AeroFlow = dynamic(() =>
  import("@/components/sections/AeroFlow").then((m) => ({
    default: m.AeroFlow,
  })),
);
const SilhouetteEvolution = dynamic(() =>
  import("@/components/sections/SilhouetteEvolution").then((m) => ({
    default: m.SilhouetteEvolution,
  })),
);
const ParticleAssembly = dynamic(() =>
  import("@/components/sections/ParticleAssembly").then((m) => ({
    default: m.ParticleAssembly,
  })),
);
const StudioOutro = dynamic(() =>
  import("@/components/sections/StudioOutro").then((m) => ({
    default: m.StudioOutro,
  })),
);

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
