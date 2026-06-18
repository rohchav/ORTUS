"use client";

import { CornerFramePanel } from "./ui/CornerFramePanel";
import { formatNumber, jsonPreview, truncateId } from "../lib/format";
import { getEntityComponents, getGridCell, getPosition, getVelocity } from "../lib/templateVisuals";
import { NeuralNeuronStateComponent } from "../simulation/templates/neuralExcitation.template";
import { useSimulationStore } from "../state/simulationStore";

interface AgentInspectorProps {
  placement?: "floating" | "drawer";
}

export function AgentInspector({ placement = "floating" }: AgentInspectorProps) {
  const snapshot = useSimulationStore((state) => state.latestSnapshot);
  const selectedEntityId = useSimulationStore((state) => state.selectedEntityId);
  const selectEntity = useSimulationStore((state) => state.selectEntity);

  if (!snapshot || !selectedEntityId) {
    return null;
  }

  const entity = snapshot.entities.find((candidate) => candidate.id === selectedEntityId);
  const components = getEntityComponents(snapshot, selectedEntityId);
  const position = getPosition(snapshot, selectedEntityId);
  const gridCell = getGridCell(snapshot, selectedEntityId);
  const velocity = getVelocity(snapshot, selectedEntityId);
  const summaryRows = componentSummaryRows(components);

  return (
    <div className={`agent-inspector agent-inspector--${placement}`}>
      <CornerFramePanel
        title="Agent Inspector"
        eyebrow={truncateId(selectedEntityId)}
        variant="floating"
        actions={
          <button type="button" onClick={() => selectEntity(null)} suppressHydrationWarning>
            Close
          </button>
        }
      >
        {entity ? (
          <div className="inspector-grid">
            <div>
              <span>ID</span>
              <strong>{entity.id}</strong>
            </div>
            <div>
              <span>Archetype</span>
              <strong>{entity.archetype}</strong>
            </div>
            <div>
              <span>Status</span>
              <strong>{entity.alive ? "Alive" : `Destroyed @ ${entity.destroyedAtTick ?? "unknown"}`}</strong>
            </div>
            <div>
              <span>Tick</span>
              <strong>{snapshot.tick}</strong>
            </div>
            {position ? (
              <div>
                <span>Position</span>
                <strong>
                  {formatNumber(position.x, 2)}, {formatNumber(position.y, 2)}
                </strong>
              </div>
            ) : null}
            {velocity ? (
              <div>
                <span>Velocity</span>
                <strong>
                  {formatNumber(velocity.x, 2)}, {formatNumber(velocity.y, 2)}
                </strong>
              </div>
            ) : null}
            {gridCell ? (
              <div>
                <span>Grid cell</span>
                <strong>
                  {gridCell.row}, {gridCell.col}
                </strong>
              </div>
            ) : null}
            {summaryRows.map((row) => (
              <div key={row.label}>
                <span>{row.label}</span>
                <strong>{row.value}</strong>
              </div>
            ))}
          </div>
        ) : (
          <p className="microcopy">This entity no longer exists in the current snapshot.</p>
        )}
        <details className="component-details">
          <summary>Component payload</summary>
          <pre className="component-dump" aria-label="Selected agent component payload">
            {jsonPreview(components)}
          </pre>
        </details>
      </CornerFramePanel>
    </div>
  );
}

function componentSummaryRows(components: Record<string, unknown>): Array<{ label: string; value: string }> {
  const rows: Array<{ label: string; value: string }> = [];
  const infection = readRecord(components.InfectionState);
  const opinion = readRecord(components.OpinionState);
  const species = readRecord(components.Species);
  const energy = readRecord(components.Energy);
  const group = readRecord(components.GroupIdentity);
  const satisfaction = readRecord(components.SatisfactionState);
  const boid = readRecord(components.BoidState);
  const boidGroup = readRecord(components.BoidGroup);
  const neural = readRecord(components[NeuralNeuronStateComponent]);

  if (typeof infection?.status === "string") {
    rows.push({ label: "Infection", value: infection.status });
  }
  if (typeof infection?.infectedAtTick === "number") {
    rows.push({ label: "Infected at", value: formatNumber(infection.infectedAtTick, 0) });
  }
  if (typeof opinion?.value === "number") {
    rows.push({ label: "Opinion", value: formatNumber(opinion.value, 3) });
  }
  if (typeof opinion?.stubbornness === "number") {
    rows.push({ label: "Stubbornness", value: formatNumber(opinion.stubbornness, 3) });
  }
  if (typeof species?.kind === "string") {
    rows.push({ label: "Species", value: species.kind });
  }
  if (typeof energy?.value === "number") {
    rows.push({ label: "Energy", value: formatNumber(energy.value, 2) });
  }
  if (typeof group?.group === "string") {
    rows.push({ label: "Group", value: group.group });
  }
  if (typeof satisfaction?.satisfied === "boolean") {
    rows.push({ label: "Satisfied", value: satisfaction.satisfied ? "yes" : "no" });
  }
  if (typeof satisfaction?.similarNeighborRatio === "number") {
    rows.push({ label: "Similarity", value: formatNumber(satisfaction.similarNeighborRatio, 3) });
  }
  if (typeof satisfaction?.similarNeighbors === "number") {
    rows.push({ label: "Similar neighbors", value: formatNumber(satisfaction.similarNeighbors, 0) });
  }
  if (typeof satisfaction?.differentNeighbors === "number") {
    rows.push({ label: "Different neighbors", value: formatNumber(satisfaction.differentNeighbors, 0) });
  }
  if (typeof satisfaction?.totalOccupiedNeighbors === "number") {
    rows.push({ label: "Occupied neighbors", value: formatNumber(satisfaction.totalOccupiedNeighbors, 0) });
  }
  if (typeof boid?.speed === "number") {
    rows.push({ label: "Speed", value: formatNumber(boid.speed, 3) });
  }
  if (typeof boid?.neighborCount === "number") {
    rows.push({ label: "Neighbors", value: formatNumber(boid.neighborCount, 0) });
  }
  if (typeof boid?.localDensity === "number") {
    rows.push({ label: "Local density", value: formatNumber(boid.localDensity, 3) });
  }
  if (typeof boidGroup?.groupId === "string") {
    rows.push({ label: "Boid group", value: boidGroup.groupId });
  }
  if (typeof neural?.state === "string") {
    rows.push({ label: "Neural state", value: neural.state });
  }
  if (typeof neural?.activation === "number") {
    rows.push({ label: "Activation", value: formatNumber(neural.activation, 3) });
  }
  if (typeof neural?.threshold === "number") {
    rows.push({ label: "Threshold", value: formatNumber(neural.threshold, 3) });
  }
  if (typeof neural?.refractoryRemaining === "number") {
    rows.push({ label: "Refractory ticks", value: formatNumber(neural.refractoryRemaining, 0) });
  }
  if (typeof neural?.incomingExcitatory === "number") {
    rows.push({ label: "Incoming excitation", value: formatNumber(neural.incomingExcitatory, 3) });
  }
  if (typeof neural?.incomingInhibitory === "number") {
    rows.push({ label: "Incoming inhibition", value: formatNumber(neural.incomingInhibitory, 3) });
  }
  if (typeof neural?.groupId === "string") {
    rows.push({ label: "Neural cluster", value: neural.groupId });
  }

  return rows;
}

function readRecord(value: unknown): Record<string, unknown> | undefined {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : undefined;
}
