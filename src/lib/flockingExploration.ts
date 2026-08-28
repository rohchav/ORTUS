import {
  createDefaultScenario,
  getProductionTemplate,
  patchScenarioInitializationOptions,
  patchScenarioMetadata,
  patchScenarioParameters,
  updateScenarioPreset,
  validateScenario,
  type AuthoredScenario,
  type ParameterValues
} from "../simulation";

export interface FlockingExplorationTarget {
  id: "coordinate" | "noisy" | "fragments" | "opposition";
  label: string;
  summary: string;
  mechanism: string;
  watch: string;
  seed: string;
  watchTick: number;
  initializationPreset: "random-headings" | "aligned-flock" | "two-opposing-flocks";
  initializationOptions: ParameterValues;
  parameters: ParameterValues;
}

const exactBaseParameters: ParameterValues = {
  agentCount: 160,
  perceptionRadius: 30,
  separationRadius: 10,
  alignmentWeight: 0.55,
  cohesionWeight: 0.35,
  separationWeight: 0.9,
  maxSpeed: 2.4,
  maxForce: 0.08,
  noise: 0.01,
  boundaryMode: "wrap"
};

export const flockingExplorationTargets: readonly FlockingExplorationTarget[] = [
  {
    id: "coordinate",
    label: "Coordinate quickly",
    summary: "Start with nearly matching headings and watch a common direction persist.",
    mechanism: "Strong alignment with moderate cohesion",
    watch: "Alignment is already high and remains high through tick 90 in this exact seeded run.",
    seed: "ur0r-aligned",
    watchTick: 90,
    initializationPreset: "aligned-flock",
    initializationOptions: { headingDegrees: 0, headingSpread: 12 },
    parameters: { ...exactBaseParameters, alignmentWeight: 0.8, cohesionWeight: 0.45 }
  },
  {
    id: "noisy",
    label: "Keep motion noisy",
    summary: "Reduce local agreement and add strong seeded steering noise.",
    mechanism: "Weak alignment and cohesion, shorter perception, high noise",
    watch: "Headings remain weakly aligned through tick 180 in this exact seeded run.",
    seed: "ur0r-noisy",
    watchTick: 180,
    initializationPreset: "random-headings",
    initializationOptions: {},
    parameters: {
      ...exactBaseParameters,
      perceptionRadius: 18,
      alignmentWeight: 0.12,
      cohesionWeight: 0.12,
      separationWeight: 1.2,
      noise: 0.32
    }
  },
  {
    id: "fragments",
    label: "Form local fragments",
    summary: "Limit perception so separated neighborhoods organize locally instead of as one flock.",
    mechanism: "Short perception with local cohesion and low noise",
    watch: "Several separated clusters are visible near tick 180 for this exact seed; the runtime has no built-in fragment detector.",
    seed: "ur0r-fragments",
    watchTick: 180,
    initializationPreset: "random-headings",
    initializationOptions: {},
    parameters: {
      ...exactBaseParameters,
      perceptionRadius: 9,
      separationRadius: 4,
      alignmentWeight: 0.45,
      cohesionWeight: 0.7,
      noise: 0.015
    }
  },
  {
    id: "opposition",
    label: "Start in opposition",
    summary: "Begin with two spatial groups moving in opposite directions.",
    mechanism: "Opposing initial headings under the ordinary local steering rules",
    watch: "The initial opposition is temporary in this exact run; the groups trend toward common direction by tick 90.",
    seed: "ur0r-opposing",
    watchTick: 90,
    initializationPreset: "two-opposing-flocks",
    initializationOptions: {},
    parameters: { ...exactBaseParameters, separationWeight: 1.1 }
  }
];

export function getFlockingExplorationTarget(id: FlockingExplorationTarget["id"]): FlockingExplorationTarget {
  const target = flockingExplorationTargets.find((candidate) => candidate.id === id);
  if (!target) {
    throw new Error(`Unknown Flocking exploration target: ${id}`);
  }
  return target;
}

export function createFlockingExplorationScenario(id: FlockingExplorationTarget["id"]): AuthoredScenario {
  const target = getFlockingExplorationTarget(id);
  const template = getProductionTemplate("flocking-boids");
  if (!template) {
    throw new Error("The production Flocking template is unavailable.");
  }

  const now = "2026-08-27T00:00:00.000Z";
  let scenario = createDefaultScenario({
    template,
    scenarioId: `ur0r-flocking-${target.id}-v1`,
    now,
    seed: target.seed,
    name: `Flocking exploration: ${target.label}`
  });
  scenario = updateScenarioPreset(scenario, target.initializationPreset, now);
  scenario = patchScenarioParameters(scenario, target.parameters, now);
  scenario = patchScenarioInitializationOptions(scenario, target.initializationOptions, now);
  scenario = patchScenarioMetadata(
    scenario,
    {
      description: `${target.summary} ${target.watch}`,
      tags: ["flocking", "audited-exploration", target.id]
    },
    now
  );

  return validateScenario({
    ...scenario,
    metadata: {
      ...scenario.metadata,
      productContentId: `flocking-exploration:${target.id}`,
      evidenceScope: "deterministic-formative-audit"
    }
  }).scenario;
}
