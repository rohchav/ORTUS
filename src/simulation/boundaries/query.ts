import { validateBoundaryEnvironmentModel } from "./validation";
import type {
  BoundaryEnvironmentModel,
  BoundaryEnvironmentSummary,
  BoundaryExchange,
  BoundarySurface,
  ExogenousShock,
  ExternalForcing
} from "./types";
import { maxBoundaryWarnings } from "./types";

export function getBoundarySurface(model: BoundaryEnvironmentModel, surfaceId: string): BoundarySurface | undefined {
  const surface = validateBoundaryEnvironmentModel(model).boundarySurfaces?.find((candidate) => candidate.id === surfaceId);
  return surface ? clone(surface) : undefined;
}

export function listBoundarySurfaces(model: BoundaryEnvironmentModel): readonly BoundarySurface[] {
  return clone(validateBoundaryEnvironmentModel(model).boundarySurfaces ?? []);
}

export function listOpenBoundarySurfaces(model: BoundaryEnvironmentModel): readonly BoundarySurface[] {
  return clone(
    (validateBoundaryEnvironmentModel(model).boundarySurfaces ?? []).filter(
      (surface) => surface.permeability === "open" || surface.permeability === "limited" || surface.permeability === "conditional"
    )
  );
}

export function listBoundaryExchanges(model: BoundaryEnvironmentModel): readonly BoundaryExchange[] {
  return clone(validateBoundaryEnvironmentModel(model).exchanges ?? []);
}

export function listActiveBoundaryExchanges(model: BoundaryEnvironmentModel): readonly BoundaryExchange[] {
  return clone((validateBoundaryEnvironmentModel(model).exchanges ?? []).filter((exchange) => exchange.active));
}

export function getExchangesForSurface(model: BoundaryEnvironmentModel, surfaceId: string): readonly BoundaryExchange[] {
  return clone((validateBoundaryEnvironmentModel(model).exchanges ?? []).filter((exchange) => exchange.boundarySurfaceId === surfaceId));
}

export function listExternalForcings(model: BoundaryEnvironmentModel): readonly ExternalForcing[] {
  return clone(validateBoundaryEnvironmentModel(model).externalForcings ?? []);
}

export function listActiveExternalForcings(model: BoundaryEnvironmentModel): readonly ExternalForcing[] {
  return clone((validateBoundaryEnvironmentModel(model).externalForcings ?? []).filter((forcing) => forcing.active));
}

export function listExogenousShocks(model: BoundaryEnvironmentModel): readonly ExogenousShock[] {
  return clone(validateBoundaryEnvironmentModel(model).exogenousShocks ?? []);
}

export function listActiveExogenousShocks(model: BoundaryEnvironmentModel): readonly ExogenousShock[] {
  return clone((validateBoundaryEnvironmentModel(model).exogenousShocks ?? []).filter((shock) => shock.active));
}

export function modelHasOpenBoundary(model: BoundaryEnvironmentModel): boolean {
  const valid = validateBoundaryEnvironmentModel(model);
  return (
    valid.boundaryType === "open" ||
    valid.boundaryType === "partiallyOpen" ||
    (valid.boundarySurfaces ?? []).some((surface) => surface.permeability === "open" || surface.permeability === "limited" || surface.permeability === "conditional") ||
    (valid.exchanges ?? []).some((exchange) => exchange.active)
  );
}

export function modelHasExternalForcing(model: BoundaryEnvironmentModel): boolean {
  return (validateBoundaryEnvironmentModel(model).externalForcings ?? []).length > 0;
}

export function modelHasExogenousShocks(model: BoundaryEnvironmentModel): boolean {
  return (validateBoundaryEnvironmentModel(model).exogenousShocks ?? []).length > 0;
}

export function summarizeBoundaryEnvironment(model: BoundaryEnvironmentModel): BoundaryEnvironmentSummary {
  const valid = validateBoundaryEnvironmentModel(model);
  const warnings = getBoundaryEnvironmentWarnings(valid);
  const closedBoundaryWarning = warnings.find((warning) => warning.includes("closed boundary"));
  const openBoundaryWarning = warnings.find((warning) => warning.includes("open boundary") || warning.includes("partially open boundary"));
  return {
    id: valid.id,
    name: valid.name,
    boundaryType: valid.boundaryType,
    ...(valid.environmentScope ? { environmentType: valid.environmentScope.environmentType } : {}),
    boundarySurfaceCount: (valid.boundarySurfaces ?? []).length,
    exchangeCount: (valid.exchanges ?? []).length,
    activeExchangeCount: (valid.exchanges ?? []).filter((exchange) => exchange.active).length,
    externalForcingCount: (valid.externalForcings ?? []).length,
    activeForcingCount: (valid.externalForcings ?? []).filter((forcing) => forcing.active).length,
    exogenousShockCount: (valid.exogenousShocks ?? []).length,
    activeShockCount: (valid.exogenousShocks ?? []).filter((shock) => shock.active).length,
    executableCount: 0,
    ...(openBoundaryWarning ? { openBoundaryWarning } : {}),
    ...(closedBoundaryWarning ? { closedBoundaryWarning } : {}),
    warnings
  };
}

export function validateBoundaryEnvironmentModelForRuntime(model: BoundaryEnvironmentModel) {
  const valid = validateBoundaryEnvironmentModel(model);
  return {
    modelId: valid.id,
    valid: true,
    runnableNow: false,
    errors: [],
    warnings: [
      "A valid boundary model describes model scope and environment assumptions; it does not prove the real system is closed or open.",
      ...getBoundaryEnvironmentWarnings(valid)
    ],
    missingCapabilities: [
      {
        primitiveId: "boundariesEnvironment" as const,
        requiredSupportLevel: "runtime" as const,
        reason: "Boundary/environment V1 is structural only; current templates do not execute exchanges, forcings, or shocks."
      }
    ]
  };
}

export function getBoundaryEnvironmentWarnings(model: BoundaryEnvironmentModel): readonly string[] {
  const valid = validateBoundaryEnvironmentModel(model);
  const warnings: string[] = [];
  const surfaces = valid.boundarySurfaces ?? [];
  const exchanges = valid.exchanges ?? [];
  const forcings = valid.externalForcings ?? [];
  const shocks = valid.exogenousShocks ?? [];
  const activeExchanges = exchanges.filter((exchange) => exchange.active);

  if (valid.boundaryType === "closed" && activeExchanges.length > 0) {
    warnings.push("The model declares a closed boundary with active exchanges; active exchanges are structural declarations, not runtime-executed flows.");
  }
  if (valid.boundaryType === "closed" && surfaces.some((surface) => surface.permeability === "open")) {
    warnings.push("The model declares a closed boundary with an open boundary surface; this is a structural contradiction to review.");
  }
  if ((valid.boundaryType === "open" || valid.boundaryType === "partiallyOpen") && exchanges.length === 0) {
    warnings.push(`The model declares an ${valid.boundaryType === "open" ? "open boundary" : "partially open boundary"} with no exchanges declared.`);
  }
  for (const forcing of forcings) {
    if (!forcing.targetDescription) {
      warnings.push(`External forcing ${forcing.id} has no target description; it remains structural and is not runtime-executed.`);
    }
  }
  for (const shock of shocks) {
    if (!shock.timingDescription || !shock.magnitudeDescription) {
      warnings.push(`Exogenous shock ${shock.id} lacks timing or magnitude description; it remains structural and is not runtime-executed.`);
    }
  }
  if (valid.boundaryType === "abstract" && surfaces.some((surface) => surface.boundaryKind === "physical")) {
    warnings.push("The model declares an abstract boundary with physical boundary surfaces; clarify whether the boundary is conceptual or physical.");
  }
  for (const surface of surfaces) {
    if (surface.permeability === "unknown") {
      warnings.push(`Boundary surface ${surface.id} has unknown permeability.`);
    }
  }
  for (const exchange of activeExchanges) {
    warnings.push(`Active boundary exchange ${exchange.id} is a structural declaration, not a runtime-executed flow.`);
  }
  for (const forcing of forcings.filter((forcing) => forcing.active)) {
    warnings.push(`Active external forcing ${forcing.id} is a structural declaration, not runtime-executed behavior.`);
  }
  for (const shock of shocks.filter((shock) => shock.active)) {
    warnings.push(`Active exogenous shock ${shock.id} is a structural declaration, not runtime-executed behavior.`);
  }
  return warnings.slice(0, maxBoundaryWarnings);
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}
