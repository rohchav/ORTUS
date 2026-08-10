"use client";

import { useEffect, useState } from "react";
import type {
  ImmersiveCameraMode,
  ImmersiveConceptId,
  ImmersiveGodHandTool,
  WorldSceneAdapter
} from "../../lib/immersiveWorld";
import { formatNumber } from "../../lib/format";
import { IconButton } from "../ui/IconButton";
import type { ImmersiveRuntimeView } from "./ImmersiveFlockingRuntime";

interface ImmersiveInspectorProps {
  adapter: WorldSceneAdapter;
  runtimeView: ImmersiveRuntimeView;
  concept: ImmersiveConceptId;
  cameraMode: ImmersiveCameraMode;
  activeTool: ImmersiveGodHandTool | "observe";
  lensActive: boolean;
  selectedEntityId: string | null;
  onSelectEntity: (entityId: string | null) => void;
  onCycleSelection: (direction: -1 | 1) => void;
  onFollowSelection: () => void;
  onSystemView: () => void;
}

export function ImmersiveInspector({
  adapter,
  runtimeView,
  concept,
  cameraMode,
  activeTool,
  lensActive,
  selectedEntityId,
  onSelectEntity,
  onCycleSelection,
  onFollowSelection,
  onSystemView
}: ImmersiveInspectorProps) {
  const entities = orderedEntities(adapter);
  const selected = adapter.getInspectableState(selectedEntityId);
  const [boidNumber, setBoidNumber] = useState(1);

  useEffect(() => {
    if (!selected) {
      return;
    }
    const index = entities.findIndex((entity) => entity.id === selected.entity.id);
    if (index >= 0) {
      setBoidNumber(index + 1);
    }
  }, [entities, selected]);

  function inspectNumber() {
    const entity = entities[Math.max(0, Math.min(entities.length - 1, Math.round(boidNumber) - 1))];
    onSelectEntity(entity?.id ?? null);
  }

  return (
    <aside className="immersive-inspector" aria-label="Selected boid inspector">
      <header className="immersive-inspector__header">
        <div>
          <span>Model state</span>
          <h2>{selected?.entity.label ?? "No boid selected"}</h2>
        </div>
        <div className="immersive-inspector__cycle">
          <IconButton label="Inspect previous boid" icon="←" onClick={() => onCycleSelection(-1)} />
          <IconButton label="Inspect next boid" icon="→" onClick={() => onCycleSelection(1)} />
        </div>
      </header>

      <form
        className="immersive-inspector__picker"
        onSubmit={(event) => {
          event.preventDefault();
          inspectNumber();
        }}
      >
        <label>
          <span>Boid number</span>
          <input
            type="number"
            min={1}
            max={entities.length}
            value={boidNumber}
            onChange={(event) => setBoidNumber(Number(event.target.value))}
          />
        </label>
        <button type="submit">Inspect</button>
      </form>

      {selected ? (
        <dl className="immersive-inspector__values">
          <div><dt>Position</dt><dd>{formatNumber(selected.entity.x, 2)}, {formatNumber(selected.entity.y, 2)}</dd></div>
          <div><dt>Heading</dt><dd>{formatNumber(selected.entity.headingDegrees, 1)} deg</dd></div>
          <div><dt>Speed</dt><dd>{formatNumber(selected.entity.speed, 3)} units/tick</dd></div>
          <div><dt>Last sensed</dt><dd>{selected.entity.neighborCount} neighbors</dd></div>
          <div><dt>Current radius</dt><dd>{selected.relationshipCount} inside {formatNumber(selected.perceptionRadius, 1)}</dd></div>
        </dl>
      ) : (
        <div className="immersive-inspector__empty" aria-live="polite">
          <span>Selection</span>
          <strong>None</strong>
        </div>
      )}

      <div className="immersive-inspector__actions">
        <button type="button" onClick={onFollowSelection} disabled={!selected}>Follow selected</button>
        <button type="button" onClick={onSystemView}>System view</button>
      </div>

      <section className="immersive-inspector__metric" aria-labelledby="immersive-alignment-title">
        <div>
          <span>Model output</span>
          <h3 id="immersive-alignment-title">Alignment</h3>
        </div>
        <strong>{runtimeView.alignment === null ? "Awaiting tick" : formatNumber(runtimeView.alignment, 3)}</strong>
        <p>Mean normalized heading magnitude, not measured animal coordination.</p>
      </section>

      <dl className="immersive-inspector__status" aria-label="Prototype state" aria-live="polite">
        <div><dt>Playback</dt><dd>{runtimeView.isRunning ? "Running" : "Paused"}</dd></div>
        <div><dt>Camera</dt><dd>{cameraModeLabel(cameraMode)}</dd></div>
        <div><dt>Tool</dt><dd>{toolLabel(concept, activeTool)}</dd></div>
        <div><dt>Lens</dt><dd>{lensActive ? "Alignment active" : "Off"}</dd></div>
      </dl>
    </aside>
  );
}

function orderedEntities(adapter: WorldSceneAdapter) {
  return [...adapter.getEntities()].sort((left, right) => entityNumber(left.label) - entityNumber(right.label) || left.id.localeCompare(right.id));
}

function entityNumber(label: string): number {
  const match = label.match(/(\d+)$/);
  return match ? Number(match[1]) : Number.MAX_SAFE_INTEGER;
}

function cameraModeLabel(mode: ImmersiveCameraMode): string {
  if (mode === "free") {
    return "Free pan";
  }
  return `${mode.slice(0, 1).toUpperCase()}${mode.slice(1)}`;
}

function toolLabel(concept: ImmersiveConceptId, tool: ImmersiveGodHandTool | "observe"): string {
  if (concept === "living-diorama") {
    return "Pan and inspect";
  }
  if (concept === "field-scientist") {
    return "Observe";
  }
  return `${tool.slice(0, 1).toUpperCase()}${tool.slice(1)}`;
}
