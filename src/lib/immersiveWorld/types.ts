import type { ParameterValues } from "../../simulation";

export const immersiveConceptIds = ["living-diorama", "god-hand", "field-scientist"] as const;
export type ImmersiveConceptId = (typeof immersiveConceptIds)[number];

export const immersiveAgentCounts = [100, 500] as const;
export type ImmersiveAgentCount = (typeof immersiveAgentCounts)[number];

export const immersiveCameraModes = ["system", "free", "local", "follow"] as const;
export type ImmersiveCameraMode = (typeof immersiveCameraModes)[number];

export const immersiveGodHandTools = ["hand", "inspect", "measure"] as const;
export type ImmersiveGodHandTool = (typeof immersiveGodHandTools)[number];

export interface ImmersivePrototypeRouteConfig {
  concept: ImmersiveConceptId;
  agentCount: ImmersiveAgentCount;
}

export interface ImmersiveWorldBounds {
  width: number;
  height: number;
}

export interface ImmersiveSceneEntity {
  id: string;
  label: string;
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
  speed: number;
  headingRadians: number;
  headingDegrees: number;
  neighborCount: number;
  localDensity: number;
  fill: string;
  stroke: string;
  radius: number;
}

export interface ImmersiveSceneRelationship {
  sourceId: string;
  targetId: string;
  distance: number;
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
}

export interface ImmersiveInspectableState {
  entity: ImmersiveSceneEntity;
  relationshipCount: number;
  perceptionRadius: number;
}

export interface ImmersiveSelectionGeometry {
  entityId: string;
  x: number;
  y: number;
  headingX: number;
  headingY: number;
  interactionRadius: number;
}

export interface ImmersiveLensData {
  alignment: number | null;
  vectors: readonly {
    entityId: string;
    x: number;
    y: number;
    headingX: number;
    headingY: number;
  }[];
}

export interface WorldSceneAdapter {
  readonly tick: number;
  readonly parameters: ParameterValues;
  getBounds(): ImmersiveWorldBounds;
  getEntities(): readonly ImmersiveSceneEntity[];
  getRelationships(entityId: string | null): readonly ImmersiveSceneRelationship[];
  getInspectableState(entityId: string | null): ImmersiveInspectableState | null;
  getSelectionGeometry(entityId: string | null): ImmersiveSelectionGeometry | null;
  getLensData(): ImmersiveLensData;
  getRuntimeSignature(): string;
}
