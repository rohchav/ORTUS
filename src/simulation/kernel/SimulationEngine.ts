import type {
  BufferedCommand,
  Command,
  CommandMetadata,
  EventAccess,
  JsonValue,
  MetricsAccess,
  ParameterValues,
  ScenarioExport,
  ScenarioVariantConfig,
  SimulationEngineOptions,
  SimulationSnapshotView,
  SimulationTemplate,
  SnapshotExport,
  SpaceAccess,
  System,
  SystemContext
} from "./types";
import { CommandBuffer, SystemCommandSink } from "./CommandBuffer";
import { appendSimulationEventLogToWorld, normalizeSimulationEventLogInWorld } from "./EventLog";
import { SimulationClock } from "./SimulationClock";
import { MetricsCollector } from "./Metrics";
import { SimulationPerformanceMonitor, type PerformanceInstrumentationOptions, type SimulationPerformanceSnapshot } from "./Performance";
import { RandomService } from "./Random";
import { Scheduler } from "./Scheduler";
import { SimulationRuntime } from "./SimulationRuntime";
import { SystemRegistry } from "./SystemRegistry";
import { World } from "./World";
import {
  SimulationEngineFailedError,
  SimulationSerializationError,
  SimulationValidationError,
  type SimulationFailure
} from "./Errors";
import { assertWorldInvariants } from "./Invariants";
import { createScenarioExport, createSnapshotExport, createSnapshotView } from "./Snapshot";
import { deserializeScenario, deserializeSnapshot, serializeScenario, serializeSnapshot } from "./Serialization";
import { deepClone, resolveParameters, validateTemplate } from "./Validation";

export interface EngineDebugData {
  tick: number;
  time: number;
  seed: string;
  templateId: string;
  systemExecutionLog: readonly { tick: number; phase: string; systemId: string; commandCount: number }[];
  lastEvents: readonly import("./types").SimulationEvent[];
  lastCommands: readonly BufferedCommand[];
}

export class SimulationEngine {
  readonly template: SimulationTemplate;
  readonly clock: SimulationClock;
  rng: RandomService;
  readonly registry: SystemRegistry;
  readonly metrics: MetricsCollector;
  readonly performanceMonitor: SimulationPerformanceMonitor;
  readonly scheduler = new Scheduler();
  readonly runtime = new SimulationRuntime();
  readonly commandBuffer = new CommandBuffer();
  seed: string;
  readonly updateMode: NonNullable<SimulationEngineOptions["updateMode"]>;
  metadata: Record<string, JsonValue>;
  readonly debug: boolean;
  parameters: ParameterValues;
  initialization?: NonNullable<SimulationEngineOptions["initialization"]>;
  scenario?: ScenarioVariantConfig;
  world: World;
  private failureState: SimulationFailure | undefined;

  constructor(template: SimulationTemplate, options: SimulationEngineOptions = {}) {
    validateTemplate(template);
    this.template = template;
    this.seed = String(options.seed ?? "default-seed");
    this.parameters = resolveParameters(template.parameterDefinitions, options.parameters ?? {});
    template.validateParameters?.(this.parameters);
    this.initialization = options.initialization ? deepClone(options.initialization) : undefined;
    this.scenario = options.scenario ? deepClone(options.scenario) : undefined;
    if (this.initialization) {
      template.validateInitializationOptions?.(this.initialization, this.parameters);
    }
    if (this.scenario) {
      template.validateScenarioOptions?.(this.scenario, this.parameters);
    }
    this.clock = new SimulationClock({
      fixedDt: options.fixedDt,
      speedMultiplier: options.speedMultiplier,
      maxStepsPerFrame: options.maxStepsPerFrame
    });
    this.rng = new RandomService(this.seed);
    this.registry = new SystemRegistry();
    this.metrics = new MetricsCollector(options.maxMetricsHistory ?? 1000, options.metricsInterval ?? 1);
    this.performanceMonitor = new SimulationPerformanceMonitor(options.performance);
    this.updateMode = options.updateMode ?? "staged";
    this.metadata = deepClone(options.metadata ?? {});
    this.debug = options.debug ?? false;

    this.world = this.buildInitialWorld(this.seed, this.parameters, this.rng, this.initialization, this.scenario);
    template.registerSystems(this.registry);
    template.registerMetrics(this.metrics);
  }

  // Failure contract:
  // - step() and applyCommands() mutate the live world. If either throws once mutation may have
  //   begun, the run is failed: pending commands are discarded, playback stops, and step, runSteps,
  //   applyCommands, play, and snapshot export are refused. The partial world stays readable for
  //   inspection and is never rolled back. Events due in the failed tick stay consumed, RNG draws
  //   stay drawn, and no metric record exists for the failed tick.
  // - A batch passed to applyCommands is validated as a whole before any command is applied; a
  //   batch rejected at that stage changes nothing and leaves the run usable.
  // - reset(), restoreSnapshot(), and importScenario() build and validate the replacement run before
  //   committing it, so they either fully replace the run (clearing any failure) or change nothing.
  get failure(): SimulationFailure | undefined {
    return this.failureState;
  }

  assertOperational(attempted: string): void {
    if (this.failureState) {
      throw new SimulationEngineFailedError(attempted, this.failureState);
    }
  }

  step(): void {
    this.assertOperational("step");
    const stepStarted = this.performanceMonitor.mark();
    let schedulerMs: number;
    let metricsMs: number;
    try {
      this.clock.advanceOne();
      this.world.tick = this.clock.tick;
      this.world.time = this.clock.time;
      this.runtime.resetStep();
      this.runtime.setDueEvents(this.world.eventQueue.popDue(this.world.tick));

      const schedulerStarted = this.performanceMonitor.mark();
      this.scheduler.runTick(this.world, this.registry, {
        updateMode: this.updateMode,
        debug: this.debug,
        commandBuffer: this.commandBuffer,
        runtime: this.runtime,
        createContext: (system) => this.createSystemContext(system)
      });
      schedulerMs = this.performanceMonitor.elapsedSince(schedulerStarted);
      assertWorldInvariants(this.world);
      this.template.validateWorld?.(this.world.view());

      // Collected only after the tick has passed validation, so history never records a failed tick.
      const metricsStarted = this.performanceMonitor.mark();
      this.metrics.collect(this.world);
      metricsMs = this.performanceMonitor.elapsedSince(metricsStarted);
    } catch (error) {
      this.fail("step", error);
      throw error;
    }
    const stepMs = this.performanceMonitor.elapsedSince(stepStarted);
    this.performanceMonitor.recordDuration("ortus.sim.step", stepMs);
    this.performanceMonitor.recordTick({
      tick: this.world.tick,
      time: this.world.time,
      stepMs,
      schedulerMs,
      metricsMs,
      entityCount: this.performanceMonitor.enabled ? this.world.entityStore.aliveCount() : 0
    });
  }

  runSteps(steps: number): void {
    this.assertOperational("run steps");
    if (!Number.isInteger(steps) || steps < 0) {
      throw new SimulationValidationError("runSteps requires a nonnegative integer");
    }
    for (let index = 0; index < steps; index += 1) {
      this.step();
    }
  }

  reset(): void {
    const rng = new RandomService(this.seed);
    const world = this.buildInitialWorld(this.seed, this.parameters, rng, this.initialization, this.scenario);
    this.clock.reset();
    this.metrics.reset();
    this.commitRun(world, rng);
  }

  pause(): void {
    this.clock.pause();
  }

  play(): void {
    this.assertOperational("resume playback");
    this.clock.play();
  }

  setSpeed(multiplier: number): void {
    this.clock.setSpeed(multiplier);
  }

  applyCommands(
    commands: readonly Command[],
    metadata: Pick<CommandMetadata, "sourceSystemId"> & Partial<Omit<CommandMetadata, "sourceSystemId" | "tick">> = {
      sourceSystemId: "external"
    }
  ): BufferedCommand[] {
    this.assertOperational("apply commands");
    try {
      for (const command of commands) {
        this.commandBuffer.add(command, {
          sourceSystemId: metadata.sourceSystemId,
          tick: this.world.tick,
          ...(metadata.reason !== undefined ? { reason: metadata.reason } : {})
        });
      }
    } catch (error) {
      // Nothing has been applied yet: reject the whole batch and leave nothing queued.
      this.commandBuffer.clear();
      throw error;
    }
    try {
      const applied = this.commandBuffer.apply(this.world);
      assertWorldInvariants(this.world);
      this.template.validateWorld?.(this.world.view());
      // The buffer's history retains these entries; callers get their own copies.
      return applied.map((entry) => deepClone(entry));
    } catch (error) {
      this.fail("applyCommands", error);
      throw error;
    }
  }

  createSnapshot(): SimulationSnapshotView {
    const started = this.performanceMonitor.mark();
    const snapshot = createSnapshotView(this.template, this.world, this.metrics);
    const snapshotMs = this.performanceMonitor.elapsedSince(started);
    this.performanceMonitor.recordDuration("ortus.sim.snapshot", snapshotMs);
    this.performanceMonitor.recordSnapshot({
      tick: snapshot.tick,
      snapshotMs,
      entityCount: snapshot.entities.filter((entity) => entity.alive).length,
      metricsHistoryLength: snapshot.metricsHistory.length
    });
    return snapshot;
  }

  enablePerformanceInstrumentation(options: PerformanceInstrumentationOptions = {}): void {
    this.performanceMonitor.enable(options);
  }

  disablePerformanceInstrumentation(): void {
    this.performanceMonitor.disable();
  }

  isPerformanceInstrumentationEnabled(): boolean {
    return this.performanceMonitor.enabled;
  }

  performanceData(): SimulationPerformanceSnapshot {
    return this.performanceMonitor.snapshot();
  }

  recordFramePerformance(sample: { steps: number; updateMs: number; frameIntervalMs?: number }): void {
    this.performanceMonitor.recordFrame({
      tick: this.world.tick,
      steps: sample.steps,
      updateMs: sample.updateMs,
      ...(sample.frameIntervalMs !== undefined ? { frameIntervalMs: sample.frameIntervalMs } : {})
    });
  }

  exportScenario(): string {
    return serializeScenario(createScenarioExport(this.template, this.parameters, this.seed, this.metadata));
  }

  importScenario(json: string | unknown): void {
    const scenario = deserializeScenario(json);
    if (scenario.templateId !== this.template.id) {
      throw new SimulationSerializationError(`Scenario template ${scenario.templateId} does not match engine template ${this.template.id}`);
    }
    const parameters = resolveParameters(this.template.parameterDefinitions, scenario.parameters);
    this.template.validateParameters?.(parameters);
    const rng = new RandomService(scenario.seed);
    const world = this.buildInitialWorld(scenario.seed, parameters, rng);
    this.seed = scenario.seed;
    this.metadata = deepClone(scenario.metadata);
    this.parameters = parameters;
    this.initialization = undefined;
    this.scenario = undefined;
    this.clock.reset();
    this.metrics.reset();
    this.commitRun(world, rng);
  }

  exportSnapshot(): string {
    return serializeSnapshot(this.snapshotExport());
  }

  snapshotExport(): SnapshotExport {
    this.assertOperational("export a snapshot");
    return createSnapshotExport(this.template, this.parameters, this.seed, this.metadata, this.world, this.rng, this.metrics);
  }

  importSnapshot(json: string | unknown): void {
    const snapshot = deserializeSnapshot(json);
    this.restoreSnapshot(snapshot);
  }

  restoreSnapshot(snapshot: SnapshotExport): void {
    if (snapshot.templateId !== this.template.id) {
      throw new SimulationSerializationError(`Snapshot template ${snapshot.templateId} does not match engine template ${this.template.id}`);
    }
    if (snapshot.tick !== snapshot.world.tick || snapshot.time !== snapshot.world.time) {
      throw new SimulationSerializationError("Snapshot clock fields must match nested world clock fields");
    }
    if (snapshot.rng.seed !== snapshot.seed) {
      throw new SimulationSerializationError("Snapshot RNG seed must match snapshot seed");
    }
    const parameters = resolveParameters(this.template.parameterDefinitions, snapshot.parameters);
    this.template.validateParameters?.(parameters);
    const world = World.fromSnapshot(snapshot.world);
    normalizeSimulationEventLogInWorld(world);
    assertWorldInvariants(world);
    this.template.validateWorld?.(world.view());
    const rng = new RandomService(snapshot.seed);
    rng.setState(snapshot.rng);
    // clock.restore validates before assigning, so it is the first mutation.
    this.clock.restore(snapshot.tick, snapshot.time);
    this.seed = snapshot.seed;
    this.metadata = deepClone(snapshot.metadata);
    this.parameters = parameters;
    this.initialization = undefined;
    this.scenario = undefined;
    this.metrics.restore(snapshot.metricsHistory);
    this.commitRun(world, rng);
  }

  debugData(): EngineDebugData {
    return {
      tick: this.world.tick,
      time: this.world.time,
      seed: this.seed,
      templateId: this.template.id,
      systemExecutionLog: this.runtime.systemExecutionLog.map((entry) => ({ ...entry })),
      lastEvents: this.runtime.lastEvents.map((event) => deepClone(event)),
      lastCommands: this.runtime.lastCommands.map((command) => deepClone(command))
    };
  }

  static fromScenario(template: SimulationTemplate, json: string | unknown, options: Omit<SimulationEngineOptions, "parameters" | "seed"> = {}): SimulationEngine {
    const scenario: ScenarioExport = deserializeScenario(json);
    return new SimulationEngine(template, {
      ...options,
      seed: scenario.seed,
      parameters: scenario.parameters,
      metadata: scenario.metadata
    });
  }

  static fromSnapshot(template: SimulationTemplate, json: string | unknown, options: Omit<SimulationEngineOptions, "parameters" | "seed"> = {}): SimulationEngine {
    const snapshot = deserializeSnapshot(json);
    const engine = new SimulationEngine(template, {
      ...options,
      seed: snapshot.seed,
      parameters: snapshot.parameters,
      metadata: snapshot.metadata
    });
    engine.restoreSnapshot(snapshot);
    return engine;
  }

  private buildInitialWorld(
    seed: string,
    parameters: ParameterValues,
    rng: RandomService,
    initialization?: NonNullable<SimulationEngineOptions["initialization"]>,
    scenario?: ScenarioVariantConfig
  ): World {
    const world = this.template.createInitialWorld({
      seed,
      params: parameters,
      ...(initialization ? { initialization } : {}),
      ...(scenario ? { scenario } : {}),
      rng,
      fixedDt: this.clock.fixedDt
    });
    assertWorldInvariants(world);
    this.template.validateWorld?.(world.view());
    normalizeSimulationEventLogInWorld(world);
    appendSimulationEventLogToWorld(world, {
      type: "run.initialized",
      source: "engine",
      label: `${this.template.name} initialized`,
      category: "run",
      severity: "info",
      payload: {
        templateId: this.template.id,
        seed
      }
    });
    return world;
  }

  // Final, non-throwing step of reset/restore/import: install an already-validated run.
  private commitRun(world: World, rng: RandomService): void {
    this.world = world;
    this.rng = rng;
    this.commandBuffer.clear();
    this.runtime.resetAll();
    this.failureState = undefined;
  }

  private fail(operation: SimulationFailure["operation"], error: unknown): void {
    this.failureState = { operation, tick: this.world.tick, error };
    this.commandBuffer.clear();
    this.clock.pause();
  }

  private createSystemContext(system: System): SystemContext {
    const worldView = this.world.view();
    const commands = new SystemCommandSink(this.commandBuffer, {
      sourceSystemId: system.id,
      tick: this.world.tick
    });
    const events: EventAccess = {
      due: (type?: string) => this.runtime.due(type)
    };
    const spaces: SpaceAccess = {
      get: (spaceId) => worldView.getSpace(spaceId),
      continuous2D: (spaceId) => worldView.continuous2D(spaceId),
      grid2D: (spaceId) => worldView.grid2D(spaceId),
      network: (spaceId) => worldView.network(spaceId),
      all: () => worldView.spaces()
    };
    const metrics: MetricsAccess = {
      history: () => this.metrics.historyRecords()
    };
    const entityIds = system.query ? worldView.entitiesWith(system.query) : undefined;

    return {
      world: worldView,
      commands,
      events,
      rng: this.rng,
      params: this.parameters,
      dt: this.clock.fixedDt,
      tick: this.world.tick,
      query: {
        entitiesWith: (componentTypes) => worldView.entitiesWith(componentTypes)
      },
      spaces,
      metrics,
      performance: {
        recordCounter: (counterId, value) => this.performanceMonitor.recordCounter(counterId, value),
        mark: () => this.performanceMonitor.mark(),
        elapsedSince: (mark) => this.performanceMonitor.elapsedSince(mark),
        recordDuration: (name, durationMs) => this.performanceMonitor.recordDuration(name, durationMs)
      },
      ...(entityIds ? { entityIds } : {})
    };
  }
}
