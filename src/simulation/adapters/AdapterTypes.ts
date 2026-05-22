import type { JsonValue, ScenarioExport, SnapshotExport } from "../kernel/types";

export interface ExternalModelAdapter {
  id: string;
  name: string;
  sourcePlatform: "mesa" | "netlogo" | "mason" | string;
  canImport: boolean;
  canExport: boolean;
  canRun: boolean;
  importModel?: (input: unknown) => Promise<ScenarioExport>;
  exportModel?: (snapshot: SnapshotExport) => Promise<JsonValue>;
  runExternal?: (scenario: ScenarioExport, steps: number) => Promise<SnapshotExport>;
}
