import {
  maxSavedScenarios,
  safeParseScenario,
  validateScenario,
  type AuthoredScenario
} from "../simulation";

export interface ScenarioStorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export interface ScenarioLibraryLoadResult {
  scenarios: AuthoredScenario[];
  warning?: string;
}

const storageKey = "ortus.scenarioBuilder.v1";

export function loadScenarioLibrary(storage = browserStorage()): ScenarioLibraryLoadResult {
  if (!storage) {
    return { scenarios: [] };
  }
  try {
    const raw = storage.getItem(storageKey);
    if (!raw) {
      return { scenarios: [] };
    }
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return { scenarios: [], warning: "Stored scenario library was invalid and has been ignored." };
    }
    const scenarios = parsed.flatMap((record) => {
      const result = safeParseScenario(record);
      return result ? [result.scenario] : [];
    });
    const warning = scenarios.length === parsed.length ? undefined : "Some stored scenarios were invalid and have been ignored.";
    return { scenarios: scenarios.slice(0, maxSavedScenarios), warning };
  } catch {
    return { scenarios: [], warning: "Stored scenario library was invalid and has been ignored." };
  }
}

export function saveScenarioLibrary(scenarios: readonly AuthoredScenario[], storage = browserStorage()): void {
  if (!storage) {
    return;
  }
  const validated = scenarios.map((scenario) => validateScenario(scenario).scenario).slice(0, maxSavedScenarios);
  storage.setItem(storageKey, JSON.stringify(validated));
}

export function saveScenarioToLibrary(
  scenario: AuthoredScenario,
  existing: readonly AuthoredScenario[],
  storage = browserStorage()
): AuthoredScenario[] {
  const validated = validateScenario(scenario).scenario;
  const next = [validated, ...existing.filter((candidate) => candidate.scenarioId !== validated.scenarioId)].slice(0, maxSavedScenarios);
  saveScenarioLibrary(next, storage);
  return next;
}

export function deleteScenarioFromLibrary(
  scenarioId: string,
  existing: readonly AuthoredScenario[],
  storage = browserStorage()
): AuthoredScenario[] {
  const next = existing.filter((scenario) => scenario.scenarioId !== scenarioId);
  saveScenarioLibrary(next, storage);
  return next;
}

export function clearScenarioLibraryStorage(storage = browserStorage()): void {
  storage?.removeItem(storageKey);
}

function browserStorage(): ScenarioStorageLike | undefined {
  if (typeof window === "undefined") {
    return undefined;
  }
  return window.localStorage;
}
