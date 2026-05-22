import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  boundaryModelArtifactType,
  deserializeBoundaryEnvironmentModel,
  fieldLayerArtifactType,
  getArtifactFamily,
  getBoundaryEnvironmentWarnings,
  getBoundarySurface,
  getExchangesForSurface,
  getPrimitive,
  getTemplateCapability,
  hybridCompositionArtifactType,
  listActiveBoundaryExchanges,
  listActiveExternalForcings,
  listActiveExogenousShocks,
  listBoundaryExchanges,
  listBoundarySurfaces,
  listExternalForcings,
  listExogenousShocks,
  listOpenBoundarySurfaces,
  listReservedPrimitives,
  listServiceOnlyPrimitives,
  modelHasExogenousShocks,
  modelHasExternalForcing,
  modelHasOpenBoundary,
  productionTemplates,
  scaleModelArtifactType,
  scaleViewStateArtifactType,
  serializeBoundaryEnvironmentModel,
  summarizeBoundaryEnvironment,
  validateBoundaryEnvironmentModel,
  validateBoundaryEnvironmentModelForRuntime,
  validateCompositionCapabilities,
  type BoundaryEnvironmentModel,
  type HybridModelComposition
} from "../index";

const repoRoot = process.cwd();

function boundaryModel(overrides: Partial<BoundaryEnvironmentModel> = {}): BoundaryEnvironmentModel {
  return {
    schemaVersion: "1",
    artifactType: boundaryModelArtifactType,
    id: "boundary-model",
    name: "Boundary Model",
    version: "1.0.0",
    boundaryType: "open",
    systemScope: {
      includedEntityTypes: ["agents"],
      excludedEntityTypes: ["external actors"],
      includedProcesses: ["movement"],
      excludedProcesses: ["external policy response"],
      notes: ["System scope is structural only."]
    },
    environmentScope: {
      environmentType: "ecological",
      description: "External habitat context.",
      externalEntityTypes: ["weather"],
      externalProcesses: ["seasonal pressure"],
      externalConstraints: ["habitat edge"]
    },
    boundarySurfaces: [
      {
        id: "surface",
        label: "Habitat Edge",
        boundaryKind: "physical",
        directionality: "bidirectional",
        permeability: "open"
      }
    ],
    exchanges: [
      {
        id: "exchange",
        label: "Migration",
        boundarySurfaceId: "surface",
        exchangeType: "agentMovement",
        direction: "bidirectional",
        source: "environment",
        target: "system",
        active: true,
        executable: false
      }
    ],
    externalForcings: [
      {
        id: "forcing",
        label: "Seasonal Pressure",
        forcingType: "seasonal",
        targetDescription: "Population-level movement pressure.",
        active: true,
        executable: false
      }
    ],
    exogenousShocks: [
      {
        id: "shock",
        label: "Storm",
        shockType: "pulse",
        timingDescription: "At a declared scenario time.",
        magnitudeDescription: "Qualitative disturbance only.",
        active: true,
        executable: false
      }
    ],
    ...overrides
  };
}

function minimalBoundaryModel(overrides: Partial<BoundaryEnvironmentModel> = {}): BoundaryEnvironmentModel {
  return {
    schemaVersion: "1",
    artifactType: boundaryModelArtifactType,
    id: "minimal-boundary",
    name: "Minimal Boundary",
    version: "1.0.0",
    boundaryType: "abstract",
    systemScope: {
      includedProcesses: ["internal dynamics"]
    },
    ...overrides
  };
}

function composition(overrides: Partial<HybridModelComposition> = {}): HybridModelComposition {
  return {
    schemaVersion: "1",
    artifactType: hybridCompositionArtifactType,
    id: "boundary-composition",
    name: "Boundary Composition",
    version: "1.0.0",
    baseTemplateId: "flocking-boids",
    primitiveAttachments: [],
    requiredCapabilities: [],
    ...overrides
  };
}

describe("boundary/environment structural services", () => {
  it("validates boundary/environment models conservatively", () => {
    expect(validateBoundaryEnvironmentModel(minimalBoundaryModel()).id).toBe("minimal-boundary");
    expect(validateBoundaryEnvironmentModel(boundaryModel()).boundarySurfaces?.[0]?.id).toBe("surface");
    expect(() => validateBoundaryEnvironmentModel(minimalBoundaryModel({ id: "" }))).toThrow(/Invalid boundary\/environment model/);
    expect(() => validateBoundaryEnvironmentModel(minimalBoundaryModel({ name: "" }))).toThrow(/Invalid boundary\/environment model/);
    expect(() => validateBoundaryEnvironmentModel(minimalBoundaryModel({ artifactType: "ortus.scaleModel" as never }))).toThrow(
      /Invalid boundary\/environment model/
    );
    expect(() => validateBoundaryEnvironmentModel(minimalBoundaryModel({ version: "" }))).toThrow(/Invalid boundary\/environment model/);
    expect(() => validateBoundaryEnvironmentModel(minimalBoundaryModel({ boundaryType: "porous" as never }))).toThrow(
      /Invalid boundary\/environment model/
    );
    expect(() => validateBoundaryEnvironmentModel({ ...minimalBoundaryModel(), systemScope: undefined })).toThrow(/Invalid boundary\/environment model/);
    expect(() => validateBoundaryEnvironmentModel(boundaryModel({ environmentScope: { environmentType: "terrain" as never } }))).toThrow(
      /Invalid boundary\/environment model/
    );
    expect(() =>
      validateBoundaryEnvironmentModel(
        boundaryModel({
          boundarySurfaces: [
            boundaryModel().boundarySurfaces![0]!,
            { ...boundaryModel().boundarySurfaces![0]! }
          ]
        })
      )
    ).toThrow(/Duplicate boundary surface id/);
    expect(() =>
      validateBoundaryEnvironmentModel(boundaryModel({ exchanges: [boundaryModel().exchanges![0]!, { ...boundaryModel().exchanges![0]! }] }))
    ).toThrow(/Duplicate boundary exchange id/);
    expect(() =>
      validateBoundaryEnvironmentModel(
        boundaryModel({ externalForcings: [boundaryModel().externalForcings![0]!, { ...boundaryModel().externalForcings![0]! }] })
      )
    ).toThrow(/Duplicate external forcing id/);
    expect(() =>
      validateBoundaryEnvironmentModel(
        boundaryModel({ exogenousShocks: [boundaryModel().exogenousShocks![0]!, { ...boundaryModel().exogenousShocks![0]! }] })
      )
    ).toThrow(/Duplicate exogenous shock id/);
    expect(() => validateBoundaryEnvironmentModel(boundaryModel({ exchanges: [{ ...boundaryModel().exchanges![0]!, boundarySurfaceId: "missing" }] }))).toThrow(
      /unknown boundarySurfaceId/
    );
    expect(() => validateBoundaryEnvironmentModel(boundaryModel({ boundarySurfaces: [{ ...boundaryModel().boundarySurfaces![0]!, boundaryKind: "wall" as never }] }))).toThrow(/Invalid boundary\/environment model/);
    expect(() => validateBoundaryEnvironmentModel(boundaryModel({ boundarySurfaces: [{ ...boundaryModel().boundarySurfaces![0]!, directionality: "sideways" as never }] }))).toThrow(/Invalid boundary\/environment model/);
    expect(() => validateBoundaryEnvironmentModel(boundaryModel({ boundarySurfaces: [{ ...boundaryModel().boundarySurfaces![0]!, permeability: "porous" as never }] }))).toThrow(/Invalid boundary\/environment model/);
    expect(() => validateBoundaryEnvironmentModel(boundaryModel({ exchanges: [{ ...boundaryModel().exchanges![0]!, exchangeType: "heat" as never }] }))).toThrow(/Invalid boundary\/environment model/);
    expect(() => validateBoundaryEnvironmentModel(boundaryModel({ exchanges: [{ ...boundaryModel().exchanges![0]!, direction: "none" as never }] }))).toThrow(/Invalid boundary\/environment model/);
    expect(() => validateBoundaryEnvironmentModel(boundaryModel({ exchanges: [{ ...boundaryModel().exchanges![0]!, executable: true as never }] }))).toThrow(/Invalid boundary\/environment model/);
    expect(() => validateBoundaryEnvironmentModel(boundaryModel({ externalForcings: [{ ...boundaryModel().externalForcings![0]!, forcingType: "causal" as never }] }))).toThrow(/Invalid boundary\/environment model/);
    expect(() => validateBoundaryEnvironmentModel(boundaryModel({ externalForcings: [{ ...boundaryModel().externalForcings![0]!, executable: true as never }] }))).toThrow(/Invalid boundary\/environment model/);
    expect(() => validateBoundaryEnvironmentModel(boundaryModel({ exogenousShocks: [{ ...boundaryModel().exogenousShocks![0]!, shockType: "prediction" as never }] }))).toThrow(/Invalid boundary\/environment model/);
    expect(() => validateBoundaryEnvironmentModel(boundaryModel({ exogenousShocks: [{ ...boundaryModel().exogenousShocks![0]!, executable: true as never }] }))).toThrow(/Invalid boundary\/environment model/);
    expect(() => validateBoundaryEnvironmentModel({ ...minimalBoundaryModel(), extra: true })).toThrow(/Invalid boundary\/environment model/);
    expect(() => validateBoundaryEnvironmentModel(minimalBoundaryModel({ metadata: { world: { tick: 1 } } }))).toThrow(/live-state|spatial-field|executable/);
    expect(() => validateBoundaryEnvironmentModel(minimalBoundaryModel({ metadata: { formula: "x + y" } }))).toThrow(/live-state|spatial-field|executable/);
    expect(() => validateBoundaryEnvironmentModel(minimalBoundaryModel({ metadata: { value: Number.POSITIVE_INFINITY } }))).toThrow(/non-finite/);
    expect(() => validateBoundaryEnvironmentModel(minimalBoundaryModel({ metadata: { huge: "x".repeat(200_000) } }))).toThrow(/Boundary\/environment model/);
    expect(() => validateBoundaryEnvironmentModel(new Date())).toThrow(/plain JSON|Invalid boundary\/environment model/);
    expect(() => validateBoundaryEnvironmentModel({ ...minimalBoundaryModel(), systemScope: [] })).toThrow(/Invalid boundary\/environment model/);
    expect(() => validateBoundaryEnvironmentModel(minimalBoundaryModel({ systemScope: { notes: ["x".repeat(2_000)] } }))).toThrow(/Invalid boundary\/environment model/);
    expect(() => validateBoundaryEnvironmentModel({ ...minimalBoundaryModel(), systemScope: { includedProcesses: [() => null] } })).toThrow(
      /plain JSON|Invalid boundary\/environment model/
    );
  });

  it("surfaces structural boundary warnings without rejecting conceptual contradictions", () => {
    const closed = boundaryModel({
      boundaryType: "closed",
      boundarySurfaces: [{ ...boundaryModel().boundarySurfaces![0]!, permeability: "open" }],
      exchanges: [{ ...boundaryModel().exchanges![0]!, active: true }]
    });
    const warnings = getBoundaryEnvironmentWarnings(closed);
    expect(warnings.join(" ")).toMatch(/closed boundary with active exchanges/);
    expect(warnings.join(" ")).toMatch(/closed boundary with an open boundary surface/);
    expect(warnings.join(" ")).toMatch(/structural declaration/);

    const sparseOpen = boundaryModel({ boundaryType: "open", exchanges: [] });
    expect(getBoundaryEnvironmentWarnings(sparseOpen).join(" ")).toMatch(/open boundary with no exchanges/);
    const sparsePartiallyOpen = boundaryModel({ boundaryType: "partiallyOpen", exchanges: [] });
    expect(getBoundaryEnvironmentWarnings(sparsePartiallyOpen).join(" ")).toMatch(/partially open boundary with no exchanges/);

    const abstractPhysical = minimalBoundaryModel({
      boundaryType: "abstract",
      boundarySurfaces: [{ id: "physical", label: "Physical", boundaryKind: "physical", directionality: "none", permeability: "unknown" }],
      externalForcings: [{ id: "untargeted", label: "Untargeted", forcingType: "constant", active: true, executable: false }],
      exogenousShocks: [
        { id: "missing-timing", label: "Missing Timing", shockType: "pulse", magnitudeDescription: "Qualitative only.", active: true, executable: false },
        { id: "missing-magnitude", label: "Missing Magnitude", shockType: "pulse", timingDescription: "At a declared scenario time.", active: true, executable: false }
      ]
    });
    const abstractWarnings = getBoundaryEnvironmentWarnings(abstractPhysical).join(" ");
    expect(abstractWarnings).toMatch(/no target description/);
    expect(abstractWarnings).toMatch(/lacks timing or magnitude/);
    expect(abstractWarnings).toMatch(/abstract boundary with physical boundary surfaces/);
    expect(abstractWarnings).toMatch(/unknown permeability/);
    expect(abstractWarnings).not.toMatch(/prove|predict|causal/i);
    const report = validateBoundaryEnvironmentModelForRuntime(abstractPhysical);
    expect(report).toMatchObject({ valid: true, runnableNow: false });
    expect(report.warnings.join(" ")).toMatch(/valid boundary model describes model scope/);
    expect(report.missingCapabilities[0]).toMatchObject({ primitiveId: "boundariesEnvironment", requiredSupportLevel: "runtime" });
  });

  it("queries and summarizes boundary/environment structure without mutating input", () => {
    const model = boundaryModel();
    const before = JSON.stringify(model);
    expect(getBoundarySurface(model, "surface")?.label).toBe("Habitat Edge");
    expect(listBoundarySurfaces(model)).toHaveLength(1);
    expect(listOpenBoundarySurfaces(model).map((surface) => surface.id)).toEqual(["surface"]);
    expect(listBoundaryExchanges(model)).toHaveLength(1);
    expect(listActiveBoundaryExchanges(model).map((exchange) => exchange.id)).toEqual(["exchange"]);
    expect(getExchangesForSurface(model, "surface").map((exchange) => exchange.id)).toEqual(["exchange"]);
    expect(listExternalForcings(model)).toHaveLength(1);
    expect(listActiveExternalForcings(model).map((forcing) => forcing.id)).toEqual(["forcing"]);
    expect(listExogenousShocks(model)).toHaveLength(1);
    expect(listActiveExogenousShocks(model).map((shock) => shock.id)).toEqual(["shock"]);
    expect(modelHasOpenBoundary(model)).toBe(true);
    expect(modelHasExternalForcing(model)).toBe(true);
    expect(modelHasExogenousShocks(model)).toBe(true);
    const summary = summarizeBoundaryEnvironment(model);
    expect(summary).toMatchObject({
      id: "boundary-model",
      boundaryType: "open",
      environmentType: "ecological",
      boundarySurfaceCount: 1,
      exchangeCount: 1,
      activeExchangeCount: 1,
      externalForcingCount: 1,
      activeForcingCount: 1,
      exogenousShockCount: 1,
      activeShockCount: 1,
      executableCount: 0
    });
    expect(summary.warnings.join(" ")).toContain("Active boundary exchange exchange is a structural declaration");
    expect(JSON.stringify(model)).toBe(before);

    const empty = minimalBoundaryModel();
    expect(getBoundarySurface(empty, "missing")).toBeUndefined();
    expect(listBoundarySurfaces(empty)).toHaveLength(0);
    expect(listOpenBoundarySurfaces(empty)).toHaveLength(0);
    expect(listBoundaryExchanges(empty)).toHaveLength(0);
    expect(listExternalForcings(empty)).toHaveLength(0);
    expect(listExogenousShocks(empty)).toHaveLength(0);
    expect(modelHasOpenBoundary(empty)).toBe(false);
    expect(modelHasExternalForcing(empty)).toBe(false);
    expect(modelHasExogenousShocks(empty)).toBe(false);
    const returnedSurface = listBoundarySurfaces(model)[0] as { label: string };
    returnedSurface.label = "Mutated";
    expect(getBoundarySurface(model, "surface")?.label).toBe("Habitat Edge");
  });

  it("serializes only boundary model artifacts and rejects other artifact families", () => {
    const model = boundaryModel();
    const json = serializeBoundaryEnvironmentModel(model);
    expect(json).toContain(`"artifactType": "${boundaryModelArtifactType}"`);
    expect(deserializeBoundaryEnvironmentModel(json)).toMatchObject({ id: "boundary-model", boundaryType: "open" });
    expect(getBoundaryEnvironmentWarnings(deserializeBoundaryEnvironmentModel(json)).join(" ")).toContain("Active boundary exchange exchange");
    for (const artifactType of [
      "ortus.scenario",
      "ortus.snapshot",
      "ortus.uncertaintyConfig",
      "ortus.uncertaintyResult",
      "ortus.assumptionProfile",
      "ortus.networkDefinition",
      "ortus.networkMetrics",
      "ortus.resourceSystem",
      "ortus.resourceMetrics",
      "ortus.eventSchedule",
      "ortus.delayQueue",
      "ortus.feedbackLoops",
      "ortus.feedbackEventMetrics",
      hybridCompositionArtifactType,
      scaleModelArtifactType,
      scaleViewStateArtifactType,
      fieldLayerArtifactType
    ]) {
      expect(() => deserializeBoundaryEnvironmentModel(JSON.stringify({ schemaVersion: "1", artifactType }))).toThrow(/artifact type/);
    }
    expect(() => deserializeBoundaryEnvironmentModel(JSON.stringify({ schemaVersion: "1", artifactType: boundaryModelArtifactType }))).toThrow(
      /Invalid boundary\/environment model/
    );
    expect(() => deserializeBoundaryEnvironmentModel(JSON.stringify({ ...model, metadata: { activeEngine: {} } }))).toThrow(/live-state|spatial-field|executable/);
    expect(() => deserializeBoundaryEnvironmentModel({ ...model, metadata: { callback: () => null } })).toThrow(/plain JSON|Invalid boundary\/environment model/);
  });

  it("updates registry and template capability truth without making templates boundary-aware", () => {
    expect(getPrimitive("boundariesEnvironment")).toMatchObject({ status: "serviceOnly", supportLevel: "service" });
    expect(listServiceOnlyPrimitives().map((primitive) => primitive.id)).toEqual(expect.arrayContaining(["boundariesEnvironment"]));
    expect(getArtifactFamily(boundaryModelArtifactType)).toMatchObject({
      primitiveId: "boundariesEnvironment",
      implemented: true,
      importSupported: true,
      exportSupported: true,
      serviceOnly: true
    });
    expect(getPrimitive("spatialFields")).toMatchObject({ status: "serviceOnly", supportLevel: "service" });
    expect(getPrimitive("observability")).toMatchObject({ status: "serviceOnly", supportLevel: "service" });
    expect(getPrimitive("causalAssumptions")).toMatchObject({ status: "serviceOnly", supportLevel: "service" });
    expect(getPrimitive("visualModelBuilder")).toMatchObject({ status: "reserved" });
    expect(listReservedPrimitives().map((primitive) => primitive.id)).not.toContain("boundariesEnvironment");
    for (const template of productionTemplates) {
      expect(getTemplateCapability(template.id, "boundariesEnvironment")).toMatchObject({
        status: "unsupported",
        runtimeActive: false,
        serviceAvailable: true
      });
      expect(getTemplateCapability(template.id, "spatialFields")).toMatchObject({ status: "unsupported", runtimeActive: false, serviceAvailable: true });
      expect(getTemplateCapability(template.id, "observability")).toMatchObject({ status: "unsupported", runtimeActive: false, serviceAvailable: true });
      expect(getTemplateCapability(template.id, "causalAssumptions")).toMatchObject({ status: "unsupported", runtimeActive: false, serviceAvailable: true });
      expect(getTemplateCapability(template.id, "visualModelBuilder")).toMatchObject({ status: "unsupported", runtimeActive: false });
    }
    expect(getTemplateCapability("flocking-boids", "boundariesEnvironment")?.runtimeActive).toBe(false);
    expect(getTemplateCapability("schelling-segregation", "boundariesEnvironment")?.runtimeActive).toBe(false);
    expect(getTemplateCapability("predator-prey", "boundariesEnvironment")?.runtimeActive).toBe(false);
  });

  it("lets hybrid compositions reference boundary models without satisfying runtime capability requirements", () => {
    const report = validateCompositionCapabilities(
      composition({
        primitiveAttachments: [
          {
            id: "boundary-ref",
            primitiveId: "boundariesEnvironment",
            attachmentType: "boundaryModel",
            mode: "reference",
            artifactType: boundaryModelArtifactType,
            artifactId: "boundary-model-1",
            active: true,
            required: true
          }
        ],
        requiredCapabilities: [
          { primitiveId: "boundariesEnvironment", requiredSupportLevel: "runtime" },
          { primitiveId: "spatialFields", requiredSupportLevel: "documentation" }
        ]
      })
    );
    expect(report.valid).toBe(true);
    expect(report.runnableNow).toBe(false);
    expect(report.missingCapabilities.map((missing) => missing.primitiveId)).toContain("boundariesEnvironment");
    expect(report.missingCapabilities.map((missing) => missing.primitiveId)).not.toContain("spatialFields");
    const spatialRuntimeReport = validateCompositionCapabilities(
      composition({
        primitiveAttachments: [
          {
            id: "boundary-ref",
            primitiveId: "boundariesEnvironment",
            attachmentType: "boundaryModel",
            mode: "reference",
            artifactType: boundaryModelArtifactType,
            artifactId: "boundary-model-1",
            active: true,
            required: true
          }
        ],
        requiredCapabilities: [{ primitiveId: "spatialFields", requiredSupportLevel: "runtime" }]
      })
    );
    expect(spatialRuntimeReport.valid).toBe(true);
    expect(spatialRuntimeReport.runnableNow).toBe(false);
    expect(spatialRuntimeReport.missingCapabilities.map((missing) => missing.primitiveId)).toContain("spatialFields");
  });

  it("keeps template assumption notes concise and honest about boundary limitations", () => {
    for (const template of productionTemplates) {
      const text = JSON.stringify(template.assumptionProfile);
      expect(text).toContain("explicit system boundary or environment layer");
      expect(text).toContain("external forcing or exogenous shocks");
      expect(text).not.toMatch(/boundary\/environment capable|runtime-active boundary|causal proof|predictive boundary/i);
    }
    expect(JSON.stringify(productionTemplates.find((template) => template.id === "flocking-boids")?.assumptionProfile)).toContain(
      "boundaryMode as a full boundary model"
    );
    expect(JSON.stringify(productionTemplates.find((template) => template.id === "schelling-segregation")?.assumptionProfile)).toContain(
      "grid edges as a full boundary model"
    );
    expect(JSON.stringify(productionTemplates.find((template) => template.id === "predator-prey")?.assumptionProfile)).toContain(
      "world bounds as a full environment model"
    );
  });

  it("documents boundary/environment boundaries and keeps services headless", () => {
    const docs = [
      readFileSync(join(repoRoot, "README.md"), "utf8"),
      readFileSync(join(repoRoot, "docs", "concepts.md"), "utf8"),
      readFileSync(join(repoRoot, "src", "simulation", "README.md"), "utf8"),
      readFileSync(join(repoRoot, "docs", "roadmap.md"), "utf8"),
      readFileSync(join(repoRoot, "docs", "missing-pillars.md"), "utf8"),
      readFileSync(join(repoRoot, "AGENTS.md"), "utf8")
    ].join("\n");

    expect(docs).toContain("Active boundary exchanges are structural declarations, not runtime-executed flows.");
    expect(docs).toContain("World bounds, grid edges, and canvas limits are not the same as an explicit system boundary model.");
    expect(docs).toContain("A valid boundary model describes model scope and environment assumptions; it does not prove the real system is closed or open.");

    const boundariesDir = join(repoRoot, "src", "simulation", "boundaries");
    const source = readdirSync(boundariesDir)
      .filter((file) => file.endsWith(".ts"))
      .map((file) => readFileSync(join(boundariesDir, file), "utf8"))
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
    expect(source).not.toMatch(/from ["'][^"']*(spatialFields|fieldLayer|compiler|visualBuilder)[^"']*["']/);
  });
});
