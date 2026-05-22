import type { ComponentValue, Entity, EntityId, JsonValue, ProductionTemplateId, SimulationSnapshotView, SimulationTemplate } from "../simulation";
import { productionTemplateMap } from "../simulation";
import { InfectionState, Position2D, Velocity2D } from "../simulation/templates/epidemic.template";
import { BoidGroup, BoidState } from "../simulation/templates/flocking.template";
import { ForestFireCellState } from "../simulation/templates/forestFire.template";
import { OpinionState } from "../simulation/templates/opinion.template";
import { Energy, Species } from "../simulation/templates/predatorPrey.template";
import { GroupIdentity, PositionGrid, SatisfactionState } from "../simulation/templates/schelling.template";

export type TemplateId = ProductionTemplateId;

export interface TemplateDescriptor {
  id: TemplateId;
  template: SimulationTemplate;
  shortName: string;
  atmosphere: "epidemic" | "opinion" | "predator-prey" | "schelling" | "flocking";
  accent: string;
}

export const templateDescriptors: TemplateDescriptor[] = [
  {
    id: "epidemic-spread",
    template: productionTemplateMap["epidemic-spread"],
    shortName: "Epidemic",
    atmosphere: "epidemic",
    accent: "#ff4a2e"
  },
  {
    id: "opinion-dynamics",
    template: productionTemplateMap["opinion-dynamics"],
    shortName: "Opinion",
    atmosphere: "opinion",
    accent: "#c34dff"
  },
  {
    id: "predator-prey",
    template: productionTemplateMap["predator-prey"],
    shortName: "Predator-Prey",
    atmosphere: "predator-prey",
    accent: "#b7ff3c"
  },
  {
    id: "schelling-segregation",
    template: productionTemplateMap["schelling-segregation"],
    shortName: "Schelling",
    atmosphere: "schelling",
    accent: "#f3f1e8"
  },
  {
    id: "flocking-boids",
    template: productionTemplateMap["flocking-boids"],
    shortName: "Flocking",
    atmosphere: "flocking",
    accent: "#d8ff3e"
  },
  {
    id: "forest-fire",
    template: productionTemplateMap["forest-fire"],
    shortName: "Forest Fire",
    atmosphere: "schelling",
    accent: "#ff5a24"
  }
];

export function getTemplateDescriptor(templateId: string): TemplateDescriptor {
  return templateDescriptors.find((descriptor) => descriptor.id === templateId) ?? templateDescriptors[0]!;
}

export function requireTemplateDescriptor(templateId: string): TemplateDescriptor {
  const descriptor = templateDescriptors.find((candidate) => candidate.id === templateId);
  if (!descriptor) {
    throw new Error(`Unknown simulation template "${templateId}". Available templates: ${templateDescriptors.map((candidate) => candidate.id).join(", ")}`);
  }
  return descriptor;
}

export function defaultParameters(template: SimulationTemplate): Record<string, JsonValue> {
  return Object.fromEntries(template.parameterDefinitions.map((definition) => [definition.key, definition.defaultValue]));
}

export function metricLabel(templateId: string, key: string): string {
  return metricLabels[templateId]?.[key] ?? humanizeKey(key);
}

export function metricNotes(templateId: string): Array<{ label: string; description: string }> {
  return metricDescriptionSets[templateId] ?? [];
}

export interface LegendEntry {
  label: string;
  description: string;
  color: string;
  glyph: string;
}

export function legendEntries(templateId: string): LegendEntry[] {
  return legendEntriesByTemplate[templateId] ?? legendEntriesByTemplate["predator-prey"] ?? [];
}

const metricLabels: Record<string, Record<string, string>> = {
  "epidemic-spread": {
    susceptibleCount: "Susceptible",
    infectedCount: "Infected",
    recoveredCount: "Recovered"
  },
  "opinion-dynamics": {
    averageOpinion: "Average opinion",
    opinionVariance: "Opinion variance",
    polarizationScore: "Polarization score"
  },
  "predator-prey": {
    preyCount: "Prey",
    predatorCount: "Predators"
  },
  "schelling-segregation": {
    satisfiedCount: "Satisfied",
    dissatisfiedCount: "Dissatisfied",
    satisfactionRate: "Satisfaction rate",
    averageSimilarity: "Average similarity",
    movedThisTick: "Moved this tick",
    groupACount: "Group A",
    groupBCount: "Group B",
    emptyCellCount: "Empty cells"
  },
  "flocking-boids": {
    averageSpeed: "Average speed",
    averageNeighborCount: "Average neighbors",
    averageLocalDensity: "Local density",
    alignmentScore: "Alignment score",
    dispersion: "Dispersion",
    interGroupDistance: "Inter-group distance",
    agentCount: "Boids"
  },
  "forest-fire": {
    fuelFraction: "Fuel",
    burningFraction: "Burning",
    burnedFraction: "Burned",
    emptyFraction: "Empty",
    activeFireCount: "Active fires",
    burnedTotalCount: "Burned cells",
    newIgnitions: "New ignitions",
    spreadRate: "Spread rate",
    extinguished: "Extinguished"
  }
};

const legendEntriesByTemplate: Record<string, LegendEntry[]> = {
  "epidemic-spread": [
    { label: "Susceptible", description: "Can be infected by local contact", color: "#e6e2d8", glyph: "S" },
    { label: "Infected", description: "Can transmit and has recovery event", color: "#ff4a2e", glyph: "I" },
    { label: "Recovered", description: "Immune in V1", color: "#b7ff3c", glyph: "R" }
  ],
  "opinion-dynamics": [
    { label: "Negative", description: "Opinion value below zero", color: "#6c72ff", glyph: "−" },
    { label: "Neutral", description: "Opinion near center", color: "#a8aaa3", glyph: "0" },
    { label: "Positive", description: "Opinion value above zero", color: "#d8ff3e", glyph: "+" }
  ],
  "predator-prey": [
    { label: "Prey", description: "Reproduces stochastically", color: "#b7ff3c", glyph: "Y" },
    { label: "Predator", description: "Consumes nearby prey and spends energy", color: "#ff4a2e", glyph: "P" }
  ],
  "schelling-segregation": [
    { label: "Group A", description: "Occupied cell assigned to Group A", color: "#d8ff3e", glyph: "A" },
    { label: "Group B", description: "Occupied cell assigned to Group B", color: "#6c72ff", glyph: "B" },
    { label: "Empty", description: "Open destination cell", color: "#161a1b", glyph: "□" },
    { label: "Dissatisfied", description: "Bright outline marks agents below threshold", color: "#f3f1e8", glyph: "!" }
  ],
  "flocking-boids": [
    { label: "Boid", description: "Directional mark for an individual agent", color: "#e8efe0", glyph: "›" },
    { label: "Group-aware", description: "Acid/cobalt/magenta fills mark initialized boid groups", color: "#d8ff3e", glyph: "G" },
    { label: "Heading", description: "Arrow points along current velocity", color: "#d8ff3e", glyph: "→" },
    { label: "Selected", description: "Crosshair ring marks inspected boid", color: "#f3f1e8", glyph: "◎" },
    { label: "Sparse", description: "Darker stroke means few sensed neighbors", color: "#8b8f89", glyph: "·" }
  ],
  "forest-fire": [
    { label: "Empty", description: "Cell without fuel", color: "#25221b", glyph: "·" },
    { label: "Fuel", description: "Cell containing fuel", color: "#6f8f3d", glyph: "F" },
    { label: "Burning", description: "Cell currently burning", color: "#ff5a24", glyph: "B" },
    { label: "Burned", description: "Cell that burned out", color: "#4a4540", glyph: "X" }
  ]
};

const metricDescriptionSets: Record<string, Array<{ label: string; description: string }>> = {
  "epidemic-spread": [
    { label: "Susceptible", description: "Agents still able to become infected." },
    { label: "Infected", description: "Agents currently able to transmit through local contact." },
    { label: "Recovered", description: "Agents that passed through infection and are immune in V1." }
  ],
  "opinion-dynamics": [
    { label: "Average opinion", description: "Mean opinion across living agents, from negative to positive." },
    { label: "Opinion variance", description: "Spread of opinions around the average." },
    { label: "Polarization score", description: "Mean absolute opinion magnitude; higher values indicate stronger separation from neutral." }
  ],
  "predator-prey": [
    { label: "Prey", description: "Living prey agents." },
    { label: "Predators", description: "Living predator agents with energy above zero." }
  ],
  "schelling-segregation": [
    { label: "Satisfied", description: "Agents whose local neighborhood meets the similarity threshold." },
    { label: "Dissatisfied", description: "Agents below the threshold and eligible to move." },
    { label: "Average similarity", description: "Mean fraction of similar occupied neighbors across agents." },
    { label: "Moved this tick", description: "Dissatisfied agents moved to empty cells during the last tick." }
  ],
  "flocking-boids": [
    { label: "Average speed", description: "Mean velocity magnitude across living boids." },
    { label: "Average neighbors", description: "Mean number of boids sensed within perception radius." },
    { label: "Alignment score", description: "Magnitude of the mean normalized heading vector." },
    { label: "Inter-group distance", description: "Mean distance between initialized group centers in group-aware runs." },
    { label: "Dispersion", description: "Mean distance from the flock center of mass." }
  ],
  "forest-fire": [
    { label: "Fuel fraction", description: "Share of cells that currently contain fuel." },
    { label: "Active fires", description: "Cells currently burning." },
    { label: "New ignitions", description: "Fuel cells newly ignited during the last tick." },
    { label: "Spread rate", description: "New ignitions divided by previous active burning cells." },
    { label: "Extinguished", description: "1 when no cells are burning." }
  ]
};

export interface RenderAgent {
  id: EntityId;
  entity: Entity;
  x: number;
  y: number;
  radius: number;
  fill: string;
  stroke: string;
  glyph: string;
  label: string;
  intensity: number;
  shape?: "circle" | "directional";
}

export interface RenderGridAgent {
  id: EntityId;
  entity: Entity;
  row: number;
  col: number;
  fill: string;
  stroke: string;
  glyph: string;
  label: string;
  intensity: number;
  satisfied: boolean;
}

export interface GridRenderModel {
  rows: number;
  cols: number;
  agents: RenderGridAgent[];
}

export function getContinuousWorld(snapshot: SimulationSnapshotView): { width: number; height: number } {
  const space = snapshot.spaces.find((candidate) => candidate.kind === "continuous2d");
  if (space?.kind === "continuous2d") {
    return { width: space.width, height: space.height };
  }
  return { width: 100, height: 100 };
}

export function renderAgents(snapshot: SimulationSnapshotView): RenderAgent[] {
  const space = snapshot.spaces.find((candidate) => candidate.kind === "continuous2d");
  if (space?.kind !== "continuous2d") {
    return [];
  }

  const entitiesById = new Map(snapshot.entities.map((entity) => [entity.id, entity]));
  const descriptor = getTemplateDescriptor(snapshot.templateId);

  return Object.entries(space.positions)
    .map(([id, position]) => {
      const entity = entitiesById.get(id);
      if (!entity || !entity.alive) {
        return undefined;
      }
      return buildAgent(descriptor, snapshot, entity, position.x, position.y);
    })
    .filter((agent): agent is RenderAgent => agent !== undefined)
    .sort((left, right) => left.id.localeCompare(right.id));
}

export function renderGrid(snapshot: SimulationSnapshotView): GridRenderModel | undefined {
  const space = snapshot.spaces.find((candidate) => candidate.kind === "grid2d");
  if (space?.kind !== "grid2d") {
    return undefined;
  }

  const entitiesById = new Map(snapshot.entities.map((entity) => [entity.id, entity]));
  const descriptor = getTemplateDescriptor(snapshot.templateId);
  const agents = Object.entries(space.cells)
    .map(([id, cell]) => {
      const entity = entitiesById.get(id);
      if (!entity || !entity.alive) {
        return undefined;
      }
      return buildGridAgent(descriptor, snapshot, entity, cell.row, cell.col);
    })
    .filter((agent): agent is RenderGridAgent => agent !== undefined)
    .sort((left, right) => left.row - right.row || left.col - right.col || left.id.localeCompare(right.id));

  return { rows: space.rows, cols: space.cols, agents };
}

export function componentForEntity<T = ComponentValue>(
  snapshot: SimulationSnapshotView,
  entityId: EntityId,
  componentType: string
): T | undefined {
  return snapshot.components[componentType]?.[entityId] as T | undefined;
}

export function getEntityComponents(snapshot: SimulationSnapshotView, entityId: EntityId): Record<string, ComponentValue> {
  const components: Record<string, ComponentValue> = {};
  for (const [componentType, bucket] of Object.entries(snapshot.components)) {
    const value = bucket[entityId];
    if (value) {
      components[componentType] = value;
    }
  }
  return components;
}

export function getPosition(snapshot: SimulationSnapshotView, entityId: EntityId): { x: number; y: number } | undefined {
  const space = snapshot.spaces.find((candidate) => candidate.kind === "continuous2d");
  if (space?.kind === "continuous2d") {
    return space.positions[entityId];
  }
  return componentForEntity(snapshot, entityId, Position2D);
}

export function getGridCell(snapshot: SimulationSnapshotView, entityId: EntityId): { row: number; col: number } | undefined {
  const space = snapshot.spaces.find((candidate) => candidate.kind === "grid2d");
  if (space?.kind === "grid2d") {
    return space.cells[entityId];
  }
  return componentForEntity(snapshot, entityId, PositionGrid);
}

export function getVelocity(snapshot: SimulationSnapshotView, entityId: EntityId): { x: number; y: number } | undefined {
  return componentForEntity(snapshot, entityId, Velocity2D);
}

function buildAgent(
  descriptor: TemplateDescriptor,
  snapshot: SimulationSnapshotView,
  entity: Entity,
  x: number,
  y: number
): RenderAgent {
  if (descriptor.id === "epidemic-spread") {
    const state = componentForEntity<{ status?: string }>(snapshot, entity.id, InfectionState);
    if (state?.status === "infected") {
      return { id: entity.id, entity, x, y, radius: 3.9, fill: "#ff4a2e", stroke: "#f3f1e8", glyph: "I", label: "Infected", intensity: 1 };
    }
    if (state?.status === "recovered") {
      return { id: entity.id, entity, x, y, radius: 3.2, fill: "#b7ff3c", stroke: "#f3f1e8", glyph: "R", label: "Recovered", intensity: 0.72 };
    }
    return { id: entity.id, entity, x, y, radius: 3.1, fill: "#e6e2d8", stroke: "#f3f1e8", glyph: "S", label: "Susceptible", intensity: 0.68 };
  }

  if (descriptor.id === "opinion-dynamics") {
    const state = componentForEntity<{ value?: number }>(snapshot, entity.id, OpinionState);
    const value = typeof state?.value === "number" ? state.value : 0;
    const fill = opinionColor(value);
    return {
      id: entity.id,
      entity,
      x,
      y,
      radius: 3.4 + Math.abs(value) * 1.2,
      fill,
      stroke: value < 0 ? "#c9cbff" : "#f3f1e8",
      glyph: value < -0.2 ? "−" : value > 0.2 ? "+" : "0",
      label: "Opinion",
      intensity: 0.6 + Math.abs(value) * 0.4
    };
  }

  if (descriptor.id === "flocking-boids") {
    const state = componentForEntity<{ speed?: number; neighborCount?: number }>(snapshot, entity.id, BoidState);
    const group = componentForEntity<{ groupId?: string }>(snapshot, entity.id, BoidGroup);
    const speed = typeof state?.speed === "number" ? Math.max(0, state.speed) : 0;
    const neighborCount = typeof state?.neighborCount === "number" ? Math.max(0, state.neighborCount) : 0;
    const groupStyle = flockingGroupStyle(group?.groupId);
    return {
      id: entity.id,
      entity,
      x,
      y,
      radius: 3.8 + Math.min(1.5, speed / 4),
      fill: groupStyle.fill,
      stroke: neighborCount > 0 ? "#d8ff3e" : "#8b8f89",
      glyph: groupStyle.glyph,
      label: groupStyle.label,
      intensity: 0.68 + Math.min(0.32, neighborCount / 16),
      shape: "directional"
    };
  }

  const species = componentForEntity<{ kind?: string }>(snapshot, entity.id, Species);
  const energy = componentForEntity<{ value?: number }>(snapshot, entity.id, Energy);
  if (species?.kind === "predator") {
    const energyValue = typeof energy?.value === "number" ? energy.value : 0;
    return {
      id: entity.id,
      entity,
      x,
      y,
      radius: 4.6 + Math.min(2, energyValue / 12),
      fill: "#ff4a2e",
      stroke: "#f3f1e8",
      glyph: "P",
      label: "Predator",
      intensity: 0.95
    };
  }
  return { id: entity.id, entity, x, y, radius: 3.1, fill: "#b7ff3c", stroke: "#f3f1e8", glyph: "Y", label: "Prey", intensity: 0.7 };
}

function buildGridAgent(
  descriptor: TemplateDescriptor,
  snapshot: SimulationSnapshotView,
  entity: Entity,
  row: number,
  col: number
): RenderGridAgent {
  if (descriptor.id === "schelling-segregation") {
    const group = componentForEntity<{ group?: string }>(snapshot, entity.id, GroupIdentity);
    const satisfaction = componentForEntity<{ satisfied?: boolean }>(snapshot, entity.id, SatisfactionState);
    const groupA = group?.group === "A";
    const satisfied = satisfaction?.satisfied !== false;
    return {
      id: entity.id,
      entity,
      row,
      col,
      fill: groupA ? "#d8ff3e" : "#6c72ff",
      stroke: satisfied ? "#f3f1e8" : "#ff4a2e",
      glyph: groupA ? "A" : "B",
      label: groupA ? "Group A" : "Group B",
      intensity: satisfied ? 0.72 : 1,
      satisfied
    };
  }
  if (descriptor.id === "forest-fire") {
    const state = componentForEntity<{ state?: string }>(snapshot, entity.id, ForestFireCellState)?.state;
    const style = forestFireCellStyle(state);
    return {
      id: entity.id,
      entity,
      row,
      col,
      fill: style.fill,
      stroke: style.stroke,
      glyph: style.glyph,
      label: style.label,
      intensity: style.intensity,
      satisfied: true
    };
  }
  return {
    id: entity.id,
    entity,
    row,
    col,
    fill: "#e8efe0",
    stroke: "#f1e6cf",
    glyph: entity.archetype.slice(0, 1).toUpperCase() || "A",
    label: entity.archetype,
    intensity: 0.75,
    satisfied: true
  };
}

function forestFireCellStyle(state: string | undefined): { fill: string; stroke: string; glyph: string; label: string; intensity: number } {
  if (state === "fuel") {
    return { fill: "#6f8f3d", stroke: "#a9c466", glyph: "F", label: "Fuel", intensity: 0.72 };
  }
  if (state === "burning") {
    return { fill: "#ff5a24", stroke: "#ffd37a", glyph: "B", label: "Burning", intensity: 1 };
  }
  if (state === "burned") {
    return { fill: "#4a4540", stroke: "#77706a", glyph: "X", label: "Burned", intensity: 0.62 };
  }
  return { fill: "#25221b", stroke: "#3a352b", glyph: "·", label: "Empty", intensity: 0.45 };
}

function opinionColor(value: number): string {
  const clamped = Math.max(-1, Math.min(1, value));
  if (clamped < -0.2) {
    return "#6c72ff";
  }
  if (clamped > 0.2) {
    return "#d8ff3e";
  }
  return "#a8aaa3";
}

function flockingGroupStyle(groupId: string | undefined): { fill: string; glyph: string; label: string } {
  if (groupId === "group-1") {
    return { fill: "#d8ff3e", glyph: "1", label: "Boid group 1" };
  }
  if (groupId === "group-2") {
    return { fill: "#6c72ff", glyph: "2", label: "Boid group 2" };
  }
  if (groupId === "group-3") {
    return { fill: "#ff4a2e", glyph: "3", label: "Boid group 3" };
  }
  if (groupId === "group-4") {
    return { fill: "#c34dff", glyph: "4", label: "Boid group 4" };
  }
  return { fill: "#e8efe0", glyph: "›", label: "Boid" };
}

function humanizeKey(key: string): string {
  return key.replace(/([A-Z])/g, " $1").replace(/^./, (value) => value.toUpperCase());
}
