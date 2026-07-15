import type { AuthoredScenario } from "../scenarios/scenarioTypes";
import { validateScenario } from "../scenarios/scenarioValidation";
import { getProductionTemplate } from "../templates/registry";
import {
  ephemeralLandscapePreviewCapabilityVersion,
  type EphemeralLandscapePreviewCapability,
  type PreviewMetricCapability,
  type PreviewParameterCapability
} from "./types";

const flockingPreviewScenarioSource: AuthoredScenario = {
  schemaVersion: "1",
  artifactType: "ortus.scenario",
  scenarioId: "atlas-preview-flocking-random-headings-v1",
  name: "Bounded random-headings flock",
  description: "A compact classic-boids scenario bundled only for the bounded Atlas ephemeral preview.",
  tags: ["atlas-preview", "ephemeral", "flocking"],
  templateId: "flocking-boids",
  templateVersion: "1.0.0",
  seed: "101",
  parameters: {
    agentCount: 60,
    perceptionRadius: 30,
    separationRadius: 10,
    alignmentWeight: 0.55,
    cohesionWeight: 0.35,
    separationWeight: 0.9,
    maxSpeed: 2.4,
    maxForce: 0.08,
    noise: 0.01,
    boundaryMode: "wrap"
  },
  initializationPreset: "random-headings",
  initializationOptions: {},
  agentComposition: {
    agentCount: 60,
    groupCount: 2,
    primaryGroupRatio: 0.5
  },
  behaviorMode: "default",
  environmentOptions: { boundaryMode: "wrap" },
  limitationNotes: [
    {
      id: "atlas-preview-limitation",
      label: "Model-only preview",
      description: "This scenario is a stylized deterministic runtime recipe, not a calibrated animal-movement model.",
      category: "limitation",
      severity: "caution",
      source: "template"
    }
  ],
  metadata: {
    origin: "bundled-atlas-preview",
    scope: "ephemeral-preview-v1"
  },
  createdAt: "2026-07-15T00:00:00.000Z",
  updatedAt: "2026-07-15T00:00:00.000Z"
};

const previewParameters = [
  {
    id: "agentCount",
    label: "Agent count",
    type: "integer",
    minimum: 20,
    maximum: 100,
    step: 1,
    suggestedMinimum: 40,
    suggestedMaximum: 80,
    suggestedPointCount: 3,
    description: "Number of boids initialized for each isolated sample run."
  },
  {
    id: "alignmentWeight",
    label: "Alignment weight",
    type: "number",
    minimum: 0,
    maximum: 1.2,
    step: 0.01,
    suggestedMinimum: 0.2,
    suggestedMaximum: 0.8,
    suggestedPointCount: 4,
    description: "Steering strength toward nearby average heading."
  },
  {
    id: "cohesionWeight",
    label: "Cohesion weight",
    type: "number",
    minimum: 0,
    maximum: 1,
    step: 0.01,
    suggestedMinimum: 0.1,
    suggestedMaximum: 0.7,
    suggestedPointCount: 4,
    description: "Steering strength toward nearby group center."
  },
  {
    id: "separationWeight",
    label: "Separation weight",
    type: "number",
    minimum: 0.2,
    maximum: 2,
    step: 0.01,
    suggestedMinimum: 0.5,
    suggestedMaximum: 1.3,
    suggestedPointCount: 4,
    description: "Steering strength away from crowded neighbors."
  },
  {
    id: "noise",
    label: "Steering noise",
    type: "number",
    minimum: 0,
    maximum: 0.1,
    step: 0.01,
    suggestedMinimum: 0,
    suggestedMaximum: 0.06,
    suggestedPointCount: 4,
    description: "Bounded deterministic RNG-driven steering noise."
  }
] as const satisfies readonly PreviewParameterCapability[];

const previewMetrics = [
  {
    id: "alignmentScore",
    label: "Alignment score",
    description: "Magnitude of the mean normalized heading vector.",
    precision: 3
  },
  {
    id: "dispersion",
    label: "Dispersion",
    description: "Mean distance from the flock center of mass.",
    unit: "world units",
    precision: 3
  },
  {
    id: "averageSpeed",
    label: "Average speed",
    description: "Mean boid velocity magnitude.",
    unit: "units/tick",
    precision: 3
  }
] as const satisfies readonly PreviewMetricCapability[];

export const ephemeralLandscapePreviewCapabilities = [
  {
    capabilityVersion: ephemeralLandscapePreviewCapabilityVersion,
    templateId: "flocking-boids",
    templateName: "Flocking / Boids",
    templateVersion: "1.0.0",
    scenario: {
      id: flockingPreviewScenarioSource.scenarioId,
      name: flockingPreviewScenarioSource.name,
      description: flockingPreviewScenarioSource.description
    },
    parameters: previewParameters,
    metrics: previewMetrics,
    fixedMetadata: {
      observation: "finalTick",
      execution: "sequential-isolated",
      storage: "component-memory-only"
    }
  }
] as const satisfies readonly EphemeralLandscapePreviewCapability[];

export function getEphemeralLandscapePreviewCapability(templateId: string): EphemeralLandscapePreviewCapability | undefined {
  return ephemeralLandscapePreviewCapabilities.find((capability) => capability.templateId === templateId);
}

export function getEphemeralLandscapePreviewScenario(templateId: string, scenarioId: string): AuthoredScenario | undefined {
  const capability = getEphemeralLandscapePreviewCapability(templateId);
  if (!capability || capability.scenario.id !== scenarioId) {
    return undefined;
  }
  const template = getProductionTemplate(templateId);
  if (!template) {
    return undefined;
  }
  return validateScenario(flockingPreviewScenarioSource, template).scenario;
}

export function getEphemeralLandscapePreviewParameter(
  capability: EphemeralLandscapePreviewCapability,
  parameterId: string
): PreviewParameterCapability | undefined {
  return capability.parameters.find((parameter) => parameter.id === parameterId);
}

export function getEphemeralLandscapePreviewMetric(
  capability: EphemeralLandscapePreviewCapability,
  metricId: string
): PreviewMetricCapability | undefined {
  return capability.metrics.find((metric) => metric.id === metricId);
}
