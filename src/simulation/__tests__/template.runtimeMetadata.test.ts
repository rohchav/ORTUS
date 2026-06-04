import { describe, expect, it } from "vitest";
import { validateTemplate } from "../kernel/Validation";
import { productionTemplateMap, productionTemplates } from "../templates/registry";

describe("template runtime performance metadata", () => {
  it("declares conservative runtime metadata for every production template", () => {
    for (const template of productionTemplates) {
      expect(template.runtimeMetadata, template.id).toBeDefined();
      const metadata = template.runtimeMetadata!;
      expect(["small", "medium", "large", "unknown"]).toContain(metadata.expectedScaleClass);
      expect(["none", "gridLocal", "continuousSpatialHash", "allPairs", "templateSpecific"]).toContain(metadata.neighborSearchStrategy);
      expect(metadata.hotLoopNotes.length).toBeGreaterThan(0);
      expect(metadata.knownPerformanceLimits.length).toBeGreaterThan(0);
      expect(Number.isInteger(metadata.defaultEntityCount)).toBe(true);
      expect(metadata.defaultEntityCount).toBeGreaterThan(0);
      expect(Number.isInteger(metadata.stressEntityCount)).toBe(true);
      expect(metadata.stressEntityCount).toBeGreaterThanOrEqual(metadata.defaultEntityCount);
    }
  });

  it("keeps runtime metadata distinct from structural primitive support claims", () => {
    expect(productionTemplateMap["flocking-boids"].runtimeMetadata?.neighborSearchStrategy).toBe("continuousSpatialHash");
    expect(productionTemplateMap["epidemic-spread"].runtimeMetadata?.neighborSearchStrategy).toBe("continuousSpatialHash");
    expect(productionTemplateMap["opinion-dynamics"].runtimeMetadata?.neighborSearchStrategy).toBe("continuousSpatialHash");
    expect(productionTemplateMap["predator-prey"].runtimeMetadata?.neighborSearchStrategy).toBe("continuousSpatialHash");
    expect(productionTemplateMap["schelling-segregation"].runtimeMetadata?.neighborSearchStrategy).toBe("gridLocal");
    expect(productionTemplateMap["forest-fire"].runtimeMetadata?.neighborSearchStrategy).toBe("gridLocal");

    for (const template of productionTemplates) {
      const text = [
        template.runtimeMetadata?.expectedScaleClass,
        template.runtimeMetadata?.neighborSearchStrategy,
        ...(template.runtimeMetadata?.hotLoopNotes ?? []),
        ...(template.runtimeMetadata?.knownPerformanceLimits ?? [])
      ].join(" ");
      expect(text).not.toMatch(/runtime support for (SpatialFieldModel|BoundaryEnvironmentModel|ControlStrategyModel|ObservabilityModel)/i);
      expect(text).not.toMatch(/validated prediction|calibrated probability|operational readiness/i);
    }
  });

  it("validates runtime metadata shape through template validation", () => {
    expect(() =>
      validateTemplate({
        ...productionTemplateMap["flocking-boids"],
        runtimeMetadata: {
          ...productionTemplateMap["flocking-boids"].runtimeMetadata!,
          defaultEntityCount: 500,
          stressEntityCount: 100
        }
      })
    ).toThrow(/Invalid simulation template definition/);
  });
});
