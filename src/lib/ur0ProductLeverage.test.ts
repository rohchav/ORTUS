import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const repoRoot = process.cwd();

function source(path: string): string {
  return readFileSync(join(repoRoot, path), "utf8");
}

describe("UR0 product leverage and comprehension gate", () => {
  it("keeps the informed formative pilot separate from the unclosed human gate", () => {
    const report = source("docs/product/PRODUCT_LEVERAGE_COMPREHENSION_GATE.md");
    const repair = source("docs/product/PRODUCT_COMPREHENSION_EXPLORATION_REPAIR.md");
    const roadmap = source("docs/ROADMAP.md");
    const readme = source("README.md");

    for (const record of [report, repair, roadmap, readme]) {
      expect(record).toMatch(/technical\/expert/i);
      expect(record).toMatch(/human comprehension gate.*pending|human pending/i);
    }
    expect(report).toContain("participant who is highly familiar with ORTUS");
    expect(report).toContain("not unbiased first-time-user validation");
    expect(repair).toContain("not an unbiased first-time-user test");
    expect(repair).toContain("Sustained milling/circular motion is therefore not advertised as supported behavior.");
    expect(report).toContain("UR0 TECHNICAL/EXPERT GATE: COMPLETE");
    expect(report).toContain("UR0 HUMAN COMPREHENSION GATE: PENDING");
    expect(roadmap).toContain("UR0R - Product Comprehension + Exploration Repair | COMPLETE");
    expect(roadmap).toContain("S1 - Starter -> Remix Bridge | COMPLETE");
    expect(roadmap).toContain("S1B - Starter -> Remix Bridge Audit | NEXT / UNSTARTED");
    expect(roadmap).toContain("O1/E1 remain high-priority scientific infrastructure");
  });

  it("does not advertise runnable Workshop authoring or nonexistent Lab records from Start", () => {
    const start = source("src/components/start/StartHub.tsx");
    const destinations = source("src/lib/researchDestinations.ts");
    const comparison = source("src/components/RunComparisonPanel.tsx");

    expect(start).toContain('label: "Draft a model structure"');
    expect(start).toContain("Describe a non-runnable model structure");
    expect(start).toContain("Lab's non-persistent evidence-record foundation");
    expect(start).not.toContain('label: "Build a system"');
    expect(start).not.toContain("what Lab can record today");
    expect(destinations).toContain("Lab does not save records");
    expect(destinations).toContain("Draft and inspect non-runnable model structure");
    expect(comparison).toContain('placeholder="Run notes"');
    expect(comparison).not.toContain('placeholder="Observation notes"');
  });

  it("provides an executable, non-identifying formative study fixture", () => {
    const report = source("docs/product/PRODUCT_LEVERAGE_COMPREHENSION_GATE.md");
    const template = source("docs/product/UR0_STUDY_OBSERVATION_TEMPLATE.md");

    for (const phrase of [
      "What do you think this product lets you do?",
      "Model vs real system",
      "Comparison vs causal proof",
      "Reset/reproduction vs preserved experimental provenance",
      "What did you expect Workshop to produce?",
      "What did you expect Lab to preserve?"
    ]) {
      expect(`${report}\n${template}`).toContain(phrase);
    }
    expect(report).toContain("5 to 8 participants");
    expect(report).toContain("Keyboard-only");
    expect(report).toContain("Screen reader");
    expect(template).toContain("Do not record a participant name");
    expect(template).toContain("Do not mark UR0 complete");
    expect(template).not.toMatch(/participantName|emailAddress|accountId|protectedClass/i);
  });

  it("keeps the example-first S1 boundary narrow while the human gate remains open", () => {
    const repair = source("docs/product/PRODUCT_COMPREHENSION_EXPLORATION_REPAIR.md");
    const roadmap = source("docs/ROADMAP.md");
    const capabilities = source("docs/CAPABILITIES.md");

    for (const phrase of [
      "Entry must support a question, phenomenon, example, or existing system",
      "How it works",
      "structural draft",
      "runnable derivative",
      "S1 must not execute `ModelSchemaDefinition`"
    ]) {
      expect(repair).toContain(phrase);
    }
    expect(roadmap).toContain("structural validity distinct from runtime support");
    expect(capabilities).toContain("S1 derives an unsaved scenario from the immutable source Starter");
    expect(capabilities).toContain("does not create a second scenario or parameter registry");
    expect(repair).toContain("UR0 HUMAN COMPREHENSION GATE: PENDING");
  });
});
