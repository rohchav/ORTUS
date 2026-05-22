import { resourceMetricsArtifactType, type FlowResult, type ResourceMetrics, type ResourceMetricsResult, type ResourceSystemState } from "./types";
import { resourceById, resourceLowerBound, stockById, stockUpperBound, validateResourceSystemState } from "./validation";

export function computeResourceMetrics(state: ResourceSystemState, flowResults: readonly FlowResult[] = state.ledger ?? []): ResourceMetricsResult {
  const valid = validateResourceSystemState(state);
  const totals = Object.fromEntries(valid.resources.map((resource) => [resource.id, 0]));
  let minStockValue = 0;
  let maxStockValue = 0;
  let depletedStockCount = 0;
  let overCapacityStockCount = 0;

  for (const [index, stockState] of valid.stockStates.entries()) {
    const stock = stockById(valid.stocks, stockState.stockId)!;
    const resource = resourceById(valid.resources, stock.resourceId)!;
    totals[stock.resourceId] = finite((totals[stock.resourceId] ?? 0) + stockState.value);
    minStockValue = index === 0 ? stockState.value : Math.min(minStockValue, stockState.value);
    maxStockValue = index === 0 ? stockState.value : Math.max(maxStockValue, stockState.value);
    const lower = resourceLowerBound(resource, stock);
    const upper = stockUpperBound(resource, stock, stockState);
    if (lower !== undefined && stockState.value <= lower) {
      depletedStockCount += 1;
    }
    if (upper !== undefined && stockState.value > upper) {
      overCapacityStockCount += 1;
    }
  }

  const totalApplied = Object.fromEntries(valid.resources.map((resource) => [resource.id, 0]));
  const totalRequested = Object.fromEntries(valid.resources.map((resource) => [resource.id, 0]));
  const netFlow = Object.fromEntries(valid.resources.map((resource) => [resource.id, 0]));
  let insufficientStockFlowCount = 0;
  let clampedFlowCount = 0;
  for (const result of flowResults) {
    if (!resourceById(valid.resources, result.resourceId)) {
      continue;
    }
    totalApplied[result.resourceId] = finite((totalApplied[result.resourceId] ?? 0) + result.appliedAmount);
    totalRequested[result.resourceId] = finite((totalRequested[result.resourceId] ?? 0) + result.requestedAmount);
    if (result.appliedAmount < result.requestedAmount) {
      clampedFlowCount += 1;
    }
    if ((result.warnings ?? []).some((warning) => warning.includes("insufficient"))) {
      insufficientStockFlowCount += 1;
    }
    netFlow[result.resourceId] = finite((netFlow[result.resourceId] ?? 0) + signedAppliedAmount(valid, result));
  }

  const metrics: ResourceMetrics = {
    resourceCount: valid.resources.length,
    stockCount: valid.stocks.length,
    flowCount: valid.flows.length,
    totalStockByResource: totals,
    minStockValue,
    maxStockValue,
    depletedStockCount,
    overCapacityStockCount,
    totalFlowAppliedByResource: totalApplied,
    totalFlowRequestedByResource: totalRequested,
    netFlowByResource: netFlow,
    insufficientStockFlowCount,
    clampedFlowCount
  };
  return {
    schemaVersion: "1",
    artifactType: resourceMetricsArtifactType,
    systemId: valid.id,
    metrics,
    warnings: []
  };
}

function signedAppliedAmount(state: ResourceSystemState, result: FlowResult): number {
  const flow = state.flows.find((item) => item.id === result.flowId);
  if (!flow) {
    return 0;
  }
  if (flow.flowType === "produce" || flow.flowType === "regenerate") {
    return result.appliedAmount;
  }
  if (flow.flowType === "consume" || flow.flowType === "decay" || flow.flowType === "deplete") {
    return -result.appliedAmount;
  }
  return 0;
}

function finite(value: number): number {
  if (!Number.isFinite(value)) {
    throw new Error("Resource metrics must be finite");
  }
  return value;
}
