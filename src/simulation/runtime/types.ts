import type { Command, SimulationRunConfig } from "../kernel/types";
import type { PerformanceMeasureSummary } from "../kernel/Performance";

export const maxRenderFrameEntities = 10_000;
export const maxSelectedNeighborCount = 2_048;
export const runtimeUiPublicationIntervalMs = 250;

export type RuntimeExecutionKind = "local" | "worker";
export type RuntimePlaybackState = "initializing" | "paused" | "running" | "failed" | "disposed";
export type RuntimeAdvanceKind = "initialization" | "run" | "step" | "command" | "restore" | "replacement";

export interface RuntimeIdentity {
  generation: number;
  runId: string;
}

export interface SelectedRenderDetail {
  entityId: number;
  neighborIds: Uint32Array;
  neighborOffsets: Float32Array;
  neighborDistances: Float32Array;
}

// This packet is an ephemeral, renderer-only projection. It is not a snapshot,
// observation record, persistence format, or source of simulation semantics.
export interface RenderFramePacket extends RuntimeIdentity {
  schemaVersion: "1";
  publicationId: number;
  templateId: string;
  tick: number;
  time: number;
  entityCount: number;
  entityIds: Uint32Array;
  positions: Float32Array;
  velocities: Float32Array;
  neighborCounts: Uint16Array;
  localDensities: Float32Array;
  groupCodes: Uint8Array;
  worldWidth: number;
  worldHeight: number;
  boundaryMode: "wrap" | "bounce" | "clamp";
  perceptionRadius: number;
  alignment: number | null;
  runtimeSignature: string;
  selectedDetail?: SelectedRenderDetail;
}

export interface SelectedUIProjection {
  entityId: number;
  label: string;
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
  speed: number;
  headingDegrees: number;
  neighborCount: number;
  localDensity: number;
  currentProximityCount: number | null;
}

export interface RuntimePublicationStats {
  ticksSimulated: number;
  framesProjected: number;
  framesPublished: number;
  framesCoalesced: number;
  uiProjected: number;
  uiPublished: number;
  uiCoalesced: number;
}

// React and accessibility consumers receive this coarse projection, never the
// per-entity motion arrays used by Canvas.
export interface UIProjection extends RuntimeIdentity {
  schemaVersion: "1";
  revision: number;
  templateId: string;
  executionKind: RuntimeExecutionKind;
  tick: number;
  time: number;
  entityCount: number;
  playback: RuntimePlaybackState;
  lastAdvanceKind: RuntimeAdvanceKind;
  alignment: number | null;
  runtimeSignature: string;
  selected: SelectedUIProjection | null;
  warnings: readonly string[];
  performance: {
    measures: readonly PerformanceMeasureSummary[];
    publications: RuntimePublicationStats;
  };
}

export interface RuntimeFailure extends RuntimeIdentity {
  code: "initialization" | "runtime" | "protocol" | "worker" | "disposed";
  message: string;
  requestId?: number;
}

export type RuntimePublication =
  | { type: "frame"; frame: RenderFramePacket }
  | { type: "ui"; ui: UIProjection }
  | { type: "failure"; failure: RuntimeFailure };

export interface RuntimeRunRequest {
  runId: string;
  runConfig: SimulationRunConfig;
  instrumentation?: boolean;
}

export interface SimulationRuntimePort {
  readonly executionKind: RuntimeExecutionKind;
  readonly generation: number;
  initialize(request: RuntimeRunRequest): Promise<UIProjection>;
  replaceRun(request: RuntimeRunRequest): Promise<UIProjection>;
  reset(): Promise<UIProjection>;
  play(): void;
  pause(): void;
  step(): Promise<UIProjection>;
  applyCommands(commands: readonly Command[]): Promise<UIProjection>;
  setSelectedEntity(entityId: string | null): void;
  resetPerformance(): void;
  getLatestFrame(): RenderFramePacket | null;
  getLatestUI(): UIProjection | null;
  subscribe(listener: (publication: RuntimePublication) => void): () => void;
  dispose(): void;
}

export interface RuntimeWorkerLike {
  postMessage(message: unknown, transfer?: Transferable[]): void;
  terminate(): void;
  addEventListener(type: "message", listener: (event: MessageEvent<unknown>) => void): void;
  addEventListener(type: "error", listener: (event: ErrorEvent) => void): void;
  addEventListener(type: "messageerror", listener: (event: MessageEvent<unknown>) => void): void;
  removeEventListener(type: "message", listener: (event: MessageEvent<unknown>) => void): void;
  removeEventListener(type: "error", listener: (event: ErrorEvent) => void): void;
  removeEventListener(type: "messageerror", listener: (event: MessageEvent<unknown>) => void): void;
}
