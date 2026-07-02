import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  capabilityGuidanceBoundary,
  capabilityGuidancePrinciple,
  capabilityGuidanceRouteContract,
  capabilityGuidanceSummaries,
  capabilityGuidanceVisibleBoundary,
  getCapabilityGuidanceByDestinationId,
  getCapabilityGuidanceByRoute,
  getCapabilityGuidanceCanonicalRoutes
} from "./capabilityGuidance";
import { getCanonicalResearchDestinationRoutes, researchDestinations } from "./researchDestinations";

const repoRoot = process.cwd();

describe("capability guidance source model", () => {
  it("defines one source-backed guidance summary per canonical destination route", () => {
    expect(capabilityGuidanceSummaries.map((guidance) => guidance.destinationId)).toEqual(["world", "workshop", "lab", "atlas"]);
    expect(capabilityGuidanceSummaries.map((guidance) => guidance.route)).toEqual(["/", "/builder", "/lab", "/atlas"]);
    expect(getCapabilityGuidanceCanonicalRoutes()).toEqual(["/", "/builder", "/lab", "/atlas"]);
    expect(new Set(getCapabilityGuidanceCanonicalRoutes())).toEqual(new Set(getCanonicalResearchDestinationRoutes()));
    expect(capabilityGuidanceRouteContract).toEqual([
      { destinationId: "world", route: "/", label: "World" },
      { destinationId: "workshop", route: "/builder", label: "Workshop" },
      { destinationId: "lab", route: "/lab", label: "Lab" },
      { destinationId: "atlas", route: "/atlas", label: "Atlas" }
    ]);
    expect(capabilityGuidanceRouteContract.map((contract) => contract.route)).not.toContain("/world");
    expect(capabilityGuidanceRouteContract.map((contract) => contract.route)).not.toContain("/workshop");

    for (const destination of researchDestinations) {
      const guidance = getCapabilityGuidanceByDestinationId(destination.id);
      expect(guidance.destinationLabel).toBe(destination.label);
      expect(guidance.route).toBe(destination.route);
      expect(guidance.routePurpose).toBe(destination.purpose);
      expect(getCapabilityGuidanceByRoute(destination.route)).toBe(guidance);
    }
  });

  it("keeps every destination explicit about available, planning-only, unavailable, and boundary semantics", () => {
    for (const guidance of capabilityGuidanceSummaries) {
      expect(guidance.availableHere.length, `${guidance.destinationId} available items`).toBeGreaterThan(0);
      expect(guidance.planningOnly.length, `${guidance.destinationId} planning items`).toBeGreaterThan(0);
      expect(guidance.notImplemented.length, `${guidance.destinationId} unavailable items`).toBeGreaterThan(0);
      expect(guidance.doNotAssume.length, `${guidance.destinationId} boundaries`).toBeGreaterThan(0);
      expect(guidance.relatedDestinations.length, `${guidance.destinationId} related destinations`).toBeGreaterThan(0);
    }
  });

  it("uses UX2 capability and evidence status semantics without operational guidance states", () => {
    for (const guidance of capabilityGuidanceSummaries) {
      for (const item of guidance.availableHere) {
        expect(item.availability).toBe("available");
        expect(item.status).toMatchObject({ label: "Available here", category: "capability", state: "supported" });
      }
      for (const item of guidance.planningOnly) {
        expect(item.availability).toBe("planning-only");
        expect(item.status).toMatchObject({ label: "Planning-only", category: "capability", state: "planning-only" });
      }
      for (const item of guidance.notImplemented) {
        expect(item.availability).toBe("not-implemented");
        expect(item.status).toMatchObject({ label: "Not implemented", category: "capability", state: "future-only" });
      }
      for (const boundary of guidance.doNotAssume) {
        expect(boundary.status.label).toBe("Do not assume");
        expect(["capability", "evidence"]).toContain(boundary.status.category);
        expect(["planning-only", "unresolved"]).toContain(boundary.status.state);
        expect(boundary.status.category).not.toBe("operational");
      }
    }
  });

  it("states the GW6 capability boundary without turning guidance into capability", () => {
    expect(capabilityGuidancePrinciple).toBe("Capability guidance describes current product capability. It does not create capability.");
    expect(capabilityGuidanceBoundary).toBe(
      "GW6 creates source-backed guidance and capability orientation. It does not create saved records, Atlas discoveries, Lab experiments, behavioral landscapes, progression, user-derived routing, or behavior-derived task ordering."
    );
    expect(capabilityGuidanceVisibleBoundary).toBe(
      "Guidance describes current ORTUS capabilities. It does not create saved records, validation, discoveries, or persistence."
    );
    for (const guidance of capabilityGuidanceSummaries) {
      expect(guidance.principle).toBe(capabilityGuidancePrinciple);
      expect(guidance.boundary).toBe(capabilityGuidanceBoundary);
      expect(guidance.visibleBoundary).toBe(capabilityGuidanceVisibleBoundary);
    }
  });

  it("keeps visible guidance free of personalized, progression, and fake-action language", () => {
    const visibleCopy = capabilityGuidanceSummaries
      .flatMap((guidance) => [
        guidance.principle,
        guidance.visibleBoundary,
        ...guidance.availableHere.map((item) => `${item.label} ${item.summary}`),
        ...guidance.planningOnly.map((item) => `${item.label} ${item.summary}`),
        ...guidance.notImplemented.map((item) => `${item.label} ${item.summary}`),
        ...guidance.doNotAssume.map((boundary) => `${boundary.label} ${boundary.summary}`),
        ...guidance.relatedDestinations.map((destination) => `${destination.label} ${destination.summary}`)
      ])
      .join("\n");

    expect(visibleCopy).not.toMatch(
      /recommended for you|next mission|unlocked|locked|achievement|\bxp\b|level|rank|streak|progress bar|complete this step|AI suggestion|smart recommendation|personalized|coach|assistant|recommender/i
    );
    expect(visibleCopy).not.toMatch(
      /Save this run|save run|Send to Lab|Create evidence record|Record experiment|Open notebook|Publish to Atlas|Create discovery|Map this run|Save to Atlas|Save discovery|evidence score|coverage percentage|confidence score/i
    );
  });

  it("keeps Lab and Atlas guidance non-persistent and non-validating", () => {
    const lab = getCapabilityGuidanceByDestinationId("lab");
    const atlas = getCapabilityGuidanceByDestinationId("atlas");

    expect(JSON.stringify(lab)).toMatch(/non-persistent/i);
    expect(JSON.stringify(lab)).toMatch(/Persistent evidence records.*not implemented/i);
    expect(JSON.stringify(lab)).toMatch(/not preserve run data/i);
    expect(JSON.stringify(lab)).toMatch(/would not certify real-world truth/i);

    expect(JSON.stringify(atlas)).toMatch(/non-persistent/i);
    expect(JSON.stringify(atlas)).toMatch(/Discovery Atlas records.*not implemented/i);
    expect(JSON.stringify(atlas)).toMatch(/does not contain sampled data or durable maps/i);
    expect(JSON.stringify(atlas)).toMatch(/do not certify discoveries about the real world/i);
  });

  it("does not add storage, time, random, fingerprint, or runtime coupling to the guidance sources", () => {
    const sourceFiles = [
      join(repoRoot, "src", "lib", "capabilityGuidance.ts"),
      join(repoRoot, "src", "components", "researchWorld", "CapabilityGuidancePanel.tsx")
    ];
    const combinedSource = sourceFiles.map((file) => readFileSync(file, "utf8")).join("\n");

    expect(combinedSource).not.toMatch(/localStorage|sessionStorage|indexedDB|document\.cookie|Date\.now|Math\.random|crypto\.randomUUID|uuid|fingerprint/i);
    expect(combinedSource).not.toMatch(/useState|useEffect|zustand|simulationStore|runFrameSteps|createEngine|templateRegistry/i);
    expect(combinedSource).not.toMatch(/dismiss|dismissed|analytics|telemetry|profileId|trackingId|userId/i);
  });
});
