import { SimulationValidationError } from "../kernel/Errors";
import { listScaleLevelsByOrder, validateMultiScaleModel } from "../multiscale";
import type { AggregationRule, CrossScaleLink, DisaggregationRule, MultiScaleModel, ScaleLevel } from "../multiscale/types";
import {
  maxScaleTransitionHistory,
  scaleViewModes,
  scaleViewStateArtifactType,
  type CreateScaleViewStateOptions,
  type ScaleCameraState,
  type ScaleTransition,
  type ScaleViewMode,
  type ScaleViewState,
  type ScaleViewTransitionResult
} from "./types";
import { validateScaleViewStateForModel } from "./validation";

export function createInitialScaleViewState(model: MultiScaleModel, options: CreateScaleViewStateOptions = {}): ScaleViewState {
  const validModel = validateMultiScaleModel(model);
  const orderedLevels = listScaleLevelsByOrder(validModel);
  const currentScaleId = options.currentScaleId ?? validModel.primaryScaleId ?? orderedLevels[0]?.id;
  if (!currentScaleId) {
    throw new SimulationValidationError("Scale model must include at least one scale level");
  }
  const currentScale = validModel.scaleLevels.find((level) => level.id === currentScaleId);
  if (!currentScale) {
    throw new SimulationValidationError(`Unknown initial currentScaleId: ${currentScaleId}`);
  }
  const viewMode = options.viewMode ?? viewModeForScale(currentScale);
  const viewState: ScaleViewState = {
    schemaVersion: "1",
    artifactType: scaleViewStateArtifactType,
    id: options.id ?? `${validModel.id}:scale-view`,
    ...(options.name ? { name: options.name } : {}),
    version: options.version ?? "1",
    scaleModelId: validModel.id,
    currentScaleId,
    viewMode,
    ...(options.camera ? { camera: { ...options.camera } } : {}),
    ...(options.selectedEntityTypeId ? { selectedEntityTypeId: options.selectedEntityTypeId } : {}),
    ...(options.selectedEntityId ? { selectedEntityId: options.selectedEntityId } : {}),
    transitionHistory: [],
    warnings: ["Model-scale zoom changes the represented scale level; camera zoom only changes visual magnification."],
    ...(options.metadata ? { metadata: JSON.parse(JSON.stringify(options.metadata)) } : {})
  };
  return validateScaleViewStateForModel(validModel, viewState);
}

export function listAvailableScaleTransitions(model: MultiScaleModel, viewState: ScaleViewState): readonly ScaleTransition[] {
  const validModel = validateMultiScaleModel(model);
  const validView = validateScaleViewStateForModel(validModel, viewState);
  return clone([...aggregationTransitions(validModel, validView), ...disaggregationTransitions(validModel, validView), ...linkTransitions(validModel, validView)].sort(sortTransitions));
}

export function listZoomInTransitions(model: MultiScaleModel, viewState: ScaleViewState): readonly ScaleTransition[] {
  return listAvailableScaleTransitions(model, viewState).filter((transition) => transition.direction === "zoomIn");
}

export function listZoomOutTransitions(model: MultiScaleModel, viewState: ScaleViewState): readonly ScaleTransition[] {
  return listAvailableScaleTransitions(model, viewState).filter((transition) => transition.direction === "zoomOut");
}

export function canZoomIn(model: MultiScaleModel, viewState: ScaleViewState): boolean {
  return listZoomInTransitions(model, viewState).some((transition) => transition.available);
}

export function canZoomOut(model: MultiScaleModel, viewState: ScaleViewState): boolean {
  return listZoomOutTransitions(model, viewState).some((transition) => transition.available);
}

export function applyScaleTransition(model: MultiScaleModel, viewState: ScaleViewState, transitionId: string): ScaleViewTransitionResult {
  const validModel = validateMultiScaleModel(model);
  const validView = validateScaleViewStateForModel(validModel, viewState);
  const transition = listAvailableScaleTransitions(validModel, validView).find((candidate) => candidate.id === transitionId);
  if (!transition) {
    throw new SimulationValidationError(`Unknown scale transition: ${transitionId}`);
  }
  if (!transition.available) {
    throw new SimulationValidationError(transition.unavailableReason ?? `Scale transition ${transitionId} is unavailable`);
  }
  const targetLevel = validModel.scaleLevels.find((level) => level.id === transition.toScaleId);
  if (!targetLevel) {
    throw new SimulationValidationError(`Scale transition ${transitionId} references unknown target scale ${transition.toScaleId}`);
  }
  const warnings = transitionWarnings(transition);
  const historyEntry = { ...transition, id: `${transition.id}@${nextHistorySequence(validView.transitionHistory ?? [])}` };
  const history = [...(validView.transitionHistory ?? []), historyEntry].slice(-maxScaleTransitionHistory);
  const nextViewState: ScaleViewState = {
    ...validView,
    currentScaleId: transition.toScaleId,
    viewMode: viewModeForScale(targetLevel),
    transitionHistory: history,
    warnings: [...(validView.warnings ?? []), ...warnings].slice(-64)
  };
  delete (nextViewState as { selectedEntityTypeId?: string }).selectedEntityTypeId;
  delete (nextViewState as { selectedEntityId?: string }).selectedEntityId;
  return {
    previousScaleId: validView.currentScaleId,
    nextScaleId: transition.toScaleId,
    transition,
    warnings,
    viewState: validateScaleViewStateForModel(validModel, nextViewState)
  };
}

function aggregationTransitions(model: MultiScaleModel, viewState: ScaleViewState): readonly ScaleTransition[] {
  return model.aggregationRules
    .filter((rule) => rule.fromScaleId === viewState.currentScaleId)
    .map((rule) => aggregationTransition(model, rule));
}

function disaggregationTransitions(model: MultiScaleModel, viewState: ScaleViewState): readonly ScaleTransition[] {
  return model.disaggregationRules
    .filter((rule) => rule.fromScaleId === viewState.currentScaleId)
    .map((rule) => disaggregationTransition(model, rule));
}

function linkTransitions(model: MultiScaleModel, viewState: ScaleViewState): readonly ScaleTransition[] {
  return model.crossScaleLinks
    .filter((link) => link.active && link.sourceScaleId === viewState.currentScaleId && linkSupportsDirection(model, link))
    .map((link) => linkTransition(model, link));
}

function aggregationTransition(model: MultiScaleModel, rule: AggregationRule): ScaleTransition {
  const direction = directionBetween(model, rule.fromScaleId, rule.toScaleId);
  const informationLossWarning = rule.informationLossNotes?.length
    ? `Aggregation rule ${rule.id} may lose information: ${rule.informationLossNotes.join(" ")}`
    : undefined;
  return {
    id: `aggregation:${rule.id}`,
    fromScaleId: rule.fromScaleId,
    toScaleId: rule.toScaleId,
    direction: direction === "up" ? "zoomOut" : "zoomIn",
    transitionType: "aggregation",
    ruleId: rule.id,
    available: true,
    ...(informationLossWarning ? { informationLossWarning } : {})
  };
}

function disaggregationTransition(model: MultiScaleModel, rule: DisaggregationRule): ScaleTransition {
  const direction = directionBetween(model, rule.fromScaleId, rule.toScaleId);
  const syntheticDetailWarning =
    rule.disaggregationType !== "restorePrevious" && rule.syntheticDetailNotes?.length
      ? `Disaggregation rule ${rule.id} creates synthetic detail: ${rule.syntheticDetailNotes.join(" ")}`
      : undefined;
  return {
    id: `disaggregation:${rule.id}`,
    fromScaleId: rule.fromScaleId,
    toScaleId: rule.toScaleId,
    direction: direction === "down" ? "zoomIn" : "zoomOut",
    transitionType: "disaggregation",
    ruleId: rule.id,
    available: true,
    ...(syntheticDetailWarning ? { syntheticDetailWarning } : {})
  };
}

function linkTransition(model: MultiScaleModel, link: CrossScaleLink): ScaleTransition {
  const direction = directionBetween(model, link.sourceScaleId, link.targetScaleId);
  const transitionDirection = direction === "up" ? "zoomOut" : "zoomIn";
  const warning = link.notes ? `Cross-scale link ${link.id}: ${link.notes}` : undefined;
  return {
    id: `link:${link.id}`,
    fromScaleId: link.sourceScaleId,
    toScaleId: link.targetScaleId,
    direction: transitionDirection,
    transitionType: "crossScaleLink",
    linkId: link.id,
    available: true,
    ...(warning && transitionDirection === "zoomOut" ? { informationLossWarning: warning } : {}),
    ...(warning && transitionDirection === "zoomIn" ? { syntheticDetailWarning: warning } : {})
  };
}

function directionBetween(model: MultiScaleModel, fromScaleId: string, toScaleId: string): "up" | "down" {
  const fromOrder = orderForScale(model, fromScaleId);
  const toOrder = orderForScale(model, toScaleId);
  return toOrder > fromOrder ? "up" : "down";
}

function linkSupportsDirection(model: MultiScaleModel, link: CrossScaleLink): boolean {
  const direction = directionBetween(model, link.sourceScaleId, link.targetScaleId);
  return link.direction === "bidirectional" || link.direction === direction;
}

function orderForScale(model: MultiScaleModel, scaleId: string): number {
  const level = model.scaleLevels.find((candidate) => candidate.id === scaleId);
  if (!level) {
    throw new SimulationValidationError(`Unknown scale level: ${scaleId}`);
  }
  return level.order;
}

function viewModeForScale(level: ScaleLevel): ScaleViewMode {
  if (level.defaultViewMode && (scaleViewModes as readonly string[]).includes(level.defaultViewMode)) {
    return level.defaultViewMode as ScaleViewMode;
  }
  if (level.entityTypes.some((entityType) => entityType.kind === "agent")) {
    return "entities";
  }
  if (level.entityTypes.some((entityType) => entityType.kind === "group")) {
    return "groups";
  }
  if (level.entityTypes.some((entityType) => entityType.kind === "region")) {
    return "regions";
  }
  if (level.entityTypes.some((entityType) => entityType.kind === "field")) {
    return "field";
  }
  if (level.entityTypes.some((entityType) => entityType.kind === "networkNode")) {
    return "network";
  }
  return "summary";
}

function transitionWarnings(transition: ScaleTransition): readonly string[] {
  return [transition.informationLossWarning, transition.syntheticDetailWarning].filter((warning): warning is string => Boolean(warning));
}

function sortTransitions(a: ScaleTransition, b: ScaleTransition): number {
  const directionOrder = { zoomIn: 0, zoomOut: 1, lateral: 2 } as const;
  return directionOrder[a.direction] - directionOrder[b.direction] || a.toScaleId.localeCompare(b.toScaleId) || a.id.localeCompare(b.id);
}

function nextHistorySequence(history: readonly ScaleTransition[]): number {
  const maxSeen = history.reduce((max, transition) => {
    const match = /@(\d+)$/.exec(transition.id);
    return match ? Math.max(max, Number(match[1])) : max;
  }, 0);
  return maxSeen + 1;
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}
