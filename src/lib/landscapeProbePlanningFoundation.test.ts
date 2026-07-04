import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  getLandscapeProbeConstraintById,
  getLandscapeProbePlanConceptById,
  landscapeProbeAxisCandidates,
  landscapeProbeBoundaries,
  landscapeProbeConstraints,
  landscapeProbeOutcomeCandidates,
  landscapeProbePlanConcepts,
  landscapeProbePlanningFoundation,
  landscapeProbePlanningSummary
} from "./landscapeProbePlanningFoundation";
import { getCanonicalResearchDestinationRoutes } from "./researchDestinations";

const repoRoot = process.cwd();

function source(path: string): string {
  return readFileSync(join(repoRoot, path), "utf8");
}

function collectKeys(value: unknown): string[] {
  if (!value || typeof value !== "object") {
    return [];
  }
  if (Array.isArray(value)) {
    return value.flatMap(collectKeys);
  }
  return Object.entries(value).flatMap(([key, child]) => [key, ...collectKeys(child)]);
}

describe("Landscape probe planning foundation semantics", () => {
  it("defines unique probe concepts, candidate axes, outcomes, constraints, and boundaries", () => {
    expect(landscapeProbePlanningFoundation.title).toBe("Landscape Probe Planning");
    expect(new Set(landscapeProbePlanConcepts.map((concept) => concept.id)).size).toBe(landscapeProbePlanConcepts.length);
    expect(new Set(landscapeProbeAxisCandidates.map((axis) => axis.id)).size).toBe(landscapeProbeAxisCandidates.length);
    expect(new Set(landscapeProbeOutcomeCandidates.map((outcome) => outcome.id)).size).toBe(landscapeProbeOutcomeCandidates.length);
    expect(new Set(landscapeProbeConstraints.map((constraint) => constraint.id)).size).toBe(landscapeProbeConstraints.length);
    expect(new Set(landscapeProbeBoundaries.map((boundary) => boundary.id)).size).toBe(landscapeProbeBoundaries.length);
    expect(landscapeProbePlanConcepts.map((concept) => concept.id)).toEqual([
      "probe-intent",
      "candidate-parameter-axis",
      "candidate-outcome-measure",
      "candidate-range",
      "candidate-constraint",
      "sampling-intent",
      "planned-comparison",
      "unresolved-feasibility",
      "externally-unvalidated-hypothesis",
      "non-executable-plan",
      "future-sampled-probe"
    ]);
  });

  it("uses UX2 capability and evidence semantics without operational or interaction states", () => {
    const statuses = [
      landscapeProbePlanningFoundation.status,
      ...landscapeProbePlanConcepts.map((concept) => concept.status),
      ...landscapeProbeAxisCandidates.map((axis) => axis.status),
      ...landscapeProbeOutcomeCandidates.map((outcome) => outcome.status),
      ...landscapeProbeConstraints.map((constraint) => constraint.status),
      landscapeProbePlanningSummary.status,
      ...landscapeProbeBoundaries.map((boundary) => boundary.status)
    ];

    expect(statuses.map((status) => status.category)).not.toContain("operational");
    expect(statuses.map((status) => status.category)).not.toContain("interaction");
    for (const status of statuses) {
      expect(["capability", "evidence"]).toContain(status.category);
      expect(["unresolved", "planning-only", "future-only"]).toContain(status.state);
    }
  });

  it("locks required planning distinctions to non-runtime interpretations", () => {
    expect(getLandscapeProbePlanConceptById("probe-intent").distinction).toBe("Probe plan is not an executed probe.");
    expect(getLandscapeProbePlanConceptById("candidate-parameter-axis").distinction).toBe(
      "Candidate axis is not a sampled parameter."
    );
    expect(getLandscapeProbePlanConceptById("candidate-range").distinction).toBe("Candidate range is not an explored range.");
    expect(getLandscapeProbePlanConceptById("candidate-outcome-measure").distinction).toBe(
      "Planned outcome is not observed evidence."
    );
    expect(getLandscapeProbePlanConceptById("sampling-intent").distinction).toBe("Sampling intent is not a sampling result.");
    expect(getLandscapeProbePlanConceptById("externally-unvalidated-hypothesis").distinction).toBe(
      "Model hypothesis is not a real-world claim."
    );
    expect(getLandscapeProbePlanConceptById("non-executable-plan").distinction).toBe("Planning scaffold is not a run queue.");
    expect(getLandscapeProbePlanConceptById("future-sampled-probe").distinction).toBe("Future-only is not locked progression.");
  });

  it("keeps the conceptual probe plan non-executable, non-persistent, and unsampled", () => {
    expect(landscapeProbePlanningSummary.label).toBe("Conceptual probe plan - not executable and not saved.");
    expect(landscapeProbePlanningSummary.status).toMatchObject({
      category: "capability",
      state: "future-only"
    });
    expect(landscapeProbePlanningSummary.boundary).toContain("no selected parameter values");
    expect(landscapeProbePlanningSummary.boundary).toContain("no samples");
    expect(landscapeProbePlanningSummary.boundary).toContain("no run queue");
    expect(landscapeProbePlanningSummary.boundary).toContain("no saved plan");
    expect(landscapeProbePlanningSummary.boundary).toContain("no probe result");
    expect(landscapeProbePlanningSummary.boundary).toContain("no detected regime");
    expect(landscapeProbePlanningFoundation.principle).toContain("It is not a sampled landscape");
    expect(landscapeProbePlanningFoundation.boundary).toContain("does not execute probes");
  });

  it("keeps future execution prerequisites as constraints, not capability claims", () => {
    expect(getLandscapeProbeConstraintById("template-capability-boundary").boundary).toBe(
      "Template capability is not inferred from a planning idea."
    );
    expect(getLandscapeProbeConstraintById("provenance-requirement").boundary).toBe(
      "GW8 stores no provenance record because no probe is executed or saved."
    );
    expect(getLandscapeProbeConstraintById("sampling-design-requirement").boundary).toBe(
      "GW8 does not create a sampler, run queue, job queue, or batch execution path."
    );
    expect(getLandscapeProbeConstraintById("external-validation-gap").boundary).toBe(
      "A planned probe does not support real-world claims."
    );
  });

  it("defines no persistence, generated ids, storage keys, timestamps, or fake result fields", () => {
    const allKeys = collectKeys(landscapeProbePlanningFoundation);
    const forbiddenKeyPattern =
      /^(storageKey|localStorageKey|database|probePlanId|planId|recordId|evidenceId|discoveryId|runQueueId|jobQueueId|sampleId|sampledResultId|savedCount|recentItems|timestamp|createdAt|updatedAt|fingerprint|uuid|confidenceScore|evidenceScore|scoreValue|coveragePercentage|coveragePercent|readyToRun|ownerId|assigneeId)$/i;

    expect(allKeys.filter((key) => forbiddenKeyPattern.test(key))).toEqual([]);
    expect(JSON.stringify(landscapeProbePlanningFoundation)).not.toMatch(/Date\.now|Math\.random|crypto\.randomUUID|uuid|fingerprint/i);
    expect(JSON.stringify(landscapeProbePlanningFoundation)).not.toMatch(
      /confidence score|evidence score|coverage percentage|coverage percent|ready to run|probe complete|sample count/i
    );
  });

  it("keeps route contracts and production surfaces bounded to Atlas route integration", () => {
    expect(getCanonicalResearchDestinationRoutes()).toEqual(["/", "/lab", "/atlas", "/builder"]);
    expect(getCanonicalResearchDestinationRoutes()).not.toContain("/world");
    expect(getCanonicalResearchDestinationRoutes()).not.toContain("/workshop");

    const unaffectedSources = ["src/app/page.tsx", "src/app/lab/page.tsx", "src/app/builder/page.tsx"].map(source).join("\n");
    expect(unaffectedSources).not.toMatch(/landscapeProbePlanningFoundation|landscapeProbePlanConcepts|LandscapeProbePlanning/i);
  });

  it("keeps implementation source free of storage APIs, random ids, runtime coupling, and fake execution actions", () => {
    const productionSources = ["src/lib/landscapeProbePlanningFoundation.ts", "src/app/atlas/page.tsx"].map(source).join("\n");
    expect(productionSources).not.toMatch(
      /localStorage|sessionStorage|IndexedDB|indexedDB|document\.cookie|database|Date\.now|Math\.random|crypto\.randomUUID|fingerprint/i
    );
    expect(productionSources).not.toMatch(
      /\b(runProbe|runSweep|executeProbe|batchSimulation|detectRegime|createDiscovery|saveProbe|saveLandscape|saveMap|sendToLab|publishToAtlas)\b/i
    );
    expect(productionSources).not.toMatch(/createEngine|templateRegistry|useSimulationStore|SimulationEngine|compiler|interpreter/i);
  });
});
