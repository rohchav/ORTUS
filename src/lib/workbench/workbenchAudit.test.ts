import { readFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
  createEngineFromRunConfig,
  createEngineFromScenario,
  getProductionTemplate,
  patchScenarioParameters,
  runConfigFromScenario,
  supportsWorkerRuntime,
  validateScenario,
  type AuthoredScenario
} from "../../simulation";
import { useSimulationStore } from "../../state/simulationStore";
import {
  createAcceptedLegacyRunConfig,
  createStarterRemixWorldLaunch,
  readStarterRemixLineage,
  resolveStarterRemixRequest,
  runnableStarterWorlds,
  starterRemixLaunchMatchesRunConfig
} from "../starterWorlds";
import { starterWorldLaunchRecipesForWorld } from "../starterWorlds/packs";

const fixedNow = "2026-10-07T12:00:00.000Z";

function source(path: string): string {
  return readFileSync(join(process.cwd(), path), "utf8");
}

/** A modified derivative: one numeric parameter moved by one step inside its authoritative bounds. */
function modifiedRemixDraft(starterId: string): { draft: AuthoredScenario; key: string; value: number } {
  // Flagship worlds launch only through one of their prepared recipes.
  const recipeId = starterWorldLaunchRecipesForWorld(starterId)[0]?.id;
  const result = resolveStarterRemixRequest({ starterId, ...(recipeId ? { recipeId } : {}) }, { now: fixedNow });
  if (!result.ok) throw new Error(result.message);
  const template = getProductionTemplate(result.source.launch.templateId)!;
  const definition = template.parameterDefinitions.find((candidate) =>
    candidate.type === "number" && candidate.min !== undefined && candidate.max !== undefined && candidate.max > candidate.min
  )!;
  const current = Number(result.source.draft.parameters[definition.key] ?? definition.defaultValue);
  const step = definition.step ?? 0.1;
  const value = Number((current + step <= definition.max! ? current + step : current - step).toFixed(6));
  const draft = validateScenario(patchScenarioParameters(result.source.draft, { ...result.source.draft.parameters, [definition.key]: value })).scenario;
  return { draft, key: definition.key, value };
}

describe("S2B Visual Systems Workbench audit contracts", () => {
  afterEach(() => {
    useSimulationStore.getState().selectTemplate("epidemic-spread");
  });

  it("replays a modified Remix derivative identically for every runnable Starter at the same configuration and seed", () => {
    expect(runnableStarterWorlds).toHaveLength(11);
    for (const world of runnableStarterWorlds) {
      const { draft } = modifiedRemixDraft(world.id);
      const config = runConfigFromScenario(draft);
      const left = supportsWorkerRuntime(draft.templateId) ? createEngineFromRunConfig(config) : createEngineFromScenario(draft).engine;
      const right = supportsWorkerRuntime(draft.templateId) ? createEngineFromRunConfig(config) : createEngineFromScenario(draft).engine;
      expect(left).not.toBe(right);
      expect(left.createSnapshot().tick, world.id).toBe(0);
      expect(left.createSnapshot(), world.id).toEqual(right.createSnapshot());
      left.runSteps(12);
      right.runSteps(12);
      expect(left.snapshotExport(), world.id).toEqual(right.snapshotExport());
    }
  }, 30_000);

  it("Run Remix acceptance yields a paused tick-0 run that carries the modification and derivative lineage", () => {
    for (const world of runnableStarterWorlds) {
      const { draft, key, value } = modifiedRemixDraft(world.id);
      const launch = createStarterRemixWorldLaunch(draft);
      useSimulationStore.getState().applyScenario(draft);
      const state = useSimulationStore.getState();
      expect(state.lastError, world.id).toBeNull();
      expect(state.isRunning, world.id).toBe(false);
      const accepted = state.flockingRuntimeConfig ?? createAcceptedLegacyRunConfig({
        templateId: state.engine!.template.id,
        seed: state.engine!.seed,
        parameters: state.engine!.parameters,
        metadata: state.engine!.metadata
      });
      if (supportsWorkerRuntime(draft.templateId)) {
        // One Worker authority: the store queues configuration and owns no main-thread Flocking engine.
        expect(state.engine, world.id).toBeNull();
      } else {
        expect(state.latestSnapshot?.tick, world.id).toBe(0);
      }
      expect(accepted.parameters[key], world.id).toBe(value);
      expect(readStarterRemixLineage(accepted.metadata)?.draftId, world.id).toBe(launch.draftId);
      expect(starterRemixLaunchMatchesRunConfig(accepted, launch), world.id).toBe(true);
    }
  }, 30_000);

  it("describes Remix as changing supported properties, never pieces or what a system can do", () => {
    const orientation = [
      "src/components/builder/BuilderShell.tsx",
      "src/components/builder/BuilderExperienceTabs.tsx",
      "src/app/builder/page.tsx",
      "src/lib/routeOrientation.ts",
      "src/lib/researchDestinations.ts"
    ];
    for (const path of orientation) {
      expect(source(path), path).not.toMatch(/Change what it can do|remix supported pieces/i);
    }
    expect(source("src/components/builder/BuilderShell.tsx")).toContain("Remix its supported properties.");
    expect(source("src/lib/researchDestinations.ts")).toContain("Take apart working systems and remix supported properties.");
  });

  it("records the S2B verdicts, scope limits, and SA0 handoff", () => {
    const audit = source("docs/product/VISUAL_SYSTEMS_WORKBENCH_AUDIT.md");
    expect(audit).toContain("Status: S2B COMPLETE; SA0 NEXT / UNSTARTED");
    expect(audit).toContain("**Technical and authority result: accepted after two P2 fixes.** No P0 or P1 was found.");
    expect(audit).toContain("**Product and HCI result: accepted with recorded P3 items.**");
    expect(audit).toContain("The UR0 human comprehension gate remains pending.");
    expect(audit).toContain("S3 remains blocked, and general executable composition remains unimplemented.");
    for (const canonical of ["../CAPABILITIES.md", "../ARCHITECTURE.md", "../SCIENTIFIC_MODEL.md", "../ROADMAP.md"]) {
      expect(audit).toContain(canonical);
    }
  });

  it("keeps the Workbench presentation layer free of engine, store, Worker, and storage authority", () => {
    for (const path of [
      "src/lib/workbench/model.ts",
      "src/lib/workbench/materials.ts",
      "src/lib/workbench/types.ts",
      "src/components/builder/workbench/VisualSystemsWorkbench.tsx",
      "src/components/builder/workbench/WorkbenchGlyph.tsx"
    ]) {
      const text = source(path);
      expect(text, path).not.toMatch(/useSimulationStore|zustand|SimulationEngine|applyScenario|createEngineFrom|RuntimeDriver|new Worker|localStorage|sessionStorage|eval\(|new Function/);
    }
  });
});
