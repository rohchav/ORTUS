import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  boundaryModelArtifactType,
  causalAssumptionModelArtifactType,
  createDefaultScenario,
  createEngineFromScenario,
  deserializeCausalAssumptionModel,
  fieldLayerArtifactType,
  getArtifactFamily,
  getCausalAssumption,
  getCausalAssumptionWarnings,
  getCausalVariable,
  getEvidenceItem,
  getInfluence,
  getInfluencesFromVariable,
  getInfluencesToVariable,
  getInterventionLinksForVariable,
  getPrimitive,
  getTemplateCapability,
  hybridCompositionArtifactType,
  listActiveInfluences,
  listActiveInterventionLinks,
  listCausalAssumptionEdges,
  listCausalAssumptions,
  listCausalVariables,
  listConfoundingEdges,
  listCorrelationEdges,
  listEvidenceItems,
  listExogenousVariables,
  listFeedbackEdges,
  listInfluences,
  listInterventionLinks,
  listLatentCausalVariables,
  listReservedPrimitives,
  listServiceOnlyPrimitives,
  modelHasActiveInterventionLinks,
  modelHasEmpiricalEvidence,
  observabilityModelArtifactType,
  productionTemplateMap,
  productionTemplates,
  scaleModelArtifactType,
  scaleViewStateArtifactType,
  serializeCausalAssumptionModel,
  summarizeCausalAssumptionModel,
  validateCausalAssumptionModel,
  validateCausalAssumptionModelForRuntime,
  validateCompositionCapabilities,
  type CausalAssumptionModel,
  type HybridModelComposition
} from "../index";

const repoRoot = process.cwd();

function causalModel(overrides: Partial<CausalAssumptionModel> = {}): CausalAssumptionModel {
  return {
    schemaVersion: "1",
    artifactType: causalAssumptionModelArtifactType,
    id: "causal-model",
    name: "Causal Model",
    version: "1.0.0",
    variables: [
      {
        id: "spread-probability",
        label: "Spread Probability",
        variableKind: "parameter",
        observabilityStatus: "direct",
        targetPath: "parameters.spreadProbability",
        unit: "probability-like"
      },
      {
        id: "burning-fraction",
        label: "Burning Fraction",
        variableKind: "metric",
        observabilityStatus: "direct",
        targetPath: "metrics.burningFraction",
        unit: "fraction"
      }
    ],
    ...overrides
  };
}

function fullCausalModel(overrides: Partial<CausalAssumptionModel> = {}): CausalAssumptionModel {
  return causalModel({
    scope: { templateId: "forest-fire", observabilityModelId: "observability-1", notes: ["Scope is structural only."] },
    variables: [
      causalModel().variables[0]!,
      causalModel().variables[1]!,
      {
        id: "latent-fuel-moisture",
        label: "Latent Fuel Moisture",
        variableKind: "latent",
        observabilityStatus: "latent",
        targetPath: "state.latentFuelMoisture"
      },
      {
        id: "lightning",
        label: "Lightning",
        variableKind: "exogenous",
        observabilityStatus: "unknown",
        targetPath: "parameters.lightningProbability"
      }
    ],
    evidenceItems: [
      {
        id: "design-evidence",
        label: "Model Design Evidence",
        evidenceType: "modelDesign",
        provenance: "Template documentation only."
      },
      {
        id: "empirical-placeholder",
        label: "Empirical Placeholder",
        evidenceType: "empiricalDataset"
      }
    ],
    assumptions: [
      {
        id: "mechanism-assumption",
        label: "Mechanism Assumption",
        assumptionType: "mechanism",
        statement: "Spread probability is a template parameter in the abstract model.",
        confidence: "medium",
        status: "modelAssumed",
        evidenceIds: ["design-evidence"]
      },
      {
        id: "hidden-confounding",
        label: "Hidden Confounding",
        assumptionType: "noUnmeasuredConfounding",
        statement: "A high-confidence hidden-confounding claim is intentionally weak in this fixture.",
        confidence: "high",
        status: "empiricalClaim"
      }
    ],
    influences: [
      {
        id: "spread-to-burning",
        label: "Spread To Burning",
        sourceVariableId: "spread-probability",
        targetVariableId: "burning-fraction",
        direction: "directed",
        influenceType: "causalAssumption",
        polarity: "positive",
        mechanismDescription: "Template rule uses spreadProbability when burning cells inspect fuel neighbors.",
        evidenceIds: ["design-evidence"],
        assumptionIds: ["mechanism-assumption"],
        active: true,
        executable: false
      },
      {
        id: "fuel-to-burning-correlation",
        label: "Fuel To Burning Correlation",
        sourceVariableId: "latent-fuel-moisture",
        targetVariableId: "burning-fraction",
        direction: "unknown",
        influenceType: "correlation",
        polarity: "unknown",
        active: true,
        executable: false
      },
      {
        id: "burning-feedback",
        label: "Burning Feedback",
        sourceVariableId: "burning-fraction",
        targetVariableId: "spread-probability",
        direction: "bidirectional",
        influenceType: "feedback",
        polarity: "mixed",
        active: false,
        executable: false
      },
      {
        id: "lightning-confounder",
        label: "Lightning Confounder",
        sourceVariableId: "lightning",
        targetVariableId: "burning-fraction",
        direction: "directed",
        influenceType: "confounding",
        active: true,
        executable: false
      }
    ],
    interventionLinks: [
      {
        id: "change-spread",
        label: "Change Spread Parameter",
        targetVariableId: "spread-probability",
        interventionKind: "changeParameter",
        expectedDirection: "increase",
        active: true,
        executable: false
      }
    ],
    ...overrides
  });
}

function composition(overrides: Partial<HybridModelComposition> = {}): HybridModelComposition {
  return {
    schemaVersion: "1",
    artifactType: hybridCompositionArtifactType,
    id: "causal-composition",
    name: "Causal Composition",
    version: "1.0.0",
    baseTemplateId: "forest-fire",
    primitiveAttachments: [],
    requiredCapabilities: [],
    ...overrides
  };
}

describe("causal assumption and influence structure services", () => {
  it("validates causal assumption models conservatively", () => {
    expect(validateCausalAssumptionModel(causalModel()).id).toBe("causal-model");
    expect(validateCausalAssumptionModel(fullCausalModel()).influences?.[0]?.id).toBe("spread-to-burning");
    expect(() => validateCausalAssumptionModel(causalModel({ id: "" }))).toThrow(/Invalid causal assumption model/);
    expect(() => validateCausalAssumptionModel(causalModel({ name: "" }))).toThrow(/Invalid causal assumption model/);
    expect(() => validateCausalAssumptionModel(causalModel({ artifactType: "ortus.observabilityModel" as never }))).toThrow(/Invalid causal assumption model/);
    expect(() => validateCausalAssumptionModel(causalModel({ version: "" }))).toThrow(/Invalid causal assumption model/);
    expect(() => validateCausalAssumptionModel({ ...causalModel(), variables: undefined })).toThrow(/Invalid causal assumption model/);
    expect(() => validateCausalAssumptionModel(causalModel({ variables: [causalModel().variables[0]!, { ...causalModel().variables[0]! }] }))).toThrow(
      /Duplicate variable id/
    );
    expect(() => validateCausalAssumptionModel(fullCausalModel({ influences: [fullCausalModel().influences![0]!, { ...fullCausalModel().influences![0]! }] }))).toThrow(
      /Duplicate influence id/
    );
    expect(() =>
      validateCausalAssumptionModel(fullCausalModel({ assumptions: [fullCausalModel().assumptions![0]!, { ...fullCausalModel().assumptions![0]! }] }))
    ).toThrow(/Duplicate assumption id/);
    expect(() =>
      validateCausalAssumptionModel(fullCausalModel({ evidenceItems: [fullCausalModel().evidenceItems![0]!, { ...fullCausalModel().evidenceItems![0]! }] }))
    ).toThrow(/Duplicate evidence id/);
    expect(() =>
      validateCausalAssumptionModel(
        fullCausalModel({ interventionLinks: [fullCausalModel().interventionLinks![0]!, { ...fullCausalModel().interventionLinks![0]! }] })
      )
    ).toThrow(/Duplicate intervention link id/);
    expect(() => validateCausalAssumptionModel(causalModel({ variables: [{ ...causalModel().variables[0]!, variableKind: "truth" as never }] }))).toThrow(
      /Invalid causal assumption model/
    );
    expect(() =>
      validateCausalAssumptionModel(causalModel({ variables: [{ ...causalModel().variables[0]!, observabilityStatus: "verified" as never }] }))
    ).toThrow(/Invalid causal assumption model/);
    expect(() =>
      validateCausalAssumptionModel(fullCausalModel({ influences: [{ ...fullCausalModel().influences![0]!, sourceVariableId: "missing" }] }))
    ).toThrow(/unknown sourceVariableId/);
    expect(() =>
      validateCausalAssumptionModel(fullCausalModel({ influences: [{ ...fullCausalModel().influences![0]!, targetVariableId: "missing" }] }))
    ).toThrow(/unknown targetVariableId/);
    expect(() =>
      validateCausalAssumptionModel(
        fullCausalModel({ influences: [{ ...fullCausalModel().influences![0]!, targetVariableId: "spread-probability" }] })
      )
    ).toThrow(/self-edge/);
    expect(() => validateCausalAssumptionModel(fullCausalModel({ influences: [{ ...fullCausalModel().influences![0]!, direction: "future" as never }] }))).toThrow(
      /Invalid causal assumption model/
    );
    expect(() =>
      validateCausalAssumptionModel(fullCausalModel({ influences: [{ ...fullCausalModel().influences![0]!, influenceType: "causalProof" as never }] }))
    ).toThrow(/Invalid causal assumption model/);
    expect(() =>
      validateCausalAssumptionModel(fullCausalModel({ influences: [{ ...fullCausalModel().influences![0]!, polarity: "certain" as never }] }))
    ).toThrow(/Invalid causal assumption model/);
    expect(() =>
      validateCausalAssumptionModel(fullCausalModel({ influences: [{ ...fullCausalModel().influences![0]!, executable: true as never }] }))
    ).toThrow(/Invalid causal assumption model/);
    expect(() =>
      validateCausalAssumptionModel(fullCausalModel({ influences: [{ ...fullCausalModel().influences![0]!, evidenceIds: ["missing"] }] }))
    ).toThrow(/unknown evidenceId/);
    expect(() =>
      validateCausalAssumptionModel(fullCausalModel({ influences: [{ ...fullCausalModel().influences![0]!, assumptionIds: ["missing"] }] }))
    ).toThrow(/unknown assumptionId/);
    expect(() =>
      validateCausalAssumptionModel(fullCausalModel({ assumptions: [{ ...fullCausalModel().assumptions![0]!, assumptionType: "truth" as never }] }))
    ).toThrow(/Invalid causal assumption model/);
    expect(() =>
      validateCausalAssumptionModel(fullCausalModel({ assumptions: [{ ...fullCausalModel().assumptions![0]!, statement: "" }] }))
    ).toThrow(/Invalid causal assumption model/);
    expect(() =>
      validateCausalAssumptionModel(fullCausalModel({ assumptions: [{ ...fullCausalModel().assumptions![0]!, confidence: "certain" as never }] }))
    ).toThrow(/Invalid causal assumption model/);
    expect(() =>
      validateCausalAssumptionModel(fullCausalModel({ assumptions: [{ ...fullCausalModel().assumptions![0]!, status: "proven" as never }] }))
    ).toThrow(/Invalid causal assumption model/);
    expect(() =>
      validateCausalAssumptionModel(fullCausalModel({ assumptions: [{ ...fullCausalModel().assumptions![0]!, evidenceIds: ["missing"] }] }))
    ).toThrow(/unknown evidenceId/);
    expect(() =>
      validateCausalAssumptionModel(fullCausalModel({ evidenceItems: [{ ...fullCausalModel().evidenceItems![0]!, evidenceType: "observedTruth" as never }] }))
    ).toThrow(/Invalid causal assumption model/);
    expect(() =>
      validateCausalAssumptionModel(fullCausalModel({ interventionLinks: [{ ...fullCausalModel().interventionLinks![0]!, interventionKind: "optimize" as never }] }))
    ).toThrow(/Invalid causal assumption model/);
    expect(() =>
      validateCausalAssumptionModel(fullCausalModel({ interventionLinks: [{ ...fullCausalModel().interventionLinks![0]!, targetVariableId: "missing" }] }))
    ).toThrow(/unknown targetVariableId/);
    expect(() =>
      validateCausalAssumptionModel(fullCausalModel({ interventionLinks: [{ ...fullCausalModel().interventionLinks![0]!, executable: true as never }] }))
    ).toThrow(/Invalid causal assumption model/);
    expect(() =>
      validateCausalAssumptionModel(fullCausalModel({ interventionLinks: [{ ...fullCausalModel().interventionLinks![0]!, expectedDirection: "certain" as never }] }))
    ).toThrow(/Invalid causal assumption model/);
    expect(() => validateCausalAssumptionModel(causalModel({ metadata: { value: Infinity } }))).toThrow(/non-finite/);
    expect(() => validateCausalAssumptionModel({ ...causalModel(), extra: true })).toThrow(/Invalid causal assumption model/);
    expect(() => validateCausalAssumptionModel(causalModel({ metadata: { world: { tick: 1 } } }))).toThrow(/live-state|executable/);
    expect(() => validateCausalAssumptionModel(causalModel({ metadata: { formula: "x + y" } }))).toThrow(/formula|structural-equation/);
    expect(() => validateCausalAssumptionModel(causalModel({ metadata: { structuralEquation: "y := f(x)" } }))).toThrow(/structural-equation/);
    expect(() => validateCausalAssumptionModel(causalModel({ metadata: { doCalculus: "do(x)" } }))).toThrow(/doCalculus/);
    expect(() => validateCausalAssumptionModel(causalModel({ metadata: { estimator: "ate" } }))).toThrow(/estimator/);
    expect(() => validateCausalAssumptionModel(causalModel({ metadata: { likelihood: "p(y|x)" } }))).toThrow(/likelihood/);
    expect(() => validateCausalAssumptionModel(causalModel({ metadata: { causalProof: true } }))).toThrow(/causalProof/);
    expect(() => validateCausalAssumptionModel(causalModel({ metadata: { certification: "validated" } }))).toThrow(/certification/);
    expect(() => validateCausalAssumptionModel(causalModel({ metadata: { dataset: [{ tick: 1, value: 2 }] } }))).toThrow(/external-data/);
    expect(() => validateCausalAssumptionModel(causalModel({ metadata: { timeSeries: [{ tick: 1, value: 2 }] } }))).toThrow(/external-data/);
    expect(() => validateCausalAssumptionModel(causalModel({ metadata: { huge: "x".repeat(230_000) } }))).toThrow(/Causal assumption model/);
    expect(() => validateCausalAssumptionModel(new Date())).toThrow(/plain JSON|Invalid causal assumption model/);
    expect(() => validateCausalAssumptionModel({ ...causalModel(), metadata: { callback: () => null } })).toThrow(
      /plain JSON|Invalid causal assumption model|executable-shaped/
    );
  });

  it("surfaces causal warnings without implying proof, prediction, calibration, or execution", () => {
    const warned = fullCausalModel({
      evidenceItems: [
        { id: "empirical", label: "Empirical", evidenceType: "empiricalDataset" },
        { id: "calibration", label: "Calibration", evidenceType: "calibrationResult" },
        { id: "validation", label: "Validation", evidenceType: "externalValidation" }
      ],
      assumptions: [
        {
          id: "empirical-claim",
          label: "Empirical Claim",
          assumptionType: "directionality",
          statement: "An empirical claim is declared without provenance.",
          confidence: "high",
          status: "empiricalClaim"
        },
        {
          id: "no-confounding",
          label: "No Confounding",
          assumptionType: "noUnmeasuredConfounding",
          statement: "No hidden confounding is assumed.",
          confidence: "high",
          status: "hypothetical"
        }
      ],
      influences: [
        {
          id: "causal-no-mechanism",
          label: "Causal Without Mechanism",
          sourceVariableId: "spread-probability",
          targetVariableId: "burning-fraction",
          direction: "unknown",
          influenceType: "causalAssumption",
          polarity: "unknown",
          active: true,
          executable: false
        },
        {
          id: "correlation",
          label: "Correlation",
          sourceVariableId: "latent-fuel-moisture",
          targetVariableId: "burning-fraction",
          direction: "directed",
          influenceType: "correlation",
          active: true,
          executable: false
        },
        {
          id: "inactive-correlation",
          label: "Inactive Correlation",
          sourceVariableId: "lightning",
          targetVariableId: "burning-fraction",
          direction: "directed",
          influenceType: "correlation",
          active: false,
          executable: false
        },
        {
          id: "unknown",
          label: "Unknown",
          sourceVariableId: "lightning",
          targetVariableId: "burning-fraction",
          direction: "unknown",
          influenceType: "unknown",
          active: false,
          executable: false
        },
        {
          id: "feedback",
          label: "Feedback",
          sourceVariableId: "burning-fraction",
          targetVariableId: "spread-probability",
          direction: "bidirectional",
          influenceType: "feedback",
          active: false,
          executable: false
        },
        {
          id: "confounding",
          label: "Confounding",
          sourceVariableId: "lightning",
          targetVariableId: "burning-fraction",
          direction: "directed",
          influenceType: "confounding",
          active: true,
          executable: false
        },
        {
          id: "mediation",
          label: "Mediation",
          sourceVariableId: "spread-probability",
          targetVariableId: "burning-fraction",
          direction: "directed",
          influenceType: "mediation",
          active: false,
          executable: false
        },
        {
          id: "moderation",
          label: "Moderation",
          sourceVariableId: "lightning",
          targetVariableId: "spread-probability",
          direction: "directed",
          influenceType: "moderation",
          active: false,
          executable: false
        }
      ]
    });
    const warnings = getCausalAssumptionWarnings(warned).join(" ");
    expect(warnings).toMatch(/no mechanismDescription/);
    expect(warnings).toMatch(/has no evidenceIds/);
    expect(warnings).toMatch(/correlation is not causation/);
    expect(warnings).toMatch(/Correlation influence inactive-correlation.*correlation is not causation/);
    expect(warnings).toMatch(/unknown influenceType/);
    expect(warnings).toMatch(/unknown direction/);
    expect(warnings).toMatch(/unknown polarity/);
    expect(warnings).toMatch(/structural label, not inferred dynamics/);
    expect(warnings).toMatch(/no confounder explanation/);
    expect(warnings).toMatch(/mediation without mechanismDescription/);
    expect(warnings).toMatch(/moderation without mechanismDescription/);
    expect(warnings).toMatch(/empiricalClaim without evidenceIds/);
    expect(warnings).toMatch(/empiricalDataset without provenance/);
    expect(warnings).toMatch(/calibrationResult without provenance/);
    expect(warnings).toMatch(/externalValidation without provenance/);
    expect(warnings).toMatch(/High confidence causal assumption empirical-claim has no evidenceIds/);
    expect(warnings).toMatch(/No-unmeasured-confounding assumption no-confounding has high confidence/);
    expect(warnings).toMatch(/Active intervention link change-spread is structural only and is not executed/);
    expect(warnings).toMatch(/Active influence causal-no-mechanism is a structural declaration/);
    expect(warnings).toMatch(/metrics are model outputs, not causal evidence/);
    expect(warnings).toMatch(/observability is measurement structure, not validation or causal proof/);
    expect(warnings).not.toMatch(/will predict|proves causality|is calibrated/i);

    const noEvidenceWarnings = getCausalAssumptionWarnings(
      causalModel({
        influences: [
          {
            id: "assumed-edge",
            label: "Assumed Edge",
            sourceVariableId: "spread-probability",
            targetVariableId: "burning-fraction",
            direction: "directed",
            influenceType: "causalAssumption",
            active: true,
            executable: false
          }
        ]
      })
    ).join(" ");
    expect(noEvidenceWarnings).toMatch(/no evidence items declared/);

    const report = validateCausalAssumptionModelForRuntime(warned);
    expect(report).toMatchObject({ valid: true, runnableNow: false });
    expect(report.missingCapabilities[0]).toMatchObject({ primitiveId: "causalAssumptions", requiredSupportLevel: "runtime" });
    expect(report.warnings.join(" ")).toContain("declare influence assumptions; they do not prove causality");
  });

  it("queries and summarizes causal structure without mutating input", () => {
    const model = fullCausalModel();
    const before = JSON.stringify(model);
    expect(listCausalVariables(model).map((variable) => variable.id)).toEqual([
      "spread-probability",
      "burning-fraction",
      "latent-fuel-moisture",
      "lightning"
    ]);
    expect(getCausalVariable(model, "spread-probability")?.variableKind).toBe("parameter");
    expect(listLatentCausalVariables(model).map((variable) => variable.id)).toEqual(["latent-fuel-moisture"]);
    expect(listExogenousVariables(model).map((variable) => variable.id)).toEqual(["lightning"]);
    expect(listInfluences(model)).toHaveLength(4);
    expect(listActiveInfluences(model).map((influence) => influence.id)).toEqual([
      "spread-to-burning",
      "fuel-to-burning-correlation",
      "lightning-confounder"
    ]);
    expect(getInfluence(model, "spread-to-burning")?.sourceVariableId).toBe("spread-probability");
    expect(getInfluencesFromVariable(model, "spread-probability").map((influence) => influence.id)).toEqual(["spread-to-burning"]);
    expect(getInfluencesToVariable(model, "burning-fraction").map((influence) => influence.id)).toEqual([
      "spread-to-burning",
      "fuel-to-burning-correlation",
      "lightning-confounder"
    ]);
    expect(listCausalAssumptionEdges(model).map((influence) => influence.id)).toEqual(["spread-to-burning"]);
    expect(listCorrelationEdges(model).map((influence) => influence.id)).toEqual(["fuel-to-burning-correlation"]);
    expect(listFeedbackEdges(model).map((influence) => influence.id)).toEqual(["burning-feedback"]);
    expect(listConfoundingEdges(model).map((influence) => influence.id)).toEqual(["lightning-confounder"]);
    expect(listCausalAssumptions(model)).toHaveLength(2);
    expect(getCausalAssumption(model, "mechanism-assumption")?.status).toBe("modelAssumed");
    expect(listEvidenceItems(model).map((evidence) => evidence.id)).toEqual(["design-evidence", "empirical-placeholder"]);
    expect(getEvidenceItem(model, "design-evidence")?.evidenceType).toBe("modelDesign");
    expect(listInterventionLinks(model)).toHaveLength(1);
    expect(listActiveInterventionLinks(model)).toHaveLength(1);
    expect(getInterventionLinksForVariable(model, "spread-probability").map((link) => link.id)).toEqual(["change-spread"]);
    expect(modelHasEmpiricalEvidence(model)).toBe(true);
    expect(modelHasActiveInterventionLinks(model)).toBe(true);
    expect(summarizeCausalAssumptionModel(model)).toMatchObject({
      id: "causal-model",
      variableCount: 4,
      influenceCount: 4,
      activeInfluenceCount: 3,
      causalAssumptionEdgeCount: 1,
      correlationEdgeCount: 1,
      feedbackEdgeCount: 1,
      confoundingEdgeCount: 1,
      latentVariableCount: 1,
      exogenousVariableCount: 1,
      evidenceItemCount: 2,
      empiricalEvidenceCount: 1,
      assumptionCount: 2,
      interventionLinkCount: 1,
      executableCount: 0
    });
    expect(JSON.stringify(model)).toBe(before);
    const returned = listInfluences(model)[0] as { label: string };
    returned.label = "Mutated";
    expect(listInfluences(model)[0]?.label).toBe("Spread To Burning");

    const minimal = causalModel();
    expect(listInfluences(minimal)).toEqual([]);
    expect(listCausalAssumptions(minimal)).toEqual([]);
    expect(listEvidenceItems(minimal)).toEqual([]);
    expect(listInterventionLinks(minimal)).toEqual([]);
    expect(getInfluence(minimal, "missing")).toBeUndefined();
    expect(getCausalAssumption(minimal, "missing")).toBeUndefined();
    expect(getEvidenceItem(minimal, "missing")).toBeUndefined();
    expect(summarizeCausalAssumptionModel(minimal)).toMatchObject({ influenceCount: 0, evidenceItemCount: 0, executableCount: 0 });
  });

  it("serializes only causal-assumption artifacts and rejects other artifact families", () => {
    const model = fullCausalModel();
    const json = serializeCausalAssumptionModel(model);
    expect(json).toContain(`"artifactType": "${causalAssumptionModelArtifactType}"`);
    expect(deserializeCausalAssumptionModel(json)).toMatchObject({ id: "causal-model", artifactType: causalAssumptionModelArtifactType });
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
      boundaryModelArtifactType,
      fieldLayerArtifactType,
      observabilityModelArtifactType
    ]) {
      expect(() => deserializeCausalAssumptionModel(JSON.stringify({ schemaVersion: "1", artifactType }))).toThrow(/artifact type/);
    }
    expect(() => deserializeCausalAssumptionModel(JSON.stringify({ schemaVersion: "1", artifactType: causalAssumptionModelArtifactType }))).toThrow(
      /Invalid causal assumption model/
    );
    expect(() => deserializeCausalAssumptionModel(JSON.stringify({ ...model, metadata: { activeEngine: {} } }))).toThrow(/live-state|executable/);
    expect(() => deserializeCausalAssumptionModel(JSON.stringify({ ...model, metadata: { observedData: [{ tick: 1, value: 2 }] } }))).toThrow(
      /external-data/
    );
    expect(() => deserializeCausalAssumptionModel(JSON.stringify({ ...model, metadata: { structuralEquation: "y := f(x)" } }))).toThrow(
      /structural-equation/
    );
    expect(() => deserializeCausalAssumptionModel(JSON.stringify({ ...model, metadata: { doCalculus: "do(x)" } }))).toThrow(/doCalculus/);
    expect(() => deserializeCausalAssumptionModel(JSON.stringify({ ...model, metadata: { estimator: "ate" } }))).toThrow(/estimator/);
    expect(() => deserializeCausalAssumptionModel(JSON.stringify({ ...model, metadata: { likelihood: "p(y|x)" } }))).toThrow(/likelihood/);
    expect(() => deserializeCausalAssumptionModel(JSON.stringify({ ...model, metadata: { causalProof: true } }))).toThrow(/causalProof/);
    expect(() => deserializeCausalAssumptionModel(JSON.stringify({ ...model, metadata: { certification: "validated" } }))).toThrow(/certification/);
    expect(() => deserializeCausalAssumptionModel({ ...model, metadata: { callback: () => null } })).toThrow(
      /plain JSON|Invalid causal assumption model|executable-shaped/
    );
  });

  it("updates registry and template capabilities without making templates causal-runtime capable", () => {
    expect(getPrimitive("causalAssumptions")).toMatchObject({ status: "serviceOnly", supportLevel: "service" });
    expect(getPrimitive("causalAssumptions")?.limitations.join(" ")).toMatch(/structural equation solving/);
    expect(getPrimitive("causalAssumptions")?.mustNotClaimYet.join(" ")).toMatch(/structural equation solving/);
    expect(listServiceOnlyPrimitives().map((primitive) => primitive.id)).toContain("causalAssumptions");
    expect(listReservedPrimitives().map((primitive) => primitive.id)).not.toContain("causalAssumptions");
    expect(getArtifactFamily(causalAssumptionModelArtifactType)).toMatchObject({
      primitiveId: "causalAssumptions",
      implemented: true,
      importSupported: true,
      exportSupported: true,
      serviceOnly: true
    });
    expect(getPrimitive("validationCalibration")).toMatchObject({ status: "reserved" });
    expect(getPrimitive("visualModelBuilder")).toMatchObject({ status: "reserved" });
    expect(getPrimitive("externalFrameworkInterop")).toMatchObject({ status: "reserved" });
    for (const template of productionTemplates) {
      expect(getTemplateCapability(template.id, "causalAssumptions")).toMatchObject({
        status: "unsupported",
        runtimeActive: false,
        serviceAvailable: true
      });
      expect(getTemplateCapability(template.id, "validationCalibration")).toMatchObject({ status: "unsupported", runtimeActive: false });
      expect(getTemplateCapability(template.id, "interventionStrategy")).toMatchObject({ status: "unsupported", runtimeActive: false });
      expect(getTemplateCapability(template.id, "visualModelBuilder")).toMatchObject({ status: "unsupported", runtimeActive: false });
    }
  });

  it("keeps networks, feedback, observability, metrics, and model mechanisms distinct from causal proof", () => {
    const template = productionTemplateMap["forest-fire"];
    const scenario = createDefaultScenario({ template, scenarioId: "forest-causality-distinction", seed: "forest-causal", now: "2026-05-19T12:00:00.000Z" });
    const { engine } = createEngineFromScenario(scenario);
    engine.runSteps(2);
    const latestMetrics = engine.createSnapshot().metricsHistory.at(-1)?.values;
    expect(latestMetrics?.burningFraction).toBeDefined();
    expect(getTemplateCapability("forest-fire", "causalAssumptions")).toMatchObject({ runtimeActive: false });
    expect(getTemplateCapability("forest-fire", "networks")).toMatchObject({ runtimeActive: false });
    expect(getTemplateCapability("forest-fire", "feedbackEvents")).toMatchObject({ runtimeActive: false });
    expect(getTemplateCapability("forest-fire", "observability")).toMatchObject({ runtimeActive: false });

    const profileText = JSON.stringify(template.assumptionProfile).toLowerCase();
    expect(profileText).toContain("runtime rules and interactions are model design assumptions, not empirical evidence of causality");
    expect(profileText).toContain("forest-fire spread rules are abstract model mechanisms, not empirical causal fire science");
    expect(profileText).not.toContain("causal validation of real fire mechanisms.");

    const warnings = getCausalAssumptionWarnings(causalModel()).join(" ");
    expect(warnings).toMatch(/metrics are model outputs, not causal evidence/);
  });

  it("keeps causal composition references structural and non-runnable for runtime requirements", () => {
    const report = validateCompositionCapabilities(
      composition({
        primitiveAttachments: [
          {
            id: "causal-ref",
            primitiveId: "causalAssumptions",
            attachmentType: "causalAssumptionModel",
            mode: "reference",
            artifactType: causalAssumptionModelArtifactType,
            artifactId: "causal-1",
            active: true,
            required: true
          }
        ],
        requiredCapabilities: [{ primitiveId: "causalAssumptions", requiredSupportLevel: "runtime" }]
      })
    );
    expect(report.valid).toBe(true);
    expect(report.runnableNow).toBe(false);
    expect(report.missingCapabilities.map((missing) => missing.primitiveId)).toContain("causalAssumptions");

    const validationRequirement = validateCompositionCapabilities(
      composition({
        primitiveAttachments: [
          {
            id: "causal-ref",
            primitiveId: "causalAssumptions",
            attachmentType: "causalAssumptionModel",
            mode: "reference",
            artifactType: causalAssumptionModelArtifactType,
            artifactId: "causal-1",
            active: true,
            required: false
          }
        ],
        requiredCapabilities: [{ primitiveId: "validationCalibration", requiredSupportLevel: "metadata" }]
      })
    );
    expect(validationRequirement.runnableNow).toBe(false);
    expect(validationRequirement.missingCapabilities.map((missing) => missing.primitiveId)).toContain("validationCalibration");

    const interventionRuntimeRequirement = validateCompositionCapabilities(
      composition({
        requiredCapabilities: [{ primitiveId: "interventionStrategy", requiredSupportLevel: "runtime" }]
      })
    );
    expect(interventionRuntimeRequirement.runnableNow).toBe(false);
    expect(interventionRuntimeRequirement.missingCapabilities.map((missing) => missing.primitiveId)).toContain("interventionStrategy");
  });

  it("documents causal-assumption boundaries and keeps services headless", () => {
    const docs = [
      readFileSync(join(repoRoot, "README.md"), "utf8"),
      readFileSync(join(repoRoot, "docs", "concepts.md"), "utf8"),
      readFileSync(join(repoRoot, "src", "simulation", "README.md"), "utf8"),
      readFileSync(join(repoRoot, "docs", "roadmap.md"), "utf8"),
      readFileSync(join(repoRoot, "docs", "missing-pillars.md"), "utf8"),
      readFileSync(join(repoRoot, "AGENTS.md"), "utf8")
    ].join("\n");

    expect(docs).toContain("Causal assumption models declare influence assumptions; they do not prove causality.");
    expect(docs).toContain("Network edges, feedback labels, runtime metrics, and observations are not causal evidence by themselves.");
    expect(docs).toContain("Active causal influences are structural declarations, not runtime-executed behavior.");
    expect(docs).toContain("Do not treat network edges as causal edges.");
    expect(docs).toContain("Do not mark templates causal-assumption-capable unless runtime uses `CausalAssumptionModel`.");
    expect(docs).toContain("Strategy and control descriptors declare intervention semantics; they do not execute or prove strategies.");

    const causalityDir = join(repoRoot, "src", "simulation", "causality");
    const source = readdirSync(causalityDir)
      .filter((file) => file.endsWith(".ts"))
      .map((file) => readFileSync(join(causalityDir, file), "utf8"))
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
    expect(source).not.toContain("doCalculus(");
    expect(source).not.toMatch(/from ["'][^"']*\/(renderer|components|app|ingestion|inference|calibration|mcmc|filter|kalman|particle|graphInference|doCalculus|structuralEquation|compiler|visualBuilder)(\/|["'])/);
  });
});
