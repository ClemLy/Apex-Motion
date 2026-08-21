import { notFound } from "next/navigation";
import { CARS } from "@/lib/three/carConfigs";
import { CaptureStage } from "./CaptureStage";

/**
 * Dev-only render harness for scripts/capture-fleet-images.mjs — renders one
 * Studio car (?car=<id>) from a shared orthographic side angle so the script
 * can grab a real, transparent-background PNG of it. One car per page load
 * keeps this to a single live WebGL context at a time. Never meant to be a
 * public route.
 */
export default async function SilhouetteCapturePage({
  searchParams,
}: {
  searchParams: Promise<{ car?: string; paint?: string }>;
}) {
  if (process.env.NODE_ENV !== "development") notFound();

  const { car: carId, paint } = await searchParams;
  const car = CARS.find((c) => c.id === carId);

  if (!car) {
    return (
      <ul>
        {CARS.map((c) => (
          <li key={c.id}>
            <a href={`/silhouette-capture?car=${c.id}`}>{c.name}</a>
          </li>
        ))}
      </ul>
    );
  }

  return <CaptureStage car={car} paintId={paint} />;
}
