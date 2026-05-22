import { SimulationValidationError } from "../kernel/Errors";
import type { FeedbackApplicationResult, FeedbackLoopDefinition, FeedbackLoopType } from "./types";
import { validateFeedbackLoopDefinition, validateFeedbackLoops } from "./validation";

export function classifyLoop(loop: FeedbackLoopDefinition): FeedbackLoopType {
  return validateFeedbackLoopDefinition(loop).loopType;
}

export function computeFeedbackAdjustment(loop: FeedbackLoopDefinition, signalValue: number, tick = 0): FeedbackApplicationResult {
  const valid = validateFeedbackLoopDefinition(loop);
  if (!Number.isFinite(signalValue)) {
    throw new SimulationValidationError("Feedback signal value must be finite");
  }
  if (!Number.isInteger(tick) || tick < 0) {
    throw new SimulationValidationError("Feedback application tick must be a finite non-negative integer");
  }
  if (!valid.enabled) {
    return {
      loopId: valid.id,
      tick,
      signalValue,
      requestedAdjustment: 0,
      appliedAdjustment: 0,
      target: valid.target,
      warnings: ["feedback loop disabled"]
    };
  }
  const requestedAdjustment = signalValue * valid.gain;
  if (!Number.isFinite(requestedAdjustment)) {
    throw new SimulationValidationError("Feedback adjustment must be finite");
  }
  const appliedAdjustment = applyFeedbackClamp(valid, requestedAdjustment);
  return {
    loopId: valid.id,
    tick,
    signalValue,
    requestedAdjustment,
    appliedAdjustment,
    target: valid.target,
    warnings: appliedAdjustment !== requestedAdjustment ? ["feedback adjustment clamped"] : []
  };
}

export function applyFeedbackClamp(loop: FeedbackLoopDefinition, requestedAdjustment: number): number {
  const valid = validateFeedbackLoopDefinition(loop);
  if (!Number.isFinite(requestedAdjustment)) {
    throw new SimulationValidationError("Feedback adjustment must be finite");
  }
  const min = valid.clamp?.min ?? Number.NEGATIVE_INFINITY;
  const max = valid.clamp?.max ?? Number.POSITIVE_INFINITY;
  return Math.min(Math.max(requestedAdjustment, min), max);
}

export function getEnabledLoopAdjustments(
  loops: readonly FeedbackLoopDefinition[],
  signalsByLoopId: Record<string, number>,
  tick: number
): FeedbackApplicationResult[] {
  return validateFeedbackLoops(loops)
    .filter((loop) => loop.enabled)
    .map((loop) => computeFeedbackAdjustment(loop, signalsByLoopId[loop.id] ?? 0, tick));
}
