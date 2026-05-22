"use client";

import { useSimulationStore, type AvatarMode } from "../state/simulationStore";

const avatarModes: Array<{ value: AvatarMode; label: string; description: string }> = [
  { value: "glyph", label: "Glyphs", description: "Template state symbols" },
  { value: "arrow", label: "Arrows", description: "Motion heading markers" },
  { value: "initials", label: "Initials", description: "Entity label initials" },
  { value: "head", label: "Heads", description: "Portrait-like markers" }
];

export function AvatarModeControl() {
  const avatarMode = useSimulationStore((state) => state.avatarMode);
  const setAvatarMode = useSimulationStore((state) => state.setAvatarMode);

  return (
    <fieldset className="avatar-mode-control">
      <legend>Agent Avatar</legend>
      <div className="avatar-mode-grid">
        {avatarModes.map((mode) => (
          <button
            key={mode.value}
            type="button"
            className={avatarMode === mode.value ? "is-active" : ""}
            aria-pressed={avatarMode === mode.value}
            onClick={() => setAvatarMode(mode.value)}
            suppressHydrationWarning
          >
            <strong>{mode.label}</strong>
            <span>{mode.description}</span>
          </button>
        ))}
      </div>
    </fieldset>
  );
}
