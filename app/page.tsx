import { Hero } from "@/components/sections/Hero";
import { KineticStatement } from "@/components/sections/KineticStatement";
import { ConfiguratorTeaser } from "@/components/sections/ConfiguratorTeaser";
import { Soundbox } from "@/components/sections/Soundbox";
import { Heritage } from "@/components/sections/Heritage";

export default function Home() {
  return (
    <>
      <Hero />
      <KineticStatement />
      <ConfiguratorTeaser />
      <Soundbox />
      <Heritage />
    </>
  );
}
