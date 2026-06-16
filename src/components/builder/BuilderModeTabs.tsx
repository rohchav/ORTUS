"use client";

import type { KeyboardEvent } from "react";

export const builderModes = [
  {
    id: "workspace",
    label: "Workspace Inspector",
    description: "Inspect read-only visual workspace descriptors."
  },
  {
    id: "authorSchema",
    label: "Author Schema",
    description: "Author structural model-schema artifacts through bounded forms."
  },
  {
    id: "graph",
    label: "Graph View",
    description: "Explore read-only structural relationships without execution."
  }
] as const;

export type BuilderModeId = (typeof builderModes)[number]["id"];

interface BuilderModeTabsProps {
  activeMode: BuilderModeId;
  onModeChange: (mode: BuilderModeId) => void;
}

export function BuilderModeTabs({ activeMode, onModeChange }: BuilderModeTabsProps) {
  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>, modeId: BuilderModeId) {
    const currentIndex = builderModes.findIndex((mode) => mode.id === modeId);
    const nextIndex =
      event.key === "ArrowRight" || event.key === "ArrowDown"
        ? (currentIndex + 1) % builderModes.length
        : event.key === "ArrowLeft" || event.key === "ArrowUp"
          ? (currentIndex - 1 + builderModes.length) % builderModes.length
          : event.key === "Home"
            ? 0
            : event.key === "End"
              ? builderModes.length - 1
              : null;

    if (nextIndex === null) {
      return;
    }
    event.preventDefault();
    const nextMode = builderModes[nextIndex]!;
    onModeChange(nextMode.id);
    focusBuilderMode(nextMode.id);
  }

  return (
    <nav className="builder-mode-tabs" aria-label="Builder modes" role="tablist">
      {builderModes.map((mode) => (
        <button
          key={mode.id}
          id={`builder-mode-tab-${mode.id}`}
          type="button"
          role="tab"
          aria-selected={mode.id === activeMode}
          aria-controls={`builder-mode-panel-${mode.id}`}
          tabIndex={mode.id === activeMode ? 0 : -1}
          className={mode.id === activeMode ? "is-active" : ""}
          onClick={() => onModeChange(mode.id)}
          onKeyDown={(event) => handleKeyDown(event, mode.id)}
          suppressHydrationWarning
        >
          <span>{mode.label}</span>
          <em>{mode.description}</em>
        </button>
      ))}
    </nav>
  );
}

function focusBuilderMode(modeId: BuilderModeId): void {
  if (typeof document === "undefined") {
    return;
  }
  window.requestAnimationFrame(() => {
    document.getElementById(`builder-mode-tab-${modeId}`)?.focus();
  });
}
