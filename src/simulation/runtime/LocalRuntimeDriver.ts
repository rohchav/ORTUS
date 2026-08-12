import type { Command } from "../kernel/types";
import { RuntimeAccumulatorScheduler, type RuntimeSchedulerOptions } from "./RuntimeScheduler";
import { RuntimeSession, type RuntimePublicationBundle } from "./RuntimeSession";
import type {
  RenderFramePacket,
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
  private disposed = false;

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

  async initialize(request: RuntimeRunRequest): Promise<UIProjection> {
    this.assertNotDisposed();
    this.activeGeneration += 1;
    this.runRequest = request;
    const bundle = this.session.rebuild(request, this.identity(request.runId), "initialization");
    this.publishBundle(bundle);
    return this.requireLatestUI();
  }

  async replaceRun(request: RuntimeRunRequest): Promise<UIProjection> {
    this.assertNotDisposed();
    this.scheduler.pause();
    this.activeGeneration += 1;
    this.runRequest = request;
    const bundle = this.session.rebuild(request, this.identity(request.runId), "replacement");
    this.publishBundle(bundle);
    return this.requireLatestUI();
  }

  async reset(): Promise<UIProjection> {
    this.assertNotDisposed();
    if (!this.runRequest) {
      throw new Error("Local runtime cannot reset before initialization");
    }
    this.scheduler.pause();
    this.activeGeneration += 1;
    this.publishBundle(this.session.reset(this.identity(this.runRequest.runId)));
    return this.requireLatestUI();
  }

  play(): void {
    this.assertNotDisposed();
    this.publishUI(this.session.play());
    this.scheduler.play();
  }

  pause(): void {
    if (this.disposed) {
      return;
    }
    this.scheduler.pause();
    this.publishUI(this.session.pause());
  }

  async step(): Promise<UIProjection> {
    this.assertNotDisposed();
    this.publishBundle(this.session.advance(1, "step"));
    return this.requireLatestUI();
  }

  async applyCommands(commands: readonly Command[]): Promise<UIProjection> {
    this.assertNotDisposed();
    this.publishBundle(this.session.applyCommands(commands));
    return this.requireLatestUI();
  }

  setSelectedEntity(entityId: string | null): void {
    this.assertNotDisposed();
    this.publishBundle(this.session.setSelectedEntity(entityId));
  }

  resetPerformance(): void {
    this.session.resetPerformance();
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
    this.scheduler.dispose();
    this.session.dispose();
    this.disposed = true;
    this.listeners.clear();
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
    if (frame.generation !== this.activeGeneration || this.disposed) {
      return;
    }
    this.latestFrame = frame;
    this.session.recordFramePublication(false);
    this.emit({ type: "frame", frame });
  }

  private publishUI(ui: UIProjection): void {
    if (ui.generation !== this.activeGeneration || this.disposed) {
      return;
    }
    this.latestUI = ui;
    this.session.recordUiPublication(false);
    this.emit({ type: "ui", ui });
  }

  private fail(error: unknown, code: RuntimeFailure["code"]): void {
    this.scheduler.pause();
    const identity = this.session.currentIdentity();
    const failure: RuntimeFailure = {
      ...identity,
      code,
      message: error instanceof Error ? error.message : String(error)
    };
    const ui = this.session.fail();
    if (ui) {
      this.publishUI(ui);
    }
    this.emit({ type: "failure", failure });
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

  private assertNotDisposed(): void {
    if (this.disposed) {
      throw new Error("Local runtime is disposed");
    }
  }
}
