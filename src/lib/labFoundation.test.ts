import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  getLabRecordLifecycleStateById,
  labBoundarySummaries,
  labFoundationSummary,
  labLedgerScaffoldStates,
  labRecordLifecycleStates
} from "./labFoundation";

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

describe("Lab foundation semantics", () => {
  it("defines unique lifecycle states with explicit category and status semantics", () => {
    expect(labRecordLifecycleStates.map((state) => state.id)).toEqual([
      "draft-schema",
      "awaiting-capture",
      "not-persisted",
      "unresolved",
      "model-only",
      "externally-unvalidated",
      "comparison-not-implemented",
      "notebook-not-implemented",
      "future-only"
    ]);
    expect(new Set(labRecordLifecycleStates.map((state) => state.id)).size).toBe(labRecordLifecycleStates.length);
    expect(labRecordLifecycleStates.map((state) => `${state.category}/${state.state}`)).toEqual([
      "capability/future-only",
      "capability/future-only",
      "capability/future-only",
      "evidence/unresolved",
      "evidence/unresolved",
      "evidence/unverified",
      "capability/future-only",
      "capability/future-only",
      "capability/future-only"
    ]);
  });

  it("keeps future-only as capability status rather than evidence support", () => {
    for (const id of ["draft-schema", "awaiting-capture", "not-persisted", "comparison-not-implemented", "notebook-not-implemented", "future-only"] as const) {
      expect(getLabRecordLifecycleStateById(id)).toMatchObject({
        category: "capability",
        state: "future-only"
      });
    }
    expect(labRecordLifecycleStates.filter((state) => state.category === "evidence").map((state) => state.state)).not.toContain("future-only");
  });

  it("keeps model-only and externally unvalidated as evidence semantics rather than operational states", () => {
    expect(getLabRecordLifecycleStateById("model-only")).toMatchObject({
      category: "evidence",
      state: "unresolved"
    });
    expect(getLabRecordLifecycleStateById("externally-unvalidated")).toMatchObject({
      category: "evidence",
      state: "unverified"
    });
    expect(labRecordLifecycleStates.map((state) => state.category)).not.toContain("operational");
    expect(labBoundarySummaries.map((summary) => summary.category)).not.toContain("operational");
  });

  it("defines only non-persistent foundation objects without record, storage, time, or generated id fields", () => {
    const allKeys = collectKeys([labFoundationSummary, labRecordLifecycleStates, labLedgerScaffoldStates, labBoundarySummaries]);
    const forbiddenKeyPattern =
      /^(storageKey|localStorageKey|database|recordId|experimentId|evidenceId|runHistoryId|notebookId|savedCount|recentItems|timestamp|createdAt|updatedAt|fingerprint|uuid)$/i;

    expect(allKeys.filter((key) => forbiddenKeyPattern.test(key))).toEqual([]);
    expect(labFoundationSummary.currentBoundary).toContain("Lab is a non-persistent foundation in GW5.");
    expect(labFoundationSummary.nonPersistenceBoundary).toContain("Nothing on this Lab route is a saved experiment");
  });

  it("keeps Lab route and source free of storage APIs, timestamps, random ids, fake records, and fake scores", () => {
    const labSources = ["src/lib/labFoundation.ts", "src/app/lab/page.tsx"].map(source).join("\n");
    expect(labSources).not.toMatch(/localStorage|sessionStorage|IndexedDB|indexedDB|cookie|database|Date\.now|Math\.random|crypto\.randomUUID|uuid|fingerprint/i);
    expect(labSources).not.toMatch(/evidenceScore|scoreValue|confidenceScore|recentActivity|savedRunCount|savedExperimentCount|comparisonResult/i);
    expect(labSources).not.toMatch(/export\s+interface\s+.*Record\b|type\s+.*Record\s*=/);
  });

  it("keeps route contracts unchanged while distinguishing Lab foundation from Atlas foundation", () => {
    const destinationSource = source("src/lib/researchDestinations.ts");
    expect(destinationSource).toContain('id: "lab"');
    expect(destinationSource).toContain('availability: "foundation"');
    expect(destinationSource).toContain('state: "planning-only"');
    expect(destinationSource).toContain('id: "atlas"');
    expect(destinationSource).not.toContain('route: "/world"');
    expect(destinationSource).not.toContain('route: "/workshop"');
  });

  it("keeps Atlas non-persistent while adding no Lab-to-Atlas publication path", () => {
    const atlasSources = ["src/lib/atlasFoundation.ts", "src/app/atlas/page.tsx"].map(source).join("\n");
    const labSources = ["src/lib/labFoundation.ts", "src/app/lab/page.tsx"].map(source).join("\n");
    expect(atlasSources).toContain("Nothing on this Atlas route is a saved discovery");
    expect(labSources).toContain("GW5 Lab does not publish records to Atlas or create discoveries");
    expect(labSources).not.toMatch(/Publish to Atlas|Create discovery|Map evidence|saveToLab|sendToLab|recordEvidence/i);
  });
});
