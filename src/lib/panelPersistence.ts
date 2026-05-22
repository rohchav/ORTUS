export type PanelState = Record<string, boolean>;

const storageKey = "ortus.panelState.v1";

export function loadPanelState(defaults: PanelState): PanelState {
  if (typeof window === "undefined") {
    return defaults;
  }
  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) {
      return defaults;
    }
    return { ...defaults, ...(JSON.parse(raw) as PanelState) };
  } catch {
    return defaults;
  }
}

export function savePanelState(state: PanelState): void {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(storageKey, JSON.stringify(state));
}
