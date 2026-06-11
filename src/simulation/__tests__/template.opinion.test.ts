import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { SimulationEngine } from "../kernel/SimulationEngine";
import type { ParameterDefinition, SimulationTemplate } from "../kernel/types";
import { World } from "../kernel/World";
import { Continuous2DSpace } from "../spaces/Continuous2DSpace";
import { Position2D } from "../templates/epidemic.template";
import {
  OPINION_SPACE_ID,
  OpinionSocialLearningState,
  OpinionState,
  createOpinionNeighborSensingSystem,
  createOpinionNoiseSystem,
  createOpinionUpdateSystem,
  opinionMetrics,
  opinionTemplate,
  validateOpinionInformationSources,
  type OpinionSocialLearningStateComponent,
  type OpinionStateComponent
} from "../templates/opinion.template";

describe("opinion template", () => {
  it("keeps opinions within [-1, 1]", () => {
    const engine = new SimulationEngine(opinionTemplate, {
      seed: "opinion-bounds",
      parameters: params({ noise: 1, influenceRadius: 100, influenceStrength: 1 })
    });
    engine.runSteps(100);

    for (const entityId of engine.world.view().entitiesWith([OpinionState])) {
      const state = engine.world.view().getComponent<OpinionStateComponent>(entityId, OpinionState);
      expect(state?.value).toBeGreaterThanOrEqual(-1);
      expect(state?.value).toBeLessThanOrEqual(1);
    }
  });

  it("influence strength affects convergence", () => {
    const weak = new SimulationEngine(opinionTemplate, {
      seed: "convergence",
      parameters: params({ influenceStrength: 0, noise: 0, influenceRadius: 100 })
    });
    const strong = new SimulationEngine(opinionTemplate, {
      seed: "convergence",
      parameters: params({ influenceStrength: 0.8, noise: 0, influenceRadius: 100 })
    });
    weak.runSteps(40);
    strong.runSteps(40);

    const weakVariance = latestMetric(weak, "opinionVariance");
    const strongVariance = latestMetric(strong, "opinionVariance");
    expect(strongVariance).toBeLessThan(weakVariance);
  });

  it("is reproducible for the same seed", () => {
    const left = new SimulationEngine(opinionTemplate, { seed: "opinion-same", parameters: params() });
    const right = new SimulationEngine(opinionTemplate, { seed: "opinion-same", parameters: params() });
    left.runSteps(100);
    right.runSteps(100);
    expect(left.createSnapshot()).toEqual(right.createSnapshot());
  });

  it("noise uses seeded RNG streams", () => {
    const left = new SimulationEngine(opinionTemplate, {
      seed: "noise-a",
      parameters: params({ noise: 0.5, influenceStrength: 0, influenceRadius: 10 })
    });
    const right = new SimulationEngine(opinionTemplate, {
      seed: "noise-b",
      parameters: params({ noise: 0.5, influenceStrength: 0, influenceRadius: 10 })
    });

    left.runSteps(25);
    right.runSteps(25);

    expect(left.createSnapshot()).not.toEqual(right.createSnapshot());
  });

  it("updates from staged sensed values without accidental order dependence", () => {
    const engine = new SimulationEngine(twoOpinionTemplate(), {
      parameters: params({ agentCount: 2, influenceRadius: 10, influenceStrength: 0.5, noise: 0, initialPolarization: 1 })
    });

    engine.step();

    expect(engine.world.view().getComponent<OpinionStateComponent>("A", OpinionState)?.value).toBe(0);
    expect(engine.world.view().getComponent<OpinionStateComponent>("B", OpinionState)?.value).toBe(0);
  });

  it("runs bounded template-owned social learning deterministically", () => {
    const parameters = params({
      agentCount: 40,
      noise: 0,
      influenceRadius: 35,
      influenceStrength: 0.35,
      socialLearningRate: 0.8,
      sourceExposureStrength: 0.9,
      sourceOneSignal: 0.9,
      sourceOneCredibility: 0.8,
      sourceOneExposure: 0.7,
      sourceOneInfluence: 0.6,
      sourceTwoSignal: -0.5,
      sourceTwoCredibility: 0.3,
      sourceTwoExposure: 0.4,
      sourceTwoInfluence: 0.4,
      crowdSignal: 0.25,
      crowdSignalStrength: 0.4,
      maxOpinionShiftPerTick: 0.09
    });
    const left = socialLearningEngine("social-learning-same", parameters);
    const right = socialLearningEngine("social-learning-same", parameters);

    expect(left.world.globals.opinionBehaviorMode).toBe("socialLearning");
    expect(left.world.globals.opinionInformationSourceCount).toBe(2);
    expect(left.world.view().entitiesWith([OpinionSocialLearningState])).toHaveLength(40);

    left.runSteps(25);
    right.runSteps(25);

    expect(left.createSnapshot()).toEqual(right.createSnapshot());
    const latest = latestMetrics(left);
    expect(latest.socialLearningActiveAgents).toBe(40);
    expect(latest.informationSourceCount).toBe(2);
    expect(latest.meanOpinionShift).toBeGreaterThan(0);
    expect(latest.meanSourceInfluence).toBeGreaterThan(0);
    expect(Number.isFinite(latest.meanCredibilityWeightedExposure)).toBe(true);

    for (const entityId of left.world.view().entitiesWith([OpinionState, OpinionSocialLearningState])) {
      const opinion = left.world.view().getComponent<OpinionStateComponent>(entityId, OpinionState);
      const social = left.world.view().getComponent<OpinionSocialLearningStateComponent>(entityId, OpinionSocialLearningState);
      expect(opinion?.value).toBeGreaterThanOrEqual(-1);
      expect(opinion?.value).toBeLessThanOrEqual(1);
      expect(social?.memory).toBeGreaterThanOrEqual(-1);
      expect(social?.memory).toBeLessThanOrEqual(1);
      expect(social?.salience).toBeGreaterThanOrEqual(0);
      expect(social?.salience).toBeLessThanOrEqual(1);
      expect(Math.abs(social?.lastOpinionShift ?? Number.POSITIVE_INFINITY)).toBeLessThanOrEqual(0.09 + 1e-12);
      expect(social?.lastCredibilityWeightedExposure).toBeGreaterThanOrEqual(0);
      expect(social?.lastCredibilityWeightedExposure).toBeLessThanOrEqual(1);
    }
  });

  it("keeps default mode free of active social-learning state and source exposure", () => {
    const engine = new SimulationEngine(opinionTemplate, {
      seed: "opinion-default-social-inactive",
      parameters: params({ agentCount: 12, noise: 0 })
    });

    expect(engine.world.globals.opinionBehaviorMode).toBe("default");
    expect(engine.world.globals.opinionInformationSourceCount).toBe(0);
    expect(engine.world.globals.opinionSocialLearningRuntimeScope).toBe("inactive");
    expect(engine.world.view().entitiesWith([OpinionSocialLearningState])).toHaveLength(0);

    engine.runSteps(3);

    const latest = latestMetrics(engine);
    expect(latest.socialLearningActiveAgents).toBe(0);
    expect(latest.informationSourceCount).toBe(0);
    expect(latest.meanOpinionShift).toBe(0);
    expect(latest.meanSourceInfluence).toBe(0);
    expect(latest.meanCrowdInfluence).toBe(0);
    expect(latest.meanMemoryInfluence).toBe(0);
  });

  it("handles zero social exposure weights without non-finite metrics", () => {
    const engine = socialLearningEngine(
      "zero-social-exposure",
      params({
        agentCount: 1,
        influenceRadius: 0.1,
        influenceStrength: 0,
        noise: 0,
        sourceExposureStrength: 0,
        sourceOneExposure: 0,
        sourceTwoExposure: 0,
        crowdSignalStrength: 0,
        salienceWeight: 0,
        maxOpinionShiftPerTick: 0.05
      })
    );

    engine.runSteps(5);

    const latest = latestMetrics(engine);
    for (const value of Object.values(latest)) {
      expect(Number.isFinite(value)).toBe(true);
    }
    expect(latest.meanOpinionShift).toBe(0);
    expect(latest.meanSourceInfluence).toBe(0);
    expect(latest.meanCrowdInfluence).toBe(0);
    expect(latest.meanMemoryInfluence).toBe(0);
    expect(latest.informationSourceCount).toBe(2);
  });

  it("keeps source-driven influence stylized, bounded, and controlled by source weights", () => {
    const highSource = oneAgentSocialLearningEngine("source-weight-high", {
      sourceExposureStrength: 1,
      sourceTrustSensitivity: 1,
      sourceOneSignal: 1,
      sourceOneCredibility: 1,
      sourceOneExposure: 1,
      sourceOneInfluence: 1,
      sourceTwoExposure: 0,
      sourceTwoInfluence: 0,
      crowdSignalStrength: 0,
      maxSourceInfluencePerTick: 0.04,
      maxOpinionShiftPerTick: 0.04
    });
    const zeroSource = oneAgentSocialLearningEngine("source-weight-zero", {
      sourceExposureStrength: 0,
      sourceOneSignal: 1,
      sourceOneCredibility: 1,
      sourceOneExposure: 1,
      sourceOneInfluence: 1,
      sourceTwoExposure: 0,
      sourceTwoInfluence: 0,
      crowdSignalStrength: 0,
      maxSourceInfluencePerTick: 0.04,
      maxOpinionShiftPerTick: 0.04
    });

    highSource.step();
    zeroSource.step();

    const highLatest = latestMetrics(highSource);
    const zeroLatest = latestMetrics(zeroSource);
    expect(highLatest.meanSourceInfluence).toBeGreaterThan(0);
    expect(highLatest.meanCredibilityWeightedExposure).toBeGreaterThan(0);
    expect(highLatest.meanOpinionShift).toBeLessThanOrEqual(0.04 + 1e-12);
    expect(zeroLatest.meanSourceInfluence).toBe(0);
    expect(zeroLatest.meanOpinionShift).toBe(0);
  });

  it("rejects invalid social-learning numeric parameters", () => {
    const invalidCases: Array<[string, Record<string, number>]> = [
      ["non-finite learning rate", { socialLearningRate: Number.NaN }],
      ["out-of-range learning rate", { socialLearningRate: 1.1 }],
      ["non-finite trust weight", { socialTrustWeight: Number.POSITIVE_INFINITY }],
      ["out-of-range trust weight", { socialTrustWeight: -0.1 }],
      ["non-finite confirmation bias", { confirmationBias: Number.NaN }],
      ["out-of-range confirmation bias", { confirmationBias: 1.1 }],
      ["non-finite source exposure strength", { sourceExposureStrength: Number.NEGATIVE_INFINITY }],
      ["out-of-range source exposure strength", { sourceExposureStrength: -0.1 }],
      ["non-finite source trust sensitivity", { sourceTrustSensitivity: Number.NaN }],
      ["out-of-range source trust sensitivity", { sourceTrustSensitivity: 1.1 }],
      ["non-finite max source influence", { maxSourceInfluencePerTick: Number.NaN }],
      ["out-of-range max source influence", { maxSourceInfluencePerTick: 0.51 }],
      ["non-finite crowd strength", { crowdSignalStrength: Number.NaN }],
      ["out-of-range crowd strength", { crowdSignalStrength: -0.1 }],
      ["crowd signal outside opinion range", { crowdSignal: 1.1 }],
      ["non-finite memory decay", { memoryDecay: Number.POSITIVE_INFINITY }],
      ["out-of-range memory decay", { memoryDecay: 1.1 }],
      ["non-finite salience weight", { salienceWeight: Number.NaN }],
      ["out-of-range salience weight", { salienceWeight: -0.1 }],
      ["non-finite max opinion shift", { maxOpinionShiftPerTick: Number.NaN }],
      ["out-of-range max opinion shift", { maxOpinionShiftPerTick: 0.51 }],
      ["source signal outside opinion range", { sourceOneSignal: -1.1 }],
      ["source credibility outside range", { sourceOneCredibility: 1.1 }],
      ["source exposure outside range", { sourceOneExposure: -0.1 }],
      ["source influence outside range", { sourceOneInfluence: 1.1 }]
    ];

    for (const [label, overrides] of invalidCases) {
      expect(
        () =>
          new SimulationEngine(opinionTemplate, {
            seed: `invalid-${label}`,
            parameters: params(overrides)
          }),
        label
      ).toThrow(/Invalid opinion parameters|not finite|must be/);
    }
  });

  it("rejects unsafe information-source descriptors and unsupported opinion behavior modes", () => {
    expect(() =>
      validateOpinionInformationSources([
        { id: "source-one", label: "One", category: "institutional", signal: 0.1, credibility: 0.5, exposure: 0.5, influence: 0.5 },
        { id: "source-one", label: "Duplicate", category: "peer", signal: 0.2, credibility: 0.5, exposure: 0.5, influence: 0.5 }
      ])
    ).toThrow(/Duplicate opinion information source id/);
    expect(() =>
      validateOpinionInformationSources([
        {
          id: "source-one",
          label: "One",
          category: "institutional",
          signal: 0.1,
          credibility: 0.5,
          exposure: 0.5,
          influence: 0.5,
          payload: "not allowed"
        } as never
      ])
    ).toThrow(/Unsupported opinion information source field/);
    expect(() =>
      validateOpinionInformationSources([
        { id: "source-one", label: "One", category: "protectedClass" as never, signal: 0.1, credibility: 0.5, exposure: 0.5, influence: 0.5 }
      ])
    ).toThrow(/Invalid opinion information source category/);
    expect(() =>
      new SimulationEngine(opinionTemplate, {
        parameters: params(),
        scenario: { behaviorMode: "schemaSocialLearning", agentComposition: {}, environmentOptions: {} }
      })
    ).toThrow(/Unsupported opinion behavior mode/);
  });

  it("rejects malformed information sources and unsafe source payload fields", () => {
    expect(validateOpinionInformationSources([validSource("source-one"), validSource("source-two", { label: "Two" })])).toHaveLength(2);
    expect(() => validateOpinionInformationSources([validSource("source-one"), validSource("source-two"), validSource("source-three")])).toThrow(
      /at most two fixed information sources/
    );
    expect(() => validateOpinionInformationSources([[] as never])).toThrow(/plain object/);
    expect(() => validateOpinionInformationSources([new (class Source {})() as never])).toThrow(/plain object/);
    expect(() => validateOpinionInformationSources([{ ...validSource("source-one"), id: undefined } as never])).toThrow(/Invalid opinion information source id/);
    expect(() => validateOpinionInformationSources([{ ...validSource("source-one"), label: "" }])).toThrow(/Invalid opinion information source label/);
    expect(() => validateOpinionInformationSources([{ ...validSource("source-one"), label: "x".repeat(81) }])).toThrow(
      /Invalid opinion information source label/
    );
    expect(() => validateOpinionInformationSources([{ ...validSource("source-one"), signal: Number.NaN }])).toThrow(
      /Invalid opinion information source signal/
    );
    expect(() => validateOpinionInformationSources([{ ...validSource("source-one"), signal: 2 }])).toThrow(/Invalid opinion information source signal/);
    expect(() => validateOpinionInformationSources([{ ...validSource("source-one"), credibility: -0.1 }])).toThrow(
      /Invalid opinion information source credibility/
    );
    expect(() => validateOpinionInformationSources([{ ...validSource("source-one"), influence: 1.1 }])).toThrow(
      /Invalid opinion information source influence/
    );
    expect(() => validateOpinionInformationSources([{ ...validSource("source-one"), exposure: Number.POSITIVE_INFINITY }])).toThrow(
      /Invalid opinion information source exposure/
    );

    const unsafeFields = [
      "llm",
      "prompt",
      "agentPayload",
      "embedding",
      "modelWeights",
      "trainingData",
      "articleText",
      "document",
      "content",
      "biography",
      "runtimeMemory",
      "realPersonProfile",
      "protectedClassTargeting",
      "truthScore",
      "misinformationScore",
      "factCheck",
      "recommender",
      "targeting",
      "persuasionObjective",
      "microtargeting",
      "policyOptimizer",
      "psychologicalDiagnosis",
      "proof",
      "certification",
      "safetyScore",
      "riskScore"
    ];
    for (const field of unsafeFields) {
      expect(() => validateOpinionInformationSources([{ ...validSource("source-one"), [field]: "not allowed" } as never]), field).toThrow(
        /Unsupported opinion information source field/
      );
    }
  });

  it("rejects arbitrary social-learning runtime state payloads", () => {
    const engine = socialLearningEngine("social-state-validation", params({ agentCount: 3, noise: 0 }));
    const [entityId] = engine.world.view().entitiesWith([OpinionSocialLearningState]);
    expect(entityId).toBeDefined();

    expect(() =>
      engine.applyCommands([
        {
          type: "patchComponent",
          entityId: entityId!,
          componentType: OpinionSocialLearningState,
          partial: { biography: "not allowed" }
        }
      ])
    ).toThrow(/Invalid OpinionSocialLearningState/);

    const boundedEngine = socialLearningEngine("social-state-bounds", params({ agentCount: 3, noise: 0 }));
    const [boundedEntityId] = boundedEngine.world.view().entitiesWith([OpinionSocialLearningState]);
    expect(boundedEntityId).toBeDefined();
    expect(() =>
      boundedEngine.applyCommands([
        {
          type: "patchComponent",
          entityId: boundedEntityId!,
          componentType: OpinionSocialLearningState,
          partial: { salience: 2 }
        }
      ])
    ).toThrow(/Invalid OpinionSocialLearningState/);
  });

  it("keeps Opinion social-learning code detached from structural artifact executors and unsafe runtimes", () => {
    const source = readFileSync(join(process.cwd(), "src", "simulation", "templates", "opinion.template.ts"), "utf8");
    expect(source).not.toContain("Math.random");
    expect(source).not.toContain("eval(");
    expect(source).not.toContain("new Function");
    expect(source).not.toMatch(/from ["'].*socialLearning/);
    expect(source).not.toMatch(/from ["'].*modelSchema/);
    expect(source).not.toMatch(/from ["'].*schemaTemplateCompatibility/);
    expect(source).not.toMatch(/from ["'].*visualBuilderWorkspace/);
    expect(source).not.toMatch(/new SimulationEngine/);
    expect(source).not.toMatch(/from ["'][^"']*(openai|tensorflow|onnx|embedding|recommender|fact)[^"']*["']/i);
  });
});

function twoOpinionTemplate(): SimulationTemplate {
  return {
    id: "two-opinion",
    name: "Two Opinion",
    description: "Two-agent opinion test.",
    version: "1.0.0",
    parameterDefinitions: opinionTemplate.parameterDefinitions.map((definition) => ({ ...definition })) as ParameterDefinition[],
    documentation: {
      purpose: "Test opinion staging.",
      entities: ["Agents"],
      stateVariables: ["Position2D", "OpinionState"],
      processOverview: "Sense and update.",
      scheduling: "Sense before decide.",
      designConcepts: { interaction: "Two neighbors." },
      initialization: "Two agents.",
      submodels: ["Opinion influence"],
      assumptions: [],
      limitations: []
    },
    createInitialWorld() {
      const world = new World();
      const space = new Continuous2DSpace({ id: OPINION_SPACE_ID, width: 10, height: 10, boundaryMode: "clamp" });
      world.addSpace(space);
      for (const [id, x, value] of [
        ["A", 0, -1],
        ["B", 1, 1]
      ] as const) {
        world.entityStore.create("opinion-agent", { id, createdAtTick: 0 });
        const position = { x, y: 0 };
        world.componentStore.add(id, Position2D, position);
        world.componentStore.add(id, OpinionState, { value, stubbornness: 0 });
        space.addEntity(id, position);
      }
      return world;
    },
    registerSystems(registry) {
      registry.register(createOpinionNeighborSensingSystem());
      registry.register(createOpinionUpdateSystem());
      registry.register(createOpinionNoiseSystem());
    },
    registerMetrics(registry) {
      for (const metric of opinionMetrics()) {
        registry.register(metric);
      }
    },
    getVisuals: () => ({ components: {} })
  };
}

function params(overrides: Record<string, number> = {}) {
  return {
    agentCount: 60,
    influenceRadius: 14,
    influenceStrength: 0.18,
    noise: 0.02,
    initialPolarization: 0.65,
    ...overrides
  };
}

function socialLearningEngine(seed: string, parameters: ReturnType<typeof params>): SimulationEngine {
  return new SimulationEngine(opinionTemplate, {
    seed,
    parameters,
    scenario: {
      behaviorMode: "socialLearning",
      agentComposition: { agentCount: parameters.agentCount, initialPolarization: parameters.initialPolarization },
      environmentOptions: {}
    }
  });
}

function oneAgentSocialLearningEngine(seed: string, overrides: Record<string, number>): SimulationEngine {
  const parameters = params({
    agentCount: 1,
    influenceRadius: 0.1,
    influenceStrength: 0,
    noise: 0,
    initialPolarization: 0,
    socialLearningRate: 1,
    socialTrustWeight: 1,
    confirmationBias: 0,
    memoryDecay: 0.5,
    salienceWeight: 0,
    ...overrides
  });
  return new SimulationEngine(opinionTemplate, {
    seed,
    parameters,
    initialization: { presetId: "consensus-start", options: { meanOpinion: -0.8, spread: 0 } },
    scenario: {
      behaviorMode: "socialLearning",
      agentComposition: { agentCount: parameters.agentCount, initialPolarization: parameters.initialPolarization },
      environmentOptions: {}
    }
  });
}

function validSource(id: string, overrides: Partial<Parameters<typeof validateOpinionInformationSources>[0][number]> = {}) {
  return {
    id,
    label: "Source",
    category: "institutional" as const,
    signal: 0.1,
    credibility: 0.5,
    exposure: 0.5,
    influence: 0.5,
    ...overrides
  };
}

function latestMetric(engine: SimulationEngine, key: string): number {
  const history = engine.createSnapshot().metricsHistory;
  const latest = history[history.length - 1];
  return latest?.values[key] ?? Number.NaN;
}

function latestMetrics(engine: SimulationEngine): Record<string, number> {
  const history = engine.createSnapshot().metricsHistory;
  return history[history.length - 1]?.values ?? {};
}
