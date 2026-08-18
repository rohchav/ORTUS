import { RuntimeAccumulatorScheduler, type RuntimeSchedulerOptions } from "./RuntimeScheduler";
import { RuntimeSession, type RuntimePublicationBundle } from "./RuntimeSession";
import { LatestPublicationGate } from "./LatestPublicationGate";
import {
  parseRuntimeWorkerRequest,
  parseRuntimeWorkerRequestFailureContext,
  type RuntimeWorkerRequest,
  type RuntimeWorkerResponse
} from "./protocol";
import { renderFrameTransferables } from "./flockingProjection";
import type { RenderFramePacket, RuntimeFailure, UIProjection } from "./types";

export interface RuntimeWorkerHostOptions {
  postMessage(message: RuntimeWorkerResponse, transfer?: Transferable[]): void;
  now?: () => number;
  scheduler?: RuntimeSchedulerOptions;
}

export class RuntimeWorkerHost {
  private readonly session: RuntimeSession;
  private readonly scheduler: RuntimeAccumulatorScheduler;
  private readonly frameGate: LatestPublicationGate<RenderFramePacket>;
  private readonly uiGate: LatestPublicationGate<UIProjection>;
  private readonly now: () => number;
  private generation = 0;
  private runId = "uninitialized";
  private disposed = false;

  constructor(private readonly options: RuntimeWorkerHostOptions) {
    this.now = options.now ?? readNow;
    this.session = new RuntimeSession("worker", this.now);
    this.frameGate = new LatestPublicationGate(
      (frame) => this.postFrame(frame),
      (frame) => frame.publicationId,
      () => this.session.recordFramePublication(false),
      () => this.session.recordFramePublication(true)
    );
    this.uiGate = new LatestPublicationGate(
      (ui) => this.postUI(ui),
      (ui) => ui.revision,
      () => this.session.recordUiPublication(false),
      () => this.session.recordUiPublication(true)
    );
    this.scheduler = new RuntimeAccumulatorScheduler({
      advance: (steps) => this.publishBundle(this.session.advance(steps, "run")),
      maxStepsPerCycle: () => this.session.maxStepsPerCycle,
      speedMultiplier: () => this.session.speedMultiplier,
      onError: (error) => this.reportFailure(error, "runtime")
    }, options.scheduler);
  }

  handleMessage(value: unknown): void {
    if (this.disposed) {
      return;
    }
    let request: RuntimeWorkerRequest;
    try {
      request = parseRuntimeWorkerRequest(value);
    } catch (error) {
      const context = parseRuntimeWorkerRequestFailureContext(value);
      if (context && this.generation > 0 && context.generation !== this.generation) {
        if (context.messageId !== undefined) {
          this.options.postMessage({
            type: "runtime.messageConsumed",
            messageId: context.messageId,
            generation: context.generation
          });
        }
        return;
      }
      this.reportFailure(error, "protocol", context?.requestId, context ?? undefined);
      return;
    }
    try {
      this.acknowledgeMessageConsumption(request);
      this.handleRequest(request);
    } catch (error) {
      const code = request.type === "runtime.initialize" || request.type === "runtime.replace"
        ? "initialization"
        : "runtime";
      const requestId = "requestId" in request ? request.requestId : undefined;
      this.reportFailure(error, code, requestId);
    }
  }

  dispose(): void {
    if (this.disposed) {
      return;
    }
    this.scheduler.dispose();
    this.frameGate.dispose();
    this.uiGate.dispose();
    this.session.dispose();
    this.disposed = true;
  }

  queueCounts(): { frame: { inFlight: number; pending: number }; ui: { inFlight: number; pending: number } } {
    return { frame: this.frameGate.counts(), ui: this.uiGate.counts() };
  }

  private handleRequest(request: RuntimeWorkerRequest): void {
    if (request.type === "runtime.initialize" || request.type === "runtime.replace") {
      if (request.generation <= this.generation) {
        return;
      }
      this.scheduler.pause();
      this.generation = request.generation;
      this.runId = request.runId;
      this.frameGate.reset();
      this.uiGate.reset();
      const bundle = this.session.rebuild(
        {
          runId: request.runId,
          runConfig: request.runConfig,
          ...(request.instrumentation !== undefined ? { instrumentation: request.instrumentation } : {})
        },
        { generation: request.generation, runId: request.runId },
        request.type === "runtime.initialize" ? "initialization" : "replacement"
      );
      this.publishBundle(bundle);
      this.complete(request.requestId, bundle.ui!);
      return;
    }
    if (request.type === "runtime.reset") {
      if (request.generation <= this.generation) {
        return;
      }
      this.scheduler.pause();
      this.generation = request.generation;
      this.runId = request.runId;
      this.frameGate.reset();
      this.uiGate.reset();
      const bundle = this.session.reset({ generation: request.generation, runId: request.runId });
      this.publishBundle(bundle);
      this.complete(request.requestId, bundle.ui!);
      return;
    }
    if (request.generation !== this.generation) {
      return;
    }
    switch (request.type) {
      case "runtime.play":
        this.publishUI(this.session.play());
        this.scheduler.play();
        break;
      case "runtime.pause":
        this.scheduler.pause();
        this.publishUI(this.session.pause());
        break;
      case "runtime.step": {
        const bundle = this.session.advance(1, "step");
        this.publishBundle(bundle);
        this.complete(request.requestId, bundle.ui!);
        break;
      }
      case "runtime.applyCommands": {
        const bundle = this.session.applyCommands(request.commands);
        this.publishBundle(bundle);
        this.complete(request.requestId, bundle.ui!);
        break;
      }
      case "runtime.selection":
        this.publishBundle(this.session.setSelectedEntity(request.entityId));
        break;
      case "runtime.resetPerformance":
        this.session.resetPerformance();
        break;
      case "runtime.frameConsumed":
        this.frameGate.acknowledge(request.publicationId);
        break;
      case "runtime.uiConsumed":
        this.uiGate.acknowledge(request.revision);
        break;
      case "runtime.dispose":
        this.dispose();
        break;
    }
  }

  private publishBundle(bundle: RuntimePublicationBundle): void {
    this.frameGate.offer(bundle.frame);
    if (bundle.ui) {
      this.uiGate.offer(bundle.ui);
    }
  }

  private publishUI(ui: UIProjection): void {
    this.uiGate.offer(ui);
  }

  private postFrame(frame: RenderFramePacket): void {
    const started = this.session.performanceMark();
    this.options.postMessage({ type: "runtime.frame", frame }, renderFrameTransferables(frame));
    this.session.recordElapsed("ortus.runtime.publish", started);
  }

  private postUI(ui: UIProjection): void {
    const started = this.session.performanceMark();
    this.options.postMessage({ type: "runtime.ui", ui });
    this.session.recordElapsed("ortus.runtime.publish", started);
  }

  private complete(requestId: number, ui: UIProjection): void {
    this.options.postMessage({ type: "runtime.complete", requestId, generation: this.generation, ui });
  }

  private acknowledgeMessageConsumption(request: RuntimeWorkerRequest): void {
    const messageId = "requestId" in request
      ? request.requestId
      : "commandId" in request
        ? request.commandId
        : undefined;
    if (messageId !== undefined) {
      this.options.postMessage({
        type: "runtime.messageConsumed",
        messageId,
        generation: request.generation
      });
    }
  }

  private reportFailure(
    error: unknown,
    code: RuntimeFailure["code"],
    requestId?: number,
    identity?: { generation: number; runId?: string }
  ): void {
    this.scheduler.pause();
    const failure: RuntimeFailure = {
      generation: (identity?.generation ?? this.generation) || 1,
      runId: identity?.runId ?? this.runId,
      code,
      message: boundedErrorMessage(error),
      ...(requestId !== undefined ? { requestId } : {})
    };
    const ui = this.session.fail();
    if (ui) {
      this.publishUI(ui);
    }
    this.options.postMessage({ type: "runtime.failure", failure });
  }
}

function boundedErrorMessage(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  return (message.trim() || "Unknown runtime failure").slice(0, 2_000);
}

function readNow(): number {
  return globalThis.performance?.now?.() ?? Date.now();
}
