import { resourceSystemArtifactType, maxResourceLedgerLength, type FlowDefinition, type FlowResult, type ResourceSystemDefinition, type ResourceSystemState, type StockState } from "./types";
import {
  normalizeResourceSystemDefinition,
  resourceById,
  resourceLowerBound,
  stockById,
  stockUpperBound,
  validateResourceSystemDefinition,
  validateResourceSystemState
} from "./validation";

export interface ApplyFlowOutcome {
  state: ResourceSystemState;
  result: FlowResult;
}

export interface ApplyFlowsOutcome {
  state: ResourceSystemState;
  results: readonly FlowResult[];
}

export function initializeResourceSystem(definition: ResourceSystemDefinition): ResourceSystemState {
  const valid = validateResourceSystemDefinition(definition);
  return validateResourceSystemState({
    ...valid,
    artifactType: resourceSystemArtifactType,
    stockStates: valid.stocks.map((stock) => ({
      stockId: stock.id,
      value: stock.initialValue,
      ...(stock.capacity !== undefined ? { capacity: stock.capacity } : {}),
      updatedAtTick: 0,
      metadata: {}
    })),
    ledger: []
  });
}

export function applyFlow(state: ResourceSystemState, flow: FlowDefinition, tick: number): ApplyFlowOutcome {
  const valid = validateResourceSystemState(state);
  const definition = definitionFromState(valid);
  const normalizedFlow = normalizeResourceSystemDefinition({ ...definition, flows: [flow] }).flows[0]!;
  validateResourceSystemDefinition({ ...definition, flows: [normalizedFlow] });
  const stockStates = valid.stockStates.map((stockState) => ({ ...stockState, metadata: stockState.metadata ? { ...stockState.metadata } : {} }));
  const warnings: string[] = [];
  const requestedAmount = normalizedFlow.enabled ? boundedRate(normalizedFlow) : 0;
  let appliedAmount = 0;
  let reason: string | undefined = normalizedFlow.enabled ? undefined : "disabled";

  if (requestedAmount > 0) {
    if (normalizedFlow.flowType === "produce" || normalizedFlow.flowType === "regenerate") {
      const target = requireStockState(stockStates, normalizedFlow.targetStockId);
      appliedAmount = addToStock(valid, target, requestedAmount, tick, warnings);
    } else if (normalizedFlow.flowType === "consume" || normalizedFlow.flowType === "decay" || normalizedFlow.flowType === "deplete") {
      const source = requireStockState(stockStates, normalizedFlow.sourceStockId);
      appliedAmount = removeFromStock(valid, source, requestedAmount, tick, warnings);
    } else {
      const source = requireStockState(stockStates, normalizedFlow.sourceStockId);
      const target = requireStockState(stockStates, normalizedFlow.targetStockId);
      const removable = removableAmount(valid, source, requestedAmount, warnings);
      const addable = addableAmount(valid, target, requestedAmount, warnings);
      appliedAmount = Math.min(requestedAmount, removable, addable);
      source.value = finiteValue(source.value - appliedAmount);
      source.updatedAtTick = tick;
      target.value = finiteValue(target.value + appliedAmount);
      target.updatedAtTick = tick;
    }
    if (appliedAmount < requestedAmount && warnings.length === 0) {
      warnings.push("flow was clamped");
    }
    if (appliedAmount < requestedAmount) {
      reason = warnings[0] ?? "clamped";
    }
  }

  const result: FlowResult = {
    flowId: normalizedFlow.id,
    resourceId: normalizedFlow.resourceId,
    tick,
    requestedAmount,
    appliedAmount,
    ...(normalizedFlow.sourceStockId ? { sourceStockId: normalizedFlow.sourceStockId } : {}),
    ...(normalizedFlow.targetStockId ? { targetStockId: normalizedFlow.targetStockId } : {}),
    ...(reason ? { reason } : {}),
    warnings
  };
  const nextState = validateResourceSystemState({
    ...valid,
    stockStates,
    ledger: [...(valid.ledger ?? []), result].slice(-maxResourceLedgerLength)
  });
  return { state: nextState, result };
}

export function applyFlows(state: ResourceSystemState, flows: readonly FlowDefinition[], tick: number): ApplyFlowsOutcome {
  let current = validateResourceSystemState(state);
  const results: FlowResult[] = [];
  const ordered = [...flows].sort((left, right) => left.id.localeCompare(right.id));
  for (const flow of ordered) {
    const outcome = applyFlow(current, flow, tick);
    current = outcome.state;
    results.push(outcome.result);
  }
  return { state: current, results };
}

function boundedRate(flow: FlowDefinition): number {
  const lower = flow.min ?? 0;
  const upper = flow.max ?? Number.POSITIVE_INFINITY;
  return finiteValue(Math.min(Math.max(flow.rate, lower), upper));
}

function addToStock(state: ResourceSystemState, stockState: StockState, amount: number, tick: number, warnings: string[]): number {
  const applied = Math.min(amount, addableAmount(state, stockState, amount, warnings));
  stockState.value = finiteValue(stockState.value + applied);
  stockState.updatedAtTick = tick;
  return applied;
}

function removeFromStock(state: ResourceSystemState, stockState: StockState, amount: number, tick: number, warnings: string[]): number {
  const applied = Math.min(amount, removableAmount(state, stockState, amount, warnings));
  stockState.value = finiteValue(stockState.value - applied);
  stockState.updatedAtTick = tick;
  return applied;
}

function addableAmount(state: ResourceSystemState, stockState: StockState, requested: number, warnings: string[]): number {
  const stock = stockById(state.stocks, stockState.stockId)!;
  const resource = resourceById(state.resources, stock.resourceId)!;
  const upper = stockUpperBound(resource, stock, stockState);
  if (upper === undefined) {
    return requested;
  }
  const room = Math.max(0, upper - stockState.value);
  if (room < requested) {
    warnings.push("capacity limit reached");
  }
  return room;
}

function removableAmount(state: ResourceSystemState, stockState: StockState, requested: number, warnings: string[]): number {
  const stock = stockById(state.stocks, stockState.stockId)!;
  const resource = resourceById(state.resources, stock.resourceId)!;
  const lower = resourceLowerBound(resource, stock);
  if (lower === undefined) {
    return requested;
  }
  const available = Math.max(0, stockState.value - lower);
  if (available < requested) {
    warnings.push("insufficient stock");
  }
  return available;
}

function requireStockState(stockStates: StockState[], stockId: string | undefined): StockState {
  const stockState = stockStates.find((item) => item.stockId === stockId);
  if (!stockState) {
    throw new Error(`Unknown stock state: ${stockId ?? "missing"}`);
  }
  return stockState;
}

function finiteValue(value: number): number {
  if (!Number.isFinite(value)) {
    throw new Error("Resource stock-flow operation produced a non-finite value");
  }
  return value;
}

function definitionFromState(state: ResourceSystemState): ResourceSystemDefinition {
  return {
    schemaVersion: state.schemaVersion,
    artifactType: state.artifactType,
    id: state.id,
    label: state.label,
    ...(state.description ? { description: state.description } : {}),
    resources: state.resources,
    stocks: state.stocks,
    flows: state.flows,
    metadata: state.metadata ?? {}
  };
}
