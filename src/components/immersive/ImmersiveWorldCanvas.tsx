"use client";

import { memo, useEffect, useRef, useState, type MutableRefObject, type PointerEvent as ReactPointerEvent, type WheelEvent as ReactWheelEvent } from "react";
import {
  AdaptiveRenderQualityController,
  BoundedTrailBuffer,
  BoundedVisualEffectBuffer,
  ImmersiveRenderPerformanceMonitor,
  interpolateImmersiveCamera,
  panImmersiveCamera,
  resetImmersiveCamera,
  resolveImmersiveCamera,
  zoomImmersiveCamera,
  type ImmersiveCameraState,
  type ImmersiveConceptId,
  type ImmersiveGodHandTool,
  type ImmersiveRenderPerformanceSummary,
  type ImmersiveRenderQualityPolicy,
  type ImmersiveSceneEntity,
  type ImmersiveWorldBounds,
  type WorldSceneAdapter
} from "../../lib/immersiveWorld";
import type { ImmersiveFlockingRuntime } from "./ImmersiveFlockingRuntime";

export interface ImmersiveCanvasAuditHandle {
  reset(at?: number): void;
  summary(at?: number): ImmersiveRenderPerformanceSummary;
}

interface ImmersiveWorldCanvasProps {
  runtime: ImmersiveFlockingRuntime;
  concept: ImmersiveConceptId;
  camera: ImmersiveCameraState;
  onCameraChange: (camera: ImmersiveCameraState) => void;
  selectedEntityId: string | null;
  onSelectEntity: (entityId: string | null) => void;
  onCycleSelection: (direction: -1 | 1) => void;
  lensActive: boolean;
  godHandTool: ImmersiveGodHandTool;
  reducedMotion: boolean;
  isRunning: boolean;
  auditHandleRef: MutableRefObject<ImmersiveCanvasAuditHandle | null>;
}

interface CanvasSize {
  width: number;
  height: number;
}

interface PointerState {
  active: boolean;
  screenX: number;
  screenY: number;
  worldX: number;
  worldY: number;
  hoveredEntityId: string | null;
  pressed: boolean;
  moved: boolean;
  lastClientX: number;
  lastClientY: number;
}

interface Projection {
  centerX: number;
  centerY: number;
  scale: number;
  yScale: number;
  skew: number;
}

const trailEntityLimit = 1;
const trailPointsPerEntity = 12;
const effectLimit = 24;

export const ImmersiveWorldCanvas = memo(function ImmersiveWorldCanvas({
  runtime,
  concept,
  camera,
  onCameraChange,
  selectedEntityId,
  onSelectEntity,
  onCycleSelection,
  lensActive,
  godHandTool,
  reducedMotion,
  isRunning,
  auditHandleRef
}: ImmersiveWorldCanvasProps) {
  const shellRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [size, setSize] = useState<CanvasSize>({ width: 900, height: 600 });
  const trailBufferRef = useRef(new BoundedTrailBuffer(trailEntityLimit, trailPointsPerEntity));
  const effectBufferRef = useRef(new BoundedVisualEffectBuffer(effectLimit));
  const monitorRef = useRef(new ImmersiveRenderPerformanceMonitor());
  const qualityControllerRef = useRef(new AdaptiveRenderQualityController(runtime.agentCount));
  const lastTickRef = useRef(-1);
  const lastDatasetAtRef = useRef(0);
  const lastFrameAtRef = useRef<number | null>(null);
  const displayCameraRef = useRef<ImmersiveCameraState | null>(null);
  const pointerRef = useRef<PointerState>({
    active: false,
    screenX: 0,
    screenY: 0,
    worldX: 0,
    worldY: 0,
    hoveredEntityId: null,
    pressed: false,
    moved: false,
    lastClientX: 0,
    lastClientY: 0
  });
  const propsRef = useRef({
    concept,
    camera,
    selectedEntityId,
    lensActive,
    godHandTool,
    reducedMotion,
    isRunning
  });

  propsRef.current = {
    concept,
    camera,
    selectedEntityId,
    lensActive,
    godHandTool,
    reducedMotion,
    isRunning
  };

  useEffect(() => {
    qualityControllerRef.current.reset(runtime.agentCount);
    trailBufferRef.current.clear();
    effectBufferRef.current.clear();
    lastTickRef.current = -1;
    lastFrameAtRef.current = null;
    displayCameraRef.current = null;
  }, [concept, runtime]);

  useEffect(() => {
    const element = shellRef.current;
    if (!element) {
      return;
    }
    const observer = new ResizeObserver(([entry]) => {
      if (!entry) {
        return;
      }
      setSize({
        width: Math.max(260, entry.contentRect.width),
        height: Math.max(240, entry.contentRect.height)
      });
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const geometry = runtime.getSceneAdapter().getSelectionGeometry(selectedEntityId);
    if (!geometry || reducedMotion) {
      return;
    }
    effectBufferRef.current.add({
      kind: "selection",
      x: geometry.x,
      y: geometry.y,
      startedAt: performance.now(),
      durationMs: 560
    });
  }, [reducedMotion, runtime, selectedEntityId]);

  useEffect(() => {
    monitorRef.current.reset(performance.now());
    auditHandleRef.current = {
      reset(at = performance.now()) {
        monitorRef.current.reset(at);
      },
      summary(at = performance.now()) {
        return monitorRef.current.summary(at);
      }
    };
    return () => {
      auditHandleRef.current = null;
    };
  }, [auditHandleRef]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }
    canvas.style.width = `${size.width}px`;
    canvas.style.height = `${size.height}px`;
    const context = canvas.getContext("2d");
    if (!context) {
      return;
    }
    let frameId = 0;
    let appliedPixelRatio = 0;
    let appliedWidth = 0;
    let appliedHeight = 0;

    const drawFrame = (at: number) => {
      const drawStartedAt = performance.now();
      const adapter = runtime.getSceneAdapter();
      const current = propsRef.current;
      const previousFrameAt = lastFrameAtRef.current;
      if (previousFrameAt !== null) {
        qualityControllerRef.current.recordFrameInterval(Math.max(0, at - previousFrameAt));
      }
      const quality = qualityControllerRef.current.getPolicy();
      const pixelRatio = Math.min(quality.pixelRatioCeiling, window.devicePixelRatio || 1);
      if (pixelRatio !== appliedPixelRatio || size.width !== appliedWidth || size.height !== appliedHeight) {
        canvas.width = Math.floor(size.width * pixelRatio);
        canvas.height = Math.floor(size.height * pixelRatio);
        context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
        appliedPixelRatio = pixelRatio;
        appliedWidth = size.width;
        appliedHeight = size.height;
      }
      const targetCamera = resolveImmersiveCamera(current.camera, adapter.getEntities(), adapter.getBounds());
      const displayCamera = displayCameraRef.current === null
        ? targetCamera
        : interpolateImmersiveCamera(
            displayCameraRef.current,
            targetCamera,
            at - (previousFrameAt ?? at),
            current.reducedMotion,
            {
              bounds: adapter.getBounds(),
              wrap: adapter.parameters.boundaryMode === "wrap"
            }
          );
      displayCameraRef.current = displayCamera;
      lastFrameAtRef.current = at;
      updateVisualHistory(adapter, current, quality, trailBufferRef.current, effectBufferRef.current, lastTickRef);
      const activeEffects = effectBufferRef.current.active(at);
      const renderedEffects = current.reducedMotion || quality.effectLimit === 0
        ? []
        : activeEffects.slice(-quality.effectLimit);
      drawImmersiveWorld({
        context,
        width: size.width,
        height: size.height,
        adapter,
        concept: current.concept,
        camera: displayCamera,
        selectedEntityId: current.selectedEntityId,
        lensActive: current.lensActive,
        pointer: pointerRef.current,
        trailBuffer: trailBufferRef.current,
        effects: renderedEffects,
        isRunning: current.isRunning,
        godHandTool: current.godHandTool,
        quality,
        at
      });
      const drawMs = performance.now() - drawStartedAt;
      runtime.recordPresentationDuration("ortus.render.draw", drawMs);
      monitorRef.current.recordFrame(
        at,
        drawMs,
        trailBufferRef.current.pointCount(),
        renderedEffects.length,
        quality.level
      );
      if (at - lastDatasetAtRef.current >= 250) {
        lastDatasetAtRef.current = at;
        canvas.dataset.tick = String(adapter.tick);
        canvas.dataset.runtimeSignature = adapter.getRuntimeSignature();
        canvas.dataset.trailPoints = String(trailBufferRef.current.pointCount());
        canvas.dataset.effectCount = String(renderedEffects.length);
        canvas.dataset.renderQuality = quality.level;
        canvas.dataset.hoveredEntity = pointerRef.current.hoveredEntityId ?? "";
      }
      frameId = requestAnimationFrame(drawFrame);
    };
    frameId = requestAnimationFrame(drawFrame);
    return () => cancelAnimationFrame(frameId);
  }, [runtime, size]);

  function handlePointerMove(event: ReactPointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }
    const rect = canvas.getBoundingClientRect();
    const screenX = event.clientX - rect.left;
    const screenY = event.clientY - rect.top;
    const adapter = runtime.getSceneAdapter();
    const entities = adapter.getEntities();
    const bounds = adapter.getBounds();
    const resolvedCamera = displayCameraRef.current ?? resolveImmersiveCamera(camera, entities, bounds);
    const projection = createProjection(adapter, resolvedCamera, concept, size.width, size.height);
    const world = screenToWorld(screenX, screenY, projection, resolvedCamera, adapter);
    const hoveredEntityId = pickEntity(entities, projection, resolvedCamera, screenX, screenY);
    const pointer = pointerRef.current;
    const deltaClientX = event.clientX - pointer.lastClientX;
    const deltaClientY = event.clientY - pointer.lastClientY;
    const canPan = concept === "living-diorama" || (concept === "god-hand" && godHandTool === "navigate");
    if (pointer.pressed && canPan && (Math.abs(deltaClientX) + Math.abs(deltaClientY) > 0)) {
      pointer.moved = true;
      onCameraChange(
        panImmersiveCamera(
          resolvedCamera,
          -deltaClientX / Math.max(0.001, projection.scale),
          -deltaClientY / Math.max(0.001, projection.scale * projection.yScale),
          bounds
        )
      );
    }
    pointerRef.current = {
      ...pointer,
      active: true,
      screenX,
      screenY,
      worldX: world.x,
      worldY: world.y,
      hoveredEntityId,
      lastClientX: event.clientX,
      lastClientY: event.clientY
    };
  }

  function handlePointerDown(event: ReactPointerEvent<HTMLCanvasElement>) {
    event.currentTarget.setPointerCapture(event.pointerId);
    const rect = event.currentTarget.getBoundingClientRect();
    const screenX = event.clientX - rect.left;
    const screenY = event.clientY - rect.top;
    const adapter = runtime.getSceneAdapter();
    const entities = adapter.getEntities();
    const displayCamera = displayCameraRef.current ?? resolveImmersiveCamera(camera, entities, adapter.getBounds());
    const projection = createProjection(adapter, displayCamera, concept, size.width, size.height);
    const world = screenToWorld(screenX, screenY, projection, displayCamera, adapter);
    pointerRef.current = {
      ...pointerRef.current,
      active: true,
      screenX,
      screenY,
      worldX: world.x,
      worldY: world.y,
      hoveredEntityId: pickEntity(entities, projection, displayCamera, screenX, screenY),
      pressed: true,
      moved: false,
      lastClientX: event.clientX,
      lastClientY: event.clientY
    };
  }

  function handlePointerUp(event: ReactPointerEvent<HTMLCanvasElement>) {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    const pointer = pointerRef.current;
    if (!pointer.moved) {
      onSelectEntity(pointer.hoveredEntityId);
    }
    pointerRef.current = { ...pointer, pressed: false, moved: false };
  }

  function handlePointerCancel(event: ReactPointerEvent<HTMLCanvasElement>) {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    pointerRef.current = {
      ...pointerRef.current,
      active: false,
      hoveredEntityId: null,
      pressed: false,
      moved: false
    };
  }

  function handleWheel(event: ReactWheelEvent<HTMLCanvasElement>) {
    event.preventDefault();
    onCameraChange(zoomImmersiveCamera(camera, event.deltaY < 0 ? 1.12 : 0.89));
  }

  return (
    <div ref={shellRef} className="immersive-canvas-shell" data-concept={concept} data-tool={godHandTool}>
      <canvas
        ref={canvasRef}
        className="immersive-world-canvas"
        role="img"
        tabIndex={0}
        aria-label="Immersive Flocking world rendered from the current runtime frame"
        onPointerMove={handlePointerMove}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        onPointerLeave={() => {
          if (!pointerRef.current.pressed) {
            pointerRef.current = { ...pointerRef.current, active: false, hoveredEntityId: null };
          }
        }}
        onWheel={handleWheel}
        onKeyDown={(event) => {
          if (event.key === "ArrowRight" || event.key === "ArrowDown") {
            event.preventDefault();
            onCycleSelection(1);
          } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
            event.preventDefault();
            onCycleSelection(-1);
          } else if (event.key === "Escape") {
            onSelectEntity(null);
          } else if (event.key === "Home") {
            event.preventDefault();
            onCameraChange(resetImmersiveCamera(runtime.getSceneAdapter().getBounds()));
          } else if (event.key === "+" || event.key === "=") {
            event.preventDefault();
            onCameraChange(zoomImmersiveCamera(camera, 1.12));
          } else if (event.key === "-") {
            event.preventDefault();
            onCameraChange(zoomImmersiveCamera(camera, 0.89));
          }
        }}
      />
    </div>
  );
});

function updateVisualHistory(
  adapter: WorldSceneAdapter,
  current: {
    concept: ImmersiveConceptId;
    selectedEntityId: string | null;
    reducedMotion: boolean;
  },
  quality: ImmersiveRenderQualityPolicy,
  trails: BoundedTrailBuffer,
  effects: BoundedVisualEffectBuffer,
  lastTickRef: MutableRefObject<number>
): void {
  if (adapter.tick === lastTickRef.current) {
    return;
  }
  if (adapter.tick < lastTickRef.current || adapter.tick === 0) {
    trails.clear();
    effects.clear();
  }
  const entities = adapter.getEntities();
  const trackedIds = current.selectedEntityId ? [current.selectedEntityId] : [];
  if (trackedIds.length === 0 || adapter.tick % quality.trailUpdateEveryTicks === 0) {
    trails.update(entities, trackedIds, adapter.tick, quality.trailPointLimit);
  }
  lastTickRef.current = adapter.tick;
}

function drawImmersiveWorld(options: {
  context: CanvasRenderingContext2D;
  width: number;
  height: number;
  adapter: WorldSceneAdapter;
  concept: ImmersiveConceptId;
  camera: ImmersiveCameraState;
  selectedEntityId: string | null;
  lensActive: boolean;
  pointer: PointerState;
  trailBuffer: BoundedTrailBuffer;
  effects: readonly { kind: string; x: number; y: number; startedAt: number; durationMs: number }[];
  isRunning: boolean;
  godHandTool: ImmersiveGodHandTool;
  quality: ImmersiveRenderQualityPolicy;
  at: number;
}): void {
  const { context: ctx, width, height, adapter, concept } = options;
  const entities = adapter.getEntities();
  const bounds = adapter.getBounds();
  const resolvedCamera = options.camera;
  const projection = createProjection(adapter, resolvedCamera, concept, width, height);

  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = concept === "field-scientist" ? "#0b1112" : concept === "god-hand" ? "#10100f" : "#10130f";
  ctx.fillRect(0, 0, width, height);
  drawCoordinateSurface(ctx, projection, resolvedCamera, bounds, concept, options.quality);
  drawTrails(ctx, options.trailBuffer, projection, resolvedCamera, bounds, concept, options.quality);

  const relationships = adapter.getRelationships(options.selectedEntityId);
  drawProximityMarkers(ctx, relationships, entities, projection, resolvedCamera, concept);
  if (options.lensActive) {
    drawAlignmentLens(ctx, adapter, projection, resolvedCamera);
  }

  const drawOrder = concept === "living-diorama"
    ? [...entities].sort((left, right) => left.y - right.y || left.id.localeCompare(right.id))
    : entities;
  for (const entity of drawOrder) {
    drawEntity(
      ctx,
      entity,
      projection,
      resolvedCamera,
      bounds,
      concept,
      entity.id === options.selectedEntityId,
      entity.id === options.pointer.hoveredEntityId,
      options.quality
    );
  }

  const selection = adapter.getSelectionGeometry(options.selectedEntityId);
  if (selection) {
    drawSelectionGeometry(ctx, selection, projection, resolvedCamera, concept);
  }
  drawEffects(ctx, options.effects, projection, resolvedCamera, options.at);
  drawPointerPresence(ctx, options.pointer, concept, options.godHandTool);
  if (!options.isRunning) {
    ctx.save();
    ctx.strokeStyle = "rgba(243, 241, 232, 0.28)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(18, height - 18);
    ctx.lineTo(74, height - 18);
    ctx.stroke();
    ctx.restore();
  }
}

function createProjection(
  adapter: WorldSceneAdapter,
  camera: ImmersiveCameraState,
  concept: ImmersiveConceptId,
  width: number,
  height: number
): Projection {
  const bounds = adapter.getBounds();
  const yScale = concept === "living-diorama" ? 0.7 : concept === "field-scientist" ? 0.88 : 0.82;
  const skew = concept === "living-diorama" ? 0.12 : 0;
  const padding = Math.max(36, Math.min(width, height) * 0.075);
  const scale = Math.min(
    (width - padding * 2) / bounds.width,
    (height - padding * 2) / (bounds.height * yScale)
  ) * camera.zoom;
  return {
    centerX: width / 2,
    centerY: height / 2,
    scale,
    yScale,
    skew
  };
}

function worldToScreen(
  x: number,
  y: number,
  projection: Projection,
  camera: ImmersiveCameraState
): { x: number; y: number } {
  const deltaY = y - camera.y;
  return {
    x: projection.centerX + ((x - camera.x) + deltaY * projection.skew) * projection.scale,
    y: projection.centerY + deltaY * projection.scale * projection.yScale
  };
}

function screenToWorld(
  screenX: number,
  screenY: number,
  projection: Projection,
  camera: ImmersiveCameraState,
  adapter: WorldSceneAdapter
): { x: number; y: number } {
  const deltaY = (screenY - projection.centerY) / Math.max(0.001, projection.scale * projection.yScale);
  const deltaX = (screenX - projection.centerX) / Math.max(0.001, projection.scale) - deltaY * projection.skew;
  const bounds = adapter.getBounds();
  return {
    x: clamp(camera.x + deltaX, 0, bounds.width),
    y: clamp(camera.y + deltaY, 0, bounds.height)
  };
}

function drawCoordinateSurface(
  ctx: CanvasRenderingContext2D,
  projection: Projection,
  camera: ImmersiveCameraState,
  bounds: ImmersiveWorldBounds,
  concept: ImmersiveConceptId,
  quality: ImmersiveRenderQualityPolicy
): void {
  const corners = [
    worldToScreen(0, 0, projection, camera),
    worldToScreen(bounds.width, 0, projection, camera),
    worldToScreen(bounds.width, bounds.height, projection, camera),
    worldToScreen(0, bounds.height, projection, camera)
  ];
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(corners[0]!.x, corners[0]!.y);
  for (const corner of corners.slice(1)) {
    ctx.lineTo(corner.x, corner.y);
  }
  ctx.closePath();
  ctx.fillStyle = concept === "living-diorama" ? "rgba(41, 55, 38, 0.56)" : "rgba(28, 37, 35, 0.5)";
  ctx.fill();
  ctx.clip();
  ctx.strokeStyle = concept === "field-scientist" ? "rgba(123, 215, 199, 0.13)" : "rgba(241, 223, 176, 0.1)";
  ctx.lineWidth = 1;
  for (let coordinate = 0; coordinate <= 100; coordinate += quality.gridStep) {
    const verticalStart = worldToScreen(coordinate, 0, projection, camera);
    const verticalEnd = worldToScreen(coordinate, bounds.height, projection, camera);
    ctx.beginPath();
    ctx.moveTo(verticalStart.x, verticalStart.y);
    ctx.lineTo(verticalEnd.x, verticalEnd.y);
    ctx.stroke();
    const horizontalStart = worldToScreen(0, coordinate, projection, camera);
    const horizontalEnd = worldToScreen(bounds.width, coordinate, projection, camera);
    ctx.beginPath();
    ctx.moveTo(horizontalStart.x, horizontalStart.y);
    ctx.lineTo(horizontalEnd.x, horizontalEnd.y);
    ctx.stroke();
  }
  ctx.restore();
  ctx.save();
  ctx.strokeStyle = concept === "god-hand" ? "rgba(216, 255, 62, 0.52)" : "rgba(241, 223, 176, 0.54)";
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(corners[0]!.x, corners[0]!.y);
  for (const corner of corners.slice(1)) {
    ctx.lineTo(corner.x, corner.y);
  }
  ctx.closePath();
  ctx.stroke();
  ctx.restore();
}

function drawTrails(
  ctx: CanvasRenderingContext2D,
  trails: BoundedTrailBuffer,
  projection: Projection,
  camera: ImmersiveCameraState,
  bounds: ImmersiveWorldBounds,
  concept: ImmersiveConceptId,
  quality: ImmersiveRenderQualityPolicy
): void {
  ctx.save();
  ctx.lineWidth = concept === "living-diorama" ? 1.3 : 1;
  ctx.strokeStyle = concept === "living-diorama" ? "rgba(217, 163, 78, 0.28)" : "rgba(123, 215, 199, 0.24)";
  trails.forEach((_entityId, allPoints) => {
    const points = allPoints.slice(-quality.trailPointLimit);
    if (points.length < 2) {
      return;
    }
    ctx.beginPath();
    let previous = points[0]!;
    let screen = worldToScreen(previous.x, previous.y, projection, camera);
    ctx.moveTo(screen.x, screen.y);
    for (const point of points.slice(1)) {
      screen = worldToScreen(point.x, point.y, projection, camera);
      if (Math.abs(point.x - previous.x) > bounds.width / 2 || Math.abs(point.y - previous.y) > bounds.height / 2) {
        ctx.moveTo(screen.x, screen.y);
      } else {
        ctx.lineTo(screen.x, screen.y);
      }
      previous = point;
    }
    ctx.stroke();
  });
  ctx.restore();
}

function drawProximityMarkers(
  ctx: CanvasRenderingContext2D,
  relationships: readonly { targetId: string }[],
  entities: readonly ImmersiveSceneEntity[],
  projection: Projection,
  camera: ImmersiveCameraState,
  concept: ImmersiveConceptId
): void {
  if (relationships.length === 0) {
    return;
  }
  const targetIds = new Set<string>();
  for (const relationship of relationships) {
    targetIds.add(relationship.targetId);
  }
  ctx.save();
  ctx.fillStyle = concept === "field-scientist" ? "rgba(123, 215, 199, 0.58)" : "rgba(241, 223, 176, 0.4)";
  for (const entity of entities) {
    if (!targetIds.has(entity.id)) {
      continue;
    }
    const target = worldToScreen(entity.x, entity.y, projection, camera);
    ctx.beginPath();
    ctx.arc(target.x, target.y, 2.2, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawAlignmentLens(
  ctx: CanvasRenderingContext2D,
  adapter: WorldSceneAdapter,
  projection: Projection,
  camera: ImmersiveCameraState
): void {
  ctx.save();
  ctx.strokeStyle = "rgba(123, 215, 199, 0.64)";
  ctx.lineWidth = 1;
  for (const vector of adapter.getLensData().vectors) {
    const start = worldToScreen(vector.x, vector.y, projection, camera);
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(start.x + vector.headingX * 13, start.y + vector.headingY * 13);
    ctx.stroke();
  }
  ctx.restore();
}

function drawEntity(
  ctx: CanvasRenderingContext2D,
  entity: ImmersiveSceneEntity,
  projection: Projection,
  camera: ImmersiveCameraState,
  bounds: ImmersiveWorldBounds,
  concept: ImmersiveConceptId,
  selected: boolean,
  hovered: boolean,
  quality: ImmersiveRenderQualityPolicy
): void {
  const screen = worldToScreen(entity.x, entity.y, projection, camera);
  const depth = concept === "living-diorama" ? 0.82 + (entity.y / bounds.height) * 0.32 : 1;
  const radius = Math.max(3.4, entity.radius * 1.25 * depth);
  const selectedDetail = selected || hovered;
  const drawShadow = concept === "living-diorama"
    && (quality.shadowDetail === "all" || (quality.shadowDetail === "selected" && selectedDetail));
  if (drawShadow) {
    ctx.save();
    ctx.fillStyle = "rgba(0, 0, 0, 0.28)";
    ctx.beginPath();
    ctx.ellipse(screen.x + 3, screen.y + radius + 4, radius * 1.25, radius * 0.46, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  ctx.save();
  ctx.translate(screen.x, screen.y);
  ctx.rotate(entity.headingRadians);
  ctx.beginPath();
  ctx.moveTo(radius + 4, 0);
  ctx.lineTo(-radius * 0.72, -radius * 0.68);
  ctx.lineTo(-radius * 0.3, 0);
  ctx.lineTo(-radius * 0.72, radius * 0.68);
  ctx.closePath();
  ctx.fillStyle = entity.fill;
  ctx.strokeStyle = selected ? "#f3f1e8" : hovered ? "#7bd7c7" : entity.stroke;
  ctx.lineWidth = selected ? 2.2 : hovered ? 1.8 : 1;
  ctx.fill();
  if (quality.strokeDetail === "all" || selectedDetail) {
    ctx.stroke();
  }
  ctx.restore();
  if (hovered || selected) {
    ctx.save();
    ctx.strokeStyle = selected ? "rgba(243, 241, 232, 0.9)" : "rgba(123, 215, 199, 0.84)";
    ctx.lineWidth = selected ? 1.4 : 1;
    ctx.beginPath();
    ctx.arc(screen.x, screen.y, radius + (selected ? 9 : 6), 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
}

function drawSelectionGeometry(
  ctx: CanvasRenderingContext2D,
  selection: { x: number; y: number; headingX: number; headingY: number; interactionRadius: number },
  projection: Projection,
  camera: ImmersiveCameraState,
  concept: ImmersiveConceptId
): void {
  const center = worldToScreen(selection.x, selection.y, projection, camera);
  ctx.save();
  ctx.strokeStyle = "rgba(241, 223, 176, 0.82)";
  ctx.lineWidth = 1.3;
  ctx.beginPath();
  ctx.moveTo(center.x, center.y);
  ctx.lineTo(center.x + selection.headingX * 30, center.y + selection.headingY * 30);
  ctx.stroke();
  if (concept !== "living-diorama") {
    ctx.strokeStyle = "rgba(123, 215, 199, 0.18)";
    ctx.setLineDash([4, 6]);
    ctx.beginPath();
    ctx.ellipse(
      center.x,
      center.y,
      selection.interactionRadius * projection.scale,
      selection.interactionRadius * projection.scale * projection.yScale,
      0,
      0,
      Math.PI * 2
    );
    ctx.stroke();
  }
  ctx.restore();
}

function drawEffects(
  ctx: CanvasRenderingContext2D,
  effects: readonly { kind: string; x: number; y: number; startedAt: number; durationMs: number }[],
  projection: Projection,
  camera: ImmersiveCameraState,
  at: number
): void {
  ctx.save();
  for (const effect of effects) {
    const progress = clamp((at - effect.startedAt) / effect.durationMs, 0, 1);
    const center = worldToScreen(effect.x, effect.y, projection, camera);
    const radius = 15 + progress * 5;
    ctx.strokeStyle = `rgba(241, 223, 176, ${0.56 * (1 - progress)})`;
    ctx.lineWidth = 1.4;
    drawCornerMarker(ctx, center.x, center.y, radius, 6);
  }
  ctx.restore();
}

function drawPointerPresence(
  ctx: CanvasRenderingContext2D,
  pointer: PointerState,
  concept: ImmersiveConceptId,
  tool: ImmersiveGodHandTool
): void {
  if (concept !== "god-hand" || !pointer.active) {
    return;
  }
  const x = pointer.screenX;
  const y = pointer.screenY;
  ctx.save();
  ctx.strokeStyle = tool === "measure" ? "rgba(123, 215, 199, 0.9)" : "rgba(216, 255, 62, 0.78)";
  ctx.lineWidth = pointer.pressed ? 2 : 1.2;
  if (tool === "navigate") {
    ctx.beginPath();
    ctx.moveTo(x - 12, y);
    ctx.lineTo(x + 12, y);
    ctx.moveTo(x - 12, y);
    ctx.lineTo(x - 7, y - 4);
    ctx.moveTo(x - 12, y);
    ctx.lineTo(x - 7, y + 4);
    ctx.moveTo(x + 12, y);
    ctx.lineTo(x + 7, y - 4);
    ctx.moveTo(x + 12, y);
    ctx.lineTo(x + 7, y + 4);
    ctx.stroke();
  } else if (tool === "inspect") {
    drawCornerMarker(ctx, x, y, 11, 6);
  } else {
    ctx.beginPath();
    ctx.moveTo(x - 15, y);
    ctx.lineTo(x + 15, y);
    for (let offset = -15; offset <= 15; offset += 5) {
      const tickHeight = Math.abs(offset) === 15 ? 6 : 3;
      ctx.moveTo(x + offset, y - tickHeight);
      ctx.lineTo(x + offset, y + tickHeight);
    }
    ctx.stroke();
  }
  ctx.restore();
}

function drawCornerMarker(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  armLength: number
): void {
  ctx.beginPath();
  ctx.moveTo(x - radius, y - radius + armLength);
  ctx.lineTo(x - radius, y - radius);
  ctx.lineTo(x - radius + armLength, y - radius);
  ctx.moveTo(x + radius - armLength, y - radius);
  ctx.lineTo(x + radius, y - radius);
  ctx.lineTo(x + radius, y - radius + armLength);
  ctx.moveTo(x + radius, y + radius - armLength);
  ctx.lineTo(x + radius, y + radius);
  ctx.lineTo(x + radius - armLength, y + radius);
  ctx.moveTo(x - radius + armLength, y + radius);
  ctx.lineTo(x - radius, y + radius);
  ctx.lineTo(x - radius, y + radius - armLength);
  ctx.stroke();
}

function pickEntity(
  entities: readonly ImmersiveSceneEntity[],
  projection: Projection,
  camera: ImmersiveCameraState,
  screenX: number,
  screenY: number
): string | null {
  let best: { id: string; distance: number } | null = null;
  for (const entity of entities) {
    const screen = worldToScreen(entity.x, entity.y, projection, camera);
    const distance = Math.hypot(screen.x - screenX, screen.y - screenY);
    if (distance <= 13 && (!best || distance < best.distance)) {
      best = { id: entity.id, distance };
    }
  }
  return best?.id ?? null;
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, value));
}
