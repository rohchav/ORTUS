import type { AssumptionItem } from "../assumptions/types";
import type { JsonValue } from "../kernel/types";
import type { PrimitiveId } from "../registry/types";

export const boundaryModelArtifactType = "ortus.boundaryModel";
export const maxBoundaryModelJsonLength = 180_000;
export const maxBoundaryModelMetadataJsonLength = 20_000;
export const maxBoundaryNoteLength = 1_200;
export const maxBoundaryNotes = 48;
export const maxBoundaryScopeItems = 96;
export const maxBoundarySurfaces = 64;
export const maxBoundaryExchanges = 128;
export const maxBoundaryForcings = 96;
export const maxBoundaryShocks = 96;
export const maxBoundaryWarnings = 512;

export const boundaryTypes = ["closed", "open", "partiallyOpen", "abstract"] as const;
export type BoundaryType = (typeof boundaryTypes)[number];

export const environmentTypes = ["spatial", "network", "institutional", "market", "ecological", "social", "technical", "abstract", "custom"] as const;
export type EnvironmentType = (typeof environmentTypes)[number];

export const boundaryKinds = ["physical", "logical", "network", "organizational", "policy", "market", "abstract", "custom"] as const;
export type BoundaryKind = (typeof boundaryKinds)[number];

export const boundaryDirectionalities = ["inbound", "outbound", "bidirectional", "none"] as const;
export type BoundaryDirectionality = (typeof boundaryDirectionalities)[number];

export const boundaryPermeabilities = ["closed", "limited", "open", "conditional", "unknown"] as const;
export type BoundaryPermeability = (typeof boundaryPermeabilities)[number];

export const boundaryExchangeTypes = [
  "resourceFlow",
  "agentMovement",
  "informationFlow",
  "eventTrigger",
  "policyInput",
  "marketInput",
  "environmentalInput",
  "custom"
] as const;
export type BoundaryExchangeType = (typeof boundaryExchangeTypes)[number];

export const boundaryExchangeDirections = ["inbound", "outbound", "bidirectional"] as const;
export type BoundaryExchangeDirection = (typeof boundaryExchangeDirections)[number];

export const externalForcingTypes = ["constant", "scheduled", "seasonal", "stochastic", "scenarioDriven", "custom"] as const;
export type ExternalForcingType = (typeof externalForcingTypes)[number];

export const exogenousShockTypes = ["pulse", "stepChange", "temporaryDisruption", "regimeShift", "custom"] as const;
export type ExogenousShockType = (typeof exogenousShockTypes)[number];

export interface SystemScope {
  includedEntityTypes?: readonly string[];
  excludedEntityTypes?: readonly string[];
  includedProcesses?: readonly string[];
  excludedProcesses?: readonly string[];
  includedScales?: readonly string[];
  excludedScales?: readonly string[];
  notes?: readonly string[];
  metadata?: Record<string, JsonValue>;
}

export interface EnvironmentScope {
  environmentType: EnvironmentType;
  description?: string;
  externalEntityTypes?: readonly string[];
  externalProcesses?: readonly string[];
  externalConstraints?: readonly string[];
  notes?: readonly string[];
  metadata?: Record<string, JsonValue>;
}

export interface BoundarySurface {
  id: string;
  label: string;
  boundaryKind: BoundaryKind;
  directionality: BoundaryDirectionality;
  permeability: BoundaryPermeability;
  notes?: readonly string[];
  metadata?: Record<string, JsonValue>;
}

export interface BoundaryExchange {
  id: string;
  label: string;
  boundarySurfaceId?: string;
  exchangeType: BoundaryExchangeType;
  direction: BoundaryExchangeDirection;
  source?: string;
  target?: string;
  quantityVariable?: string;
  rateVariable?: string;
  unit?: string;
  active: boolean;
  executable: false;
  notes?: readonly string[];
  metadata?: Record<string, JsonValue>;
}

export interface ExternalForcing {
  id: string;
  label: string;
  forcingType: ExternalForcingType;
  targetDescription?: string;
  variable?: string;
  unit?: string;
  active: boolean;
  executable: false;
  notes?: readonly string[];
  metadata?: Record<string, JsonValue>;
}

export interface ExogenousShock {
  id: string;
  label: string;
  shockType: ExogenousShockType;
  timingDescription?: string;
  targetDescription?: string;
  magnitudeDescription?: string;
  active: boolean;
  executable: false;
  notes?: readonly string[];
  metadata?: Record<string, JsonValue>;
}

export interface BoundaryEnvironmentModel {
  schemaVersion: "1";
  artifactType: typeof boundaryModelArtifactType;
  id: string;
  name: string;
  description?: string;
  version: string;
  boundaryType: BoundaryType;
  systemScope: SystemScope;
  environmentScope?: EnvironmentScope;
  boundarySurfaces?: readonly BoundarySurface[];
  exchanges?: readonly BoundaryExchange[];
  externalForcings?: readonly ExternalForcing[];
  exogenousShocks?: readonly ExogenousShock[];
  assumptionNotes?: readonly AssumptionItem[];
  limitationNotes?: readonly AssumptionItem[];
  validationNotes?: readonly AssumptionItem[];
  metadata?: Record<string, JsonValue>;
}

export interface BoundaryEnvironmentMissingCapability {
  primitiveId: PrimitiveId;
  requiredSupportLevel: "runtime";
  reason: string;
}

export interface BoundaryEnvironmentValidationReport {
  modelId: string;
  valid: boolean;
  runnableNow: boolean;
  errors: readonly string[];
  warnings: readonly string[];
  missingCapabilities: readonly BoundaryEnvironmentMissingCapability[];
}

export interface BoundaryEnvironmentSummary {
  id: string;
  name: string;
  boundaryType: BoundaryType;
  environmentType?: EnvironmentType;
  boundarySurfaceCount: number;
  exchangeCount: number;
  activeExchangeCount: number;
  externalForcingCount: number;
  activeForcingCount: number;
  exogenousShockCount: number;
  activeShockCount: number;
  executableCount: number;
  openBoundaryWarning?: string;
  closedBoundaryWarning?: string;
  warnings: readonly string[];
}
