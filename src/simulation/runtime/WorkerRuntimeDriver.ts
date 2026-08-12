import type { Command } from "../kernel/types";
import { parseRuntimeWorkerResponse, type RuntimeWorkerRequest } from "./protocol";
import type {
  RenderFramePacket,
  RuntimeFailure,
  RuntimePublication,
  RuntimeRunRequest,
  RuntimeWorkerLike,
  SimulationRuntimePort,
  UIProjection
} from "./types";

interface PendingRequest {
  generation: number;
  resolve(ui: UIProjection): void;
  reject(error: Error): void;
}

export class WorkerRuntimeDriver implements SimulationRuntimePort {
  readonly executionKind = "worker" as const;
  private activeGeneration = 0;
  private requestSequence = 0;
  private latestFrame: RenderFramePacket | null = null;
  private latestUI: UIProjection | null = null;
  private runRequest: RuntimeRunRequest | null = null;
  private readonly listeners = new Set<(publication: RuntimePublication) => void>();
  private readonly pending = new Map<number, PendingRequest>();
  private disposed = false;
  private failed = false;

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

  initialize(request: RuntimeRunRequest): Promise<UIProjection> {
    this.assertUsable();
    this.runRequest = request;
    return this.beginRun("runtime.initialize", request);
  }

  replaceRun(request: RuntimeRunRequest): Promise<UIProjection> {
    this.assertUsable();
    this.runRequest = request;
    return this.beginRun("runtime.replace", request);
  }

  reset(): Promise<UIProjection> {
    this.assertUsable();
    if (!this.runRequest) {
      return Promise.reject(new Error("Worker runtime cannot reset before initialization"));
    }
    this.advanceGeneration();
    return this.request({
      type: "runtime.reset",
      requestId: this.nextRequestId(),
      generation: this.activeGeneration,
      runId: this.runRequest.runId
    });
  }

  play(): void {
    this.post({ type: "runtime.play", generation: this.activeGeneration });
  }

  pause(): void {
    if (this.disposed || this.failed || this.activeGeneration === 0) {
      return;
    }
    this.post({ type: "runtime.pause", generation: this.activeGeneration });
  }

  step(): Promise<UIProjection> {
    this.assertUsable();
    return this.request({
      type: "runtime.step",
      requestId: this.nextRequestId(),
      generation: this.activeGeneration
    });
  }

  applyCommands(commands: readonly Command[]): Promise<UIProjection> {
    this.assertUsable();
    return this.request({
      type: "runtime.applyCommands",
      requestId: this.nextRequestId(),
      generation: this.activeGeneration,
      commands
    });
  }

  setSelectedEntity(entityId: string | null): void {
    this.post({ type: "runtime.selection", generation: this.activeGeneration, entityId });
  }

  resetPerformance(): void {
    this.post({ type: "runtime.resetPerformance", generation: this.activeGeneration });
  }

  getLatestFrame(): RenderFramePacket | null {
    return this.latestFrame;
  }

  getLatestUI(): UIProjection | null {
    return this.latestUI;
  }

  subscribe(listener: (publication: RuntimePublication) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  dispose(): void {
    if (this.disposed) {
      return;
    }
    if (!this.failed && this.activeGeneration > 0) {
      this.worker.postMessage({ type: "runtime.dispose", generation: this.activeGeneration } satisfies RuntimeWorkerRequest);
    }
    this.removeWorkerListeners();
    this.worker.terminate();
    this.disposed = true;
    this.rejectPending(new Error("Worker runtime was disposed"));
    this.listeners.clear();
    this.latestFrame = null;
    this.latestUI = null;
  }

  private beginRun(type: "runtime.initialize" | "runtime.replace", request: RuntimeRunRequest): Promise<UIProjection> {
    this.advanceGeneration();
    return this.request({
      type,
      requestId: this.nextRequestId(),
      generation: this.activeGeneration,
      runId: request.runId,
      runConfig: request.runConfig,
      ...(request.instrumentation !== undefined ? { instrumentation: request.instrumentation } : {})
    });
  }

  private request(message: Extract<RuntimeWorkerRequest, { requestId: number }>): Promise<UIProjection> {
    return new Promise((resolve, reject) => {
      this.pending.set(message.requestId, { generation: message.generation, resolve, reject });
      try {
        this.post(message);
      } catch (error) {
        this.pending.delete(message.requestId);
        reject(error instanceof Error ? error : new Error(String(error)));
      }
    });
  }

  private post(message: RuntimeWorkerRequest): void {
    this.assertUsable();
    if (this.activeGeneration === 0) {
      throw new Error("Worker runtime is not initialized");
    }
    this.worker.postMessage(message);
  }

  private handleMessage(value: unknown): void {
    if (this.disposed || this.failed) {
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
      this.worker.postMessage({
        type: "runtime.frameConsumed",
        generation: message.frame.generation,
        publicationId: message.frame.publicationId
      } satisfies RuntimeWorkerRequest);
      if (message.frame.generation !== this.activeGeneration) {
        return;
      }
      this.latestFrame = message.frame;
      this.emit({ type: "frame", frame: message.frame });
      return;
    }
    if (message.type === "runtime.ui") {
      this.worker.postMessage({
        type: "runtime.uiConsumed",
        generation: message.ui.generation,
        revision: message.ui.revision
      } satisfies RuntimeWorkerRequest);
      if (message.ui.generation !== this.activeGeneration) {
        return;
      }
      this.latestUI = message.ui;
      this.emit({ type: "ui", ui: message.ui });
      return;
    }
    if (message.type === "runtime.complete") {
      const pending = this.pending.get(message.requestId);
      if (!pending || pending.generation !== message.generation || message.generation !== this.activeGeneration) {
        return;
      }
      this.pending.delete(message.requestId);
      this.latestUI = message.ui;
      pending.resolve(message.ui);
      return;
    }
    const failure = message.failure;
    if (failure.generation !== this.activeGeneration) {
      return;
    }
    this.emit({ type: "failure", failure });
    if (failure.requestId !== undefined) {
      const pending = this.pending.get(failure.requestId);
      this.pending.delete(failure.requestId);
      pending?.reject(new Error(failure.message));
    } else {
      this.rejectPending(new Error(failure.message));
    }
  }

  private failDriver(message: string, code: RuntimeFailure["code"]): void {
    if (this.disposed || this.failed) {
      return;
    }
    this.failed = true;
    const failure: RuntimeFailure = {
      generation: Math.max(1, this.activeGeneration),
      runId: this.runRequest?.runId ?? "uninitialized",
      code,
      message: (message.trim() || "Simulation Worker failed").slice(0, 2_000)
    };
    this.emit({ type: "failure", failure });
    this.rejectPending(new Error(failure.message));
    this.removeWorkerListeners();
    this.worker.terminate();
  }

  private advanceGeneration(): void {
    this.rejectPending(new Error("Runtime request was superseded by a newer generation"));
    this.activeGeneration += 1;
    this.latestFrame = null;
    this.latestUI = null;
  }

  private nextRequestId(): number {
    this.requestSequence += 1;
    return this.requestSequence;
  }

  private rejectPending(error: Error): void {
    for (const pending of this.pending.values()) {
      pending.reject(error);
    }
    this.pending.clear();
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

  private assertUsable(): void {
    if (this.disposed) {
      throw new Error("Worker runtime is disposed");
    }
    if (this.failed) {
      throw new Error("Worker runtime has failed and will not fall back implicitly");
    }
  }
}
