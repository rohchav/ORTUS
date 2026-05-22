import type { JsonValue } from "../kernel/types";

export const scaleViewStateArtifactType = "ortus.scaleViewState";
export const maxScaleViewStateJsonLength = 120_000;
export const maxScaleViewMetadataJsonLength = 20_000;
export const maxScaleViewWarnings = 64;
export const maxScaleViewWarningLength = 1_000;
export const maxScaleTransitionHistory = 64;
export const maxScaleCameraZoom = 1_000;

export const scaleViewModes = ["entities", "groups", "regions", "field", "network", "summary", "comparison", "custom"] as const;
export type ScaleViewMode = (typeof scaleViewModes)[number];

export const scaleTransitionDirections = ["zoomIn", "zoomOut", "lateral"] as const;
export type ScaleTransitionDirection = (typeof scaleTransitionDirections)[number];

export const scaleTransitionTypes = ["aggregation", "disaggregation", "crossScaleLink", "direct"] as const;
export type ScaleTransitionType = (typeof scaleTransitionTypes)[number];

export interface ScaleCameraState {
  x: number;
  y: number;
  zoom: number;
  rotation?: number;
}

export interface ScaleTransition {
  id: string;
  fromScaleId: string;
  toScaleId: string;
  direction: ScaleTransitionDirection;
  transitionType: ScaleTransitionType;
  ruleId?: string;
  linkId?: string;
  available: boolean;
  informationLossWarning?: string;
  syntheticDetailWarning?: string;
  unavailableReason?: string;
  metadata?: Record<string, JsonValue>;
}

export interface ScaleViewState {
  schemaVersion: "1";
  artifactType: typeof scaleViewStateArtifactType;
  id: string;
  name?: string;
  version: string;
  scaleModelId: string;
  currentScaleId: string;
  viewMode: ScaleViewMode;
  camera?: ScaleCameraState;
  selectedEntityTypeId?: string;
  selectedEntityId?: string;
  transitionHistory?: readonly ScaleTransition[];
  warnings?: readonly string[];
  metadata?: Record<string, JsonValue>;
}

export interface ScaleViewTransitionResult {
  previousScaleId: string;
  nextScaleId: string;
  transition: ScaleTransition;
  warnings: readonly string[];
  viewState: ScaleViewState;
}

export interface ScaleViewSummary {
  scaleModelId: string;
  currentScaleId: string;
  currentScaleLabel: string;
  viewMode: ScaleViewMode;
  canZoomIn: boolean;
  canZoomOut: boolean;
  availableTransitionCount: number;
  informationLossWarningCount: number;
  syntheticDetailWarningCount: number;
  cameraZoom: number;
  modelScaleZoomNote: string;
  warnings: readonly string[];
}

export interface CreateScaleViewStateOptions {
  id?: string;
  name?: string;
  version?: string;
  currentScaleId?: string;
  viewMode?: ScaleViewMode;
  camera?: ScaleCameraState;
  selectedEntityTypeId?: string;
  selectedEntityId?: string;
  metadata?: Record<string, JsonValue>;
}
