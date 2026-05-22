import type { JsonValue } from "../kernel/types";

export const resourceSystemArtifactType = "ortus.resourceSystem";
export const resourceMetricsArtifactType = "ortus.resourceMetrics";

export const maxResourceCount = 200;
export const maxStockCount = 1_000;
export const maxFlowCount = 1_000;
export const maxResourceLedgerLength = 1_000;
export const maxResourceSystemJsonLength = 300_000;
export const maxResourceMetadataJsonLength = 40_000;

export type ResourceKind = "material" | "energy" | "information" | "capacity" | "abstract";
export type StockOwnerType = "system" | "agent" | "group" | "region" | "environment";
export type FlowType = "produce" | "consume" | "transfer" | "regenerate" | "decay" | "deplete";

export interface ResourceDefinition {
  id: string;
  label: string;
  description?: string;
  unit?: string;
  kind?: ResourceKind;
  min?: number;
  max?: number;
  allowNegative?: boolean;
  metadata?: Record<string, JsonValue>;
}

export interface StockDefinition {
  id: string;
  label: string;
  description?: string;
  resourceId: string;
  ownerType?: StockOwnerType;
  ownerId?: string;
  initialValue: number;
  min?: number;
  max?: number;
  capacity?: number;
  allowNegative?: boolean;
  metadata?: Record<string, JsonValue>;
}

export interface FlowDefinition {
  id: string;
  label: string;
  description?: string;
  resourceId: string;
  sourceStockId?: string;
  targetStockId?: string;
  flowType: FlowType;
  rate: number;
  min?: number;
  max?: number;
  enabled?: boolean;
  metadata?: Record<string, JsonValue>;
}

export interface StockState {
  stockId: string;
  value: number;
  capacity?: number;
  updatedAtTick?: number;
  metadata?: Record<string, JsonValue>;
}

export interface FlowResult {
  flowId: string;
  resourceId: string;
  tick: number;
  requestedAmount: number;
  appliedAmount: number;
  sourceStockId?: string;
  targetStockId?: string;
  reason?: string;
  warnings?: readonly string[];
}

export interface ResourceSystemDefinition {
  schemaVersion: "1";
  artifactType: typeof resourceSystemArtifactType;
  id: string;
  label: string;
  description?: string;
  resources: readonly ResourceDefinition[];
  stocks: readonly StockDefinition[];
  flows: readonly FlowDefinition[];
  metadata?: Record<string, JsonValue>;
}

export interface ResourceSystemState extends ResourceSystemDefinition {
  stockStates: readonly StockState[];
  ledger?: readonly FlowResult[];
}

export interface ResourceMetrics {
  resourceCount: number;
  stockCount: number;
  flowCount: number;
  totalStockByResource: Record<string, number>;
  minStockValue: number;
  maxStockValue: number;
  depletedStockCount: number;
  overCapacityStockCount: number;
  totalFlowAppliedByResource: Record<string, number>;
  totalFlowRequestedByResource: Record<string, number>;
  netFlowByResource: Record<string, number>;
  insufficientStockFlowCount: number;
  clampedFlowCount: number;
}

export interface ResourceMetricsResult {
  schemaVersion: "1";
  artifactType: typeof resourceMetricsArtifactType;
  systemId: string;
  metrics: ResourceMetrics;
  warnings: readonly string[];
}
