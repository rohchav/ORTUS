import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  behavioralLandscapeFoundation,
  getLandscapeConceptById,
  getLandscapeRegionStateById,
  landscapeAxes,
  landscapeBoundaries,
  landscapeConcepts,
  landscapeRegionStates,
  landscapeScaffoldSummary
} from "./behavioralLandscapeFoundation";
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

describe("Behavioral landscape foundation semantics", () => {
  it("defines unique landscape concepts, axes, regions, and boundaries", () => {
    expect(behavioralLandscapeFoundation.title).toBe("Behavioral Landscape Foundation");
    expect(new Set(landscapeConcepts.map((concept) => concept.id)).size).toBe(landscapeConcepts.length);
    expect(new Set(landscapeAxes.map((axis) => axis.id)).size).toBe(landscapeAxes.length);
    expect(new Set(landscapeRegionStates.map((region) => region.id)).size).toBe(landscapeRegionStates.length);
    expect(new Set(landscapeBoundaries.map((boundary) => boundary.id)).size).toBe(landscapeBoundaries.length);
    expect(landscapeConcepts.map((concept) => concept.id)).toEqual([
      "behavioral-landscape",
      "parameter-space",
      "outcome-space",
      "model-condition",
      "sampled-area",
      "unsampled-area",
      "unresolved-region",
      "model-regime",
      "transition-zone",
      "sensitivity-zone",
      "externally-unvalidated-area",
      "conceptual-scaffold",
      "future-sampled-landscape"
    ]);
  });

  it("uses UX2 capability and evidence semantics without operational states", () => {
    const statuses = [
      behavioralLandscapeFoundation.status,
      ...landscapeAxes.map((axis) => axis.status),
      ...landscapeConcepts.map((concept) => concept.status),
      ...landscapeRegionStates.map((region) => region.status),
      ...landscapeBoundaries.map((boundary) => boundary.status)
    ];

    expect(statuses.map((status) => status.category)).not.toContain("operational");
    expect(statuses.map((status) => status.category)).not.toContain("interaction");
    for (const status of statuses) {
      expect(["capability", "evidence"]).toContain(status.category);
      expect(["supported", "contradicted", "unresolved", "planning-only", "future-only"]).toContain(status.state);
    }
  });

  it("keeps future sampled landscape as capability future-only rather than evidence support", () => {
    expect(getLandscapeConceptById("future-sampled-landscape").status).toMatchObject({
      label: "Future-only",
      category: "capability",
      state: "future-only"
    });
    expect(getLandscapeRegionStateById("future-sampled-landscape").status).toMatchObject({
      label: "Future-only",
      category: "capability",
      state: "future-only"
    });
    expect(getLandscapeRegionStateById("future-sampled-landscape").interpretation).toContain("not evidence support");
  });

  it("keeps externally unvalidated areas unresolved and non-empirical", () => {
    expect(getLandscapeConceptById("externally-unvalidated-area").status).toMatchObject({
      category: "evidence",
      state: "unresolved"
    });
    expect(getLandscapeRegionStateById("externally-unvalidated").status).toMatchObject({
      category: "evidence",
      state: "unresolved"
    });
    expect(getLandscapeRegionStateById("externally-unvalidated").interpretation).toContain("Model output is not empirical truth");
  });

  it("frames supported and contradicted regions as future source-backed model-space evidence only", () => {
    expect(getLandscapeRegionStateById("supported-within-model")).toMatchObject({
      status: { category: "evidence", state: "supported" }
    });
    expect(getLandscapeRegionStateById("contradicted-within-model")).toMatchObject({
      status: { category: "evidence", state: "contradicted" }
    });
    expect(getLandscapeRegionStateById("supported-within-model").summary).toContain("Future source-backed model evidence");
    expect(getLandscapeRegionStateById("supported-within-model").interpretation).toContain("not empirical proof");
    expect(getLandscapeRegionStateById("contradicted-within-model").interpretation).toContain("not a software failure");
  });

  it("keeps conceptual scaffold separate from run data and sampled maps", () => {
    expect(landscapeScaffoldSummary.label).toBe("Conceptual scaffold - not sampled run data.");
    expect(landscapeScaffoldSummary.status).toMatchObject({
      category: "capability",
      state: "future-only"
    });
    expect(landscapeScaffoldSummary.boundary).toContain("no data points");
    expect(landscapeScaffoldSummary.boundary).toContain("no persisted areas");
    expect(behavioralLandscapeFoundation.principle).toContain("It is not a real-world map");
    expect(behavioralLandscapeFoundation.boundary).toContain("does not create saved landscapes");
  });

  it("defines no persistence, generated ids, storage keys, timestamps, or fake data fields", () => {
    const allKeys = collectKeys(behavioralLandscapeFoundation);
    const forbiddenKeyPattern =
      /^(storageKey|localStorageKey|database|landscapeId|recordId|evidenceId|discoveryId|runHistoryId|savedCount|recentItems|timestamp|createdAt|updatedAt|fingerprint|uuid|confidenceScore|evidenceScore|coveragePercentage)$/i;

    expect(allKeys.filter((key) => forbiddenKeyPattern.test(key))).toEqual([]);
    expect(JSON.stringify(behavioralLandscapeFoundation)).not.toMatch(/Date\.now|Math\.random|crypto\.randomUUID|uuid|fingerprint/i);
    expect(JSON.stringify(behavioralLandscapeFoundation)).not.toMatch(/confidence score|evidence score|coverage percentage/i);
  });

  it("keeps route contracts and production surfaces bounded to Atlas route integration", () => {
    expect(getCanonicalResearchDestinationRoutes()).toEqual(["/", "/lab", "/atlas", "/builder"]);
    expect(getCanonicalResearchDestinationRoutes()).not.toContain("/world");
    expect(getCanonicalResearchDestinationRoutes()).not.toContain("/workshop");

    const worldAndBuilderSources = ["src/app/page.tsx", "src/app/builder/page.tsx"].map(source).join("\n");
    expect(worldAndBuilderSources).not.toMatch(/behavioralLandscapeFoundation|landscapeRegionStates|landscapeAxes/i);
  });

  it("keeps implementation source free of storage APIs, random ids, runtime coupling, and fake execution", () => {
    const productionSources = ["src/lib/behavioralLandscapeFoundation.ts", "src/app/atlas/page.tsx"].map(source).join("\n");
    expect(productionSources).not.toMatch(/localStorage|sessionStorage|IndexedDB|indexedDB|document\.cookie|database|Date\.now|Math\.random|crypto\.randomUUID|uuid|fingerprint/i);
    expect(productionSources).not.toMatch(/runSweep|batchSimulation|detectRegime|createDiscovery|saveLandscape|saveMap|sendToLab|publishToAtlas/i);
    expect(productionSources).not.toMatch(/createEngine|templateRegistry|useSimulationStore|SimulationEngine|execute|compiler|interpreter/i);
  });
});
