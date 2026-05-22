import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  applyFeedbackClamp,
  applyEventResult,
  assumptionProfileArtifactType,
  classifyLoop,
  computeFeedbackAdjustment,
  computeFeedbackEventMetrics,
  createDefaultRunConfig,
  createDefaultScenario,
  delayQueueArtifactType,
  deserializeDelayQueue,
  deserializeEventSchedule,
  deserializeFeedbackEventMetrics,
  deserializeFeedbackLoops,
  eventScheduleArtifactType,
  feedbackEventMetricsArtifactType,
  feedbackLoopsArtifactType,
  getEnabledLoopAdjustments,
  getDelayItemsForReleaseTick,
  getEnabledFeedbackLoops,
  getFeedbackLoop,
  getFeedbackLoopsByType,
  getFutureEvents,
  getScheduledEventsForTick,
  hasFeedbackLoop,
  hasScheduledEvent,
  maxDelayQueueItemCount,
  maxFeedbackPayloadJsonLength,
  networkDefinitionArtifactType,
  networkMetricsArtifactType,
  peekDelayItems,
  releaseDelayItemsForTick,
  releaseEventsForTick,
  resourceMetricsArtifactType,
  resourceSystemArtifactType,
  scheduleDelay,
  scheduleEvent,
  serializeDelayQueue,
  serializeEventSchedule,
  serializeFeedbackEventMetrics,
  serializeFeedbackLoops,
  sortScheduledEvents,
  uncertaintyConfigArtifactType,
  uncertaintyResultArtifactType,
  validateDelayDefinition,
  validateDelayQueue,
  validateDelayQueueItem,
  validateEventDefinition,
  validateFeedbackEventSystemState,
  validateFeedbackLoopDefinition,
  validateFeedbackSignal,
  validateRunConfig,
  validateScenario,
  validateScheduledEvent,
  validateUncertaintyConfig,
  type DelayDefinition,
  type DelayQueueArtifact,
  type DelayQueueItem,
  type EventScheduleArtifact,
  type FeedbackLoopsArtifact,
  type FeedbackLoopDefinition,
  type ScheduledEvent
} from "../index";
import { productionTemplates } from "../templates/registry";

function event(overrides: Partial<ScheduledEvent> = {}): ScheduledEvent {
  return {
    id: "event-a",
    tick: 4,
    priority: 0,
    eventType: "policy.note",
    payload: { message: "plain metadata only" },
    ...overrides
  };
}

function delayDefinition(overrides: Partial<DelayDefinition> = {}): DelayDefinition {
  return {
    id: "delay-a",
    label: "Delay A",
    delayType: "release",
    delayTicks: 3,
    targetType: "system",
    ...overrides
  };
}

function loop(overrides: Partial<FeedbackLoopDefinition> = {}): FeedbackLoopDefinition {
  return {
    id: "loop-a",
    label: "Loop A",
    loopType: "reinforcing",
    signalSource: "caller.metric",
    target: "parameter.rate",
    gain: 2,
    enabled: true,
    ...overrides
  };
}

describe("feedback, delay, and event primitives", () => {
  it("validates scheduled events, delay definitions, and feedback loops with bounded plain JSON", () => {
    expect(validateEventDefinition({ id: "definition-a", label: "Definition A", eventType: "shock" })).toMatchObject({ id: "definition-a" });
    expect(() => validateEventDefinition({ id: "definition-a", label: "Definition A", eventType: "shock", payload: { huge: "x".repeat(maxFeedbackPayloadJsonLength + 1) } })).toThrow(/payload/);
    expect(() => validateEventDefinition({ id: "definition-a", label: "Definition A", eventType: "shock", metadata: { huge: "x".repeat(maxFeedbackPayloadJsonLength + 1) } })).toThrow(/metadata/);
    expect(validateScheduledEvent(event())).toMatchObject({ id: "event-a", priority: 0 });
    expect(() => validateScheduledEvent(event({ tick: -1 }))).toThrow(/Invalid scheduled event/);
    expect(() => validateScheduledEvent(event({ priority: 2_000 }))).toThrow(/Invalid scheduled event/);
    expect(() => validateScheduledEvent(event({ payload: { huge: "x".repeat(maxFeedbackPayloadJsonLength + 1) } }))).toThrow(/payload/);
    expect(() => validateScheduledEvent(event({ payload: { world: {} } }))).toThrow(/live run state/);
    expect(() => validateScheduledEvent(event({ payload: { fn: (() => "bad") as unknown as never } }))).toThrow(/plain JSON/);
    expect(() => validateScheduledEvent({ ...event(), extra: true })).toThrow(/Invalid scheduled event/);

    expect(validateDelayDefinition(delayDefinition())).toMatchObject({ id: "delay-a" });
    expect(() => validateDelayDefinition(delayDefinition({ delayTicks: -1 }))).toThrow(/Invalid delay definition/);
    expect(() => validateDelayDefinition(delayDefinition({ delayTicks: 100_001 }))).toThrow(/Invalid delay definition/);
    expect(validateDelayQueueItem({ id: "item-a", scheduledAtTick: 2, releaseTick: 3, payload: { ok: true } })).toMatchObject({ id: "item-a" });
    expect(() => validateDelayQueueItem({ id: "bad-release", scheduledAtTick: 3, releaseTick: 2, payload: { ok: true } })).toThrow(/releaseTick/);
    expect(() => validateDelayQueueItem({ id: "bad-tick", scheduledAtTick: Number.NaN, releaseTick: 2, payload: { ok: true } })).toThrow(/non-finite|Invalid delay queue item/);

    expect(validateFeedbackLoopDefinition(loop())).toMatchObject({ id: "loop-a", enabled: true });
    expect(validateFeedbackLoopDefinition(loop({ delayTicks: 2 }))).toMatchObject({ delayTicks: 2 });
    expect(() => validateFeedbackLoopDefinition(loop({ delayTicks: -1 }))).toThrow(/Invalid feedback loop/);
    expect(() => validateFeedbackLoopDefinition(loop({ loopType: "causal" as never }))).toThrow(/Invalid feedback loop/);
    expect(() => validateFeedbackLoopDefinition(loop({ gain: Number.NaN }))).toThrow(/Invalid feedback loop|non-finite/);
    expect(() => validateFeedbackLoopDefinition(loop({ clamp: { min: 2, max: 1 } }))).toThrow(/clamp/);
    expect(() => validateFeedbackLoopDefinition(loop({ enabled: "yes" as never }))).toThrow(/Invalid feedback loop/);
    expect(() => validateFeedbackLoopDefinition(loop({ signalSource: "" }))).toThrow(/Invalid feedback loop/);
    expect(() => validateFeedbackLoopDefinition(loop({ target: "" }))).toThrow(/Invalid feedback loop/);
    expect(() => validateFeedbackLoopDefinition({ ...loop(), extra: true })).toThrow(/Invalid feedback loop/);
    expect(validateFeedbackSignal({ loopId: "loop-a", tick: 1, value: 0.25, source: "caller.metric" })).toMatchObject({ loopId: "loop-a" });
    expect(() => validateFeedbackSignal({ loopId: "loop-a", tick: 1, value: Number.POSITIVE_INFINITY, source: "caller.metric" })).toThrow(
      /non-finite|Invalid feedback signal/
    );

    const oversizedQueue = Array.from({ length: maxDelayQueueItemCount + 1 }, (_, index): DelayQueueItem => ({
      id: `delay-${index}`,
      scheduledAtTick: 0,
      releaseTick: 1,
      payload: { index }
    }));
    expect(() => validateDelayQueue(oversizedQueue)).toThrow(/Delay queue/);
    expect(() => validateDelayQueue([{ id: "dup", scheduledAtTick: 0, releaseTick: 1, payload: true }, { id: "dup", scheduledAtTick: 0, releaseTick: 2, payload: true }])).toThrow(/Duplicate/);
    expect(validateFeedbackEventSystemState({ scheduledEvents: [event()], delayQueue: [], feedbackLoops: [loop()], metadata: {} })).toMatchObject({
      scheduledEvents: [{ id: "event-a" }]
    });
    expect(() =>
      validateFeedbackEventSystemState({ scheduledEvents: [event()], delayQueue: [], feedbackLoops: [loop()], metadata: { activeEngine: {} } })
    ).toThrow(/live run state/);
  });

  it("schedules and releases events deterministically without mutating the input queue", () => {
    const queue: ScheduledEvent[] = [event({ id: "later", tick: 8, priority: 0 }), event({ id: "overdue", tick: 2, priority: 0 })];
    const before = JSON.stringify(queue);
    const next = scheduleEvent(queue, event({ id: "earlier", tick: 4, priority: -1 }));
    expect(JSON.stringify(queue)).toBe(before);
    expect(next.map((item) => item.id)).toEqual(["overdue", "earlier", "later"]);

    const sameTick = sortScheduledEvents([
      event({ id: "b", tick: 3, priority: 1 }),
      event({ id: "a", tick: 3, priority: 1 }),
      event({ id: "c", tick: 3, priority: -1 })
    ]);
    expect(sameTick.map((item) => item.id)).toEqual(["c", "a", "b"]);

    const released = releaseEventsForTick(next, 4);
    expect(released.released.map((item) => item.id)).toEqual(["overdue", "earlier"]);
    expect(released.queue.map((item) => item.id)).toEqual(["later"]);
    expect(released.results[1]).toMatchObject({ eventId: "earlier", tick: 4, applied: true });
    expect(releaseEventsForTick([], 4)).toEqual({ queue: [], released: [], results: [] });
    expect(applyEventResult(event({ payload: { nested: true } }), false, "caller rejected").payloadSummary).toContain("nested");
    expect(applyEventResult(event({ payload: { huge: "x".repeat(300) } }), false).payloadSummary?.length).toBeLessThanOrEqual(120);
    expect(() => applyEventResult(event(), false, undefined, ["x".repeat(300)])).toThrow(/Invalid event application result/);
    expect(() => releaseEventsForTick(next, Number.NaN)).toThrow(/Release tick/);
  });

  it("schedules, peeks, and releases delay queue items deterministically", () => {
    const definition = delayDefinition({ id: "shipment", delayTicks: 2 });
    const queue: DelayQueueItem[] = [];
    const next = scheduleDelay(queue, definition, { units: 4 }, 5, { targetId: "warehouse" });
    expect(queue).toEqual([]);
    expect(next[0]).toMatchObject({ delayDefinitionId: "shipment", scheduledAtTick: 5, releaseTick: 7, targetId: "warehouse" });
    expect(getDelayItemsForReleaseTick(next, 7)).toHaveLength(1);
    expect(peekDelayItems(next, 7)).toHaveLength(1);
    expect(peekDelayItems(next, 7)).toEqual(next);

    const zeroDelay = scheduleDelay([], delayDefinition({ id: "zero", delayTicks: 0 }), { done: true }, 3);
    expect(releaseDelayItemsForTick(zeroDelay, 3).released).toHaveLength(1);

    const duplicatePayload = scheduleDelay(next, definition, { units: 4 }, 5);
    expect(new Set(duplicatePayload.map((item) => item.id)).size).toBe(2);
    const released = releaseDelayItemsForTick(duplicatePayload, 7);
    expect(released.released.map((item) => item.id)).toEqual([...released.released].sort((a, b) => a.id.localeCompare(b.id)).map((item) => item.id));
    expect(released.queue).toHaveLength(0);
    expect(releaseDelayItemsForTick(scheduleDelay([], definition, { overdue: true }, 1), 10).released).toHaveLength(1);
    expect(() => scheduleDelay([], definition, { bad: true }, Number.NaN)).toThrow(/Delay scheduling ticks/);
    expect(() => scheduleDelay([], definition, { huge: "x".repeat(maxFeedbackPayloadJsonLength + 1) }, 1)).toThrow(/Delay payload/);
    expect(() => releaseDelayItemsForTick(next, Number.NaN)).toThrow(/Delay release tick/);
  });

  it("classifies loops and computes clamped deterministic adjustments without mutating loop definitions", () => {
    const source = loop({ clamp: { min: -3, max: 3 } });
    const before = JSON.stringify(source);
    expect(classifyLoop(source)).toBe("reinforcing");
    expect(applyFeedbackClamp(source, 10)).toBe(3);
    const result = computeFeedbackAdjustment(source, 2, 6);
    expect(result).toMatchObject({ loopId: "loop-a", tick: 6, signalValue: 2, requestedAdjustment: 4, appliedAdjustment: 3 });
    expect(result.warnings).toEqual(["feedback adjustment clamped"]);
    expect(JSON.stringify(source)).toBe(before);

    const disabled = computeFeedbackAdjustment(loop({ enabled: false }), 100, 7);
    expect(disabled).toMatchObject({ requestedAdjustment: 0, appliedAdjustment: 0 });
    expect(disabled.warnings).toEqual(["feedback loop disabled"]);
    expect(() => computeFeedbackAdjustment(source, Number.POSITIVE_INFINITY)).toThrow(/finite/);
    expect(() => computeFeedbackAdjustment(source, 1, Number.NaN)).toThrow(/tick/);
    expect(getEnabledLoopAdjustments([source, loop({ id: "disabled", enabled: false })], { "loop-a": 2, disabled: 99 }, 8)).toHaveLength(1);
  });

  it("computes finite event, delay, and feedback metrics", () => {
    const scheduledEvents = [event({ id: "future", tick: 5, eventType: "future" })];
    const releasedEvents = [event({ id: "past", tick: 2, eventType: "past" })];
    const delayQueue = scheduleDelay([], delayDefinition({ id: "queued", delayTicks: 4 }), { queued: true }, 1);
    const releasedDelayItems = scheduleDelay([], delayDefinition({ id: "released", delayTicks: 2 }), { released: true }, 1);
    const feedbackLoops = [loop({ id: "reinforcing", loopType: "reinforcing" }), loop({ id: "balancing", loopType: "balancing" }), loop({ id: "unknown", loopType: "unknown", enabled: false })];
    const feedbackLedger = [computeFeedbackAdjustment(loop({ id: "clamped", clamp: { min: -1, max: 1 } }), 2, 10)];

    const metrics = computeFeedbackEventMetrics({
      scheduledEvents,
      releasedEvents,
      delayQueue,
      releasedDelayItems,
      feedbackLoops,
      eventLedger: [applyEventResult(releasedEvents[0]!, true)],
      feedbackLedger
    });
    expect(metrics.artifactType).toBe(feedbackEventMetricsArtifactType);
    expect(metrics.metrics).toMatchObject({
      scheduledEventCount: 1,
      releasedEventCount: 1,
      delayQueueSize: 1,
      releasedDelayItemCount: 1,
      feedbackLoopCount: 3,
      enabledFeedbackLoopCount: 2,
      reinforcingLoopCount: 1,
      balancingLoopCount: 1,
      unknownLoopCount: 1,
      averageDelayTicks: 3,
      maxDelayTicks: 4,
      eventLedgerCount: 1,
      feedbackLedgerCount: 1,
      clampedFeedbackCount: 1
    });
    expect(metrics.metrics.eventsByType).toEqual({ future: 1, past: 1 });
    expect(metrics.metrics.delaysByType).toEqual({ queued: 1, released: 1 });
    expect(metrics.metrics.feedbackAdjustmentsByTarget).toEqual({ "parameter.rate": 1 });
    const numericMetrics = Object.values(metrics.metrics).flatMap((value) => (typeof value === "number" ? [value] : []));
    expect(numericMetrics.every(Number.isFinite)).toBe(true);
  });

  it("queries events, delays, and loops without mutating inputs", () => {
    const events = [event({ id: "now", tick: 2 }), event({ id: "future", tick: 5 })];
    const loops = [loop({ id: "a", loopType: "reinforcing" }), loop({ id: "b", loopType: "balancing", enabled: false })];
    const delayQueue = scheduleDelay([], delayDefinition({ id: "release", delayTicks: 2 }), { ok: true }, 3);
    const before = JSON.stringify({ events, loops, delayQueue });

    expect(getScheduledEventsForTick(events, 2).map((item) => item.id)).toEqual(["now"]);
    expect(getFutureEvents(events, 2).map((item) => item.id)).toEqual(["future"]);
    expect(getDelayItemsForReleaseTick(delayQueue, 5)).toHaveLength(1);
    expect(getFeedbackLoop(loops, "a").loopType).toBe("reinforcing");
    expect(getEnabledFeedbackLoops(loops).map((item) => item.id)).toEqual(["a"]);
    expect(getFeedbackLoopsByType(loops, "balancing").map((item) => item.id)).toEqual(["b"]);
    expect(hasScheduledEvent(events, "now")).toBe(true);
    expect(hasFeedbackLoop(loops, "missing")).toBe(false);
    expect(() => getFeedbackLoop(loops, "missing")).toThrow(/Unknown feedback loop/);
    expect(getScheduledEventsForTick([], 1)).toEqual([]);
    expect(getDelayItemsForReleaseTick([], 1)).toEqual([]);
    expect(() => getScheduledEventsForTick(events, Number.NaN)).toThrow(/query tick/);
    expect(() => getDelayItemsForReleaseTick(delayQueue, Number.NaN)).toThrow(/query tick/);
    expect(JSON.stringify({ events, loops, delayQueue })).toBe(before);
  });

  it("serializes feedback artifacts distinctly and rejects other artifact families", () => {
    const eventArtifact: EventScheduleArtifact = {
      schemaVersion: "1",
      artifactType: eventScheduleArtifactType,
      scheduledEvents: [event()],
      metadata: {}
    };
    const delayArtifact: DelayQueueArtifact = {
      schemaVersion: "1",
      artifactType: delayQueueArtifactType,
      delayQueue: scheduleDelay([], delayDefinition(), { ok: true }, 1)
    };
    const loopsArtifact: FeedbackLoopsArtifact = { schemaVersion: "1", artifactType: feedbackLoopsArtifactType, feedbackLoops: [loop()] };
    const metricsArtifact = computeFeedbackEventMetrics({ scheduledEvents: [event()], feedbackLoops: [loop()] });

    expect(deserializeEventSchedule(serializeEventSchedule(eventArtifact))).toEqual({
      ...eventArtifact,
      scheduledEvents: [{ ...event(), metadata: {} }],
      eventLedger: []
    });
    expect(deserializeDelayQueue(serializeDelayQueue(delayArtifact))).toEqual({ ...delayArtifact, metadata: {} });
    expect(deserializeFeedbackLoops(serializeFeedbackLoops(loopsArtifact))).toEqual({
      ...loopsArtifact,
      feedbackLoops: [{ ...loop(), metadata: {} }],
      feedbackLedger: [],
      metadata: {}
    });
    expect(deserializeFeedbackEventMetrics(serializeFeedbackEventMetrics(metricsArtifact))).toEqual(metricsArtifact);

    const rejectedArtifactTypes = [
      "ortus.scenario",
      "ortus.snapshot",
      uncertaintyConfigArtifactType,
      uncertaintyResultArtifactType,
      assumptionProfileArtifactType,
      networkDefinitionArtifactType,
      networkMetricsArtifactType,
      resourceSystemArtifactType,
      resourceMetricsArtifactType,
      "ortus.unknown",
      "ortus.runSummary"
    ];
    for (const artifactType of rejectedArtifactTypes) {
      const payload = JSON.stringify({ schemaVersion: "1", artifactType });
      expect(() => deserializeEventSchedule(payload)).toThrow(/artifact type/);
      expect(() => deserializeDelayQueue(payload)).toThrow(/artifact type/);
      expect(() => deserializeFeedbackLoops(payload)).toThrow(/artifact type/);
    }
    expect(() => deserializeEventSchedule(JSON.stringify({ ...eventArtifact, metadata: { runSummary: {} } }))).toThrow(/live run state/);
    expect(() => deserializeDelayQueue(JSON.stringify({ ...delayArtifact, delayQueue: [{ ...delayArtifact.delayQueue[0]!, releaseTick: 0 }] }))).toThrow(
      /releaseTick/
    );
    expect(() => deserializeFeedbackLoops(JSON.stringify({ ...loopsArtifact, feedbackLoops: [{ ...loop(), clamp: { min: 2, max: 1 } }] }))).toThrow(
      /clamp/
    );
    expect(() => deserializeFeedbackEventMetrics(JSON.stringify({ ...metricsArtifact, metrics: { ...metricsArtifact.metrics, extra: 1 } }))).toThrow(
      /Invalid feedback\/event metric/
    );
    expect(() =>
      deserializeFeedbackEventMetrics(JSON.stringify({ ...metricsArtifact, metrics: { ...metricsArtifact.metrics, eventsByType: { future: {} } } }))
    ).toThrow(/finite|metric map/);
    expect(() => deserializeFeedbackEventMetrics(JSON.stringify({ ...metricsArtifact, warnings: [{ bad: true }] }))).toThrow(/warning/);
  });

  it("keeps feedback capabilities explicit and unsupported by current templates", () => {
    for (const template of productionTemplates) {
      expect(template.capabilities?.supportsEvents).toBe(false);
      expect(template.capabilities?.supportsDelays).toBe(false);
      expect(template.capabilities?.supportsFeedbackLoops).toBe(false);
      expect(template.capabilities?.supportsFeedbackMetrics).toBe(false);

      const runConfig = createDefaultRunConfig({ template, seed: `feedback-capabilities-${template.id}` });
      expect(() => validateRunConfig({ ...runConfig, eventScheduleOptions: { enabled: true } } as never, template)).toThrow(
        /Unsupported RunConfig field/
      );
      expect(() => validateRunConfig({ ...runConfig, delayOptions: { enabled: true } } as never, template)).toThrow(/Unsupported RunConfig field/);
      expect(() => validateRunConfig({ ...runConfig, feedbackLoopOptions: { enabled: true } } as never, template)).toThrow(
        /Unsupported RunConfig field/
      );

      const scenario = createDefaultScenario({ template, now: "2026-01-01T00:00:00.000Z" });
      expect(() => validateScenario({ ...scenario, eventScheduleOptions: { enabled: true } } as never, template)).toThrow(/Invalid scenario/);
      expect(() => validateScenario({ ...scenario, delayOptions: { enabled: true } } as never, template)).toThrow(/Invalid scenario/);
      expect(() => validateScenario({ ...scenario, feedbackLoopOptions: { enabled: true } } as never, template)).toThrow(/Invalid scenario/);
    }
  });

  it("does not allow uncertainty targets for feedback, delay, or event fields", () => {
    const template = productionTemplates[0]!;
    const base = createDefaultRunConfig({ template, seed: "feedback-uncertainty-base" });
    const config = {
      schemaVersion: "1",
      artifactType: uncertaintyConfigArtifactType,
      baseSeed: "sampler",
      samplingMethod: "randomMonteCarlo",
      sampleCount: 1,
      variables: [
        {
          id: "feedback-target",
          label: "Feedback target",
          target: "feedback",
          targetPath: "feedbackLoops.loop-a.gain",
          distribution: { type: "fixed", value: 1 },
          enabled: true
        }
      ],
      outputMetrics: [template.metricDefinitions![0]!.key]
    };
    expect(() => validateUncertaintyConfig(config as never, base)).toThrow(/Invalid uncertainty config/);
    for (const target of ["event", "delay"] as const) {
      expect(() =>
        validateUncertaintyConfig(
          {
            ...config,
            variables: [
              {
                ...config.variables[0],
                id: `${target}-target`,
                label: `${target} target`,
                target,
                targetPath: `${target}.timing`
              }
            ]
          } as never,
          base
        )
      ).toThrow(/Invalid uncertainty config/);
    }
  });

  it("keeps feedback services free of UI imports, randomness, dynamic execution, and arbitrary expression parsers", () => {
    const files = feedbackFiles(join(process.cwd(), "src", "simulation", "feedback"));
    const banned = [
      /from\s+["']react["']/,
      /from\s+["']zustand["']/,
      /\bdocument\./,
      /\bwindow\./,
      /\blocalStorage\b/,
      /\bnavigator\./,
      /\bCanvasRenderingContext2D\b/,
      /\bHTMLCanvasElement\b/,
      /\bMath\.random\b/,
      /\beval\s*\(/,
      /\bnew\s+Function\b/,
      /\bexpression parser\b/i,
      /from\s+["'][^"']*\.\.\/resources/,
      /from\s+["'][^"']*\.\.\/networks/,
      /from\s+["'][^"']*\.\.\/uncertainty/,
      /from\s+["'][^"']*\.\.\/assumptions/,
      /from\s+["'][^"']*\.\.\/scenarios/,
      /from\s+["'][^"']*\.\.\/templates/,
      /from\s+["'][^"']*\.\.\/runs/
    ];
    const offenders = files.filter((file) => banned.some((pattern) => pattern.test(readFileSync(file, "utf8"))));
    expect(offenders).toEqual([]);
  });
});

function feedbackFiles(root: string): string[] {
  return readdirSync(root).flatMap((entry) => {
    const path = join(root, entry);
    return path.endsWith(".ts") ? [path] : [];
  });
}
