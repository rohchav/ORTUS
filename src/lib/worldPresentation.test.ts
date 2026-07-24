import { describe, expect, it } from "vitest";
import { metricDefinitionsForTemplate } from "../simulation";
import { templateDescriptors } from "./templateVisuals";
import { metricPresentationForTemplate, parameterPresentationForTemplate, primaryMetricKeysForTemplate } from "./worldPresentation";

describe("World presentation metadata", () => {
  it("prioritizes valid parameters without changing defaults or bounds", () => {
    for (const descriptor of templateDescriptors) {
      const before = descriptor.template.parameterDefinitions.map((definition) => ({ ...definition }));
      const presentation = parameterPresentationForTemplate(descriptor.id);

      expect(presentation.map((item) => item.key).sort()).toEqual(before.map((definition) => definition.key).sort());
      expect(presentation.filter((item) => item.priority === "primary")).toHaveLength(4);
      expect(presentation.every((item) => item.rebuildsRun)).toBe(true);
      expect(descriptor.template.parameterDefinitions).toEqual(before);
    }
  });

  it("derives deterministic primary metrics only from registered template metrics", () => {
    for (const descriptor of templateDescriptors) {
      const available = metricDefinitionsForTemplate(descriptor.template).map((metric) => metric.key);
      const first = metricPresentationForTemplate(descriptor.id, available);
      const second = metricPresentationForTemplate(descriptor.id, [...available].reverse());
      const primary = primaryMetricKeysForTemplate(descriptor.id, available);

      expect(new Set(first.map((item) => item.key))).toEqual(new Set(available));
      expect(primary.length).toBeGreaterThanOrEqual(2);
      expect(primary.length).toBeLessThanOrEqual(4);
      expect(primary.every((key) => available.includes(key))).toBe(true);
      expect(first).toEqual(second);
    }
  });
});
