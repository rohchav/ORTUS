import type { ExternalModelAdapter } from "./AdapterTypes";

export const netLogoAdapterContract: ExternalModelAdapter = {
  id: "netlogo-contract",
  name: "NetLogo Adapter Contract",
  sourcePlatform: "netlogo",
  canImport: false,
  canExport: false,
  canRun: false
};

export const netLogoAdapterFuturePurpose = [
  "Map turtles, patches, links, and observer concepts into the canonical schema.",
  "Optionally run NetLogo through a bridge in a future integration.",
  "No NetLogo runtime or bridge is implemented in V1."
] as const;
