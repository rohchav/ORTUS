import type { Command } from "../kernel/types";
import { RuntimeAccumulatorScheduler, type RuntimeSchedulerOptions } from "./RuntimeScheduler";
import { RuntimeSession, type RuntimePublicationBundle } from "./RuntimeSession";
import type {
  RenderFramePacket,
  RuntimeDriverState,
  RuntimeFailure,
  RuntimePublication,
  RuntimeRunRequest,
  SimulationRuntimePort,
  UIProjection
} from "./types";

export class LocalRuntimeDriver implements SimulationRuntimePort {
  readonly executionKind = "local" as const;
  private readonly session: RuntimeSession;
  private readonly scheduler: RuntimeAccumulatorScheduler;
  private readonly listeners = new Set<(publication: RuntimePublication) => void>();
  private activeGeneration = 0;
  private latestFrame: RenderFramePacket | null = null;
  private latestUI: UIProjection | null = null;
  private runRequest: RuntimeRunRequest | null = null;
  private lifecycle: RuntimeDriverState = "idle";

  constructor(options: RuntimeSchedulerOptions = {}) {
    this.session = new RuntimeSession("local", options.now);
    this.scheduler = new RuntimeAccumulatorScheduler({
      advance: (steps) => this.publishBundle(this.session.advance(steps, "run")),
      maxStepsPerCycle: () => this.session.maxStepsPerCycle,
      speedMultiplier: () => this.session.speedMultiplier,
      onError: (error) => this.fail(error, "runtime")
    }, options);
  }

  get generation(): number {
    return this.activeGeneration;
  }

  get state(): RuntimeDriverState {
    return this.lifecycle;
  }

  async initialize(request: RuntimeRunRequest): Promise<UIProjection> {
    this.assertUsable();
    if (this.lifecycle !== "idle") {
      throw new Error("Local runtime initialize is allowed only from the idle state; use replaceRun for an active runtime");
    }
    return this.rebuild(request, "initialization");
  }

  async replaceRun(request: RuntimeRunRequest): Promise<UIProjection> {
    this.assertCommandable("replace run");
    this.scheduler.pause();
    return this.rebuild(request, "replacement");
  }

  async reset(): Promise<UIProjection> {
    this.assertCommandable("reset");
    if (!this.runRequest) {
      throw new Error("Local runtime cannot reset before initialization");
    }
    this.scheduler.pause();
    this.beginGeneration();
    this.lifecycle = "initializing";
    try {
      this.publishBundle(this.session.reset(this.identity(this.runRequest.runId)));
      this.lifecycle = "ready";
      return this.requireLatestUI();
    } catch (error) {
      this.fail(error, "runtime", this.runRequest.runId);
      throw error;
    }
  }

  play(): void {
    this.assertCommandable("play");
    try {
      this.publishUI(this.session.play());
      this.scheduler.play();
    } catch (error) {
      this.fail(error, "runtime");
      throw error;
    }
  }

  pause(): void {
    this.assertCommandable("pause");
    this.scheduler.pause();
    try {
      this.publishUI(this.session.pause());
    } catch (error) {
      this.fail(error, "runtime");
      throw error;
    }
  }

  async step(): Promise<UIProjection> {
    this.assertCommandable("step");
    if (this.latestUI?.playback === "running") {
      throw new Error("Manual step requires a paused runtime");
    }
    try {
      this.publishBundle(this.session.advance(1, "step"));
      return this.requireLatestUI();
    } catch (error) {
      this.fail(error, "runtime");
      throw error;
    }
  }

  async applyCommands(commands: readonly Command[]): Promise<UIProjection> {
    this.assertCommandable("apply commands");
    try {
      this.publishBundle(this.session.applyCommands(commands));
      return this.requireLatestUI();
    } catch (error) {
      this.fail(error, "runtime");
      throw error;
    }
  }

  setSelectedEntity(entityId: string | null): void {
    this.assertCommandable("change selection");
    try {
      this.publishBundle(this.session.setSelectedEntity(entityId));
    } catch (error) {
      this.fail(error, "runtime");
      throw error;
    }
  }

  resetPerformance(): void {
    this.assertCommandable("reset performance instrumentation");
    this.session.resetPerformance();
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
    this.scheduler.dispose();
    this.session.dispose();
    this.lifecycle = "disposed";
    this.listeners.clear();
    this.latestFrame = null;
    this.latestUI = null;
    this.runRequest = null;
  }

  private rebuild(request: RuntimeRunRequest, kind: "initialization" | "replacement"): UIProjection {
    this.beginGeneration();
    this.lifecycle = "initializing";
    this.runRequest = request;
    try {
      const bundle = this.session.rebuild(request, this.identity(request.runId), kind);
      this.publishBundle(bundle);
      this.lifecycle = "ready";
      return this.requireLatestUI();
    } catch (error) {
      this.fail(error, "initialization", request.runId);
      throw error;
    }
  }

  private beginGeneration(): void {
    if (this.activeGeneration >= Number.MAX_SAFE_INTEGER) {
      throw new Error("Local runtime generation exhausted its safe integer range");
    }
    this.activeGeneration += 1;
    this.latestFrame = null;
    this.latestUI = null;
  }

  private publishBundle(bundle: RuntimePublicationBundle): void {
    this.publishFrame(bundle.frame);
    if (bundle.ui) {
      this.publishUI(bundle.ui);
    }
  }

  private publishFrame(frame: RenderFramePacket): void {
    if (frame.generation !== this.activeGeneration || this.lifecycle === "disposed") {
      return;
    }
    this.latestFrame = frame;
    this.session.recordFramePublication(false);
    this.emit({ type: "frame", frame });
  }

  private publishUI(ui: UIProjection): void {
    if (ui.generation !== this.activeGeneration || this.lifecycle === "disposed") {
      return;
    }
    this.latestUI = ui;
    this.session.recordUiPublication(false);
    this.emit({ type: "ui", ui });
  }

  private fail(error: unknown, code: RuntimeFailure["code"], runId?: string): void {
    if (this.lifecycle === "failed" || this.lifecycle === "disposed") {
      return;
    }
    this.scheduler.pause();
    this.lifecycle = "failed";
    const identity = this.session.currentIdentity();
    const failure: RuntimeFailure = {
      generation: Math.max(1, this.activeGeneration),
      runId: runId ?? (identity.generation === this.activeGeneration ? identity.runId : this.runRequest?.runId ?? "uninitialized"),
      code,
      message: boundedErrorMessage(error)
    };
    const ui = this.session.fail();
    if (ui) {
      this.publishUI({ ...ui, playback: "failed" });
    }
    this.emit({ type: "failure", failure });
    this.runRequest = null;
  }

  private emit(publication: RuntimePublication): void {
    for (const listener of this.listeners) {
      listener(publication);
    }
  }

  private identity(runId: string) {
    return { generation: this.activeGeneration, runId };
  }

  private requireLatestUI(): UIProjection {
    if (!this.latestUI) {
      throw new Error("Local runtime did not publish UI state");
    }
    return this.latestUI;
  }

  private assertCommandable(operation: string): void {
    this.assertUsable();
    if (this.lifecycle !== "ready") {
      throw new Error(`Local runtime cannot ${operation} while ${this.lifecycle}`);
    }
  }

  private assertUsable(): void {
    this.assertNotDisposed();
    if (this.lifecycle === "failed") {
      throw new Error("Local runtime has failed");
    }
  }

  private assertNotDisposed(): void {
    if (this.lifecycle === "disposed") {
      throw new Error("Local runtime is disposed");
    }
  }
}

function boundedErrorMessage(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  return (message.trim() || "Unknown local runtime failure").slice(0, 2_000);
}
