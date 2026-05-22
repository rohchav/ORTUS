import type { ExternalModelAdapter } from "./AdapterTypes";

export const masonAdapterContract: ExternalModelAdapter = {
  id: "mason-contract",
  name: "MASON Adapter Contract",
  sourcePlatform: "mason",
  canImport: false,
  canExport: false,
  canRun: false
};

export const masonAdapterFuturePurpose = [
  "Map or export Java/MASON-style simulation project schemas in a future integration.",
  "No MASON runtime or bridge is implemented in V1."
] as const;
