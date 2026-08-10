import {
  createDefaultScenario,
  createEngineFromScenario,
  flockingTemplate,
  patchScenarioParameters,
  validateScenario,
  type AuthoredScenario,
  type SimulationEngine
} from "../../simulation";
import { immersiveAgentCounts, type ImmersiveAgentCount } from "./types";

export const immersiveFlockingScenarioId = "i0-immersive-flocking-v1";
export const immersiveFlockingSeed = "i0-immersive-flocking-seed-v1";
export const immersiveFlockingInitializationPreset = "random-headings";
const fixedScenarioTimestamp = "2026-08-10T00:00:00.000Z";

export function createImmersiveFlockingScenario(agentCount: ImmersiveAgentCount): AuthoredScenario {
  if (!immersiveAgentCounts.includes(agentCount)) {
    throw new Error(`Unsupported immersive Flocking agent count: ${agentCount}`);
  }
  const base = createDefaultScenario({
    template: flockingTemplate,
    scenarioId: immersiveFlockingScenarioId,
    seed: immersiveFlockingSeed,
    name: "I0 Immersive Flocking",
    now: fixedScenarioTimestamp
  });
  const patched = patchScenarioParameters(
    base,
    { ...base.parameters, agentCount },
    fixedScenarioTimestamp
  );
  return validateScenario({
    ...patched,
    description: "A fixed-seed random-headings Flocking scenario for isolated I0 presentation prototypes.",
    metadata: {
      milestone: "I0",
      prototypeOnly: true,
      persistence: "none"
    },
    createdAt: fixedScenarioTimestamp,
    updatedAt: fixedScenarioTimestamp
  }).scenario;
}

export function createImmersiveFlockingEngine(agentCount: ImmersiveAgentCount): SimulationEngine {
  return createEngineFromScenario(createImmersiveFlockingScenario(agentCount)).engine;
}
