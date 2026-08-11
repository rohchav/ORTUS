import type {
  ImmersiveCameraMode,
  ImmersiveSceneEntity,
  ImmersiveWorldBounds
} from "./types";

export interface ImmersiveCameraState {
  x: number;
  y: number;
  zoom: number;
  mode: ImmersiveCameraMode;
  focusTargetId: string | null;
}

export interface ImmersiveCameraInterpolationOptions {
  bounds: ImmersiveWorldBounds;
  wrap: boolean;
}

export const immersiveCameraMinZoom = 0.72;
export const immersiveCameraMaxZoom = 4;

export function createSystemCamera(bounds: ImmersiveWorldBounds): ImmersiveCameraState {
  return {
    x: bounds.width / 2,
    y: bounds.height / 2,
    zoom: 1,
    mode: "system",
    focusTargetId: null
  };
}

export function resetImmersiveCamera(bounds: ImmersiveWorldBounds): ImmersiveCameraState {
  return createSystemCamera(bounds);
}

export function panImmersiveCamera(
  camera: ImmersiveCameraState,
  deltaX: number,
  deltaY: number,
  bounds: ImmersiveWorldBounds
): ImmersiveCameraState {
  return {
    ...camera,
    x: clamp(camera.x + deltaX, 0, bounds.width),
    y: clamp(camera.y + deltaY, 0, bounds.height),
    mode: "free",
    focusTargetId: null
  };
}

export function zoomImmersiveCamera(camera: ImmersiveCameraState, factor: number): ImmersiveCameraState {
  if (!Number.isFinite(factor) || factor <= 0) {
    return camera;
  }
  const zoom = clamp(camera.zoom * factor, immersiveCameraMinZoom, immersiveCameraMaxZoom);
  if (zoom === camera.zoom) {
    return camera;
  }
  return {
    ...camera,
    zoom,
    mode: camera.mode === "system" ? "free" : camera.mode,
    focusTargetId: camera.mode === "system" ? null : camera.focusTargetId
  };
}

export function releaseImmersiveCameraFocus(
  camera: ImmersiveCameraState,
  bounds: ImmersiveWorldBounds
): ImmersiveCameraState {
  return camera.mode === "local" || camera.mode === "follow"
    ? createSystemCamera(bounds)
    : camera;
}

export function focusImmersiveCamera(
  camera: ImmersiveCameraState,
  mode: "local" | "follow",
  entityId: string | null
): ImmersiveCameraState {
  if (!entityId) {
    return camera;
  }
  return {
    ...camera,
    mode,
    focusTargetId: entityId,
    zoom: mode === "follow" ? Math.max(camera.zoom, 3) : Math.max(camera.zoom, 2.1)
  };
}

export function resolveImmersiveCamera(
  camera: ImmersiveCameraState,
  entities: readonly ImmersiveSceneEntity[],
  bounds: ImmersiveWorldBounds
): ImmersiveCameraState {
  if ((camera.mode !== "local" && camera.mode !== "follow") || !camera.focusTargetId) {
    return camera;
  }
  const target = entities.find((entity) => entity.id === camera.focusTargetId);
  if (!target) {
    return createSystemCamera(bounds);
  }
  return { ...camera, x: target.x, y: target.y };
}

export function interpolateImmersiveCamera(
  current: ImmersiveCameraState,
  target: ImmersiveCameraState,
  elapsedMs: number,
  reducedMotion: boolean,
  options?: ImmersiveCameraInterpolationOptions
): ImmersiveCameraState {
  if (reducedMotion || !Number.isFinite(elapsedMs) || elapsedMs <= 0) {
    return { ...target };
  }
  const interpolationStart = prepareWrappedFocusTransition(current, target, options);
  const amount = 1 - Math.exp(-Math.min(elapsedMs, 64) / 150);
  const next = {
    ...target,
    x: lerp(interpolationStart.x, target.x, amount),
    y: lerp(interpolationStart.y, target.y, amount),
    zoom: lerp(interpolationStart.zoom, target.zoom, amount)
  };
  return cameraDistance(next, target) < 0.001 ? { ...target } : next;
}

function prepareWrappedFocusTransition(
  current: ImmersiveCameraState,
  target: ImmersiveCameraState,
  options?: ImmersiveCameraInterpolationOptions
): ImmersiveCameraState {
  const followsSameTarget = target.focusTargetId !== null
    && target.focusTargetId === current.focusTargetId
    && (target.mode === "local" || target.mode === "follow");
  if (!options?.wrap || !followsSameTarget) {
    return current;
  }
  return {
    ...current,
    x: Math.abs(target.x - current.x) > options.bounds.width / 2 ? target.x : current.x,
    y: Math.abs(target.y - current.y) > options.bounds.height / 2 ? target.y : current.y
  };
}

function lerp(from: number, to: number, amount: number): number {
  return from + (to - from) * amount;
}

function cameraDistance(left: ImmersiveCameraState, right: ImmersiveCameraState): number {
  return Math.abs(left.x - right.x) + Math.abs(left.y - right.y) + Math.abs(left.zoom - right.zoom);
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, value));
}
