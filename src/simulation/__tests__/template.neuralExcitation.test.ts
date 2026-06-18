import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { renderNetworkEdges, renderNeuralDecisionReadout } from "../../lib/templateVisuals";
import { executeIntervention } from "../interventions/interventionExecutor";
import { getInterventionDefinitions } from "../interventions/interventionRegistry";
import { getTemplateCapability } from "../registry";
import { SimulationEngine } from "../kernel/SimulationEngine";
import {
  NeuralNeuronStateComponent,
  neuralDecisionReadoutGlobalKey,
  neuralExcitationBoundaryPhrases,
  neuralExcitationScaleGlobalKey,
  neuralExcitationTemplate,
  neuralExternalStimulusGlobalKey,
  neuralInhibitionScaleGlobalKey,
  neuralRpsReadoutGlobalKey,
  neuralSignalQueueGlobalKey,
  neuralSynapsesGlobalKey,
  readNeuralDecisionReadout,
  type NeuralDecisionReadout,
  type NeuralNeuronState
} from "../templates/neuralExcitation.template";

describe("Neural Excitation Network template", () => {
  it("documents strict runtime and neuroscience boundaries", () => {
    const docs = [
      neuralExcitationTemplate.description,
      neuralExcitationTemplate.documentation.purpose,
      ...neuralExcitationTemplate.documentation.assumptions,
      ...neuralExcitationTemplate.documentation.limitations,
      ...(neuralExcitationTemplate.documentation.notRepresented ?? []),
      ...(neuralExcitationTemplate.assumptionProfile?.ethicsNotes ?? [])
    ].join("\n");

    for (const phrase of neuralExcitationBoundaryPhrases) {
      expect(docs).toContain(phrase);
    }
    expect(docs).toContain("This is a stylized neural excitation network, not a biological brain simulation.");
    expect(docs).toContain("Outputs are model behavior, not neuroscience evidence.");
    expect(docs).toContain("Metrics are model-output history, not empirical neural recordings.");
    expect(docs).toContain("It does not make Builder graphs or model-schema graphs executable.");
    expect(docs).toContain("Decision Readout V1 maps labeled output assemblies to bounded categorical choices. It is not cognition or reasoning.");
    expect(docs).toContain("Rock-Paper-Scissors labels are semantic labels assigned by the model designer, not meanings understood by the network.");
    expect(docs).toContain("RPS payoff is observational in V1 and does not train, adapt, or optimize the network.");
    expect(docs).toContain("The model does not infer intentions, beliefs, preferences, personality, or human decision-making.");
  });

  it("runs deterministic bounded runtime graph dynamics without Builder or schema execution", () => {
    const options = {
      seed: "neural-runtime",
      parameters: {
        neuronCount: 40,
        connectionDensity: 0.12,
        initialActiveRatio: 0.08,
        externalStimulusRate: 0.02,
        maxSignalQueueSize: 350
      }
    };
    const left = new SimulationEngine(neuralExcitationTemplate, options);
    const right = new SimulationEngine(neuralExcitationTemplate, options);

    expect(getTemplateCapability("neural-excitation-network", "networks")).toMatchObject({
      status: "implemented",
      supportLevel: "runtime",
      runtimeActive: true
    });
    expect(getTemplateCapability("opinion-dynamics", "networks")).toMatchObject({ status: "unsupported", runtimeActive: false });

    const initial = left.createSnapshot();
    expect(readNeuralDecisionReadout(initial.globals).enabled).toBe(false);
    expect(renderNeuralDecisionReadout(initial)?.enabled).toBe(false);
    expect(initial.spaces.map((space) => space.kind).sort()).toEqual(["continuous2d", "network"]);
    expect(initial.globals[neuralSynapsesGlobalKey]).toEqual(expect.any(Array));
    expect((initial.globals[neuralSynapsesGlobalKey] as unknown[]).length).toBeGreaterThan(0);
    expect(renderNetworkEdges(initial).length).toBeGreaterThan(0);

    left.runSteps(40);
    right.runSteps(40);
    const snapshot = left.createSnapshot();
    expect(right.createSnapshot()).toEqual(snapshot);
    expect((snapshot.globals[neuralSignalQueueGlobalKey] as unknown[]).length).toBeLessThanOrEqual(350);
    expect(snapshot.globals.neuralRuntimeBoundary).toBe(
      "This runtime graph belongs only to the Neural Excitation Network template and does not make Builder graphs executable."
    );

    for (const record of snapshot.metricsHistory) {
      for (const value of Object.values(record.values)) {
        expect(Number.isFinite(value)).toBe(true);
      }
    }
  });

  it("applies bounded template-owned neural interventions without edge editing", () => {
    const engine = new SimulationEngine(neuralExcitationTemplate, {
      seed: "neural-interventions",
      parameters: { neuronCount: 36, initialActiveRatio: 0, externalStimulusRate: 0 }
    });
    const definitions = getInterventionDefinitions("neural-excitation-network");
    expect(definitions.map((definition) => definition.id)).toEqual([
      "neural.increaseGlobalExcitation",
      "neural.increaseGlobalInhibition",
      "neural.inhibitSelectedNeuron",
      "neural.silenceSelectedCluster",
      "neural.stimulatePaperAssembly",
      "neural.stimulateRandomNeuron",
      "neural.stimulateRockAssembly",
      "neural.stimulateScissorsAssembly",
      "neural.stimulateSelectedCluster",
      "neural.stimulateSelectedNeuron",
      "neural.toggleExternalStimulus"
    ]);
    expect(definitions.some((definition) => /synapse/i.test(definition.label))).toBe(false);

    const entityId = firstNeuralEntity(engine);
    const before = neuralState(engine, entityId);
    executeIntervention(engine, {
      templateId: "neural-excitation-network",
      interventionId: "neural.stimulateSelectedNeuron",
      target: { entityId },
      parameters: { strength: 1.4 }
    });
    expect(neuralState(engine, entityId).activation).toBeGreaterThan(before.activation);

    executeIntervention(engine, {
      templateId: "neural-excitation-network",
      interventionId: "neural.inhibitSelectedNeuron",
      target: { entityId },
      parameters: { strength: 0.8 }
    });
    expect(neuralState(engine, entityId).incomingInhibitory).toBeGreaterThan(0);

    executeIntervention(engine, {
      templateId: "neural-excitation-network",
      interventionId: "neural.increaseGlobalExcitation",
      parameters: { delta: 0.25 }
    });
    executeIntervention(engine, {
      templateId: "neural-excitation-network",
      interventionId: "neural.increaseGlobalInhibition",
      parameters: { delta: 0.35 }
    });
    executeIntervention(engine, {
      templateId: "neural-excitation-network",
      interventionId: "neural.toggleExternalStimulus"
    });
    expect(engine.world.globals[neuralExcitationScaleGlobalKey]).toBe(1.25);
    expect(engine.world.globals[neuralInhibitionScaleGlobalKey]).toBe(1.35);
    expect(engine.world.globals[neuralExternalStimulusGlobalKey]).toBe(false);
  });

  it("builds the optional RPS Decision Readout with bounded valid output assemblies", () => {
    const preset = neuralExcitationTemplate.initializationPresets?.find((candidate) => candidate.id === "rock-paper-scissors-readout");
    expect(preset).toBeDefined();
    const engine = new SimulationEngine(neuralExcitationTemplate, {
      seed: "neural-rps-preset",
      parameters: { ...preset!.parameterOverrides, thresholdVariance: 0 }
    });
    const snapshot = engine.createSnapshot();
    const entityIds = new Set(snapshot.entities.map((entity) => entity.id));
    const readout = readNeuralDecisionReadout(snapshot.globals);

    expect(readout.enabled).toBe(true);
    expect(readout.selected).toBe("undecided");
    expect(readout.choices.map((choice) => choice.choice)).toEqual(["rock", "paper", "scissors"]);
    expect(new Set(readout.choices.map((choice) => choice.choice)).size).toBe(3);
    for (const assembly of readout.choices) {
      expect(assembly.neuronIds.length).toBeGreaterThan(0);
      expect(assembly.neuronIds.length).toBeLessThanOrEqual(8);
      for (const neuronId of assembly.neuronIds) {
        expect(entityIds.has(neuronId)).toBe(true);
      }
    }
    const view = renderNeuralDecisionReadout(snapshot);
    expect(view?.choices.map((choice) => choice.label)).toEqual(["Rock", "Paper", "Scissors"]);
    expect(snapshot.globals[neuralRpsReadoutGlobalKey]).toMatchObject({
      enabled: true,
      networkChoice: "undecided",
      outcome: "none",
      payoff: 0
    });
  });

  it("selects undecided, conflicted, and clear output readouts deterministically", () => {
    const baseParameters = {
      neuronCount: 36,
      networkTopology: "clustered",
      connectionDensity: 0.01,
      initialActiveRatio: 0,
      externalStimulusRate: 0,
      noiseLevel: 0,
      thresholdVariance: 0,
      signalDelayMin: 10,
      signalDelayMax: 10,
      decisionReadoutEnabled: true,
      decisionThreshold: 0.75,
      decisionMargin: 0.15,
      decisionWindowTicks: 1,
      fixedOpponentChoice: "scissors"
    } as const;

    const undecided = new SimulationEngine(neuralExcitationTemplate, { seed: "neural-readout-undecided", parameters: baseParameters });
    undecided.runSteps(1);
    const undecidedReadout = readNeuralDecisionReadout(undecided.createSnapshot().globals);
    expect(undecidedReadout.selected).toBe("undecided");
    expect(undecidedReadout.confidence).toBeGreaterThanOrEqual(0);
    expect(undecidedReadout.confidence).toBeLessThanOrEqual(1);

    const conflicted = new SimulationEngine(neuralExcitationTemplate, { seed: "neural-readout-conflicted", parameters: baseParameters });
    executeIntervention(conflicted, {
      templateId: "neural-excitation-network",
      interventionId: "neural.stimulateRockAssembly",
      parameters: { strength: 2 }
    });
    executeIntervention(conflicted, {
      templateId: "neural-excitation-network",
      interventionId: "neural.stimulatePaperAssembly",
      parameters: { strength: 2 }
    });
    conflicted.runSteps(1);
    const conflictedReadout = readNeuralDecisionReadout(conflicted.createSnapshot().globals);
    expect(conflictedReadout.selected).toBe("conflicted");
    expect(conflictedReadout.winnerMargin).toBeLessThanOrEqual(0.15);
    expect(conflictedReadout.confidence).toBeGreaterThanOrEqual(0);
    expect(conflictedReadout.confidence).toBeLessThanOrEqual(1);

    const left = new SimulationEngine(neuralExcitationTemplate, { seed: "neural-readout-clear", parameters: baseParameters });
    const right = new SimulationEngine(neuralExcitationTemplate, { seed: "neural-readout-clear", parameters: baseParameters });
    stimulateAssemblyThenStep(left, "neural.stimulateRockAssembly");
    stimulateAssemblyThenStep(right, "neural.stimulateRockAssembly");
    expect(readNeuralDecisionReadout(left.createSnapshot().globals)).toMatchObject({
      selected: "rock",
      decisionTick: 1,
      selectedAssemblyId: "decision-output-rock"
    });
    expect(left.createSnapshot().globals[neuralRpsReadoutGlobalKey]).toMatchObject({
      networkChoice: "rock",
      opponentChoice: "scissors",
      outcome: "win",
      payoff: 1
    });

    stimulateAssemblyThenStep(left, "neural.stimulatePaperAssembly");
    stimulateAssemblyThenStep(right, "neural.stimulatePaperAssembly");
    const switched = left.createSnapshot();
    expect(switched).toEqual(right.createSnapshot());
    expect(readNeuralDecisionReadout(switched.globals).selected).toBe("paper");
    expect(switched.globals.neuralDecisionSwitchCount).toBe(1);
  });

  it("keeps observational RPS payoff out of synapse weights and learning state", () => {
    const engine = new SimulationEngine(neuralExcitationTemplate, {
      seed: "neural-rps-no-learning",
      parameters: {
        neuronCount: 36,
        connectionDensity: 0.01,
        initialActiveRatio: 0,
        externalStimulusRate: 0,
        noiseLevel: 0,
        thresholdVariance: 0,
        decisionReadoutEnabled: true,
        decisionWindowTicks: 1,
        fixedOpponentChoice: "scissors"
      }
    });
    const beforeSynapses = JSON.stringify(engine.world.globals[neuralSynapsesGlobalKey]);
    stimulateAssemblyThenStep(engine, "neural.stimulateRockAssembly");
    const afterSnapshot = engine.createSnapshot();

    expect(JSON.stringify(afterSnapshot.globals[neuralSynapsesGlobalKey])).toBe(beforeSynapses);
    expect(afterSnapshot.globals[neuralRpsReadoutGlobalKey]).toMatchObject({ outcome: "win", payoff: 1 });
    expect(Object.keys(afterSnapshot.globals).filter((key) => /learning|plasticity|adapt/i.test(key))).toEqual([]);
  });

  it("rejects malformed decision assemblies and keeps readout boundaries out of Builder and schema runtime", () => {
    const engine = new SimulationEngine(neuralExcitationTemplate, {
      seed: "neural-readout-validation",
      parameters: { neuronCount: 36, initialActiveRatio: 0, externalStimulusRate: 0, decisionReadoutEnabled: true }
    });
    const valid = readNeuralDecisionReadout(engine.world.globals);
    engine.world.globals[neuralDecisionReadoutGlobalKey] = {
      ...valid,
      choices: [valid.choices[0]!, { ...valid.choices[1]!, choice: "rock" }, valid.choices[2]!]
    } as NeuralDecisionReadout;
    expect(() => neuralExcitationTemplate.validateWorld?.(engine.world.view())).toThrow(/Duplicate Neural Decision Readout choice/);

    const emptyAssemblyEngine = new SimulationEngine(neuralExcitationTemplate, {
      seed: "neural-readout-empty-validation",
      parameters: { neuronCount: 36, initialActiveRatio: 0, externalStimulusRate: 0, decisionReadoutEnabled: true }
    });
    const emptyValid = readNeuralDecisionReadout(emptyAssemblyEngine.world.globals);
    emptyAssemblyEngine.world.globals[neuralDecisionReadoutGlobalKey] = {
      ...emptyValid,
      choices: [{ ...emptyValid.choices[0]!, neuronIds: [] }, emptyValid.choices[1]!, emptyValid.choices[2]!]
    } as NeuralDecisionReadout;
    expect(() => neuralExcitationTemplate.validateWorld?.(emptyAssemblyEngine.world.view())).toThrow(/cannot be empty/);

    const source = [
      readFileSync(join(process.cwd(), "src", "simulation", "templates", "neuralExcitation.template.ts"), "utf8"),
      readFileSync(join(process.cwd(), "src", "simulation", "interventions", "interventionRegistry.ts"), "utf8"),
      readFileSync(join(process.cwd(), "src", "components", "Legend.tsx"), "utf8")
    ].join("\n");
    expect(source).not.toMatch(/from ["'][^"']*(builder|modelSchema|visualBuilderWorkspace|schemaTemplateCompatibility|socialLearning)/);
    expect(source).not.toMatch(/generateScenario|generateRunConfig|generateTemplate|deserializeVisualBuilderWorkspace|serializeModelSchema/);
  });

  it("keeps the template source headless and free of arbitrary execution hooks", () => {
    const source = readFileSync(join(process.cwd(), "src", "simulation", "templates", "neuralExcitation.template.ts"), "utf8");
    expect(source).not.toContain("Math.random");
    expect(source).not.toMatch(/from ["']react["']|from ["']zustand["']|document\.[A-Za-z_$]|window\.[A-Za-z_$]|CanvasRenderingContext2D|HTMLCanvasElement|localStorage/);
    expect(source).not.toMatch(/eval\(|new Function|import\(/);
    expect(source).not.toMatch(/openai|chatCompletion|LLM|embedding/i);
  });
});

function stimulateAssemblyThenStep(engine: SimulationEngine, interventionId: string): void {
  executeIntervention(engine, {
    templateId: "neural-excitation-network",
    interventionId,
    parameters: { strength: 2 }
  });
  engine.runSteps(1);
}

function firstNeuralEntity(engine: SimulationEngine): string {
  const [entityId] = engine.world.view().entitiesWith([NeuralNeuronStateComponent]);
  if (!entityId) {
    throw new Error("Expected a Neural neuron entity");
  }
  return entityId;
}

function neuralState(engine: SimulationEngine, entityId: string): NeuralNeuronState {
  const state = engine.world.view().getComponent<NeuralNeuronState>(entityId, NeuralNeuronStateComponent);
  if (!state) {
    throw new Error(`Missing NeuralNeuronState for ${entityId}`);
  }
  return state;
}
