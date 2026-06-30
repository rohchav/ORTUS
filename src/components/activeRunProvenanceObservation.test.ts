import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { productionTemplateMap, type ParameterValues, type SimulationSnapshotView } from "../simulation";
import {
  deriveActiveRunProvenanceObservation,
  RUN_INTERPRETATION_VISUAL_PATTERN_COPY,
  RUN_OBSERVATION_MODEL_STATE_COPY,
  RUN_PROVENANCE_NON_PERSISTENT_COPY
} from "./activeRunProvenanceObservation";

const repoRoot = process.cwd();
const template = productionTemplateMap["epidemic-spread"];
const parameters: ParameterValues = Object.fromEntries(template.parameterDefinitions.map((definition) => [definition.key, definition.defaultValue]));

function snapshot(tick = 8): SimulationSnapshotView {
  return {
    schemaVersion: "1",
    templateId: template.id,
    tick,
    time: tick * 0.5,
    entities: [
      { id: "entity-a", archetype: "person", alive: true, createdAtTick: 0 },
      { id: "entity-b", archetype: "person", alive: false, createdAtTick: 0, destroyedAtTick: 4 }
    ],
    components: {},
    spaces: [],
    globals: {},
    metricsHistory: [
      {
        tick,
        time: tick * 0.5,
        values: {
          infectedCount: 2,
          susceptibleCount: 7
        }
      }
    ]
  };
}

describe("active run provenance observation", () => {
  it("derives a live non-persistent provenance summary from existing active-run fields", () => {
    const summary = deriveActiveRunProvenanceObservation({
      selectedTemplateId: template.id,
      template,
      seed: "gw2-seed",
      parameters,
      metadata: { scenarioName: "Baseline scenario" },
      snapshot: snapshot(),
      isRunning: true,
      hasActiveEngine: true,
      speedMultiplier: 1.5,
      interventionCount: 2,
      metricLabelForKey: (_templateId, key) => key
    });

    expect(summary.provenance).toMatchObject({
      templateId: "epidemic-spread",
      templateLabel: "Epidemic Spread",
      scenarioLabel: "Baseline scenario",
      runtimeModeLabel: "Active World engine",
      seedLabel: "gw2-seed",
      parameterCount: template.parameterDefinitions.length,
      parameterSummaryLabel: `${template.parameterDefinitions.length} active parameters`,
      speedLabel: "1.5x local playback",
      liveNonPersistent: true,
      configurationFingerprint: null,
      boundaryCopy: RUN_PROVENANCE_NON_PERSISTENT_COPY
    });
    expect(summary.provenance.runConfigurationStatus).toMatchObject({
      label: "Live run",
      category: "operational",
      state: "ready"
    });
    expect(summary.observation).toMatchObject({
      advancingLabel: "Advancing",
      aliveEntityCount: 1,
      aliveEntityCountLabel: "1",
      metricRecordCount: 1,
      metricRecordCountLabel: "1",
      interventionCount: 2,
      boundaryCopy: RUN_OBSERVATION_MODEL_STATE_COPY
    });
  });

  it("preserves Paused as an operational paused state while separating lifecycle status", () => {
    const summary = deriveActiveRunProvenanceObservation({
      selectedTemplateId: template.id,
      template,
      seed: "paused-seed",
      parameters,
      snapshot: snapshot(12),
      isRunning: false,
      hasActiveEngine: true
    });

    expect(summary.observation.runStatus).toMatchObject({
      label: "Paused",
      category: "operational",
      state: "paused"
    });
    expect(summary.observation.lifecycleStatus).toMatchObject({
      label: "Paused",
      category: "operational",
      state: "paused"
    });
  });

  it("handles missing optional active-run fields without fabricating saved records or IDs", () => {
    const summary = deriveActiveRunProvenanceObservation({
      selectedTemplateId: "unknown-template",
      isRunning: false,
      hasActiveEngine: false
    });

    expect(summary.provenance).toMatchObject({
      templateId: "unknown-template",
      templateLabel: "unknown-template",
      scenarioLabel: "Default run",
      runtimeModeLabel: "No active World engine",
      seedLabel: "No seed exposed",
      parameterCount: 0,
      configurationFingerprint: null,
      liveNonPersistent: true
    });
    expect(summary.provenance.runConfigurationStatus).toMatchObject({ label: "Incomplete", state: "idle" });
    expect(summary.observation.lifecycleStatus).toMatchObject({ label: "Not initialized", state: "idle" });
    expect(summary.observation).toMatchObject({
      tickLabel: "No snapshot",
      timeLabel: "No snapshot",
      aliveEntityCountLabel: "No snapshot",
      metricRecordCountLabel: "No snapshot"
    });
    expect(summary.observation.latestMetricRows).toEqual([]);
  });

  it("keeps interpretation boundaries explicit and evidence status unresolved", () => {
    const summary = deriveActiveRunProvenanceObservation({
      selectedTemplateId: template.id,
      template,
      seed: "evidence-seed",
      parameters,
      snapshot: snapshot(),
      isRunning: false,
      hasActiveEngine: true
    });

    expect(summary.interpretation.visualPatternCopy).toBe(RUN_INTERPRETATION_VISUAL_PATTERN_COPY);
    expect(summary.interpretation.evidenceStatus).toMatchObject({
      label: "Model output",
      category: "evidence",
      state: "unresolved"
    });
    expect(summary.interpretation.claimBoundaries.join(" ")).toMatch(/Runnable means the local template is producing model behavior/);
    expect(summary.interpretation.claimBoundaries.join(" ")).not.toMatch(/empirical truth|validated conclusion|certified/i);
  });

  it("does not add storage, timestamps, random IDs, or a generated fingerprint in the GW2 slice", () => {
    const utilitySource = readFileSync(join(repoRoot, "src", "components", "activeRunProvenanceObservation.ts"), "utf8");
    const panelSource = readFileSync(join(repoRoot, "src", "components", "RunProvenanceObservationPanel.tsx"), "utf8");
    const forbiddenRuntimeApis = /localStorage|sessionStorage|IndexedDB|indexedDB|cookie|Date\.now|Math\.random|crypto\.randomUUID|randomUUID|uuid/i;

    expect(utilitySource).not.toMatch(forbiddenRuntimeApis);
    expect(panelSource).not.toMatch(forbiddenRuntimeApis);

    const first = deriveActiveRunProvenanceObservation({
      selectedTemplateId: template.id,
      template,
      seed: "stable-seed",
      parameters,
      snapshot: snapshot(),
      isRunning: false,
      hasActiveEngine: true
    });
    const second = deriveActiveRunProvenanceObservation({
      selectedTemplateId: template.id,
      template,
      seed: "stable-seed",
      parameters,
      snapshot: snapshot(),
      isRunning: false,
      hasActiveEngine: true
    });

    expect(first.provenance.configurationFingerprint).toBeNull();
    expect(second.provenance.configurationFingerprint).toBeNull();
    expect(JSON.stringify(first)).toBe(JSON.stringify(second));
  });

  it("keeps active run context as semantic readable content rather than a fake tab stop", () => {
    const panelSource = readFileSync(join(repoRoot, "src", "components", "RunProvenanceObservationPanel.tsx"), "utf8");

    expect(panelSource).toContain('className="active-run-context" aria-labelledby="active-run-context-heading"');
    expect(panelSource).not.toMatch(/active-run-context[^>]+tabIndex=\{0\}/);
    expect(panelSource).not.toMatch(/active-run-context[^>]+role="button"/);
  });
});
