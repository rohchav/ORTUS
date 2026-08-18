import type { MetricsCollector } from "./Metrics";
import type { RandomService } from "./Random";
import type { SystemRegistry } from "./SystemRegistry";
import type { World, WorldView } from "./World";
import type { ReadonlySpace, SpaceLocation } from "../spaces/Space";
import type { Continuous2DSpaceReader } from "../spaces/Continuous2DSpace";
import type { Grid2DSpaceReader } from "../spaces/Grid2DSpace";
import type { NetworkSpaceReader } from "../spaces/NetworkSpace";
import type { ModelAssumptionProfile } from "../assumptions/types";

export type EntityId = string;
export type ComponentType = string;

export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue };
export type ComponentValue = { [key: string]: JsonValue };

export interface Entity {
  id: EntityId;
  archetype: string;
  alive: boolean;
  createdAtTick: number;
  destroyedAtTick?: number;
  label?: string;
}

export const schedulerPhases = [
  "beforeStep",
  "sense",
  "decide",
  "act",
  "resolve",
  "afterStep",
  "metrics"
] as const;

export type SchedulerPhase = (typeof schedulerPhases)[number];
export type UpdateMode = "immediate" | "staged";

export type ParameterType = "number" | "integer" | "boolean" | "select";
export type TemplateSpaceType = "continuous2d" | "grid2d" | "network" | "hybrid";
export type MetricValueType = "number" | "integer" | "boolean" | "category";
export type MetricSource = "modelState" | "event" | "derived" | "input";
export type SimulationLogEventSeverity = "info" | "warning" | "error";
export type SimulationLogEventCategory = "run" | "scenario" | "snapshot" | "experiment" | "intervention" | "agent" | "system";

export interface ParameterDefinition<T extends JsonValue = JsonValue> {
  key: string;
  label: string;
  type: ParameterType;
  defaultValue: T;
  min?: number;
  max?: number;
  step?: number;
  options?: readonly JsonValue[];
  description: string;
  liveUpdate: boolean;
}

export type ParameterValues = Record<string, JsonValue>;

export interface InitializationPresetDefinition {
  id: string;
  label: string;
  description: string;
  parameterOverrides?: ParameterValues;
  optionDefinitions?: readonly ParameterDefinition[];
}

export interface InitializationConfig {
  presetId: string;
  options: ParameterValues;
}

export interface BehaviorModeDefinition {
  id: string;
  label: string;
  description: string;
  templateId?: string;
  supportedCompositionFields?: readonly string[];
  supportedParameters?: readonly string[];
  defaultParameterOverrides?: ParameterValues;
  documentation?: string;
  limitations?: readonly string[];
  visualNotes?: string;
  metricNotes?: string;
}

// Scenario variant context is setup metadata for a fresh run. It is not a
// snapshot and must not contain live world/component/space state.
export interface ScenarioVariantConfig {
  behaviorMode: string;
  agentComposition: ParameterValues;
  environmentOptions: ParameterValues;
  initialization?: InitializationConfig;
}

export interface TemplateCapabilities {
  supportsScenarioBuilder: boolean;
  supportsInitializationPresets: boolean;
  supportsAgentComposition: boolean;
  supportsBehaviorModes: boolean;
  supportsEnvironmentOptions: boolean;
  supportsInterventions: boolean;
  supportsMetricHistory: boolean;
  supportsRunComparison: boolean;
  supportsExperimentRunner: boolean;
  supportsSnapshotExport: boolean;
  supportsContinuousSpace: boolean;
  supportsGridSpace: boolean;
  supportsNetworkSpace: boolean;
  supportsNetworkOptions: boolean;
  supportsNetworkMetrics: boolean;
  supportsResources: boolean;
  supportsStocks: boolean;
  supportsFlows: boolean;
  supportsResourceMetrics: boolean;
  supportsEvents: boolean;
  supportsDelays: boolean;
  supportsFeedbackLoops: boolean;
  supportsFeedbackMetrics: boolean;
  supportsEnvironmentLayers: boolean;
  supportsUncertaintyConfig: boolean;
  supportsTemplateOwnedSocialLearning?: boolean;
  supportsInformationSourceExposure?: boolean;
}

export type RuntimeScaleClass = "small" | "medium" | "large" | "unknown";

export type NeighborSearchStrategy = "none" | "gridLocal" | "continuousSpatialHash" | "allPairs" | "templateSpecific";

export interface RuntimePerformanceMetadata {
  expectedScaleClass: RuntimeScaleClass;
  neighborSearchStrategy: NeighborSearchStrategy;
  hotLoopNotes: readonly string[];
  defaultEntityCount: number;
  stressEntityCount: number;
  knownPerformanceLimits: readonly string[];
}

export interface TemplateSpaceDefinition {
  type: TemplateSpaceType;
  spaceId?: string;
  description: string;
  boundaryMode?: "wrap" | "bounce" | "clamp";
  dimensions?: {
    width?: number;
    height?: number;
    rows?: number;
    cols?: number;
  };
}

export interface EntityTypeDefinition {
  typeId: string;
  label: string;
  description: string;
  components?: readonly ComponentType[];
  representedAs?: "entity" | "state" | "cell";
  configurableCount?: boolean;
  countParameterKey?: string;
  defaultVisual?: {
    color?: string;
    glyph?: string;
    label?: string;
  };
}

export interface MetricDefinition {
  id?: string;
  key: string;
  label: string;
  description: string;
  valueType: MetricValueType;
  unit?: string;
  displayUnit?: string;
  range?: {
    min?: number;
    max?: number;
  };
  supportsHistory?: boolean;
  comparableAcrossRuns?: boolean;
  source?: MetricSource;
  precision?: number;
  displayFormat?: "integer" | "decimal" | "percent";
  collect(world: WorldView): number;
}

export interface MetricRecord {
  tick: number;
  time: number;
  values: Record<string, number>;
}

export interface SimulationLogEvent {
  eventId: string;
  tick: number;
  type: string;
  source: string;
  order: number;
  target?: string;
  label?: string;
  payload?: JsonValue;
  severity?: SimulationLogEventSeverity;
  category?: SimulationLogEventCategory;
}

export interface ModelDocumentation {
  purpose: string;
  entities: string[];
  stateVariables: string[];
  processOverview: string;
  scheduling: string;
  designConcepts: {
    emergence?: string;
    adaptation?: string;
    interaction?: string;
    stochasticity?: string;
    observation?: string;
  };
  initialization: string;
  inputData?: string;
  submodels: string[];
  assumptions: string[];
  limitations: string[];
  notRepresented?: string[];
  appropriateUse?: string[];
  inappropriateUse?: string[];
}

export interface VisualMapping {
  components: Record<string, JsonValue>;
  colors?: Record<string, string>;
  labels?: Record<string, string>;
  description?: string;
}

// A view of the current run state for rendering and inspection. Snapshot views
// are derived from engine state; scenarios and run summaries should not embed
// this shape by default.
export interface SimulationSnapshotView {
  readonly schemaVersion: string;
  readonly templateId: string;
  readonly tick: number;
  readonly time: number;
  readonly entities: readonly Entity[];
  readonly components: Record<ComponentType, Record<EntityId, ComponentValue>>;
  readonly spaces: readonly SerializedSpace[];
  readonly globals: Record<string, JsonValue>;
  readonly metricsHistory: readonly MetricRecord[];
}

export interface TemplateContext {
  readonly seed: string;
  readonly params: ParameterValues;
  readonly initialization?: InitializationConfig;
  readonly scenario?: ScenarioVariantConfig;
  readonly rng: RandomService;
  readonly fixedDt: number;
}

export interface SystemContext {
  readonly world: WorldView;
  readonly commands: CommandSink;
  readonly events: EventAccess;
  readonly rng: RandomService;
  readonly params: ParameterValues;
  readonly dt: number;
  readonly tick: number;
  readonly query: QueryHelpers;
  readonly spaces: SpaceAccess;
  readonly metrics: MetricsAccess;
  readonly performance: PerformanceAccess;
  readonly entityIds?: readonly EntityId[];
}

export interface QueryHelpers {
  entitiesWith(componentTypes: readonly ComponentType[]): EntityId[];
}

export interface SpaceAccess {
  get(spaceId: string): ReadonlySpace<any> | undefined;
  continuous2D(spaceId: string): Continuous2DSpaceReader | undefined;
  grid2D(spaceId: string): Grid2DSpaceReader | undefined;
  network(spaceId: string): NetworkSpaceReader | undefined;
  all(): ReadonlySpace<any>[];
}

export interface MetricsAccess {
  history(): readonly MetricRecord[];
}

export interface PerformanceAccess {
  recordCounter(counterId: string, value: number): void;
  mark(): number;
  elapsedSince(mark: number): number;
  recordDuration(name: import("./Performance").PerformanceMeasureName, durationMs: number): void;
}

export interface EventAccess {
  due(type?: string): readonly SimulationEvent[];
}

export interface CommandSink {
  add(command: Command, reason?: string): void;
  createEntity(command: Omit<CreateEntityCommand, "type">, reason?: string): void;
  destroyEntity(entityId: EntityId, reason?: string): void;
  addComponent(entityId: EntityId, componentType: ComponentType, value: ComponentValue, reason?: string): void;
  setComponent(entityId: EntityId, componentType: ComponentType, value: ComponentValue, reason?: string): void;
  setComponents(componentType: ComponentType, values: Record<EntityId, ComponentValue>, reason?: string): void;
  patchComponent(entityId: EntityId, componentType: ComponentType, partial: ComponentValue, reason?: string): void;
  removeComponent(entityId: EntityId, componentType: ComponentType, reason?: string): void;
  moveEntity(spaceId: string, entityId: EntityId, location: SpaceLocation, reason?: string): void;
  moveEntities(spaceId: string, locations: Record<EntityId, SpaceLocation>, reason?: string): void;
  addEdge(spaceId: string, source: EntityId, target: EntityId, weight?: number, directed?: boolean, reason?: string): void;
  removeEdge(spaceId: string, source: EntityId, target: EntityId, reason?: string): void;
  emitEvent(event: SchedulableEvent, reason?: string): void;
  setGlobal(key: string, value: JsonValue, reason?: string): void;
}

export interface System {
  id: string;
  phase: SchedulerPhase;
  priority: number;
  query?: readonly ComponentType[];
  update(ctx: SystemContext): void;
}

// A template is a model family definition: rules, setup metadata, metrics,
// visuals, assumptions, limitations, and validated extension points.
export interface SimulationTemplate {
  id: string;
  name: string;
  description: string;
  version: string;
  capabilities?: TemplateCapabilities;
  spaceDefinition?: TemplateSpaceDefinition;
  entityTypeDefinitions?: readonly EntityTypeDefinition[];
  parameterDefinitions: readonly ParameterDefinition[];
  metricDefinitions?: readonly MetricDefinition[];
  documentation: ModelDocumentation;
  createInitialWorld(ctx: TemplateContext): World;
  registerSystems(registry: SystemRegistry): void;
  registerMetrics(registry: MetricsCollector): void;
  getVisuals(snapshot: SimulationSnapshotView): VisualMapping;
  initializationPresets?: readonly InitializationPresetDefinition[];
  behaviorModes?: readonly BehaviorModeDefinition[];
  agentCompositionDefinitions?: readonly ParameterDefinition[];
  environmentOptionDefinitions?: readonly ParameterDefinition[];
  runtimeMetadata?: RuntimePerformanceMetadata;
  assumptionProfile?: ModelAssumptionProfile;
  validateInitializationOptions?(initialization: InitializationConfig, params: ParameterValues): void;
  validateScenarioOptions?(options: ScenarioVariantConfig, params: ParameterValues): void;
  validateWorld?(world: WorldView): void;
  validateParameters?(params: ParameterValues): void;
}

export interface CommandMetadata {
  sourceSystemId: string;
  tick: number;
  reason?: string;
}

export interface BufferedCommand {
  command: Command;
  metadata: CommandMetadata;
}

export interface CreateEntityCommand {
  type: "createEntity";
  entityId?: EntityId;
  archetype: string;
  label?: string;
  components?: Record<ComponentType, ComponentValue>;
  spaceLocations?: Record<string, SpaceLocation>;
}

export interface DestroyEntityCommand {
  type: "destroyEntity";
  entityId: EntityId;
  allowMissing?: boolean;
}

export interface ComponentCommand {
  type: "addComponent" | "setComponent" | "patchComponent" | "removeComponent";
  entityId: EntityId;
  componentType: ComponentType;
  value?: ComponentValue;
  partial?: ComponentValue;
  allowMissing?: boolean;
}

export interface BatchComponentCommand {
  type: "setComponents";
  componentType: ComponentType;
  values: Record<EntityId, ComponentValue>;
  allowMissing?: boolean;
}

export interface MoveEntityCommand {
  type: "moveEntity";
  spaceId: string;
  entityId: EntityId;
  location: SpaceLocation;
  allowMissing?: boolean;
}

export interface MoveEntitiesCommand {
  type: "moveEntities";
  spaceId: string;
  locations: Record<EntityId, SpaceLocation>;
  allowMissing?: boolean;
}

export interface EdgeCommand {
  type: "addEdge" | "removeEdge";
  spaceId: string;
  source: EntityId;
  target: EntityId;
  weight?: number;
  directed?: boolean;
  allowMissing?: boolean;
}

export interface EmitEventCommand {
  type: "emitEvent";
  event: SchedulableEvent;
}

export interface SetGlobalCommand {
  type: "setGlobal";
  key: string;
  value: JsonValue;
}

export type Command =
  | CreateEntityCommand
  | DestroyEntityCommand
  | ComponentCommand
  | BatchComponentCommand
  | MoveEntityCommand
  | MoveEntitiesCommand
  | EdgeCommand
  | EmitEventCommand
  | SetGlobalCommand;

export interface SimulationEvent {
  id: string;
  type: string;
  scheduledTick: number;
  payload: JsonValue;
  source?: EntityId | string;
  target?: EntityId | string;
  createdAtTick: number;
  priority?: number;
}

export type SchedulableEvent = Omit<SimulationEvent, "id"> & { id?: string };

export interface EventQueueSnapshot {
  sequence: number;
  events: SimulationEvent[];
}

export interface EntityStoreSnapshot {
  sequence: number;
  entities: Entity[];
}

export type ComponentStoreSnapshot = Record<ComponentType, Record<EntityId, ComponentValue>>;

export type SerializedSpace =
  | {
      id: string;
      kind: "continuous2d";
      width: number;
      height: number;
      boundaryMode: "wrap" | "bounce" | "clamp";
      positions: Record<EntityId, { x: number; y: number }>;
    }
  | {
      id: string;
      kind: "grid2d";
      rows: number;
      cols: number;
      boundaryMode: "wrap" | "bounce" | "clamp";
      cells: Record<EntityId, { row: number; col: number }>;
    }
  | {
      id: string;
      kind: "network";
      nodes: EntityId[];
      edges: Array<{ source: EntityId; target: EntityId; weight?: number; directed: boolean }>;
    };

export interface WorldSnapshot {
  tick: number;
  time: number;
  globals: Record<string, JsonValue>;
  entities: EntityStoreSnapshot;
  components: ComponentStoreSnapshot;
  spaces: SerializedSpace[];
  events: EventQueueSnapshot;
}

export interface RandomServiceState {
  seed: string;
  streams: Record<string, { state: number; spareNormal?: number }>;
}

// Engine-level scenario export is a restart recipe for initial conditions, not
// live run state. Authored Scenario Builder JSON is richer but follows the same
// scenario-not-snapshot boundary.
export interface ScenarioExport {
  schemaVersion: "1";
  templateId: string;
  parameters: ParameterValues;
  seed: string;
  metadata: Record<string, JsonValue>;
}

// Snapshot export is exact run state for deterministic restore at a tick.
export interface SnapshotExport extends ScenarioExport {
  tick: number;
  time: number;
  world: WorldSnapshot;
  rng: RandomServiceState;
  metricsHistory: MetricRecord[];
}

// A RunConfig is a fresh-run recipe shared by scenario authoring, experiments,
// and future uncertainty sampling. It is not a snapshot and not a run summary.
export interface SimulationRunConfig {
  schemaVersion: "1";
  templateId: string;
  seed: string;
  parameters: ParameterValues;
  scenarioId?: string;
  scenarioName?: string;
  initializationPreset?: string;
  initializationOptions?: ParameterValues;
  agentComposition?: ParameterValues;
  behaviorMode?: string;
  environmentOptions?: ParameterValues;
  uncertaintyConfig?: Record<string, JsonValue>;
  metadata?: Record<string, JsonValue>;
}

export interface SimulationEngineOptions {
  seed?: string | number;
  parameters?: ParameterValues;
  initialization?: InitializationConfig;
  scenario?: ScenarioVariantConfig;
  fixedDt?: number;
  speedMultiplier?: number;
  maxStepsPerFrame?: number;
  updateMode?: UpdateMode;
  maxMetricsHistory?: number;
  metricsInterval?: number;
  debug?: boolean;
  performance?: boolean | import("./Performance").PerformanceInstrumentationOptions;
  metadata?: Record<string, JsonValue>;
}
