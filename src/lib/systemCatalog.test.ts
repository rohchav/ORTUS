import { describe, expect, it } from "vitest";
import { systemCatalog, getSystemCatalogEntry } from "./systemCatalog";
import { templateDescriptors, type TemplateId } from "./templateVisuals";

describe("Start Hub system catalog", () => {
  it("derives one presentation entry from every authoritative production template", () => {
    expect(systemCatalog).toHaveLength(templateDescriptors.length);
    expect(systemCatalog.map((entry) => entry.descriptor.id)).toEqual(templateDescriptors.map((entry) => entry.id));
    for (const entry of systemCatalog) {
      expect(entry.descriptor).toBe(templateDescriptors.find((descriptor) => descriptor.id === entry.descriptor.id));
      expect(getSystemCatalogEntry(entry.descriptor.id)).toBe(entry);
    }
  });

  it("keeps the compact setup controls valid, bounded, and honest about the selected runtime template", () => {
    for (const entry of systemCatalog) {
      const parameterKeys = new Set(entry.descriptor.template.parameterDefinitions.map((definition) => definition.key));
      expect(entry.quickParameterKeys).toHaveLength(4);
      expect(new Set(entry.quickParameterKeys).size).toBe(4);
      expect(entry.quickParameterKeys.every((key) => parameterKeys.has(key))).toBe(true);
      expect(entry.quickParameterKeys).toContain(entry.highlightedParameterKey);
      expect(entry.question.trim().endsWith("?")).toBe(true);
      expect(entry.manipulation.trim().length).toBeGreaterThan(20);
      expect(entry.visibleOutput.trim().length).toBeGreaterThan(20);
      expect(entry.watchFor.trim().length).toBeGreaterThan(20);
      expect(entry.suggestedChange.trim().length).toBeGreaterThan(20);
    }
  });

  it("does not silently substitute a different system for an unknown identifier", () => {
    expect(() => getSystemCatalogEntry("not-a-template" as TemplateId)).toThrow(/Unknown system catalog template/);
  });
});
