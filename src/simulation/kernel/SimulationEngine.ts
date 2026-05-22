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
import { RandomService } from "./Random";
import { Scheduler } from "./Scheduler";
import { SimulationRuntime } from "./SimulationRuntime";
import { SystemRegistry } from "./SystemRegistry";
import { World } from "./World";
import { SimulationSerializationError, SimulationValidationError } from "./Errors";
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
    this.updateMode = options.updateMode ?? "staged";
    this.metadata = deepClone(options.metadata ?? {});
    this.debug = options.debug ?? false;

    this.world = template.createInitialWorld({
      seed: this.seed,
      params: this.parameters,
      ...(this.initialization ? { initialization: this.initialization } : {}),
      ...(this.scenario ? { scenario: this.scenario } : {}),
      rng: this.rng,
      fixedDt: this.clock.fixedDt
    });
    template.registerSystems(this.registry);
    template.registerMetrics(this.metrics);
    assertWorldInvariants(this.world);
    template.validateWorld?.(this.world.view());
    normalizeSimulationEventLogInWorld(this.world);
    appendSimulationEventLogToWorld(this.world, {
      type: "run.initialized",
      source: "engine",
      label: `${this.template.name} initialized`,
      category: "run",
      severity: "info",
      payload: {
        templateId: this.template.id,
        seed: this.seed
      }
    });
  }

  step(): void {
    this.clock.advanceOne();
    this.world.tick = this.clock.tick;
    this.world.time = this.clock.time;
    this.runtime.resetStep();
    this.runtime.setDueEvents(this.world.eventQueue.popDue(this.world.tick));

    this.scheduler.runTick(this.world, this.registry, {
      updateMode: this.updateMode,
      debug: this.debug,
      commandBuffer: this.commandBuffer,
      runtime: this.runtime,
      createContext: (system) => this.createSystemContext(system)
    });

    this.metrics.collect(this.world);
    assertWorldInvariants(this.world);
    this.template.validateWorld?.(this.world.view());
  }

  runSteps(steps: number): void {
    if (!Number.isInteger(steps) || steps < 0) {
      throw new SimulationValidationError("runSteps requires a nonnegative integer");
    }
    for (let index = 0; index < steps; index += 1) {
      this.step();
    }
  }

  reset(): void {
    this.clock.reset();
    this.rng.setState(new RandomService(this.seed).getState());
    this.metrics.reset();
    this.commandBuffer.clear();
    this.runtime.resetAll();
    this.world = this.template.createInitialWorld({
      seed: this.seed,
      params: this.parameters,
      ...(this.initialization ? { initialization: this.initialization } : {}),
      ...(this.scenario ? { scenario: this.scenario } : {}),
      rng: this.rng,
      fixedDt: this.clock.fixedDt
    });
    assertWorldInvariants(this.world);
    this.template.validateWorld?.(this.world.view());
    normalizeSimulationEventLogInWorld(this.world);
    appendSimulationEventLogToWorld(this.world, {
      type: "run.initialized",
      source: "engine",
      label: `${this.template.name} initialized`,
      category: "run",
      severity: "info",
      payload: {
        templateId: this.template.id,
        seed: this.seed
      }
    });
  }

  pause(): void {
    this.clock.pause();
  }

  play(): void {
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
    for (const command of commands) {
      this.commandBuffer.add(command, {
        sourceSystemId: metadata.sourceSystemId,
        tick: this.world.tick,
        ...(metadata.reason !== undefined ? { reason: metadata.reason } : {})
      });
    }
    const applied = this.commandBuffer.apply(this.world);
    assertWorldInvariants(this.world);
    this.template.validateWorld?.(this.world.view());
    return applied;
  }

  createSnapshot(): SimulationSnapshotView {
    return createSnapshotView(this.template, this.world, this.metrics);
  }

  exportScenario(): string {
    return serializeScenario(createScenarioExport(this.template, this.parameters, this.seed, this.metadata));
  }

  importScenario(json: string | unknown): void {
    const scenario = deserializeScenario(json);
    if (scenario.templateId !== this.template.id) {
      throw new SimulationSerializationError(`Scenario template ${scenario.templateId} does not match engine template ${this.template.id}`);
    }
    this.seed = scenario.seed;
    this.rng = new RandomService(this.seed);
    this.metadata = deepClone(scenario.metadata);
    this.parameters = resolveParameters(this.template.parameterDefinitions, scenario.parameters);
    this.template.validateParameters?.(this.parameters);
    this.initialization = undefined;
    this.scenario = undefined;
    this.reset();
  }

  exportSnapshot(): string {
    return serializeSnapshot(this.snapshotExport());
  }

  snapshotExport(): SnapshotExport {
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
    this.seed = snapshot.seed;
    this.rng = new RandomService(this.seed);
    this.metadata = deepClone(snapshot.metadata);
    this.parameters = resolveParameters(this.template.parameterDefinitions, snapshot.parameters);
    this.template.validateParameters?.(this.parameters);
    this.initialization = undefined;
    this.scenario = undefined;
    this.world = World.fromSnapshot(snapshot.world);
    normalizeSimulationEventLogInWorld(this.world);
    this.clock.restore(snapshot.tick, snapshot.time);
    this.rng.setState(snapshot.rng);
    this.metrics.restore(snapshot.metricsHistory);
    this.commandBuffer.clear();
    this.runtime.resetAll();
    assertWorldInvariants(this.world);
    this.template.validateWorld?.(this.world.view());
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
      ...(entityIds ? { entityIds } : {})
    };
  }
}
