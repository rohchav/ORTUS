import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  applyFlow,
  applyFlows,
  assumptionProfileArtifactType,
  computeResourceMetrics,
  createDefaultRunConfig,
  createDefaultScenario,
  deserializeResourceMetrics,
  deserializeResourceSystem,
  getFlow,
  getFlowsForResource,
  getResource,
  getStock,
  getStocksForResource,
  getStockValue,
  getTotalStockForResource,
  hasResource,
  hasStock,
  initializeResourceSystem,
  maxResourceCount,
  maxResourceSystemJsonLength,
  networkDefinitionArtifactType,
  networkMetricsArtifactType,
  productionTemplates,
  resourceMetricsArtifactType,
  resourceSystemArtifactType,
  serializeResourceMetrics,
  serializeResourceSystem,
  uncertaintyConfigArtifactType,
  validateResourceSystemDefinition,
  validateResourceSystemState,
  validateRunConfig,
  validateScenario,
  validateUncertaintyConfig,
  type ResourceSystemDefinition
} from "../index";

function baseResourceSystem(): ResourceSystemDefinition {
  return {
    schemaVersion: "1",
    artifactType: resourceSystemArtifactType,
    id: "resource-test",
    label: "Resource test",
    resources: [{ id: "food", label: "Food", unit: "units", kind: "material", min: 0, max: 100 }],
    stocks: [
      { id: "field", label: "Field biomass", resourceId: "food", initialValue: 5, min: 0, capacity: 10 },
      { id: "store", label: "Stored food", resourceId: "food", initialValue: 2, min: 0, capacity: 20 }
    ],
    flows: [
      { id: "a-produce", label: "Produce", resourceId: "food", targetStockId: "field", flowType: "produce", rate: 4 },
      { id: "b-consume", label: "Consume", resourceId: "food", sourceStockId: "field", flowType: "consume", rate: 3 },
      {
        id: "c-transfer",
        label: "Transfer",
        resourceId: "food",
        sourceStockId: "field",
        targetStockId: "store",
        flowType: "transfer",
        rate: 2
      },
      { id: "d-regenerate", label: "Regenerate", resourceId: "food", targetStockId: "field", flowType: "regenerate", rate: 20 },
      { id: "e-decay", label: "Decay", resourceId: "food", sourceStockId: "field", flowType: "decay", rate: 2 }
    ],
    metadata: { purpose: "test" }
  };
}

describe("resource, stock, and flow primitives", () => {
  it("validates resource systems and rejects malformed or live-state payloads", () => {
    const system = baseResourceSystem();
    expect(validateResourceSystemDefinition(system)).toMatchObject({ id: "resource-test" });
    expect(() => validateResourceSystemDefinition({ ...system, resources: [...system.resources, { id: "food", label: "Duplicate" }] })).toThrow(
      /Duplicate resource id/
    );
    expect(() => validateResourceSystemDefinition({ ...system, stocks: [...system.stocks, { ...system.stocks[0]! }] })).toThrow(
      /Duplicate stock id/
    );
    expect(() => validateResourceSystemDefinition({ ...system, flows: [...system.flows, { ...system.flows[0]! }] })).toThrow(
      /Duplicate flow id/
    );
    expect(() => validateResourceSystemDefinition({ ...system, stocks: [{ ...system.stocks[0]!, resourceId: "missing" }] })).toThrow(
      /Unknown stock resourceId/
    );
    expect(() => validateResourceSystemDefinition({ ...system, flows: [{ ...system.flows[0]!, resourceId: "missing" }] })).toThrow(
      /Unknown flow resourceId/
    );
    expect(() => validateResourceSystemDefinition({ ...system, flows: [{ ...system.flows[1]!, sourceStockId: "missing" }] })).toThrow(
      /Unknown sourceStockId/
    );
    expect(() => validateResourceSystemDefinition({ ...system, flows: [{ ...system.flows[0]!, targetStockId: "missing" }] })).toThrow(
      /Unknown targetStockId/
    );
    expect(() =>
      validateResourceSystemDefinition({
        ...system,
        resources: [...system.resources, { id: "water", label: "Water" }],
        stocks: [...system.stocks, { id: "water-stock", label: "Water", resourceId: "water", initialValue: 1 }],
        flows: [{ ...system.flows[2]!, targetStockId: "water-stock" }]
      })
    ).toThrow(/target stock resource mismatch/);
    expect(() =>
      validateResourceSystemDefinition({ ...system, flows: [{ id: "consume-missing", label: "Consume", resourceId: "food", flowType: "consume", rate: 1 }] })
    ).toThrow(/requires sourceStockId/);
    expect(() =>
      validateResourceSystemDefinition({ ...system, flows: [{ id: "produce-missing", label: "Produce", resourceId: "food", flowType: "produce", rate: 1 }] })
    ).toThrow(/requires targetStockId/);
    expect(() =>
      validateResourceSystemDefinition({ ...system, flows: [{ id: "transfer-missing", label: "Transfer", resourceId: "food", targetStockId: "store", flowType: "transfer", rate: 1 }] })
    ).toThrow(/Transfer flow requires/);
    expect(() => validateResourceSystemDefinition({ ...system, flows: [{ ...system.flows[0]!, flowType: "equation" }] })).toThrow(
      /Invalid resource system/
    );
    expect(() => validateResourceSystemDefinition({ ...system, flows: [{ ...system.flows[0]!, rate: Number.NaN }] })).toThrow(/non-finite/);
    expect(() => validateResourceSystemDefinition({ ...system, stocks: [{ ...system.stocks[0]!, initialValue: -1 }] })).toThrow(/below minimum/);
    expect(() => validateResourceSystemDefinition({ ...system, stocks: [{ ...system.stocks[0]!, min: 10, max: 5 }] })).toThrow(/Stock max/);
    expect(() => validateResourceSystemDefinition({ ...system, resources: [{ ...system.resources[0]!, min: 10, max: 5 }] })).toThrow(
      /Resource max/
    );
    expect(() => validateResourceSystemDefinition({ ...system, stocks: [{ ...system.stocks[0]!, capacity: -1 }] })).toThrow(
      /Invalid resource system/
    );
    expect(() => validateResourceSystemDefinition({ ...system, stocks: [{ ...system.stocks[0]!, min: 12, capacity: 10 }] })).toThrow(
      /upper bound/
    );
    expect(() => validateResourceSystemDefinition({ ...system, stocks: [{ ...system.stocks[0]!, initialValue: 11 }] })).toThrow(/above/);
    expect(() => validateResourceSystemDefinition({ ...system, metadata: { world: {} } })).toThrow(/live run state/);
    expect(() => validateResourceSystemDefinition({ ...system, metadata: { fn: (() => "bad") as unknown as never } })).toThrow(/plain JSON/);
    expect(() => validateResourceSystemDefinition({ ...system, metadata: { huge: "x".repeat(50_000) } })).toThrow(/Resource metadata/);
    expect(() => validateResourceSystemDefinition({ ...system, extra: true })).toThrow(/Invalid resource system/);
    expect(() =>
      validateResourceSystemDefinition({
        ...system,
        resources: Array.from({ length: maxResourceCount + 1 }, (_, index) => ({ id: `resource-${index}`, label: `Resource ${index}` }))
      })
    ).toThrow(/Invalid resource system/);

    const state = initializeResourceSystem(system);
    expect(() => validateResourceSystemState({ ...state, stockStates: [...state.stockStates, state.stockStates[0]!] })).toThrow(
      /Duplicate stock state id/
    );
    expect(() => validateResourceSystemState({ ...state, stockStates: state.stockStates.slice(1) })).toThrow(/Missing stock state/);
  });

  it("applies deterministic non-mutating produce, consume, transfer, regenerate, decay, and depletion flows", () => {
    const definition = baseResourceSystem();
    const initial = initializeResourceSystem(definition);
    expect(getStockValue(initial, "field")).toBe(5);
    expect(getStockValue(initial, "store")).toBe(2);

    const before = JSON.stringify(initial);
    const produced = applyFlow(initial, definition.flows.find((flow) => flow.id === "a-produce")!, 1);
    expect(getStockValue(produced.state, "field")).toBe(9);
    expect(JSON.stringify(initial)).toBe(before);

    const consumed = applyFlow(produced.state, definition.flows.find((flow) => flow.id === "b-consume")!, 2);
    expect(getStockValue(consumed.state, "field")).toBe(6);

    const transferred = applyFlow(consumed.state, definition.flows.find((flow) => flow.id === "c-transfer")!, 3);
    expect(getStockValue(transferred.state, "field")).toBe(4);
    expect(getStockValue(transferred.state, "store")).toBe(4);

    const regenerated = applyFlow(transferred.state, definition.flows.find((flow) => flow.id === "d-regenerate")!, 4);
    expect(getStockValue(regenerated.state, "field")).toBe(10);
    expect(regenerated.result.appliedAmount).toBe(6);
    expect(regenerated.result.warnings?.[0]).toMatch(/capacity/);

    const decayed = applyFlow(regenerated.state, definition.flows.find((flow) => flow.id === "e-decay")!, 5);
    expect(getStockValue(decayed.state, "field")).toBe(8);

    const depleted = applyFlow(decayed.state, { id: "z-deplete", label: "Deplete", resourceId: "food", sourceStockId: "field", flowType: "deplete", rate: 20 }, 6);
    expect(getStockValue(depleted.state, "field")).toBe(0);
    expect(depleted.result.appliedAmount).toBe(8);
    expect(depleted.result.warnings?.[0]).toMatch(/insufficient/);
    expect(Object.values(depleted.state.stockStates).every((stockState) => Number.isFinite(stockState.value))).toBe(true);

    const disabled = applyFlow(
      depleted.state,
      {
        id: "disabled-produce",
        label: "Disabled produce",
        resourceId: "food",
        targetStockId: "field",
        flowType: "produce",
        rate: 5,
        enabled: false
      },
      7
    );
    expect(getStockValue(disabled.state, "field")).toBe(0);
    expect(disabled.result).toMatchObject({ requestedAmount: 0, appliedAmount: 0, reason: "disabled" });

    const debtDefinition: ResourceSystemDefinition = {
      schemaVersion: "1",
      artifactType: resourceSystemArtifactType,
      id: "debt",
      label: "Debt",
      resources: [{ id: "balance", label: "Balance", allowNegative: true }],
      stocks: [{ id: "account", label: "Account", resourceId: "balance", initialValue: 0, allowNegative: true }],
      flows: [{ id: "withdraw", label: "Withdraw", resourceId: "balance", sourceStockId: "account", flowType: "consume", rate: 3 }]
    };
    const debt = applyFlow(initializeResourceSystem(debtDefinition), debtDefinition.flows[0]!, 1);
    expect(getStockValue(debt.state, "account")).toBe(-3);
    expect(debt.result.warnings).toEqual([]);
  });

  it("applies flows in deterministic id order and keeps bounded ledgers", () => {
    const definition: ResourceSystemDefinition = {
      ...baseResourceSystem(),
      stocks: [{ id: "field", label: "Field biomass", resourceId: "food", initialValue: 5, min: 0, capacity: 10 }],
      flows: [
        { id: "b-consume", label: "Consume", resourceId: "food", sourceStockId: "field", flowType: "consume", rate: 8 },
        { id: "a-produce", label: "Produce", resourceId: "food", targetStockId: "field", flowType: "produce", rate: 5 }
      ]
    };
    const initial = initializeResourceSystem(definition);
    const first = applyFlows(initial, [...definition.flows].reverse(), 1);
    const second = applyFlows(initial, definition.flows, 1);
    expect(first.state).toEqual(second.state);
    expect(getStockValue(first.state, "field")).toBe(2);
    expect(first.results.map((result) => result.flowId)).toEqual(["a-produce", "b-consume"]);
  });

  it("computes finite stock-flow metrics without mutating state", () => {
    const definition = baseResourceSystem();
    const initial = initializeResourceSystem(definition);
    const outcome = applyFlows(initial, definition.flows, 7);
    const before = JSON.stringify(outcome.state);
    const metrics = computeResourceMetrics(outcome.state, outcome.results);
    expect(metrics.metrics.resourceCount).toBe(1);
    expect(metrics.metrics.stockCount).toBe(2);
    expect(metrics.metrics.flowCount).toBe(5);
    expect(metrics.metrics.totalStockByResource.food).toBe(getTotalStockForResource(outcome.state, "food"));
    expect(metrics.metrics.minStockValue).toBeGreaterThanOrEqual(0);
    expect(metrics.metrics.maxStockValue).toBeGreaterThanOrEqual(metrics.metrics.minStockValue);
    expect(metrics.metrics.depletedStockCount).toBeGreaterThanOrEqual(0);
    expect(metrics.metrics.overCapacityStockCount).toBe(0);
    expect(metrics.metrics.totalFlowAppliedByResource.food).toBeGreaterThan(0);
    expect(metrics.metrics.totalFlowRequestedByResource.food).toBeGreaterThan(0);
    expect(Object.values(metrics.metrics).flatMap((value) => (typeof value === "object" ? Object.values(value) : [value])).every(Number.isFinite)).toBe(
      true
    );
    expect(JSON.stringify(outcome.state)).toBe(before);

    const empty = initializeResourceSystem({
      schemaVersion: "1",
      artifactType: resourceSystemArtifactType,
      id: "empty",
      label: "Empty",
      resources: [],
      stocks: [],
      flows: []
    });
    expect(computeResourceMetrics(empty).metrics).toMatchObject({
      resourceCount: 0,
      stockCount: 0,
      flowCount: 0,
      minStockValue: 0,
      maxStockValue: 0
    });

    const multi = initializeResourceSystem({
      schemaVersion: "1",
      artifactType: resourceSystemArtifactType,
      id: "multi-resource",
      label: "Multi resource",
      resources: [
        { id: "food", label: "Food" },
        { id: "water", label: "Water" }
      ],
      stocks: [
        { id: "food-stock", label: "Food", resourceId: "food", initialValue: 4 },
        { id: "water-stock", label: "Water", resourceId: "water", initialValue: 9 }
      ],
      flows: []
    });
    expect(computeResourceMetrics(multi).metrics.totalStockByResource).toEqual({ food: 4, water: 9 });
  });

  it("queries resources, stocks, flows, and totals without mutating state", () => {
    const state = initializeResourceSystem(baseResourceSystem());
    const before = JSON.stringify(state);
    expect(getResource(state, "food").label).toBe("Food");
    expect(getStock(state, "field").resourceId).toBe("food");
    expect(getFlow(state, "a-produce").flowType).toBe("produce");
    expect(getStocksForResource(state, "food").map((stock) => stock.id)).toEqual(["field", "store"]);
    expect(getFlowsForResource(state, "food").map((flow) => flow.id)).toEqual(["a-produce", "b-consume", "c-transfer", "d-regenerate", "e-decay"]);
    expect(getStockValue(state, "field")).toBe(5);
    expect(getTotalStockForResource(state, "food")).toBe(7);
    expect(hasResource(state, "food")).toBe(true);
    expect(hasStock(state, "field")).toBe(true);
    expect(() => getResource(state, "missing")).toThrow(/Unknown resource/);
    expect(() => getStockValue(state, "missing")).toThrow(/Unknown stock state/);
    expect(JSON.stringify(state)).toBe(before);
  });

  it("serializes resource systems and metrics as distinct artifacts", () => {
    const state = initializeResourceSystem(baseResourceSystem());
    const json = serializeResourceSystem(state);
    expect(deserializeResourceSystem(json)).toEqual(state);

    const metrics = computeResourceMetrics(state);
    const metricsJson = serializeResourceMetrics(metrics);
    expect(JSON.parse(metricsJson).artifactType).toBe(resourceMetricsArtifactType);
    expect(deserializeResourceMetrics(metricsJson).metrics.stockCount).toBe(2);
    expect(() => deserializeResourceMetrics(JSON.stringify({ ...JSON.parse(metricsJson), world: {} }))).toThrow(/live run state|Invalid resource/);

    expect(() => deserializeResourceSystem(JSON.stringify({ schemaVersion: "1", artifactType: "ortus.scenario" }))).toThrow(/artifact type/);
    expect(() => deserializeResourceSystem(JSON.stringify({ schemaVersion: "1", artifactType: "ortus.snapshot" }))).toThrow(/artifact type/);
    expect(() => deserializeResourceSystem(JSON.stringify({ schemaVersion: "1", artifactType: "ortus.uncertaintyConfig" }))).toThrow(/artifact type/);
    expect(() => deserializeResourceSystem(JSON.stringify({ schemaVersion: "1", artifactType: "ortus.uncertaintyResult" }))).toThrow(
      /artifact type/
    );
    expect(() => deserializeResourceSystem(JSON.stringify({ schemaVersion: "1", artifactType: assumptionProfileArtifactType }))).toThrow(/artifact type/);
    expect(() => deserializeResourceSystem(JSON.stringify({ schemaVersion: "1", artifactType: networkDefinitionArtifactType }))).toThrow(/artifact type/);
    expect(() => deserializeResourceSystem(JSON.stringify({ schemaVersion: "1", artifactType: networkMetricsArtifactType }))).toThrow(
      /artifact type/
    );
    expect(() => deserializeResourceSystem(JSON.stringify({ schemaVersion: "1", artifactType: "ortus.runSummary" }))).toThrow(/artifact type/);
    expect(() => deserializeResourceSystem(JSON.stringify({ ...state, world: {} }))).toThrow(/live run state/);
    expect(() => deserializeResourceSystem("x".repeat(maxResourceSystemJsonLength + 1))).toThrow(/characters or less/);
    expect(() => deserializeResourceMetrics(JSON.stringify({ schemaVersion: "1", artifactType: networkMetricsArtifactType }))).toThrow(
      /artifact type/
    );
  });

  it("keeps production templates and fresh-run schemas honest about unsupported resource fields", () => {
    for (const template of productionTemplates) {
      expect(template.capabilities?.supportsResources).toBe(false);
      expect(template.capabilities?.supportsStocks).toBe(false);
      expect(template.capabilities?.supportsFlows).toBe(false);
      expect(template.capabilities?.supportsResourceMetrics).toBe(false);

      const runConfig = createDefaultRunConfig({ template, seed: `resource-capabilities-${template.id}` });
      expect(() => validateRunConfig({ ...runConfig, resourceOptions: { enabled: true } } as never, template)).toThrow(
        /Unsupported RunConfig field/
      );
      expect(() => validateRunConfig({ ...runConfig, resourceSystemDefinition: baseResourceSystem() } as never, template)).toThrow(
        /Unsupported RunConfig field/
      );
      const scenario = createDefaultScenario({ template, now: "2026-01-01T00:00:00.000Z" });
      expect(() => validateScenario({ ...scenario, resourceOptions: { enabled: true } } as never, template)).toThrow(/Invalid scenario/);
      expect(() => validateScenario({ ...scenario, resourceSystemDefinition: baseResourceSystem() } as never, template)).toThrow(/Invalid scenario/);
      expect(() =>
        validateUncertaintyConfig(
          {
            schemaVersion: "1",
            artifactType: uncertaintyConfigArtifactType,
            baseSeed: "resource-target",
            samplingMethod: "randomMonteCarlo",
            sampleCount: 1,
            variables: [
              {
                id: "resource-rate",
                label: "Resource rate",
                target: "resource",
                targetPath: "resources.food",
                distribution: { type: "fixed", value: 1 },
                enabled: true
              }
            ],
            outputMetrics: []
          },
          runConfig
        )
      ).toThrow(/Invalid uncertainty config/);
    }
  });

  it("keeps resource services headless, deterministic, and outside React", () => {
    const resourcesDir = new URL("../resources", import.meta.url);
    for (const file of readdirSync(resourcesDir)) {
      if (!file.endsWith(".ts")) {
        continue;
      }
      const source = readFileSync(join(resourcesDir.pathname, file), "utf8");
      expect(source).not.toMatch(/from "react"|from 'react'|zustand|document\.|window\.|Canvas|localStorage/);
      expect(source).not.toMatch(/from "\.\.\/networks|from '\.\.\/networks|from "\.\.\/templates|from '\.\.\/templates|from "\.\.\/scenarios|from '\.\.\/scenarios|from "\.\.\/uncertainty|from '\.\.\/uncertainty|from "\.\.\/assumptions|from '\.\.\/assumptions/);
      expect(source).not.toContain("Math.random");
      expect(source).not.toMatch(/eval\(|new Function/);
    }
  });
});
