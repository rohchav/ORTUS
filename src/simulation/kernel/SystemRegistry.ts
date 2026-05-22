import type { System } from "./types";
import { schedulerPhases } from "./types";
import { SimulationTemplateError } from "./Errors";

export class SystemRegistry {
  private readonly systems = new Map<string, System>();

  register(system: System): void {
    if (this.systems.has(system.id)) {
      throw new SimulationTemplateError(`Duplicate system id: ${system.id}`, {
        systemId: system.id,
        phase: system.phase
      });
    }
    if (!schedulerPhases.includes(system.phase)) {
      throw new SimulationTemplateError(`Invalid system phase: ${system.phase}`, { systemId: system.id });
    }
    this.systems.set(system.id, { ...system, query: system.query ? [...system.query] : undefined });
  }

  all(): System[] {
    return [...this.systems.values()].sort(compareSystems);
  }

  byPhase(phase: System["phase"]): System[] {
    return this.all().filter((system) => system.phase === phase);
  }

  get(systemId: string): System | undefined {
    return this.systems.get(systemId);
  }
}

export function compareSystems(left: System, right: System): number {
  const phaseDelta = schedulerPhases.indexOf(left.phase) - schedulerPhases.indexOf(right.phase);
  return phaseDelta || left.priority - right.priority || left.id.localeCompare(right.id);
}
