import { describe, expect, it } from "vitest";
import { isModelSpecificWorldGuidance, normalizeWorldGuidance, uniqueWorldGuidance } from "./worldExplanation";

describe("World explanation presentation", () => {
  it("deduplicates presentation lines deterministically without changing their text", () => {
    const values = ["Bounded model output.", "  Bounded model output  ", "A model-specific limitation."];

    expect(uniqueWorldGuidance(values)).toEqual(["Bounded model output.", "A model-specific limitation."]);
    expect(normalizeWorldGuidance(values[0]!)).toBe("bounded model output");
  });

  it("keeps model-specific guidance separate from unrelated product-global boundaries", () => {
    expect(isModelSpecificWorldGuidance("This model is not calibrated against empirical data.")).toBe(true);
    expect(isModelSpecificWorldGuidance("It does not make Builder graphs or model-schema graphs executable.")).toBe(false);
    expect(
      isModelSpecificWorldGuidance(
        "This runtime graph belongs only to the Neural Excitation Network template and does not make Builder graphs executable."
      )
    ).toBe(false);
    expect(isModelSpecificWorldGuidance("Builder execution is unavailable.")).toBe(false);
  });
});
