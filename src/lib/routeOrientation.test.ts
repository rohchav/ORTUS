import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { getRouteOrientation, routeOrientations } from "./routeOrientation";

const repoRoot = process.cwd();

function source(path: string): string {
  return readFileSync(join(repoRoot, path), "utf8");
}

describe("UX5 route orientation and disclosure contracts", () => {
  it("defines one plain-language orientation for every canonical destination", () => {
    expect(routeOrientations.map((orientation) => orientation.destinationId)).toEqual(["world", "workshop", "lab", "atlas"]);

    for (const orientation of routeOrientations) {
      expect(orientation.routeName.length).toBeGreaterThan(0);
      expect(orientation.purpose.length).toBeGreaterThan(20);
      expect(orientation.startHere.length).toBeGreaterThan(20);
      expect(orientation.boundary.length).toBeGreaterThan(20);
      expect(orientation.technicalDetails.length).toBeGreaterThan(0);
      expect(getRouteOrientation(orientation.destinationId)).toBe(orientation);
    }
  });

  it("keeps the Lab and Atlas non-persistence and non-execution boundaries exact", () => {
    expect(getRouteOrientation("lab").boundary).toBe(
      "Nothing on this route is a saved experiment, evidence record, notebook, or run history."
    );
    expect(getRouteOrientation("atlas").boundary).toBe(
      "No sampled landscape, saved map, probe execution, regime detection, or discovery record exists here yet."
    );
    expect(getRouteOrientation("world").boundary).toBe(
      "Model output describes this simulation, not automatically the real world."
    );
    expect(getRouteOrientation("workshop").boundary).toBe("A valid structure is not automatically runnable.");
  });

  it("keeps required technical vocabulary one disclosure away without redefining it", () => {
    const technicalCopy = routeOrientations
      .flatMap((orientation) => orientation.technicalDetails.map((detail) => `${detail.plainLanguage}: ${detail.technicalLanguage}`))
      .join("\n");

    expect(technicalCopy).toContain("Active local run");
    expect(technicalCopy).toContain("Deterministic seed");
    expect(technicalCopy).toContain("Engine snapshot restore point");
    expect(technicalCopy).toContain("ortus.modelSchema structural artifact");
    expect(technicalCopy).toContain("ortus.visualBuilderWorkspace artifact");
    expect(technicalCopy).toContain("Structural compatibility summary, not conversion");
    expect(technicalCopy).toContain("Non-runnable scenario-planning artifact");
    expect(technicalCopy).toContain("Model-behavior evidence state");
    expect(technicalCopy).toContain("Behavioral landscape");
    expect(technicalCopy).toContain("Non-executable landscape probe plan");
  });

  it("uses component-local disclosure state with accessible button semantics and no persistence", () => {
    const disclosure = source("src/components/ui/Disclosure.tsx");
    const orientationPanel = source("src/components/researchWorld/RouteOrientationPanel.tsx");
    const capabilityPanel = source("src/components/researchWorld/CapabilityGuidancePanel.tsx");
    const productionSource = [disclosure, orientationPanel, capabilityPanel, source("src/lib/routeOrientation.ts")].join("\n");

    expect(disclosure).toContain("useState(false)");
    expect(disclosure).toContain("aria-expanded={expanded}");
    expect(disclosure).toContain("aria-controls={resolvedContentId}");
    expect(disclosure).toContain("hidden={!expanded}");
    expect(orientationPanel).toContain('expandLabel="Technical details"');
    expect(capabilityPanel).toContain('expandLabel="Show all capabilities"');
    expect(productionSource).not.toMatch(
      /localStorage|sessionStorage|indexedDB|document\.cookie|createJSONStorage|storageKey|persist\(|Date\.now|Math\.random|crypto\.randomUUID/i
    );
    expect(productionSource).not.toMatch(/simulationStore|createEngine|runFrameSteps|templateRegistry|compile|executeSchema|executeGraph/i);
  });

  it("does not turn orientation into guidance personalization, progression, or fake actions", () => {
    const copy = JSON.stringify(routeOrientations);
    expect(copy).not.toMatch(
      /recommended for you|personalized|achievement|\bxp\b|rank|streak|unlock|completion tracking|guided builder|AI-generated/i
    );
    expect(copy).not.toMatch(
      /Save this run|Send to Lab|Create evidence record|Publish to Atlas|Create discovery|Run probe now|Run sweep now|Generate model|Apply to simulation/i
    );
  });
});
