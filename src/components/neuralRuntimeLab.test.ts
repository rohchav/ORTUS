import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { executeIntervention } from "../simulation/interventions/interventionExecutor";
import { SimulationEngine } from "../simulation/kernel/SimulationEngine";
import { neuralExcitationTemplate } from "../simulation/templates/neuralExcitation.template";
import {
  boundNeuralRpsRounds,
  boundNeuralTimelineEvents,
  createNeuralLabMission,
  createNeuralLiveExplanations,
  createNeuralRpsRound,
  deriveNeuralRuntimeEvents,
  neuralDirectActions,
  neuralLabScenarioCards,
  neuralPlainEnglishControls,
  neuralRuntimeLabBoundaryCopy,
  neuralRuntimeLabRpsHistoryLimit,
  neuralRuntimeLabTemplateId,
  neuralRuntimeLabTimelineLimit,
  neuralRpsDistribution
} from "./neuralRuntimeLab";

const repoRoot = process.cwd();

function source(path: string): string {
  return readFileSync(join(repoRoot, path), "utf8");
}

describe("Neural Runtime Lab UX view model", () => {
  it("defines scenario-first cards with explicit regeneration and no-learning boundaries", () => {
    expect(neuralLabScenarioCards.map((scenario) => scenario.title)).toEqual([
      "Watch a cascade spread",
      "Stabilize runaway excitation",
      "Make two clusters synchronize",
      "Break the network by removing/silencing a hub",
      "Rock-Paper-Scissors Readout Demo",
      "Stay unpredictable challenge shell"
    ]);

    for (const scenario of neuralLabScenarioCards) {
      expect(scenario.setupImpact).toMatch(/regenerates a fresh tick-0/i);
      expect(scenario.parameterPatch).toBeTypeOf("object");
    }
    expect(neuralLabScenarioCards.find((scenario) => scenario.id === "silence-hub")?.objective).toContain(
      "V1 does not support selected-edge or hub removal"
    );
    expect(neuralLabScenarioCards.find((scenario) => scenario.id === "stay-unpredictable")?.objective).toContain(
      "non-learning RPS history"
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

  it("keeps the RPS challenge shell observational, bounded, and distribution-only", () => {
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
        fixedOpponentChoice: "scissors"
      }
    });
    executeIntervention(engine, {
      templateId: neuralRuntimeLabTemplateId,
      interventionId: "neural.stimulateRockAssembly",
      parameters: { strength: 2 }
    });
    engine.runSteps(1);
    const round = createNeuralRpsRound(engine.createSnapshot(), "rock");

    expect(round).toMatchObject({ userChoice: "rock", networkChoice: "rock", opponentChoice: "scissors", outcome: "win", payoff: 1 });
    expect(boundNeuralRpsRounds(fakeRounds(80))).toHaveLength(neuralRuntimeLabRpsHistoryLimit);
    expect(neuralRpsDistribution([round!]).find((item) => item.choice === "rock")?.count).toBe(1);
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
  });

  it("renders source-level boundaries, accessibility hooks, bounded histories, and no training controls", () => {
    const component = source("src/components/NeuralRuntimeLabPanel.tsx");
    const parameterPanel = source("src/components/ParameterPanel.tsx");
    const leftStack = source("src/components/LeftInstrumentStack.tsx");
    const helper = source("src/components/neuralRuntimeLab.ts");

    for (const phrase of neuralRuntimeLabBoundaryCopy) {
      expect(helper).toContain(phrase);
    }
    expect(component).toContain("No adaptation is active. RPS payoff is recorded but does not change weights, biases, or future choices.");
    expect(component).toContain("Training and adaptation are deferred to Neural Strategy Adaptation V1.");
    expect(component).toContain(
      "Apply setup rebuilds a fresh tick-0 Neural run and discards the current tick, metric trace, selection, intervention target, and intervention history."
    );
    expect(leftStack).toContain("<NeuralRuntimeLabPanel />");
    expect(parameterPanel).toContain("aria-expanded={neuralAdvancedOpen}");
    expect(parameterPanel).toContain('aria-controls="neural-advanced-config-panel"');
    expect(parameterPanel).toContain("ortus:open-neural-advanced-config");
    expect(component).toContain('aria-label="Neural lab scenarios"');
    expect(component).toContain('aria-label="Live neural explanation"');
    expect(component).toContain('aria-label="Neural lab timeline"');
    expect(component).toContain('aria-describedby={disabledReason ? `neural-action-${action.id}-reason` : undefined}');
    expect(component).toContain('<ol className="neural-lab-timeline">');
    expect(component).toContain('<ol className="neural-lab-rps__history" aria-label="RPS round history">');
    expect(helper).toContain("neuralRuntimeLabTimelineLimit = 60");
    expect(helper).toContain("neuralRuntimeLabRpsHistoryLimit = 40");

    expect(component).not.toMatch(/>\s*(Train network|Learn opponent)\s*</i);
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
    expect(helper).not.toMatch(/\b(window|document|navigator|localStorage|sessionStorage|HTMLElement|HTMLCanvasElement)\b/);
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

function fakeRounds(count: number) {
  return Array.from({ length: count }, (_, index) => ({
    id: `round-${index}`,
    tick: index,
    userChoice: "rock" as const,
    networkChoice: index % 2 === 0 ? "rock" : "paper",
    opponentChoice: "scissors",
    outcome: index % 2 === 0 ? "win" : "loss",
    payoff: index % 2 === 0 ? 1 : -1,
    confidence: 0.5
  }));
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
