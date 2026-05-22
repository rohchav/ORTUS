import type { ParameterValues, SimulationEngineOptions, SimulationTemplate } from "../kernel/types";
import { SimulationEngine } from "../kernel/SimulationEngine";

export function createHarness(
  template: SimulationTemplate,
  options: SimulationEngineOptions & { parameters?: ParameterValues } = {}
): SimulationEngine {
  return new SimulationEngine(template, options);
}

export function runHeadless(template: SimulationTemplate, steps: number, options: SimulationEngineOptions = {}): SimulationEngine {
  const engine = new SimulationEngine(template, options);
  engine.runSteps(steps);
  return engine;
}
