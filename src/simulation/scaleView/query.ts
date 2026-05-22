import { getScaleLevel, validateMultiScaleModel } from "../multiscale";
import type { MultiScaleModel } from "../multiscale/types";
import {
  canZoomIn,
  canZoomOut,
  listAvailableScaleTransitions,
  listZoomInTransitions,
  listZoomOutTransitions
} from "./transitions";
import type { ScaleViewState } from "./types";
import { validateScaleViewStateForModel } from "./validation";

export function getCurrentScaleLevel(model: MultiScaleModel, viewState: ScaleViewState) {
  const validModel = validateMultiScaleModel(model);
  const validView = validateScaleViewStateForModel(validModel, viewState);
  return getScaleLevel(validModel, validView.currentScaleId);
}

export function getScaleViewWarnings(model: MultiScaleModel, viewState: ScaleViewState): readonly string[] {
  const validModel = validateMultiScaleModel(model);
  const validView = validateScaleViewStateForModel(validModel, viewState);
  const transitionWarnings = listAvailableScaleTransitions(validModel, validView).flatMap((transition) =>
    [transition.informationLossWarning, transition.syntheticDetailWarning].filter((warning): warning is string => Boolean(warning))
  );
  return clone([...(validView.warnings ?? []), ...transitionWarnings]);
}

export function summarizeScaleView(model: MultiScaleModel, viewState: ScaleViewState) {
  const validModel = validateMultiScaleModel(model);
  const validView = validateScaleViewStateForModel(validModel, viewState);
  const currentScale = getScaleLevel(validModel, validView.currentScaleId);
  const transitions = listAvailableScaleTransitions(validModel, validView);
  const informationLossWarningCount = transitions.filter((transition) => transition.informationLossWarning).length;
  const syntheticDetailWarningCount = transitions.filter((transition) => transition.syntheticDetailWarning).length;
  return {
    scaleModelId: validModel.id,
    currentScaleId: validView.currentScaleId,
    currentScaleLabel: currentScale?.label ?? validView.currentScaleId,
    viewMode: validView.viewMode,
    canZoomIn: canZoomIn(validModel, validView),
    canZoomOut: canZoomOut(validModel, validView),
    availableTransitionCount: transitions.filter((transition) => transition.available).length,
    informationLossWarningCount,
    syntheticDetailWarningCount,
    cameraZoom: validView.camera?.zoom ?? 1,
    modelScaleZoomNote: "Model-scale zoom changes the represented scale level; camera zoom only changes visual magnification.",
    warnings: getScaleViewWarnings(validModel, validView)
  };
}

export { listAvailableScaleTransitions, listZoomInTransitions, listZoomOutTransitions, canZoomIn, canZoomOut };

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}
