import type { EphemeralLandscapePreviewRequest, EphemeralLandscapePreviewResult } from "./types";
import { ephemeralLandscapePreviewRequestsEqual } from "./request";

export function isEphemeralLandscapePreviewResultStale(
  result: EphemeralLandscapePreviewResult,
  currentRequest: EphemeralLandscapePreviewRequest | null
): boolean {
  return currentRequest === null || !ephemeralLandscapePreviewRequestsEqual(result.request, currentRequest);
}

export function clearEphemeralLandscapePreviewResult(): null {
  return null;
}
