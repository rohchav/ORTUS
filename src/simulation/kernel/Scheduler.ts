import type { System, SystemContext, UpdateMode } from "./types";
import { schedulerPhases } from "./types";
import { SimulationError } from "./Errors";
import type { CommandBuffer } from "./CommandBuffer";
import type { SystemRegistry } from "./SystemRegistry";
import type { World } from "./World";
import type { SimulationRuntime } from "./SimulationRuntime";
import { assertWorldInvariants } from "./Invariants";

export interface SchedulerOptions {
  updateMode: UpdateMode;
  debug: boolean;
  createContext(system: System): SystemContext;
  commandBuffer: CommandBuffer;
  runtime: SimulationRuntime;
}

export class Scheduler {
  runTick(world: World, registry: SystemRegistry, options: SchedulerOptions): void {
    for (const phase of schedulerPhases) {
      for (const system of registry.byPhase(phase)) {
        const before = options.commandBuffer.count();
        try {
          system.update(options.createContext(system));
        } catch (error) {
          if (error instanceof SimulationError) {
            throw error;
          }
          throw new SimulationError(`System ${system.id} failed`, {
            tick: world.tick,
            phase,
            systemId: system.id,
            cause: error
          });
        }
        const produced = options.commandBuffer.count() - before;
        options.runtime.recordSystem(world.tick, phase, system.id, produced);
        if (options.updateMode === "immediate") {
          const applied = options.commandBuffer.apply(world);
          options.runtime.recordCommands(applied);
        }
      }
      if (options.updateMode === "staged") {
        const applied = options.commandBuffer.apply(world);
        options.runtime.recordCommands(applied);
      }
      if (options.debug) {
        assertWorldInvariants(world);
      }
    }
  }
}
