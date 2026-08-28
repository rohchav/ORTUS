import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const map = readFileSync(join(process.cwd(), "docs", "research", "ORTUS_RESEARCH_CAPABILITY_MAP.md"), "utf8");

describe("ORTUS research capability map", () => {
  it("is subordinate to the four canonical sources rather than a competing roadmap", () => {
    expect(map).toContain("THIS IS A CONCEPTUAL / RESEARCH REFERENCE.");
    expect(map).toContain("Current capability truth: [`docs/CAPABILITIES.md`](../CAPABILITIES.md)");
    expect(map).toContain("Architecture authority: [`docs/ARCHITECTURE.md`](../ARCHITECTURE.md)");
    expect(map).toContain("Scientific contracts: [`docs/SCIENTIFIC_MODEL.md`](../SCIENTIFIC_MODEL.md)");
    expect(map).toContain("Roadmap sequencing: [`docs/ROADMAP.md`](../ROADMAP.md)");
    expect(map).toContain("It is not a fifth roadmap");
    expect(map).toContain("A valid artifact is not necessarily runnable");
  });

  it("covers every required research area from A through AI exactly once", () => {
    const labels = [
      ..."ABCDEFGHIJKLMNOPQRSTUVWXYZ".split(""),
      "AA",
      "AB",
      "AC",
      "AD",
      "AE",
      "AF",
      "AG",
      "AH",
      "AI"
    ];
    const headings = [...map.matchAll(/^## ([A-Z]{1,2})\. /gm)].map((match) => match[1]);
    expect(headings).toEqual(labels);
  });

  it("preserves runtime, evidence, ML, causal, and safety boundaries", () => {
    for (const phrase of [
      "ModelDefinition != RuntimePlan",
      "SimulationSnapshot\n  != RenderFramePacket\n  != UIProjection\n  != CanonicalObservation",
      "candidate generator",
      "It is not scientific authority.",
      "prediction != explanation",
      "cluster                       != emergent entity",
      "camera zoom                   != scientific scale",
      "protected-class inference",
      "persuasion optimization, microtargeting",
      "LLM-per-agent runtime",
      "arbitrary formula, script, function-body"
    ]) {
      expect(map).toContain(phrase);
    }
    expect(map).toContain("Candidate generators propose. Independent evaluators assess.");
    expect(map).toContain("Current browser-local comparison summaries, page-local Atlas previews, and structural Lab scaffolds are not this infrastructure.");
  });
});
