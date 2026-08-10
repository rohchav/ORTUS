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
  return {
    ...camera,
    zoom: clamp(camera.zoom * factor, immersiveCameraMinZoom, immersiveCameraMaxZoom)
  };
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
  reducedMotion: boolean
): ImmersiveCameraState {
  if (reducedMotion || !Number.isFinite(elapsedMs) || elapsedMs <= 0) {
    return { ...target };
  }
  const amount = 1 - Math.exp(-Math.min(elapsedMs, 64) / 150);
  const next = {
    ...target,
    x: lerp(current.x, target.x, amount),
    y: lerp(current.y, target.y, amount),
    zoom: lerp(current.zoom, target.zoom, amount)
  };
  return cameraDistance(next, target) < 0.001 ? { ...target } : next;
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
