import type { JsonValue } from "../kernel/types";

export const assumptionProfileArtifactType = "ortus.assumptionProfile";
export const maxAssumptionItemDescriptionLength = 900;
export const maxAssumptionProfileJsonLength = 60_000;
export const maxAssumptionSummaryJsonLength = 180_000;
export const maxScenarioAssumptionNotes = 24;

export type AssumptionOwnerType = "template" | "scenario" | "uncertaintyConfig" | "run" | "result";
export type AssumptionSeverity = "info" | "caution" | "critical";
export type ValidationStatus = "illustrative" | "internallyTested" | "patternValidated" | "calibrated" | "externallyValidated" | "unknown";
export type AssumptionConfidence = "low" | "medium" | "high" | "unknown";

export interface AssumptionItem {
  id: string;
  label: string;
  description: string;
  severity?: AssumptionSeverity;
  category?: string;
  source?: string;
  confidence?: AssumptionConfidence;
}

export interface ModelAssumptionProfile {
  schemaVersion: "1";
  artifactType: typeof assumptionProfileArtifactType;
  id: string;
  ownerType: AssumptionOwnerType;
  ownerId: string;
  assumptions: readonly AssumptionItem[];
  limitations: readonly AssumptionItem[];
  notRepresented: readonly AssumptionItem[];
  appropriateUse: readonly AssumptionItem[];
  inappropriateUse: readonly AssumptionItem[];
  ethicsNotes: readonly AssumptionItem[];
  validationStatus: ValidationStatus;
  validationNotes: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ScenarioAssumptionNotes {
  assumptionNotes?: readonly AssumptionItem[];
  limitationNotes?: readonly AssumptionItem[];
  validationNotes?: readonly AssumptionItem[];
  ethicsNotes?: readonly AssumptionItem[];
}

export interface AssumptionSummary {
  templateProfile: ModelAssumptionProfile;
  scenarioNotes: ScenarioAssumptionNotes;
  uncertaintyNotes: readonly AssumptionItem[];
  provenance: Record<string, JsonValue>;
}
