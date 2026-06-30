import type { Metadata } from "next";
import { FutureDestinationSurface } from "../../components/researchWorld/FutureDestinationSurface";

export const metadata: Metadata = {
  title: "Lab | ORTUS",
  description: "Future-only Research World destination for experiments, evidence, and reusable research assets."
};

const plannedResponsibilities = [
  "Experiments",
  "Run references",
  "Comparison sets",
  "Notebook entries",
  "Reusable networks",
  "Uncertainty ensembles",
  "Intervention configurations",
  "Evidence chains",
  "Unresolved questions"
] as const;

const principles = [
  "Persistent research records must preserve provenance and model boundaries.",
  "Reusable assets will not become universally compatible by being saved.",
  "Lab artifacts must not imply calibrated, validated, or empirical truth.",
  "GW1 adds no storage, accounts, notebooks, or cross-session research state.",
  "GW2 exposes live run provenance in World. Persistent Lab records are still not implemented."
] as const;

export default function LabPage() {
  return (
    <FutureDestinationSurface
      destinationId="lab"
      implementationCopy="Lab is a future Research World destination. Persistent experiments, notebooks, comparison sets, and reusable research assets are not implemented in GW1 or GW2."
      boundaryCopy="The Lab route documents destination responsibility. It does not simulate persistence."
      plannedResponsibilities={plannedResponsibilities}
      principles={principles}
    />
  );
}
