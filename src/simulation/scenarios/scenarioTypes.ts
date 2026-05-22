import type { JsonValue, ParameterValues } from "../kernel/types";
import type { AssumptionItem } from "../assumptions/types";

// Authored scenarios are initial-condition and supported-variant recipes. They
// intentionally exclude live tick state, full snapshots, metric history, and
// post-run intervention history.
export interface AuthoredScenario {
  schemaVersion: "1";
  artifactType: "ortus.scenario";
  scenarioId: string;
  name: string;
  description: string;
  tags: string[];
  templateId: string;
  templateVersion: string;
  seed: string;
  parameters: ParameterValues;
  initializationPreset: string;
  initializationOptions: ParameterValues;
  agentComposition: ParameterValues;
  behaviorMode: string;
  environmentOptions: ParameterValues;
  assumptionNotes?: readonly AssumptionItem[];
  limitationNotes?: readonly AssumptionItem[];
  validationNotes?: readonly AssumptionItem[];
  ethicsNotes?: readonly AssumptionItem[];
  metadata: Record<string, JsonValue>;
  createdAt: string;
  updatedAt: string;
}

export interface ScenarioValidationResult {
  scenario: AuthoredScenario;
  warnings: string[];
}

export const maxSavedScenarios = 50;
export const maxScenarioTags = 8;
export const maxScenarioDescriptionLength = 1200;
export const maxScenarioJsonLength = 100_000;
export const scenarioArtifactType = "ortus.scenario";
