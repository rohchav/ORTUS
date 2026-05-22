import type { ExternalModelAdapter } from "./AdapterTypes";

export const mesaAdapterContract: ExternalModelAdapter = {
  id: "mesa-contract",
  name: "Mesa Adapter Contract",
  sourcePlatform: "mesa",
  canImport: false,
  canExport: false,
  canRun: false
};

export const mesaAdapterFuturePurpose = [
  "Export canonical simulation schema into a Python Mesa scaffold.",
  "Optionally run server-side Mesa simulations in a future integration.",
  "No Mesa runtime or bridge is implemented in V1."
] as const;
