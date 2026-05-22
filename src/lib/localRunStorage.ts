import { addRunToLibrary, maxSavedRunSummaries, safeParseRunSummary, validateRunSummary, type SavedRunSummary } from "../simulation";

export interface RunStorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export interface RunLibraryLoadResult {
  runs: SavedRunSummary[];
  warning?: string;
}

const storageKey = "ortus.runComparison.v1";

export function loadRunLibrary(storage = browserStorage()): RunLibraryLoadResult {
  if (!storage) {
    return { runs: [] };
  }
  try {
    const raw = storage.getItem(storageKey);
    if (!raw) {
      return { runs: [] };
    }
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return { runs: [], warning: "Stored run library was invalid and has been ignored." };
    }
    const runs = parsed.flatMap((record) => {
      const run = safeParseRunSummary(record);
      return run ? [run] : [];
    });
    const warning = runs.length === parsed.length ? undefined : "Some stored run summaries were invalid and have been ignored.";
    return { runs: runs.slice(0, maxSavedRunSummaries), warning };
  } catch {
    return { runs: [], warning: "Stored run library was invalid and has been ignored." };
  }
}

export function saveRunLibrary(runs: readonly SavedRunSummary[], storage = browserStorage()): void {
  if (!storage) {
    return;
  }
  const validated = runs.map((run) => validateRunSummary(run)).slice(0, maxSavedRunSummaries);
  storage.setItem(storageKey, JSON.stringify(validated));
}

export function clearRunLibraryStorage(storage = browserStorage()): void {
  storage?.removeItem(storageKey);
}

export function saveRunToLibrary(run: SavedRunSummary, existing: readonly SavedRunSummary[], storage = browserStorage()): SavedRunSummary[] {
  const next = addRunToLibrary(existing, validateRunSummary(run), maxSavedRunSummaries);
  saveRunLibrary(next, storage);
  return next;
}

export function deleteRunFromLibrary(runId: string, existing: readonly SavedRunSummary[], storage = browserStorage()): SavedRunSummary[] {
  const next = existing.filter((run) => run.runId !== runId);
  saveRunLibrary(next, storage);
  return next;
}

function browserStorage(): RunStorageLike | undefined {
  if (typeof window === "undefined") {
    return undefined;
  }
  return window.localStorage;
}
