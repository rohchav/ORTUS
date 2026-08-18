import type { Command, SimulationRunConfig } from "../kernel/types";
import type { PerformanceMeasureSummary } from "../kernel/Performance";

export const maxRenderFrameEntities = 10_000;
export const maxSelectedNeighborCount = 2_048;
// This is a shared transport bound: promise-returning requests and acknowledged
// fire-and-forget controls must not create an unbounded browser Worker queue.
export const maxPendingRuntimeMessages = 128;
export const runtimeUiPublicationIntervalMs = 250;

export type RuntimeExecutionKind = "local" | "worker";
export type RuntimeDriverState = "idle" | "initializing" | "ready" | "failed" | "disposed";
export type RuntimePlaybackState = "initializing" | "paused" | "running" | "failed" | "disposed";
export type RuntimeAdvanceKind = "initialization" | "run" | "step" | "command" | "restore" | "replacement";
export type RuntimeProjectionKind = "flocking-v1";

export interface RuntimeIdentity {
  readonly generation: number;
  readonly runId: string;
}

export interface SelectedRenderDetail {
  readonly entityId: number;
  readonly neighborIds: Readonly<Uint32Array>;
  readonly neighborOffsets: Readonly<Float32Array>;
  readonly neighborDistances: Readonly<Float32Array>;
}

// This packet is an ephemeral, renderer-only projection. It is not a snapshot,
// observation record, persistence format, or source of simulation semantics.
export interface RuntimeFramePacketBase extends RuntimeIdentity {
  readonly schemaVersion: "1";
  readonly projectionKind: RuntimeProjectionKind;
  readonly publicationId: number;
  readonly templateId: string;
  readonly tick: number;
  readonly time: number;
  readonly entityCount: number;
  readonly runtimeSignature: string;
}

export interface FlockingRenderFramePacket extends RuntimeFramePacketBase {
  readonly projectionKind: "flocking-v1";
  readonly entityIds: Readonly<Uint32Array>;
  readonly positions: Readonly<Float32Array>;
  readonly velocities: Readonly<Float32Array>;
  readonly neighborCounts: Readonly<Uint16Array>;
  readonly groupCodes: Readonly<Uint8Array>;
  readonly worldWidth: number;
  readonly worldHeight: number;
  readonly boundaryMode: "wrap" | "bounce" | "clamp";
  readonly perceptionRadius: number;
  readonly alignment: number | null;
  readonly selectedDetail?: SelectedRenderDetail;
}

// The runtime protocol is an explicit projection union. PERF1/PERF1B register
// only Flocking; this alias does not imply support for other templates.
export type RenderFramePacket = FlockingRenderFramePacket;

export interface SelectedUIProjection {
  readonly entityId: number;
  readonly label: string;
  readonly x: number;
  readonly y: number;
  readonly velocityX: number;
  readonly velocityY: number;
  readonly speed: number;
  readonly headingDegrees: number;
  readonly neighborCount: number;
  readonly localDensity: number;
  readonly currentProximityCount: number | null;
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
export interface RuntimeUIProjectionBase extends RuntimeIdentity {
  readonly schemaVersion: "1";
  readonly projectionKind: RuntimeProjectionKind;
  readonly revision: number;
  readonly templateId: string;
  readonly executionKind: RuntimeExecutionKind;
  readonly tick: number;
  readonly time: number;
  readonly entityCount: number;
  readonly playback: RuntimePlaybackState;
  readonly lastAdvanceKind: RuntimeAdvanceKind;
  readonly runtimeSignature: string;
  readonly warnings: readonly string[];
  readonly performance: {
    measures: readonly PerformanceMeasureSummary[];
    publications: RuntimePublicationStats;
  };
}

export interface FlockingUIProjection extends RuntimeUIProjectionBase {
  readonly projectionKind: "flocking-v1";
  readonly alignment: number | null;
  readonly selected: SelectedUIProjection | null;
}

export type UIProjection = FlockingUIProjection;

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
  readonly state: RuntimeDriverState;
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
