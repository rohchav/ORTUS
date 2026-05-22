import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  applyScaleTransition,
  canZoomIn,
  canZoomOut,
  createInitialScaleViewState,
  deserializeScaleViewState,
  getArtifactFamily,
  getPrimitive,
  getTemplateCapability,
  hybridCompositionArtifactType,
  listAvailableScaleTransitions,
  listReservedPrimitives,
  listServiceOnlyPrimitives,
  listZoomInTransitions,
  listZoomOutTransitions,
  productionTemplates,
  scaleModelArtifactType,
  scaleViewStateArtifactType,
  serializeScaleViewState,
  summarizeScaleView,
  validateCompositionCapabilities,
  validateScaleViewState,
  validateScaleViewStateForModel,
  type HybridModelComposition,
  type MultiScaleModel,
  type ScaleViewState
} from "../index";

const repoRoot = process.cwd();

function scaleModel(overrides: Partial<MultiScaleModel> = {}): MultiScaleModel {
  return {
    schemaVersion: "1",
    artifactType: scaleModelArtifactType,
    id: "scale-model",
    name: "Scale Model",
    version: "1.0.0",
    primaryScaleId: "micro",
    scaleLevels: [
      {
        id: "micro",
        label: "People",
        order: 0,
        scaleType: "micro",
        entityTypes: [{ id: "person", label: "Person", kind: "agent" }]
      },
      {
        id: "macro",
        label: "Region",
        order: 1,
        scaleType: "macro",
        entityTypes: [{ id: "region", label: "Region", kind: "region" }]
      }
    ],
    aggregationRules: [
      {
        id: "people-to-region",
        label: "People To Region",
        fromScaleId: "micro",
        toScaleId: "macro",
        fromEntityTypeId: "person",
        toEntityTypeId: "region",
        aggregationType: "count",
        informationLossNotes: ["Individual histories are lost in the regional summary."],
        executable: false
      }
    ],
    disaggregationRules: [
      {
        id: "region-to-people",
        label: "Region To People",
        fromScaleId: "macro",
        toScaleId: "micro",
        fromEntityTypeId: "region",
        toEntityTypeId: "person",
        disaggregationType: "sampleRepresentative",
        syntheticDetailNotes: ["Representative people are synthetic, not observed individuals."],
        executable: false
      }
    ],
    crossScaleLinks: [
      {
        id: "region-down",
        label: "Region Down",
        sourceScaleId: "macro",
        targetScaleId: "micro",
        sourceEntityTypeId: "region",
        targetEntityTypeId: "person",
        linkType: "constrainDown",
        direction: "down",
        active: true,
        executable: false,
        notes: "Structural constraint only."
      }
    ],
    ...overrides
  };
}

function viewState(overrides: Partial<ScaleViewState> = {}): ScaleViewState {
  return {
    schemaVersion: "1",
    artifactType: scaleViewStateArtifactType,
    id: "view-state",
    name: "Scale View",
    version: "1.0.0",
    scaleModelId: "scale-model",
    currentScaleId: "micro",
    viewMode: "entities",
    ...overrides
  };
}

function baseComposition(overrides: Partial<HybridModelComposition> = {}): HybridModelComposition {
  return {
    schemaVersion: "1",
    artifactType: hybridCompositionArtifactType,
    id: "scale-view-composition",
    name: "Scale View Composition",
    version: "1.0.0",
    primitiveAttachments: [],
    requiredCapabilities: [],
    ...overrides
  };
}

describe("scale view state and model-scale transitions", () => {
  it("validates scale view state shape and model references conservatively", () => {
    expect(validateScaleViewState(viewState()).id).toBe("view-state");
    expect(validateScaleViewState(viewState({ camera: { x: 1, y: 2, zoom: 3, rotation: 0.2 } })).camera?.zoom).toBe(3);
    expect(validateScaleViewStateForModel(scaleModel(), viewState({ selectedEntityTypeId: "person" })).selectedEntityTypeId).toBe("person");
    expect(() => validateScaleViewState(viewState({ id: "" }))).toThrow(/Invalid scale view state/);
    expect(() => validateScaleViewState(viewState({ artifactType: "ortus.scaleModel" as never }))).toThrow(/Invalid scale view state/);
    expect(() => validateScaleViewState(viewState({ scaleModelId: "" }))).toThrow(/Invalid scale view state/);
    expect(() => validateScaleViewState(viewState({ currentScaleId: "" }))).toThrow(/Invalid scale view state/);
    expect(() => validateScaleViewStateForModel(scaleModel(), viewState({ currentScaleId: "missing" }))).toThrow(/Unknown currentScaleId/);
    expect(() => validateScaleViewStateForModel(scaleModel(), viewState({ selectedEntityTypeId: "missing" }))).toThrow(/Unknown selectedEntityTypeId/);
    expect(() => validateScaleViewState(viewState({ viewMode: "zoom" as never }))).toThrow(/Invalid scale view state/);
    expect(() => validateScaleViewState(viewState({ camera: { x: Number.NaN, y: 0, zoom: 1 } }))).toThrow(/non-finite numbers/);
    expect(() => validateScaleViewState(viewState({ camera: { x: 0, y: 0, zoom: 0 } }))).toThrow(/Invalid scale view state/);
    expect(() => validateScaleViewState(viewState({ camera: { x: 0, y: 0, zoom: -1 } }))).toThrow(/Invalid scale view state/);
    expect(() => validateScaleViewState(viewState({ camera: { x: 0, y: 0, zoom: 2_000 } }))).toThrow(/Invalid scale view state/);
    expect(() =>
      validateScaleViewState(
        viewState({
          transitionHistory: Array.from({ length: 70 }, (_, index) => ({
            id: `history-${index}`,
            fromScaleId: "micro",
            toScaleId: "macro",
            direction: "zoomOut",
            transitionType: "aggregation",
            available: true
          }))
        })
      )
    ).toThrow(/Invalid scale view state/);
    expect(() =>
      validateScaleViewState(
        viewState({
          transitionHistory: [
            { id: "dupe", fromScaleId: "micro", toScaleId: "macro", direction: "zoomOut", transitionType: "aggregation", available: true },
            { id: "dupe", fromScaleId: "micro", toScaleId: "macro", direction: "zoomOut", transitionType: "aggregation", available: true }
          ]
        })
      )
    ).toThrow(/Duplicate transition history id/);
    expect(() =>
      validateScaleViewState(
        viewState({
          transitionHistory: [
            { id: "bad-direction", fromScaleId: "micro", toScaleId: "macro", direction: "pan" as never, transitionType: "aggregation", available: true }
          ]
        })
      )
    ).toThrow(/Invalid scale view state/);
    expect(() =>
      validateScaleViewStateForModel(
        scaleModel(),
        viewState({
          transitionHistory: [
            { id: "unknown-scale", fromScaleId: "missing", toScaleId: "macro", direction: "zoomOut", transitionType: "aggregation", available: true }
          ]
        })
      )
    ).toThrow(/unknown fromScaleId/);
    expect(() =>
      validateScaleViewState(
        viewState({
          warnings: Array.from({ length: 70 }, (_, index) => `warning-${index}`)
        })
      )
    ).toThrow(/Invalid scale view state/);
    expect(() => validateScaleViewState({ ...viewState(), extra: true })).toThrow(/Invalid scale view state/);
    expect(() => validateScaleViewState({ ...viewState(), scaleLevels: [] })).toThrow(/model-definition/);
    expect(() => validateScaleViewState(viewState({ metadata: { world: { tick: 1 } } }))).toThrow(/live-state|model-definition|executable/);
    expect(() => validateScaleViewState(viewState({ metadata: { formula: "x + y" } }))).toThrow(/live-state|model-definition|executable/);
    expect(() => validateScaleViewState(viewState({ metadata: { huge: "x".repeat(140_000) } }))).toThrow(/Scale view state/);
  });

  it("derives and applies model-scale transitions without executing scale rules or mutating inputs", () => {
    const model = scaleModel();
    const initial = createInitialScaleViewState(model);
    expect(initial.currentScaleId).toBe("micro");
    expect(initial.viewMode).toBe("entities");
    const fallback = createInitialScaleViewState(scaleModel({ primaryScaleId: undefined }));
    expect(fallback.currentScaleId).toBe("micro");

    const beforeModel = JSON.stringify(model);
    const beforeView = JSON.stringify(initial);
    const cameraOnly = validateScaleViewStateForModel(model, { ...initial, camera: { x: 10, y: 20, zoom: 4 } });
    expect(cameraOnly.currentScaleId).toBe(initial.currentScaleId);
    expect(listAvailableScaleTransitions(model, cameraOnly).map((transition) => transition.id)).toEqual(["aggregation:people-to-region"]);
    const zoomOut = listZoomOutTransitions(model, initial);
    expect(zoomOut).toHaveLength(1);
    expect(zoomOut[0]).toMatchObject({
      id: "aggregation:people-to-region",
      direction: "zoomOut",
      transitionType: "aggregation",
      available: true
    });
    expect(zoomOut[0]?.informationLossWarning).toContain("Individual histories");
    expect(canZoomOut(model, initial)).toBe(true);
    expect(canZoomIn(model, initial)).toBe(false);

    const result = applyScaleTransition(model, initial, "aggregation:people-to-region");
    expect(result.previousScaleId).toBe("micro");
    expect(result.nextScaleId).toBe("macro");
    expect(result.viewState.currentScaleId).toBe("macro");
    expect(result.viewState.camera).toBeUndefined();
    expect(result.warnings[0]).toContain("Individual histories");
    expect(result.viewState.transitionHistory).toHaveLength(1);
    expect(JSON.stringify(model)).toBe(beforeModel);
    expect(JSON.stringify(initial)).toBe(beforeView);
    const cameraResult = applyScaleTransition(model, cameraOnly, "aggregation:people-to-region");
    expect(cameraResult.viewState.camera?.zoom).toBe(4);

    const zoomIn = listZoomInTransitions(model, result.viewState);
    expect(zoomIn.map((transition) => transition.id)).toEqual(["disaggregation:region-to-people", "link:region-down"]);
    expect(zoomIn[0]?.syntheticDetailWarning).toContain("Representative people");
    expect(canZoomIn(model, result.viewState)).toBe(true);
    expect(canZoomOut(model, result.viewState)).toBe(false);

    let current = result.viewState;
    for (let index = 0; index < 70; index += 1) {
      current = applyScaleTransition(model, current, current.currentScaleId === "macro" ? "disaggregation:region-to-people" : "aggregation:people-to-region").viewState;
    }
    expect(current.transitionHistory?.length).toBe(64);
    expect(() => applyScaleTransition(model, initial, "missing")).toThrow(/Unknown scale transition/);
    expect(listAvailableScaleTransitions(model, initial).map((transition) => transition.id)).toEqual(["aggregation:people-to-region"]);
  });

  it("summarizes scale view state with camera-vs-model-scale semantics", () => {
    const model = scaleModel();
    const state = viewState({ camera: { x: 4, y: 5, zoom: 2 } });
    const summary = summarizeScaleView(model, state);
    expect(summary).toMatchObject({
      scaleModelId: "scale-model",
      currentScaleId: "micro",
      currentScaleLabel: "People",
      viewMode: "entities",
      canZoomIn: false,
      canZoomOut: true,
      availableTransitionCount: 1,
      informationLossWarningCount: 1,
      syntheticDetailWarningCount: 0,
      cameraZoom: 2
    });
    expect(summary.modelScaleZoomNote).toBe("Model-scale zoom changes the represented scale level; camera zoom only changes visual magnification.");
  });

  it("serializes only scale view state artifacts and rejects other artifact families", () => {
    const state = viewState({ camera: { x: 0, y: 0, zoom: 1 } });
    const json = serializeScaleViewState(state);
    expect(json).toContain(`"artifactType": "${scaleViewStateArtifactType}"`);
    expect(deserializeScaleViewState(json)).toMatchObject({ id: "view-state", scaleModelId: "scale-model" });
    const withStoredWarnings = applyScaleTransition(scaleModel(), createInitialScaleViewState(scaleModel()), "aggregation:people-to-region").viewState;
    const restoredWarnings = deserializeScaleViewState(serializeScaleViewState(withStoredWarnings));
    expect(restoredWarnings.warnings?.join(" ")).toContain("Individual histories");
    expect(restoredWarnings.transitionHistory?.[0]?.informationLossWarning).toContain("Individual histories");

    for (const artifactType of [
      "ortus.scenario",
      "ortus.snapshot",
      "ortus.uncertaintyConfig",
      "ortus.uncertaintyResult",
      "ortus.assumptionProfile",
      "ortus.networkDefinition",
      "ortus.resourceSystem",
      "ortus.eventSchedule",
      "ortus.delayQueue",
      "ortus.feedbackLoops",
      "ortus.hybridComposition",
      "ortus.scaleModel"
    ]) {
      expect(() => deserializeScaleViewState(JSON.stringify({ schemaVersion: "1", artifactType }))).toThrow(/artifact type/);
    }
    expect(() => deserializeScaleViewState(JSON.stringify({ schemaVersion: "1", artifactType: scaleViewStateArtifactType }))).toThrow(
      /Invalid scale view state/
    );
    expect(() => deserializeScaleViewState(JSON.stringify({ ...state, metadata: { activeEngine: {} } }))).toThrow(/live-state|model-definition|executable/);
    expect(() => deserializeScaleViewState({ ...state, metadata: { callback: () => null } })).toThrow(/plain JSON|Invalid scale view state/);
  });

  it("updates registry and template capability truth without making templates scale-aware", () => {
    expect(getPrimitive("scaleAwareViews")).toMatchObject({ status: "serviceOnly", supportLevel: "service" });
    expect(getPrimitive("multiScale")).toMatchObject({ status: "serviceOnly", supportLevel: "service" });
    expect(listServiceOnlyPrimitives().map((primitive) => primitive.id)).toEqual(expect.arrayContaining(["multiScale", "scaleAwareViews"]));
    expect(getArtifactFamily(scaleViewStateArtifactType)).toMatchObject({
      primitiveId: "scaleAwareViews",
      implemented: true,
      importSupported: true,
      exportSupported: true,
      serviceOnly: true
    });
    expect(getPrimitive("observability")).toMatchObject({ status: "serviceOnly", supportLevel: "service" });
    expect(getPrimitive("causalAssumptions")).toMatchObject({ status: "serviceOnly", supportLevel: "service" });
    expect(getPrimitive("visualModelBuilder")).toMatchObject({ status: "reserved" });
    expect(listReservedPrimitives().map((primitive) => primitive.id)).not.toContain("scaleAwareViews");

    for (const template of productionTemplates) {
      expect(getTemplateCapability(template.id, "scaleAwareViews")).toMatchObject({
        status: "unsupported",
        runtimeActive: false,
        serviceAvailable: true
      });
      expect(getTemplateCapability(template.id, "multiScale")).toMatchObject({ status: "unsupported", runtimeActive: false });
      expect(getTemplateCapability(template.id, "causalAssumptions")).toMatchObject({ status: "unsupported", runtimeActive: false, serviceAvailable: true });
    }
    expect(getTemplateCapability("flocking-boids", "behaviorModes")?.notes).toContain("groupAware");
    expect(getTemplateCapability("flocking-boids", "scaleAwareViews")?.runtimeActive).toBe(false);
  });

  it("lets hybrid compositions reference scale view state without satisfying runtime capability requirements", () => {
    const composition = baseComposition({
      baseTemplateId: "flocking-boids",
      primitiveAttachments: [
        {
          id: "scale-view-ref",
          primitiveId: "scaleAwareViews",
          attachmentType: "scaleViewState",
          mode: "reference",
          artifactType: scaleViewStateArtifactType,
          artifactId: "scale-view-1",
          active: true,
          required: true
        }
      ],
      requiredCapabilities: [
        { primitiveId: "scaleAwareViews", requiredSupportLevel: "runtime" },
        { primitiveId: "multiScale", requiredSupportLevel: "runtime" }
      ]
    });
    const report = validateCompositionCapabilities(composition);
    expect(report.valid).toBe(true);
    expect(report.runnableNow).toBe(false);
    expect(report.missingCapabilities.map((missing) => missing.primitiveId)).toEqual(expect.arrayContaining(["scaleAwareViews", "multiScale"]));
  });

  it("documents model-scale zoom boundaries and keeps scale view services headless", () => {
    const docs = [
      readFileSync(join(repoRoot, "README.md"), "utf8"),
      readFileSync(join(repoRoot, "docs", "concepts.md"), "utf8"),
      readFileSync(join(repoRoot, "src", "simulation", "README.md"), "utf8"),
      readFileSync(join(repoRoot, "docs", "roadmap.md"), "utf8"),
      readFileSync(join(repoRoot, "docs", "missing-pillars.md"), "utf8"),
      readFileSync(join(repoRoot, "AGENTS.md"), "utf8")
    ].join("\n");

    expect(docs).toContain("Model-scale zoom changes the represented scale level; camera zoom only changes visual magnification.");
    expect(docs).toContain("Scale transitions in V1 do not execute aggregation or disaggregation rules.");
    expect(docs).toContain("A scale view state can navigate a scale model, but it does not make a template multi-scale capable.");

    const scaleViewDir = join(repoRoot, "src", "simulation", "scaleView");
    const source = readdirSync(scaleViewDir)
      .filter((file) => file.endsWith(".ts"))
      .map((file) => readFileSync(join(scaleViewDir, file), "utf8"))
      .join("\n");

    expect(source).not.toMatch(/from ["']react["']/);
    expect(source).not.toMatch(/from ["']zustand["']/);
    expect(source).not.toContain("Math.random");
    expect(source).not.toContain("eval(");
    expect(source).not.toContain("new Function");
    expect(source).not.toContain("localStorage");
    expect(source).not.toContain("sessionStorage");
    expect(source).not.toContain("document.");
    expect(source).not.toContain("window.");
    expect(source).not.toContain("Canvas");
    expect(source).not.toContain("WorldStage");
    expect(source).not.toMatch(/from ["'][^"']*(renderer|components|app)[^"']*["']/);
  });
});
