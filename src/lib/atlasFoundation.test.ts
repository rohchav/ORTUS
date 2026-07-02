import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  atlasBoundarySummaries,
  atlasCapabilityLegendState,
  atlasEvidenceStates,
  atlasFoundationSummary,
  atlasMapRegionStates,
  getAtlasEvidenceStateById
} from "./atlasFoundation";

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

describe("Atlas foundation semantics", () => {
  it("defines unique evidence states with explicit evidence category semantics", () => {
    expect(atlasEvidenceStates.map((state) => state.id)).toEqual([
      "unsampled",
      "sampled",
      "unresolved",
      "supported-within-model",
      "contradicted-within-model",
      "unsupported",
      "externally-unvalidated"
    ]);
    expect(new Set(atlasEvidenceStates.map((state) => state.id)).size).toBe(atlasEvidenceStates.length);
    expect(atlasEvidenceStates.every((state) => state.category === "evidence")).toBe(true);
    expect(atlasEvidenceStates.map((state) => state.state)).toEqual([
      "unresolved",
      "unresolved",
      "unresolved",
      "supported",
      "contradicted",
      "unsupported",
      "unverified"
    ]);
    expect(getAtlasEvidenceStateById("supported-within-model")).toMatchObject({
      category: "evidence",
      state: "supported"
    });
  });

  it("keeps future-only as capability status, not evidence support", () => {
    expect(atlasCapabilityLegendState).toMatchObject({
      label: "Future-only",
      category: "capability",
      state: "future-only"
    });
    expect(atlasEvidenceStates.map((state) => state.state)).not.toContain("future-only");
    expect(atlasEvidenceStates.map((state) => state.label)).not.toContain("Future-only");
    expect(atlasEvidenceStates.map((state) => state.state)).not.toContain("observed");
  });

  it("keeps sampled as a future model-space concept rather than current observed data", () => {
    expect(getAtlasEvidenceStateById("sampled")).toMatchObject({
      category: "evidence",
      state: "unresolved"
    });
    expect(getAtlasEvidenceStateById("sampled").summary).toContain("would need source-backed model-run evidence");
    expect(getAtlasEvidenceStateById("sampled").interpretation).toContain("not current data");
  });

  it("keeps supported, contradicted, and unsupported as evidence states rather than operational states", () => {
    for (const id of ["supported-within-model", "contradicted-within-model", "unsupported"] as const) {
      expect(getAtlasEvidenceStateById(id).category).toBe("evidence");
    }
    expect(atlasEvidenceStates.map((state) => state.category)).not.toContain("operational");
    expect(atlasBoundarySummaries.map((summary) => summary.category)).not.toContain("operational");
  });

  it("defines only non-persistent foundation objects without record, storage, time, or generated id fields", () => {
    const allKeys = collectKeys([atlasFoundationSummary, atlasEvidenceStates, atlasCapabilityLegendState, atlasMapRegionStates, atlasBoundarySummaries]);
    const forbiddenKeyPattern =
      /^(storageKey|localStorageKey|database|recordId|discoveryId|evidenceId|runHistoryId|savedCount|recentItems|timestamp|createdAt|updatedAt|fingerprint|uuid)$/i;

    expect(allKeys.filter((key) => forbiddenKeyPattern.test(key))).toEqual([]);
    expect(atlasFoundationSummary.currentBoundary).toContain("Atlas is a non-persistent foundation in GW4.");
    expect(atlasFoundationSummary.nonPersistenceBoundary).toContain("Nothing on this Atlas route is a saved discovery");
  });

  it("keeps Atlas route and source free of storage APIs, timestamps, random ids, fake scores, and fake map data", () => {
    const atlasSources = ["src/lib/atlasFoundation.ts", "src/app/atlas/page.tsx"].map(source).join("\n");
    expect(atlasSources).not.toMatch(/localStorage|sessionStorage|IndexedDB|indexedDB|cookie|database|Date\.now|Math\.random|crypto\.randomUUID|uuid|fingerprint/i);
    expect(atlasSources).not.toMatch(/evidenceScore|scoreValue|coveragePercent|sampledRegionCount|regimeConfidence|recentActivity/i);
    expect(atlasSources).not.toMatch(/export\s+interface\s+.*Record|type\s+.*Record\s*=/);
  });

  it("keeps route contracts unchanged while distinguishing Lab future-only from Atlas foundation", () => {
    const destinationSource = source("src/lib/researchDestinations.ts");
    expect(destinationSource).toContain('id: "atlas"');
    expect(destinationSource).toContain('availability: "foundation"');
    expect(destinationSource).toContain('state: "planning-only"');
    expect(destinationSource).toContain('id: "lab"');
    expect(destinationSource).toContain('availability: "future-only"');
    expect(destinationSource).not.toContain('route: "/world"');
    expect(destinationSource).not.toContain('route: "/workshop"');
  });
});
