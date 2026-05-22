import { SimulationValidationError } from "../kernel/Errors";
import type { FlowDefinition, ResourceDefinition, ResourceSystemDefinition, ResourceSystemState, StockDefinition } from "./types";
import { validateResourceSystemDefinition, validateResourceSystemState } from "./validation";

type ResourceSystemLike = ResourceSystemDefinition | ResourceSystemState;

export function getResource(system: ResourceSystemLike, resourceId: string): ResourceDefinition {
  const valid = validateDefinitionLike(system);
  const resource = valid.resources.find((item) => item.id === resourceId);
  if (!resource) {
    throw new SimulationValidationError(`Unknown resource: ${resourceId}`);
  }
  return { ...resource, metadata: resource.metadata ? { ...resource.metadata } : {} };
}

export function getStock(system: ResourceSystemLike, stockId: string): StockDefinition {
  const valid = validateDefinitionLike(system);
  const stock = valid.stocks.find((item) => item.id === stockId);
  if (!stock) {
    throw new SimulationValidationError(`Unknown stock: ${stockId}`);
  }
  return { ...stock, metadata: stock.metadata ? { ...stock.metadata } : {} };
}

export function getFlow(system: ResourceSystemLike, flowId: string): FlowDefinition {
  const valid = validateDefinitionLike(system);
  const flow = valid.flows.find((item) => item.id === flowId);
  if (!flow) {
    throw new SimulationValidationError(`Unknown flow: ${flowId}`);
  }
  return { ...flow, metadata: flow.metadata ? { ...flow.metadata } : {} };
}

export function getStocksForResource(system: ResourceSystemLike, resourceId: string): StockDefinition[] {
  const valid = validateDefinitionLike(system);
  getResource(valid, resourceId);
  return valid.stocks
    .filter((stock) => stock.resourceId === resourceId)
    .sort((left, right) => left.id.localeCompare(right.id))
    .map((stock) => ({ ...stock, metadata: stock.metadata ? { ...stock.metadata } : {} }));
}

export function getFlowsForResource(system: ResourceSystemLike, resourceId: string): FlowDefinition[] {
  const valid = validateDefinitionLike(system);
  getResource(valid, resourceId);
  return valid.flows
    .filter((flow) => flow.resourceId === resourceId)
    .sort((left, right) => left.id.localeCompare(right.id))
    .map((flow) => ({ ...flow, metadata: flow.metadata ? { ...flow.metadata } : {} }));
}

export function getStockValue(state: ResourceSystemState, stockId: string): number {
  const valid = validateResourceSystemState(state);
  const stockState = valid.stockStates.find((item) => item.stockId === stockId);
  if (!stockState) {
    throw new SimulationValidationError(`Unknown stock state: ${stockId}`);
  }
  return stockState.value;
}

export function getTotalStockForResource(state: ResourceSystemState, resourceId: string): number {
  const valid = validateResourceSystemState(state);
  getResource(valid, resourceId);
  return valid.stockStates.reduce((sum, stockState) => {
    const stock = valid.stocks.find((item) => item.id === stockState.stockId);
    return stock?.resourceId === resourceId ? sum + stockState.value : sum;
  }, 0);
}

export function hasResource(system: ResourceSystemLike, resourceId: string): boolean {
  const valid = validateDefinitionLike(system);
  return valid.resources.some((resource) => resource.id === resourceId);
}

export function hasStock(system: ResourceSystemLike, stockId: string): boolean {
  const valid = validateDefinitionLike(system);
  return valid.stocks.some((stock) => stock.id === stockId);
}

function validateDefinitionLike(system: ResourceSystemLike): ResourceSystemDefinition {
  return "stockStates" in system ? validateResourceSystemState(system) : validateResourceSystemDefinition(system);
}
