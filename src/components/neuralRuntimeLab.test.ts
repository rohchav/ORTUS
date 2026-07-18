import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { executeIntervention } from "../simulation/interventions/interventionExecutor";
import { SimulationEngine } from "../simulation/kernel/SimulationEngine";
import { neuralExcitationTemplate } from "../simulation/templates/neuralExcitation.template";
import {
  boundNeuralRpsRounds,
  boundNeuralTimelineEvents,
  chooseNeuralAdaptiveCue,
  clearNeuralRpsHistory,
  createInitialNeuralStrategyAdaptationState,
  createNeuralLabMission,
  createNeuralLiveExplanations,
  createNeuralRpsRound,
  createNeuralStrategyAdaptationConfig,
  deriveNeuralRuntimeEvents,
  defaultNeuralStrategyAdaptationConfig,
  neuralDirectActions,
  neuralLabScenarioCards,
  neuralPlainEnglishControls,
  neuralRuntimeLabBoundaryCopy,
  neuralRuntimeLabRpsHistoryLimit,
  neuralRuntimeLabTemplateId,
  neuralRuntimeLabTimelineLimit,
  neuralRpsDistribution,
  neuralStrategyAdaptationMetricsBoundary,
  neuralStrategyAdaptationPlainControls,
  neuralStrategyRandomPlayBoundary,
  nextNeuralRpsRoundIndex,
  resetNeuralStrategyAdaptation,
  rpsCounterChoice,
  roundsAfterNeuralStrategyReset,
  type NeuralRpsChoice,
  type NeuralRpsRound,
  updateNeuralStrategyAdaptation
} from "./neuralRuntimeLab";

const repoRoot = process.cwd();

function source(path: string): string {
  return readFileSync(join(repoRoot, path), "utf8");
}

describe("Neural Runtime Lab UX view model", () => {
  it("defines scenario-first cards with explicit regeneration and adaptation boundaries", () => {
    expect(neuralLabScenarioCards.map((scenario) => scenario.title)).toEqual([
      "Watch a cascade spread",
      "Stabilize runaway excitation",
      "Make two clusters synchronize",
      "Break the network by removing/silencing a hub",
      "Rock-Paper-Scissors Readout Demo",
      "Adaptive RPS Challenge"
    ]);

    for (const scenario of neuralLabScenarioCards) {
      expect(scenario.setupImpact).toMatch(/regenerates a fresh tick-0/i);
      expect(scenario.parameterPatch).toBeTypeOf("object");
    }
    expect(neuralLabScenarioCards.find((scenario) => scenario.id === "silence-hub")?.objective).toContain(
      "V1 does not support selected-edge or hub removal"
    );
    expect(neuralLabScenarioCards.find((scenario) => scenario.id === "stay-unpredictable")?.objective).toContain(
      "bounded local pattern statistics"
    );
    expect(neuralLabScenarioCards.find((scenario) => scenario.id === "stay-unpredictable")?.actionHint).toContain(
      "random optimal play has no exploitable pattern"
    );
  });

  it("builds mission status, live explanations, and bounded timeline events from runtime output", () => {
    const engine = new SimulationEngine(neuralExcitationTemplate, {
      seed: "neural-lab-mission",
      parameters: { neuronCount: 40, initialActiveRatio: 0.06, externalStimulusRate: 0.01 }
    });
    const initial = engine.createSnapshot();
    engine.runSteps(4);
    const next = engine.createSnapshot();

    const mission = createNeuralLabMission(next);
    expect(mission.objective).toContain("Trigger a small cascade");
    expect(mission.statusRows.map((row) => row.label)).toEqual([
      "Firing neurons",
      "Refractory",
      "Signal queue",
      "Excitation/inhibition balance",
      "Cascade status"
    ]);
    expect(mission.tryNext).toContain("Raise inhibition.");

    const explanations = createNeuralLiveExplanations(next).join("\n");
    expect(explanations).toMatch(/network|Activity|Cascade|Delayed signal|Inhibition/i);
    expect(explanations).not.toMatch(/\b(thinks|believes|wants|understands|learned|personality|diagnosis)\b/i);

    const events = deriveNeuralRuntimeEvents(initial, next);
    expect(events.every((event) => event.tick === next.tick)).toBe(true);
    expect(boundNeuralTimelineEvents(fakeTimeline(100))).toHaveLength(neuralRuntimeLabTimelineLimit);
  });

  it("records local RPS rounds, payoff, bounded history, and distribution metrics", () => {
    const engine = new SimulationEngine(neuralExcitationTemplate, {
      seed: "neural-lab-rps",
      parameters: {
        neuronCount: 36,
        connectionDensity: 0.01,
        initialActiveRatio: 0,
        externalStimulusRate: 0,
        noiseLevel: 0,
        thresholdVariance: 0,
        decisionReadoutEnabled: true,
        decisionWindowTicks: 1,
        fixedOpponentChoice: "rock"
      }
    });
    executeIntervention(engine, {
      templateId: neuralRuntimeLabTemplateId,
      interventionId: "neural.stimulateRockAssembly",
      parameters: { strength: 2 }
    });
    engine.runSteps(1);
    const round = createNeuralRpsRound(engine.createSnapshot(), "scissors", 7);

    expect(round).toMatchObject({
      roundIndex: 7,
      userChoice: "scissors",
      networkChoice: "rock",
      opponentChoice: "scissors",
      outcome: "win",
      payoff: 1
    });
    expect(round?.readoutConfidence).toBeGreaterThanOrEqual(0);
    expect(round?.winnerMargin).toBeGreaterThanOrEqual(0);
    expect(boundNeuralRpsRounds(fakeRounds(260))).toHaveLength(neuralRuntimeLabRpsHistoryLimit);
    expect(neuralRpsDistribution([round!]).find((item) => item.choice === "rock")?.count).toBe(1);
  });

  it("updates deterministic bounded strategy state only when adaptation is enabled", () => {
    const config = createNeuralStrategyAdaptationConfig({
      enabled: true,
      learningRate: 0.2,
      explorationRate: 0.1,
      historyWindow: 20,
      patternWindow: 8,
      maxBiasMagnitude: 0.7,
      decayRate: 0.1,
      minPatternConfidence: 0.2
    });
    const repeatedRock = scriptedRounds(["rock", "rock", "rock", "rock", "rock"], "paper");
    const repeatedPaper = scriptedRounds(["paper", "paper", "paper", "paper", "paper"], "scissors");
    const repeatedScissors = scriptedRounds(["scissors", "scissors", "scissors", "scissors", "scissors"], "rock");

    const rockState = updateNeuralStrategyAdaptation(repeatedRock, config);
    const sameRockState = updateNeuralStrategyAdaptation(repeatedRock, config);
    expect(rockState).toEqual(sameRockState);
    expect(rockState.opponentChoiceCounts).toMatchObject({ rock: 5, paper: 0, scissors: 0 });
    expect(rockState.networkChoiceCounts.paper).toBe(5);
    expect(rockState.transitionCounts.rock.rock).toBe(4);
    expect(rockState.predictedOpponentChoice).toBe("rock");
    expect(rockState.predictedCounterChoice).toBe("paper");
    expect(rockState.patternConfidence).toBeGreaterThan(0.5);
    expect(rockState.choiceBias.paper).toBeGreaterThan(rockState.choiceBias.rock);
    expect(Math.abs(rockState.choiceBias.paper)).toBeLessThanOrEqual(config.maxBiasMagnitude);
    expect(rockState.rollingWinRate).toBe(1);
    expect(rockState.strategyEntropy).toBe(0);

    expect(updateNeuralStrategyAdaptation(repeatedPaper, config).predictedCounterChoice).toBe("scissors");
    expect(updateNeuralStrategyAdaptation(repeatedScissors, config).predictedCounterChoice).toBe("rock");
    expect(rpsCounterChoice("rock")).toBe("paper");
    expect(rpsCounterChoice("paper")).toBe("scissors");
    expect(rpsCounterChoice("scissors")).toBe("rock");

    const randomLike = updateNeuralStrategyAdaptation(scriptedRounds(["rock", "paper", "scissors", "rock", "paper", "scissors"], "rock"), {
      ...config,
      minPatternConfidence: 0.6
    });
    expect(randomLike.predictedOpponentChoice).toBe("unknown");
    expect(randomLike.patternConfidence).toBe(0);
    expect(randomLike.strategyEntropy).toBeGreaterThan(0.9);

    const disabled = updateNeuralStrategyAdaptation(repeatedRock, { ...config, enabled: false });
    expect(disabled.predictedOpponentChoice).toBe("unknown");
    expect(disabled.choiceBias).toEqual({ rock: 0, paper: 0, scissors: 0 });

    expect(() => createNeuralStrategyAdaptationConfig({ learningRate: 0.8 })).toThrow(/learningRate/);
    expect(() => createNeuralStrategyAdaptationConfig({ patternWindow: 80, historyWindow: 20 })).toThrow(/patternWindow/);
    expect(resetNeuralStrategyAdaptation(config)).toMatchObject({
      roundCount: 0,
      choiceBias: { rock: 0, paper: 0, scissors: 0 },
      predictedOpponentChoice: "unknown"
    });
    expect(clearNeuralRpsHistory()).toEqual([]);
  });

  it("uses round-index reset guards so bounded history cannot rehydrate or swallow new learned state", () => {
    const config = createNeuralStrategyAdaptationConfig({
      historyWindow: 80,
      patternWindow: 20,
      minPatternConfidence: 0.1
    });
    const fullHistory = boundNeuralRpsRounds(fakeRounds(200), config.historyWindow);
    const resetAfter = nextNeuralRpsRoundIndex(fullHistory) - 1;
    const postResetRound: NeuralRpsRound = {
      ...fakeRounds(1)[0]!,
      id: "post-reset-201",
      roundIndex: resetAfter + 1,
      tick: resetAfter + 1,
      userChoice: "paper",
      opponentChoice: "paper",
      networkChoice: "scissors",
      outcome: "win",
      payoff: 1
    };
    const nextHistory = boundNeuralRpsRounds([...fullHistory, postResetRound], config.historyWindow);
    const postResetOnly = roundsAfterNeuralStrategyReset(nextHistory, resetAfter);
    const postResetState = updateNeuralStrategyAdaptation(postResetOnly, config);

    expect(fullHistory).toHaveLength(80);
    expect(nextNeuralRpsRoundIndex(fullHistory)).toBe(201);
    expect(nextHistory).toHaveLength(80);
    expect(postResetOnly.map((round) => round.roundIndex)).toEqual([201]);
    expect(postResetState.roundCount).toBe(1);
    expect(postResetState.opponentChoiceCounts.paper).toBe(1);
    expect(roundsAfterNeuralStrategyReset(nextHistory, Number.NaN)).toHaveLength(80);
  });

  it("ignores malformed round objects and rejects arbitrary RPS action labels", () => {
    const config = createNeuralStrategyAdaptationConfig({ minPatternConfidence: 0.1 });
    const valid = scriptedRounds(["rock", "rock", "rock", "rock"], "paper");
    const malformedChoice = { ...valid[0]!, id: "bad-choice", opponentChoice: "lizard" } as unknown as NeuralRpsRound;
    const malformedMetric = { ...valid[1]!, id: "bad-metric", confidence: Number.POSITIVE_INFINITY } as NeuralRpsRound;
    const state = updateNeuralStrategyAdaptation([malformedChoice, ...valid, malformedMetric], config);

    expect(state.roundCount).toBe(valid.length);
    expect(state.opponentChoiceCounts).toEqual({ rock: 4, paper: 0, scissors: 0 });
    expect(boundNeuralRpsRounds([malformedChoice, ...valid, malformedMetric])).toHaveLength(valid.length);
    expect(() =>
      chooseNeuralAdaptiveCue("lizard" as NeuralRpsChoice, createInitialNeuralStrategyAdaptationState(config), config, "seed", 1)
    ).toThrow(/Invalid RPS choice/);
  });

  it("uses deterministic exploration and bounded adaptive cue strength", () => {
    const config = createNeuralStrategyAdaptationConfig({
      enabled: true,
      explorationRate: 0.5,
      maxBiasMagnitude: 2,
      minPatternConfidence: 0.1
    });
    const state = updateNeuralStrategyAdaptation(scriptedRounds(["rock", "rock", "rock", "rock"], "paper"), config);
    const left = chooseNeuralAdaptiveCue("rock", state, config, "same-seed", 5);
    const right = chooseNeuralAdaptiveCue("rock", state, config, "same-seed", 5);
    const differentRound = chooseNeuralAdaptiveCue("rock", state, config, "same-seed", 6);

    expect(left).toEqual(right);
    expect(left.strength).toBeGreaterThanOrEqual(0.1);
    expect(left.strength).toBeLessThanOrEqual(5);
    expect(["rock", "paper", "scissors"]).toContain(left.cueChoice);
    expect(differentRound.explorationActive === left.explorationActive && differentRound.cueChoice === left.cueChoice).toBeTypeOf("boolean");

    const offPlan = chooseNeuralAdaptiveCue("scissors", createInitialNeuralStrategyAdaptationState({ ...config, enabled: false }), { ...config, enabled: false }, "seed", 1);
    expect(offPlan).toMatchObject({ cueChoice: "scissors", strength: 2, explorationActive: false });
  });

  it("exposes direct actions and plain-English controls without bypassing template interventions or exact parameters", () => {
    expect(neuralDirectActions.map((action) => action.id)).toEqual([
      "stimulate-random",
      "raise-inhibition",
      "stimulate-selected-neuron",
      "stimulate-selected-cluster",
      "silence-selected-cluster",
      "stimulate-rock",
      "stimulate-paper",
      "stimulate-scissors",
      "toggle-external-stimulus",
      "reset-activity",
      "regenerate-network",
      "show-advanced-config"
    ]);
    expect(neuralDirectActions.filter((action) => action.interventionId).every((action) => action.interventionId?.startsWith("neural."))).toBe(true);
    expect(neuralPlainEnglishControls.map((control) => control.label)).toEqual([
      "Network structure",
      "Excitation balance",
      "Timing",
      "Noise and external stimulus",
      "Decision readout"
    ]);
    expect(neuralPlainEnglishControls.flatMap((control) => control.options).every((option) => Object.keys(option.parameterPatch).length > 0)).toBe(true);
    expect(neuralStrategyAdaptationPlainControls.map((control) => control.label)).toEqual([
      "Learning speed",
      "Exploration",
      "Memory length",
      "Adaptation strength"
    ]);
    expect(neuralStrategyAdaptationPlainControls.flatMap((control) => control.options).every((option) => Object.keys(option.configPatch).length > 0)).toBe(true);
  });

  it("renders source-level boundaries, accessibility hooks, bounded histories, and no cognition-training controls", () => {
    const component = source("src/components/NeuralRuntimeLabPanel.tsx");
    const parameterPanel = source("src/components/ParameterPanel.tsx");
    const runSettings = source("src/components/RunSettingsPanel.tsx");
    const leftStack = source("src/components/LeftInstrumentStack.tsx");
    const helper = source("src/components/neuralRuntimeLab.ts");

    for (const phrase of neuralRuntimeLabBoundaryCopy) {
      expect(helper).toContain(phrase);
    }
    expect(component).toContain("Adaptive RPS Challenge");
    expect(component).toContain("Start adaptive challenge");
    expect(component).toContain("Pause challenge");
    expect(component).toContain("Reset learned strategy");
    expect(component).toContain("Clear round history");
    expect(component).toContain("strategyResetAfterRoundRef.current = nextNeuralRpsRoundIndex(rpsRoundsRef.current) - 1");
    expect(component).toContain("roundsSinceStrategyReset(nextRounds)");
    expect(component).toContain("roundsAfterNeuralStrategyReset(rounds, strategyResetAfterRoundRef.current)");
    expect(component).toContain("const nextRoundIndex = nextNeuralRpsRoundIndex(rpsRoundsRef.current)");
    expect(component).toContain("Local learned strategy state is not cleared unless Reset learned strategy is used.");
    expect(component).toContain("Enable adaptation");
    expect(component).toContain("Show adaptation details");
    expect(component).toContain("Hide adaptation details");
    expect(component).toContain("aria-expanded={detailsOpen}");
    expect(helper).toContain(neuralStrategyRandomPlayBoundary);
    expect(helper).toContain(neuralStrategyAdaptationMetricsBoundary);
    expect(component).toContain("neuralStrategyRandomPlayBoundary");
    expect(component).toContain("neuralStrategyAdaptationMetricsBoundary");
    expect(component).toContain(
      "Apply setup rebuilds a fresh tick-0 Neural run and discards the current tick, metric trace, selection, intervention target, and intervention history."
    );
    expect(leftStack).toContain("<NeuralRuntimeLabPanel />");
    expect(runSettings).toContain("aria-expanded={allParametersOpen}");
    expect(runSettings).toContain('aria-controls="all-model-parameters"');
    expect(runSettings).toContain('id="neural-advanced-config-toggle"');
    expect(runSettings).toContain("ortus:open-neural-advanced-config");
    expect(parameterPanel).toContain("getTemplateDescriptor(selectedTemplateId).template.parameterDefinitions.filter");
    expect(component).toContain('aria-label="Neural lab scenarios"');
    expect(component).toContain('aria-label="Live neural explanation"');
    expect(component).toContain('aria-label="Neural lab timeline"');
    expect(component).toContain('aria-describedby={disabledReason ? `neural-action-${action.id}-reason` : undefined}');
    expect(component).toContain('aria-label="Enable adaptation"');
    expect(component).toContain('aria-label="Reset learned strategy"');
    expect(component).toContain('aria-label="Clear local RPS history"');
    expect(component).toContain('aria-controls="neural-adaptation-details"');
    expect(component).toContain('<ol className="neural-lab-timeline">');
    expect(component).toContain('<ol className="neural-lab-rps__history" aria-label="RPS round history">');
    expect(helper).toContain("neuralRuntimeLabTimelineLimit = 60");
    expect(helper).toContain("neuralRuntimeLabRpsHistoryLimit = 200");

    expect(component).not.toMatch(/>\s*(Train network|Learn opponent|Think|Mind read|Predict your intent|Train brain)\s*</i);
    expect(component + helper).not.toMatch(/learning your personality|brain learning|real neural plasticity/i);
    expect(component + helper).not.toMatch(/from ["'][^"']*(builder|modelSchema|visualBuilderWorkspace|schemaTemplateCompatibility|socialLearning)/);
    expect(component + helper).not.toMatch(/eval\(|new Function|Math\.random|openai|chatCompletion|embedding/i);
  });

  it("keeps production build inputs local and avoids leaking tests into production imports", () => {
    const layout = source("src/app/layout.tsx");
    const globals = source("src/app/globals.css");
    expect(layout).not.toContain("next/font/google");
    expect(layout).not.toContain("Google Fonts");
    expect(globals).toContain('var(--font-space-grotesk, "Space Grotesk")');
    expect(globals).toContain('var(--font-ibm-plex-sans, "IBM Plex Sans")');
    expect(globals).toContain('var(--font-ibm-plex-mono, "IBM Plex Mono")');

    for (const path of sourceFiles("src")) {
      if (path.endsWith(".test.ts") || path.endsWith(".test.tsx") || path.includes("/__tests__/")) {
        continue;
      }
      expect(source(path), path).not.toMatch(/from ["'][^"']*\.test["']|from ["'][^"']*__tests__[^"']*["']/);
    }
  });

  it("keeps the Neural Runtime Lab helper browser-free and bounded to view-model logic", () => {
    const helper = source("src/components/neuralRuntimeLab.ts");
    const component = source("src/components/NeuralRuntimeLabPanel.tsx");
    expect(helper).not.toMatch(
      /\b(document|navigator|localStorage|sessionStorage|HTMLElement|HTMLCanvasElement)\s*[.[\]]|typeof\s+window|window\.(document|localStorage|sessionStorage|navigator|requestAnimationFrame|dispatchEvent|addEventListener|removeEventListener)/
    );
    expect(helper).not.toMatch(/Date\.now|crypto\.randomUUID|Math\.random|node:/);
    expect(component).not.toContain("dangerouslySetInnerHTML");
    expect(component).not.toMatch(/from ["']node:/);
    expect(component).not.toMatch(/import\(/);
  });
});

function fakeTimeline(count: number) {
  return Array.from({ length: count }, (_, index) => ({
    id: `event-${index}`,
    tick: index,
    kind: "run" as const,
    label: `event ${index}`,
    detail: "bounded"
  }));
}

function fakeRounds(count: number): NeuralRpsRound[] {
  return Array.from({ length: count }, (_, index) => ({
    id: `round-${index}`,
    roundIndex: index + 1,
    tick: index,
    userChoice: "rock" as const,
    networkChoice: index % 2 === 0 ? "rock" : "paper",
    opponentChoice: "rock" as const,
    outcome: index % 2 === 0 ? ("draw" as const) : ("win" as const),
    payoff: index % 2 === 0 ? 0 : 1,
    readoutConfidence: 0.5,
    winnerMargin: 0.2,
    confidence: 0.5,
    explorationActive: false
  }));
}

function scriptedRounds(choices: readonly NeuralRpsChoice[], networkChoice: NeuralRpsChoice): NeuralRpsRound[] {
  return choices.map((choice, index) => {
    const outcome =
      networkChoice === choice
        ? ("draw" as const)
        : (networkChoice === rpsCounterChoice(choice) ? ("win" as const) : ("loss" as const));
    return {
      id: `scripted-${index}`,
      roundIndex: index + 1,
      tick: index + 1,
      userChoice: choice,
      networkChoice,
      opponentChoice: choice,
      outcome,
      payoff: outcome === "win" ? 1 : outcome === "loss" ? -1 : 0,
      readoutConfidence: 0.75,
      winnerMargin: 0.4,
      confidence: 0.75,
      explorationActive: false
    };
  });
}

function sourceFiles(root: string): string[] {
  const entries = readdirSync(join(repoRoot, root));
  return entries.flatMap((entry) => {
    const path = join(root, entry);
    const absolutePath = join(repoRoot, path);
    const stats = statSync(absolutePath);
    if (stats.isDirectory()) {
      return sourceFiles(path);
    }
    return path.endsWith(".ts") || path.endsWith(".tsx") ? [path] : [];
  });
}
