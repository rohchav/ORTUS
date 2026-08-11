import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { ImmersiveFlockingRuntime } from "../../components/immersive/ImmersiveFlockingRuntime";
import {
  BoundedTrailBuffer,
  BoundedVisualEffectBuffer,
  AdaptiveRenderQualityController,
  ImmersiveRenderPerformanceMonitor,
  createFlockingWorldSceneAdapter,
  createImmersiveFlockingEngine,
  createImmersiveFlockingScenario,
  createSystemCamera,
  focusImmersiveCamera,
  immersiveFlockingInitializationPreset,
  immersiveFlockingScenarioId,
  immersiveFlockingSeed,
  immersivePrototypeHref,
  interpolateImmersiveCamera,
  panImmersiveCamera,
  parseImmersivePrototypeQuery,
  resolveImmersiveCamera,
  releaseImmersiveCameraFocus,
  zoomImmersiveCamera,
  type ImmersiveLensData,
  type ImmersiveInspectableState,
  type ImmersiveSceneEntity,
  type ImmersiveSelectionGeometry,
  type ReadOnlyWorldSceneAdapter
} from ".";

describe("I0 immersive Flocking foundation", () => {
  it("parses only the isolated concepts and bounded scene loads", () => {
    expect(parseImmersivePrototypeQuery({})).toEqual({
      ok: true,
      config: { concept: "living-diorama", agentCount: 100 }
    });
    expect(parseImmersivePrototypeQuery({ concept: "god-hand", agents: "500" })).toEqual({
      ok: true,
      config: { concept: "god-hand", agentCount: 500 }
    });
    expect(parseImmersivePrototypeQuery({ concept: "field-scientist", agents: "100" })).toEqual({
      ok: true,
      config: { concept: "field-scientist", agentCount: 100 }
    });
    expect(parseImmersivePrototypeQuery({ concept: "invented", agents: "100" }).ok).toBe(false);
    expect(parseImmersivePrototypeQuery({ concept: ["god-hand", "field-scientist"], agents: "100" }).ok).toBe(false);
    expect(parseImmersivePrototypeQuery({ concept: "god-hand", agents: "250" }).ok).toBe(false);
    expect(parseImmersivePrototypeQuery({ concept: "god-hand", agents: "100", template: "epidemic-spread" }).ok).toBe(false);
    expect(immersivePrototypeHref({ concept: "field-scientist", agentCount: 500 })).toBe(
      "/world/immersive-prototype?concept=field-scientist&agents=500"
    );
  });

  it("creates one fixed, validated, real Flocking scenario at both approved loads", () => {
    for (const agentCount of [100, 500] as const) {
      const scenario = createImmersiveFlockingScenario(agentCount);
      expect(scenario.scenarioId).toBe(immersiveFlockingScenarioId);
      expect(scenario.templateId).toBe("flocking-boids");
      expect(scenario.seed).toBe(immersiveFlockingSeed);
      expect(scenario.initializationPreset).toBe(immersiveFlockingInitializationPreset);
      expect(scenario.parameters.agentCount).toBe(agentCount);
      expect(scenario.metadata).toEqual({ milestone: "I0", prototypeOnly: true, persistence: "none" });

      const engine = createImmersiveFlockingEngine(agentCount);
      const snapshot = engine.createSnapshot();
      expect(snapshot.templateId).toBe("flocking-boids");
      expect(snapshot.tick).toBe(0);
      expect(snapshot.entities).toHaveLength(agentCount);
    }
    expect(() => createImmersiveFlockingScenario(250 as 100)).toThrow(/unsupported immersive Flocking agent count/i);
  });

  it("keeps seeded engine evolution identical across independent prototype sessions", () => {
    const left = createImmersiveFlockingEngine(100);
    const right = createImmersiveFlockingEngine(100);
    for (let tick = 0; tick < 6; tick += 1) {
      left.step();
      right.step();
    }
    const leftAdapter = createFlockingWorldSceneAdapter(left.createSnapshot(), left.parameters);
    const rightAdapter = createFlockingWorldSceneAdapter(right.createSnapshot(), right.parameters);
    expect(leftAdapter.getRuntimeSignature()).toBe(rightAdapter.getRuntimeSignature());
    expect(leftAdapter.getEntities()).toEqual(rightAdapter.getEntities());
    expect(leftAdapter.getLensData()).toEqual(rightAdapter.getLensData());
  });

  it("adapts real snapshot state into inspectable entities, local relationships, and Alignment data", () => {
    const engine = createImmersiveFlockingEngine(100);
    engine.step();
    const adapter = createFlockingWorldSceneAdapter(engine.createSnapshot(), engine.parameters);
    const first = adapter.getEntities()[0]!;
    const inspected = adapter.getInspectableState(first.id);
    const relationships = adapter.getRelationships(first.id);

    expect(adapter.tick).toBe(1);
    expect(adapter.getBounds()).toEqual({ width: 100, height: 100 });
    expect(adapter.getEntities()).toHaveLength(100);
    expect(inspected?.entity).toEqual(first);
    expect(inspected?.relationshipCount).toBe(relationships.length);
    expect(relationships.every((relationship) => relationship.distance <= inspected!.perceptionRadius)).toBe(true);
    expect(adapter.getSelectionGeometry(first.id)?.entityId).toBe(first.id);
    expect(adapter.getAlignment()).toBeTypeOf("number");
    expect(adapter.getLensData().vectors).toHaveLength(100);
    expect(adapter.getLensData().alignment).toBeTypeOf("number");
    expect(adapter.getInspectableState("missing")).toBeNull();
    expect(adapter.getRelationships("missing")).toEqual([]);

    const genericAdapter: ReadOnlyWorldSceneAdapter<
      ImmersiveSceneEntity,
      ImmersiveInspectableState,
      ImmersiveSelectionGeometry,
      ImmersiveLensData
    > = adapter;
    expect(genericAdapter.templateId).toBe("flocking-boids");
  });

  it("keeps camera, selection, and lens-oriented reads outside authoritative runtime state", () => {
    const engine = createImmersiveFlockingEngine(100);
    engine.step();
    const adapter = createFlockingWorldSceneAdapter(engine.createSnapshot(), engine.parameters);
    const first = adapter.getEntities()[0]!;
    const signature = adapter.getRuntimeSignature();
    const system = createSystemCamera(adapter.getBounds());
    const focused = focusImmersiveCamera(system, "follow", first.id);
    const resolved = resolveImmersiveCamera(focused, adapter.getEntities(), adapter.getBounds());
    const zoomed = zoomImmersiveCamera(resolved, 1.5);
    const panned = panImmersiveCamera(zoomed, 8, -5, adapter.getBounds());
    const eased = interpolateImmersiveCamera(system, resolved, 16, false);
    const immediate = interpolateImmersiveCamera(system, resolved, 16, true);
    const freeZoom = zoomImmersiveCamera(system, 1.2);
    const released = releaseImmersiveCameraFocus(focused, adapter.getBounds());

    expect(resolved).toMatchObject({ mode: "follow", focusTargetId: first.id, x: first.x, y: first.y });
    expect(zoomed.zoom).toBeGreaterThan(system.zoom);
    expect(panned).toMatchObject({ mode: "free", focusTargetId: null });
    expect(eased.x).not.toBe(resolved.x);
    expect(eased.mode).toBe("follow");
    expect(immediate).toEqual(resolved);
    expect(freeZoom).toMatchObject({ mode: "free", focusTargetId: null });
    expect(released).toEqual(system);
    expect(adapter.getInspectableState(first.id)).not.toBeNull();
    expect(adapter.getLensData().vectors).toHaveLength(100);
    expect(adapter.getRuntimeSignature()).toBe(signature);
  });

  it("bounds visual trails, effects, and performance samples", () => {
    const trails = new BoundedTrailBuffer(2, 3);
    const entities = [entity("one", 1), entity("two", 2), entity("three", 3)];
    for (let tick = 0; tick < 10; tick += 1) {
      trails.update(entities, ["one", "two", "three"], tick);
    }
    expect(trails.entries().map(([id]) => id)).toEqual(["one", "two"]);
    expect(trails.pointCount()).toBe(6);

    const effects = new BoundedVisualEffectBuffer(2);
    effects.add({ kind: "selection", x: 1, y: 1, startedAt: 100, durationMs: 20 });
    effects.add({ kind: "selection", x: 2, y: 2, startedAt: 105, durationMs: 20 });
    effects.add({ kind: "selection", x: 3, y: 3, startedAt: 110, durationMs: 20 });
    expect(effects.count()).toBe(2);
    expect(effects.active(131)).toEqual([]);

    const monitor = new ImmersiveRenderPerformanceMonitor();
    monitor.reset(100);
    for (let frame = 0; frame < 500; frame += 1) {
      monitor.recordFrame(100 + frame * 16, frame % 4, trails.pointCount(), effects.count());
    }
    const summary = monitor.summary(8_100);
    expect(summary.frameCount).toBe(499);
    expect(summary.trailPointCount).toBe(6);
    expect(summary.effectCount).toBe(0);
    expect(summary.medianFrameMs).toBe(16);
    expect(summary.renderQuality).toBe("high");

    trails.update(entities, [], 11);
    expect(trails.pointCount()).toBe(0);
    for (let tick = 12; tick < 20; tick += 1) {
      trails.update(entities, ["one"], tick, 2);
    }
    expect(trails.pointCount()).toBe(2);
  });

  it("degrades only bounded visual detail while preserving an automatic recovery path", () => {
    const high = new AdaptiveRenderQualityController(100);
    const loaded = new AdaptiveRenderQualityController(500);
    expect(high.getPolicy()).toMatchObject({ level: "high", trailPointLimit: 12, trailUpdateEveryTicks: 1 });
    expect(loaded.getPolicy()).toMatchObject({ level: "balanced", trailPointLimit: 8, trailUpdateEveryTicks: 2 });

    for (let frame = 0; frame < 90; frame += 1) {
      loaded.recordFrameInterval(90);
    }
    expect(loaded.getPolicy()).toMatchObject({
      level: "performance",
      pixelRatioCeiling: 1,
      shadowDetail: "none",
      trailPointLimit: 5
    });

    for (let frame = 0; frame < 360; frame += 1) {
      loaded.recordFrameInterval(16);
    }
    expect(loaded.getPolicy().level).toBe("balanced");
  });

  it("snaps only a continuously followed target across a wrapped boundary", () => {
    const current = { x: 99, y: 50, zoom: 3, mode: "follow", focusTargetId: "one" } as const;
    const target = { ...current, x: 1 };
    const wrapped = interpolateImmersiveCamera(current, target, 16, false, {
      bounds: { width: 100, height: 100 },
      wrap: true
    });
    const bounded = interpolateImmersiveCamera(current, target, 16, false, {
      bounds: { width: 100, height: 100 },
      wrap: false
    });

    expect(wrapped.x).toBe(1);
    expect(bounded.x).toBeGreaterThan(1);
    expect(bounded.x).toBeLessThan(99);
  });

  it("steps and restores a fresh runtime without persisting presentation state", () => {
    const runtime = new ImmersiveFlockingRuntime(100);
    const initialSignature = runtime.getView().runtimeSignature;
    let notifications = 0;
    const unsubscribe = runtime.subscribe(() => { notifications += 1; });

    runtime.stepOnce();
    expect(runtime.getView()).toMatchObject({ tick: 1, isRunning: false, lastAdvanceKind: "step" });
    expect(runtime.getView().runtimeSignature).not.toBe(initialSignature);
    expect(runtime.getView().alignment).toBeTypeOf("number");
    expect(runtime.performanceSummary()).toMatchObject({
      sampleCount: 1,
      medianEngineStepMs: expect.any(Number),
      medianSnapshotMs: expect.any(Number),
      medianAdapterMs: expect.any(Number)
    });
    runtime.restore();
    expect(runtime.getView()).toMatchObject({ tick: 0, isRunning: false, lastAdvanceKind: "restore" });
    expect(runtime.getView().runtimeSignature).toBe(initialSignature);
    expect(notifications).toBeGreaterThanOrEqual(2);

    unsubscribe();
    runtime.dispose();
  });

  it("contains no persistence, random visual state, or per-boid React rendering path", () => {
    const implementation = [
      "src/components/immersive/ImmersiveFlockingRuntime.ts",
      "src/components/immersive/ImmersiveWorldCanvas.tsx",
      "src/components/immersive/ImmersiveWorldPrototype.tsx",
      "src/lib/immersiveWorld/boundedVisualState.ts",
      "src/lib/immersiveWorld/camera.ts"
    ].map((path) => readFileSync(join(process.cwd(), path), "utf8")).join("\n");
    const canvas = readFileSync(join(process.cwd(), "src/components/immersive/ImmersiveWorldCanvas.tsx"), "utf8");

    expect(implementation).not.toMatch(/localStorage|sessionStorage|indexedDB/);
    expect(implementation).not.toContain("Math.random");
    expect(canvas).toContain("<canvas");
    expect(canvas).not.toMatch(/<Boid|<Agent/);
    expect(canvas).toContain("for (const entity of drawOrder)");
  });
});

function entity(id: string, coordinate: number): ImmersiveSceneEntity {
  return {
    id,
    label: id,
    x: coordinate,
    y: coordinate,
    velocityX: 1,
    velocityY: 0,
    speed: 1,
    headingRadians: 0,
    headingDegrees: 0,
    neighborCount: 0,
    localDensity: 0,
    fill: "#fff",
    stroke: "#000",
    radius: 2
  };
}
