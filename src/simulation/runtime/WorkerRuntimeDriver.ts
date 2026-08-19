import type { Command } from "../kernel/types";
import type { InterventionRequest } from "../interventions/interventionTypes";
import { parseRuntimeWorkerResponse, validateRuntimeArtifactJson, type RuntimeWorkerRequest } from "./protocol";
import {
  maxPendingRuntimeMessages,
  type RenderFramePacket,
  type RuntimeArtifactImportRequest,
  type RuntimeArtifactKind,
  type RuntimeDriverState,
  type RuntimeFailure,
  type RuntimePublication,
  type RuntimeRunRequest,
  type RuntimeWorkerLike,
  type SimulationRuntimePort,
  type UIProjection
} from "./types";

type PendingRequestKind = "initialize" | "replace" | "reset" | "operation";

interface PendingRequest {
  generation: number;
  kind: PendingRequestKind;
  resolve(ui: UIProjection): void;
  reject(error: Error): void;
}

interface PendingArtifactRequest {
  generation: number;
  kind: RuntimeArtifactKind;
  resolve(json: string): void;
  reject(error: Error): void;
}

interface OutstandingTransportMessage {
  generation: number;
  kind: "request" | "control";
}

type RuntimeControlRequest = Extract<RuntimeWorkerRequest, {
  type: "runtime.play" | "runtime.pause" | "runtime.speed" | "runtime.selection" | "runtime.resetPerformance";
}>;

export class WorkerRuntimeDriver implements SimulationRuntimePort {
  readonly executionKind = "worker" as const;
  private activeGeneration = 0;
  private requestSequence = 0;
  private activeRunId: string | null = null;
  private activeTemplateId: string | null = null;
  private latestFrame: RenderFramePacket | null = null;
  private latestUI: UIProjection | null = null;
  private latestFramePublicationId = 0;
  private latestUiRevision = 0;
  private intendedPlayback: "paused" | "running" | null = null;
  private readonly listeners = new Set<(publication: RuntimePublication) => void>();
  private readonly pending = new Map<number, PendingRequest>();
  private readonly pendingArtifacts = new Map<number, PendingArtifactRequest>();
  private readonly outstandingTransport = new Map<number, OutstandingTransportMessage>();
  private lifecycle: RuntimeDriverState = "idle";
  private hasReadyRun = false;

  private readonly onMessage = (event: MessageEvent<unknown>) => this.handleMessage(event.data);
  private readonly onError = (event: ErrorEvent) => {
    event.preventDefault?.();
    this.failDriver(event.message || "Simulation Worker failed", "worker");
  };
  private readonly onMessageError = () => this.failDriver("Simulation Worker emitted an unreadable message", "protocol");

  constructor(private readonly worker: RuntimeWorkerLike) {
    worker.addEventListener("message", this.onMessage);
    worker.addEventListener("error", this.onError);
    worker.addEventListener("messageerror", this.onMessageError);
  }

  get generation(): number {
    return this.activeGeneration;
  }

  get state(): RuntimeDriverState {
    return this.lifecycle;
  }

  initialize(request: RuntimeRunRequest): Promise<UIProjection> {
    this.assertUsable();
    if (this.lifecycle !== "idle") {
      throw new Error("Worker runtime initialize is allowed only from the idle state; use replaceRun for an active runtime");
    }
    return this.beginRun("runtime.initialize", request, "initialize");
  }

  replaceRun(request: RuntimeRunRequest): Promise<UIProjection> {
    this.assertUsable();
    if (this.lifecycle === "idle") {
      throw new Error("Worker runtime cannot replace a run before initialization");
    }
    if (!this.hasTransportCapacity()) {
      return Promise.reject(this.transportCapacityError());
    }
    return this.beginRun("runtime.replace", request, "replace");
  }

  reset(): Promise<UIProjection> {
    this.assertCommandable("reset");
    if (!this.activeRunId) {
      return Promise.reject(new Error("Worker runtime cannot reset before initialization"));
    }
    if (!this.hasTransportCapacity()) {
      return Promise.reject(this.transportCapacityError());
    }
    this.advanceGeneration();
    this.lifecycle = "initializing";
    this.intendedPlayback = "paused";
    return this.request({
      type: "runtime.reset",
      requestId: this.nextRequestId(),
      generation: this.activeGeneration,
      runId: this.activeRunId
    }, "reset");
  }

  play(): void {
    this.assertCommandable("play");
    const message: RuntimeControlRequest = {
      type: "runtime.play",
      commandId: this.reserveTransport("control"),
      generation: this.activeGeneration
    };
    this.sendControl(message);
    this.intendedPlayback = "running";
  }

  pause(): void {
    this.assertCommandable("pause");
    const message: RuntimeControlRequest = {
      type: "runtime.pause",
      commandId: this.reserveTransport("control"),
      generation: this.activeGeneration
    };
    this.sendControl(message);
    this.intendedPlayback = "paused";
  }

  step(): Promise<UIProjection> {
    this.assertCommandable("step");
    if (this.intendedPlayback === "running") {
      return Promise.reject(new Error("Manual step requires a paused runtime"));
    }
    return this.request({
      type: "runtime.step",
      requestId: this.nextRequestId(),
      generation: this.activeGeneration
    }, "operation");
  }

  applyCommands(commands: readonly Command[]): Promise<UIProjection> {
    this.assertCommandable("apply commands");
    return this.request({
      type: "runtime.applyCommands",
      requestId: this.nextRequestId(),
      generation: this.activeGeneration,
      commands
    }, "operation");
  }

  setSpeedMultiplier(value: number): void {
    this.assertCommandable("change speed");
    this.sendControl({
      type: "runtime.speed",
      commandId: this.reserveTransport("control"),
      generation: this.activeGeneration,
      value
    });
  }

  applyIntervention(intervention: InterventionRequest): Promise<UIProjection> {
    this.assertCommandable("apply an intervention");
    return this.request({
      type: "runtime.applyIntervention",
      requestId: this.nextRequestId(),
      generation: this.activeGeneration,
      intervention
    }, "operation");
  }

  clearInterventions(): Promise<UIProjection> {
    this.assertCommandable("clear intervention entries");
    return this.request({
      type: "runtime.clearInterventions",
      requestId: this.nextRequestId(),
      generation: this.activeGeneration
    }, "operation");
  }

  exportArtifact(kind: RuntimeArtifactKind): Promise<string> {
    this.assertCommandable(`export a ${kind}`);
    return this.requestArtifact({
      type: "runtime.exportArtifact",
      requestId: this.nextRequestId(),
      generation: this.activeGeneration,
      kind
    });
  }

  importArtifact(request: RuntimeArtifactImportRequest): Promise<UIProjection> {
    this.assertCommandable(`import a ${request.kind}`);
    validateRuntimeArtifactJson(request.kind, request.json);
    if (!this.hasTransportCapacity()) {
      return Promise.reject(this.transportCapacityError());
    }
    this.advanceGeneration();
    this.lifecycle = "initializing";
    this.intendedPlayback = "paused";
    this.activeRunId = request.runId;
    this.activeTemplateId = "flocking-boids";
    return this.request({
      type: "runtime.importArtifact",
      requestId: this.nextRequestId(),
      generation: this.activeGeneration,
      runId: request.runId,
      kind: request.kind,
      json: request.json
    }, "replace");
  }

  setSelectedEntity(entityId: string | null): void {
    this.assertCommandable("change selection");
    this.sendControl({
      type: "runtime.selection",
      commandId: this.reserveTransport("control"),
      generation: this.activeGeneration,
      entityId
    });
  }

  resetPerformance(): void {
    this.assertCommandable("reset performance instrumentation");
    this.sendControl({
      type: "runtime.resetPerformance",
      commandId: this.reserveTransport("control"),
      generation: this.activeGeneration
    });
  }

  getLatestFrame(): RenderFramePacket | null {
    return this.latestFrame;
  }

  getLatestUI(): UIProjection | null {
    return this.latestUI;
  }

  subscribe(listener: (publication: RuntimePublication) => void): () => void {
    this.assertNotDisposed();
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  dispose(): void {
    if (this.lifecycle === "disposed") {
      return;
    }
    if (this.lifecycle !== "failed" && this.activeGeneration > 0) {
      try {
        this.worker.postMessage({ type: "runtime.dispose", generation: this.activeGeneration } satisfies RuntimeWorkerRequest);
      } catch {
        // Local termination below remains authoritative during disposal.
      }
    }
    this.removeWorkerListeners();
    this.worker.terminate();
    this.lifecycle = "disposed";
    this.rejectPending(new Error("Worker runtime was disposed"));
    this.outstandingTransport.clear();
    this.listeners.clear();
    this.latestFrame = null;
    this.latestUI = null;
    this.intendedPlayback = null;
    this.activeRunId = null;
    this.activeTemplateId = null;
  }

  private beginRun(
    type: "runtime.initialize" | "runtime.replace",
    request: RuntimeRunRequest,
    kind: Extract<PendingRequestKind, "initialize" | "replace">
  ): Promise<UIProjection> {
    this.advanceGeneration();
    this.lifecycle = "initializing";
    this.intendedPlayback = "paused";
    this.activeRunId = request.runId;
    this.activeTemplateId = request.runConfig.templateId;
    return this.request({
      type,
      requestId: this.nextRequestId(),
      generation: this.activeGeneration,
      runId: request.runId,
      runConfig: request.runConfig,
      ...(request.instrumentation !== undefined ? { instrumentation: request.instrumentation } : {})
    }, kind);
  }

  private request(
    message: Extract<RuntimeWorkerRequest, { requestId: number }>,
    kind: PendingRequestKind
  ): Promise<UIProjection> {
    if (this.pending.size >= maxPendingRuntimeMessages || !this.hasTransportCapacity()) {
      return Promise.reject(this.transportCapacityError());
    }
    return new Promise((resolve, reject) => {
      this.pending.set(message.requestId, { generation: message.generation, kind, resolve, reject });
      this.outstandingTransport.set(message.requestId, { generation: message.generation, kind: "request" });
      try {
        this.send(message);
      } catch (error) {
        this.pending.delete(message.requestId);
        this.outstandingTransport.delete(message.requestId);
        reject(error instanceof Error ? error : new Error(String(error)));
      }
    });
  }

  private requestArtifact(
    message: Extract<RuntimeWorkerRequest, { type: "runtime.exportArtifact" }>
  ): Promise<string> {
    if (this.pendingArtifacts.size >= maxPendingRuntimeMessages || !this.hasTransportCapacity()) {
      return Promise.reject(this.transportCapacityError());
    }
    return new Promise((resolve, reject) => {
      this.pendingArtifacts.set(message.requestId, {
        generation: message.generation,
        kind: message.kind,
        resolve,
        reject
      });
      this.outstandingTransport.set(message.requestId, { generation: message.generation, kind: "request" });
      try {
        this.send(message);
      } catch (error) {
        this.pendingArtifacts.delete(message.requestId);
        this.outstandingTransport.delete(message.requestId);
        reject(error instanceof Error ? error : new Error(String(error)));
      }
    });
  }

  private sendControl(message: RuntimeControlRequest): void {
    try {
      this.send(message);
    } catch (error) {
      this.outstandingTransport.delete(message.commandId);
      throw error;
    }
  }

  private send(message: RuntimeWorkerRequest): void {
    this.assertUsable();
    if (this.activeGeneration === 0) {
      throw new Error("Worker runtime is not initialized");
    }
    try {
      this.worker.postMessage(message);
    } catch (error) {
      const failure = error instanceof Error ? error : new Error(String(error));
      this.failDriver(`Simulation Worker transport failed: ${failure.message}`, "worker");
      throw failure;
    }
  }

  private handleMessage(value: unknown): void {
    if (this.lifecycle === "disposed" || this.lifecycle === "failed") {
      return;
    }
    let message;
    try {
      message = parseRuntimeWorkerResponse(value);
    } catch (error) {
      this.failDriver(error instanceof Error ? error.message : String(error), "protocol");
      return;
    }
    if (message.type === "runtime.frame") {
      if (!this.acknowledge({
        type: "runtime.frameConsumed",
        generation: message.frame.generation,
        publicationId: message.frame.publicationId
      })) {
        return;
      }
      if (message.frame.generation !== this.activeGeneration) {
        return;
      }
      if (!this.validateActiveProjection(message.frame)) {
        return;
      }
      if (message.frame.publicationId <= this.latestFramePublicationId) {
        return;
      }
      if (this.latestFrame && message.frame.tick < this.latestFrame.tick) {
        this.failDriver("Runtime frame tick regressed within the active generation", "protocol");
        return;
      }
      this.latestFramePublicationId = message.frame.publicationId;
      this.latestFrame = message.frame;
      this.emit({ type: "frame", frame: message.frame });
      return;
    }
    if (message.type === "runtime.ui") {
      if (!this.acknowledge({
        type: "runtime.uiConsumed",
        generation: message.ui.generation,
        revision: message.ui.revision
      })) {
        return;
      }
      if (message.ui.generation !== this.activeGeneration) {
        return;
      }
      if (!this.validateActiveProjection(message.ui)) {
        return;
      }
      if (message.ui.revision <= this.latestUiRevision) {
        return;
      }
      if (this.latestUI && message.ui.tick < this.latestUI.tick) {
        this.failDriver("Runtime UI tick regressed within the active generation", "protocol");
        return;
      }
      this.latestUiRevision = message.ui.revision;
      this.latestUI = message.ui;
      this.emit({ type: "ui", ui: message.ui });
      return;
    }
    if (message.type === "runtime.messageConsumed") {
      this.consumeTransport(message.messageId, message.generation);
      return;
    }
    if (message.type === "runtime.artifact") {
      this.consumeTransport(message.requestId, message.generation);
      const pending = this.pendingArtifacts.get(message.requestId);
      if (!pending || pending.generation !== message.generation || message.generation !== this.activeGeneration) {
        return;
      }
      if (pending.kind !== message.kind) {
        this.failDriver("Runtime artifact kind did not match the active export request", "protocol");
        return;
      }
      try {
        validateRuntimeArtifactJson(message.kind, message.json);
      } catch (error) {
        this.failDriver(error instanceof Error ? error.message : String(error), "protocol");
        return;
      }
      this.pendingArtifacts.delete(message.requestId);
      pending.resolve(message.json);
      return;
    }
    if (message.type === "runtime.complete") {
      this.consumeTransport(message.requestId, message.generation);
      const pending = this.pending.get(message.requestId);
      if (!pending || pending.generation !== message.generation || message.generation !== this.activeGeneration) {
        return;
      }
      if (!this.validateActiveProjection(message.ui)) {
        return;
      }
      let shouldEmitUI = false;
      if (message.ui.revision > this.latestUiRevision) {
        if (this.latestUI && message.ui.tick < this.latestUI.tick) {
          this.failDriver("Runtime completion UI tick regressed within the active generation", "protocol");
          return;
        }
        this.latestUiRevision = message.ui.revision;
        this.latestUI = message.ui;
        shouldEmitUI = true;
      }
      this.pending.delete(message.requestId);
      if (pending.kind === "initialize" || pending.kind === "replace" || pending.kind === "reset") {
        this.lifecycle = "ready";
        this.hasReadyRun = true;
        this.intendedPlayback = message.ui.playback === "running" ? "running" : "paused";
      }
      if (shouldEmitUI) {
        this.emit({ type: "ui", ui: message.ui });
      }
      pending.resolve(message.ui);
      return;
    }
    const failure = message.failure;
    if (failure.generation !== this.activeGeneration) {
      return;
    }
    if (failure.runId !== this.activeRunId) {
      this.failDriver("Runtime failure identity did not match the active run", "protocol");
      return;
    }
    this.terminateWithFailure(failure);
  }

  private acknowledge(message: Extract<RuntimeWorkerRequest, { type: "runtime.frameConsumed" | "runtime.uiConsumed" }>): boolean {
    try {
      this.worker.postMessage(message);
      return true;
    } catch (error) {
      const failure = error instanceof Error ? error : new Error(String(error));
      this.failDriver(`Simulation Worker acknowledgement failed: ${failure.message}`, "worker");
      return false;
    }
  }

  private validateActiveProjection(projection: RenderFramePacket | UIProjection): boolean {
    if (
      projection.runId !== this.activeRunId
      || projection.templateId !== this.activeTemplateId
      || projection.projectionKind !== "flocking-v1"
      || ("executionKind" in projection && projection.executionKind !== "worker")
    ) {
      this.failDriver("Runtime projection identity or kind did not match the active Worker run", "protocol");
      return false;
    }
    return true;
  }

  private failDriver(message: string, code: RuntimeFailure["code"]): void {
    if (this.lifecycle === "disposed" || this.lifecycle === "failed") {
      return;
    }
    const failure: RuntimeFailure = {
      generation: Math.max(1, this.activeGeneration),
      runId: this.activeRunId ?? "uninitialized",
      code,
      message: (message.trim() || "Simulation Worker failed").slice(0, 2_000)
    };
    this.terminateWithFailure(failure);
  }

  private terminateWithFailure(failure: RuntimeFailure): void {
    if (this.lifecycle === "disposed" || this.lifecycle === "failed") {
      return;
    }
    this.lifecycle = "failed";
    if (this.latestUI) {
      this.latestUI = { ...this.latestUI, playback: "failed" };
    }
    this.emit({ type: "failure", failure });
    this.rejectPending(new Error(failure.message));
    this.outstandingTransport.clear();
    this.intendedPlayback = null;
    this.removeWorkerListeners();
    this.worker.terminate();
  }

  private advanceGeneration(): void {
    this.rejectPending(new Error("Runtime request was superseded by a newer generation"));
    if (this.activeGeneration >= Number.MAX_SAFE_INTEGER) {
      throw new Error("Worker runtime generation exhausted its safe integer range");
    }
    this.activeGeneration += 1;
    this.latestFrame = null;
    this.latestUI = null;
    this.latestFramePublicationId = 0;
    this.latestUiRevision = 0;
  }

  private nextRequestId(): number {
    if (this.requestSequence >= Number.MAX_SAFE_INTEGER) {
      throw new Error("Worker runtime request identity exhausted its safe integer range");
    }
    this.requestSequence += 1;
    return this.requestSequence;
  }

  private reserveTransport(kind: OutstandingTransportMessage["kind"]): number {
    if (!this.hasTransportCapacity()) {
      throw this.transportCapacityError();
    }
    const messageId = this.nextRequestId();
    this.outstandingTransport.set(messageId, { generation: this.activeGeneration, kind });
    return messageId;
  }

  private consumeTransport(messageId: number, generation: number): void {
    const outstanding = this.outstandingTransport.get(messageId);
    if (!outstanding) {
      return;
    }
    if (outstanding.generation !== generation) {
      this.failDriver("Runtime consumption acknowledgement generation did not match the sent message", "protocol");
      return;
    }
    this.outstandingTransport.delete(messageId);
  }

  private hasTransportCapacity(): boolean {
    return this.outstandingTransport.size < maxPendingRuntimeMessages;
  }

  private transportCapacityError(): Error {
    return new Error(`Worker runtime cannot accept more than ${maxPendingRuntimeMessages} unconsumed messages`);
  }

  private rejectPending(error: Error): void {
    for (const pending of this.pending.values()) {
      pending.reject(error);
    }
    this.pending.clear();
    for (const pending of this.pendingArtifacts.values()) {
      pending.reject(error);
    }
    this.pendingArtifacts.clear();
  }

  private emit(publication: RuntimePublication): void {
    for (const listener of this.listeners) {
      listener(publication);
    }
  }

  private removeWorkerListeners(): void {
    this.worker.removeEventListener("message", this.onMessage);
    this.worker.removeEventListener("error", this.onError);
    this.worker.removeEventListener("messageerror", this.onMessageError);
  }

  private assertCommandable(operation: string): void {
    this.assertUsable();
    if (this.lifecycle === "ready") {
      return;
    }
    if (this.lifecycle === "initializing" && this.hasReadyRun) {
      return;
    }
    throw new Error(`Worker runtime cannot ${operation} while ${this.lifecycle}`);
  }

  private assertUsable(): void {
    this.assertNotDisposed();
    if (this.lifecycle === "failed") {
      throw new Error("Worker runtime has failed and will not fall back implicitly");
    }
  }

  private assertNotDisposed(): void {
    if (this.lifecycle === "disposed") {
      throw new Error("Worker runtime is disposed");
    }
  }
}
