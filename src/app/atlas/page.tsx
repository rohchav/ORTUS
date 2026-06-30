import type { Metadata } from "next";
import { FutureDestinationSurface } from "../../components/researchWorld/FutureDestinationSurface";

export const metadata: Metadata = {
  title: "Atlas | ORTUS",
  description: "Future-only Research World destination for investigated model behavior and evidence boundaries."
};

const plannedResponsibilities = [
  "Discovery records",
  "Behavioral landscapes",
  "Regime maps",
  "Evidence states",
  "Uncertainty overlays",
  "Contradicted findings",
  "Unexplored regions",
  "Multiscale views"
] as const;

const principles = [
  "A Discovery Atlas records investigated model behavior, not certified real-world discovery.",
  "Sampled regions must remain distinct from unsampled territory.",
  "Evidence-linked regimes will require provenance and uncertainty boundaries.",
  "Atlas views must not turn model output into empirical truth.",
  "GW2 does not create Discovery Atlas records. Atlas remains future-only."
] as const;

export default function AtlasPage() {
  return (
    <FutureDestinationSurface
      destinationId="atlas"
      implementationCopy="Atlas is a future Research World destination. Discovery records, behavioral landscapes, sampled-region maps, and evidence-linked model regimes are not implemented in GW1 or GW2."
      boundaryCopy="Atlas will map investigated model behavior. It will not certify discoveries about the real world."
      plannedResponsibilities={plannedResponsibilities}
      principles={principles}
    />
  );
}
