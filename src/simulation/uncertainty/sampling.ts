import { RandomService, type RandomStream } from "../kernel/Random";
import { deepClone } from "../kernel/Validation";
import type { JsonValue, ParameterValues, SimulationRunConfig } from "../kernel/types";
import { validateRunConfig } from "../runs/runConfig";
import type { UncertaintyConfig, UncertaintyDistribution, UncertaintyVariable } from "./types";
import { validateSampledRunConfig, validateUncertaintyConfig } from "./validation";

export function generateUncertaintyRunConfigs(
  baseRunConfig: SimulationRunConfig,
  uncertaintyConfig: UncertaintyConfig
): SimulationRunConfig[] {
  const base = validateRunConfig(deepClone(baseRunConfig));
  const validation = validateUncertaintyConfig(uncertaintyConfig, base);
  const config = validation.config;
  const runsPerSample = config.runsPerSample ?? 1;
  const rng = new RandomService(`${base.seed}:uncertainty:${config.baseSeed}`);
  const enabledVariables = config.variables.filter((variable) => variable.enabled);
  const hasSeedVariable = enabledVariables.some((variable) => variable.target === "seed");
  const generated: SimulationRunConfig[] = [];

  for (let sampleIndex = 0; sampleIndex < config.sampleCount; sampleIndex += 1) {
    const sampledValues: Record<string, JsonValue> = {};
    const syncedTargetPaths: Record<string, JsonValue> = {};
    const sampledBase = cloneConcreteRunConfig(base);

    for (const variable of enabledVariables) {
      const stream = rng.fork(`sample:${sampleIndex}:variable:${variable.id}`);
      const value = sampleDistribution(variable.distribution, stream, sampleIndex);
      sampledValues[variable.id] = deepClone(value);
      const synced = applySampledValue(sampledBase, variable, value);
      if (synced.length > 0) {
        syncedTargetPaths[variable.id] = synced;
      }
    }

    for (let repeatIndex = 0; repeatIndex < runsPerSample; repeatIndex += 1) {
      const runConfig = cloneConcreteRunConfig(sampledBase);
      if (runsPerSample > 1) {
        runConfig.seed = hasSeedVariable
          ? `${runConfig.seed}:repeat-${repeatIndex + 1}`
          : `${base.seed}:uncertainty:${config.baseSeed}:sample-${sampleIndex + 1}:run-${repeatIndex + 1}`;
      }
      runConfig.metadata = {
        ...(runConfig.metadata ?? {}),
        uncertainty: {
          configId: config.id ?? null,
          configLabel: config.label ?? null,
          sampleIndex,
          repeatIndex,
          sampledValues,
          syncedTargetPaths
        }
      };
      generated.push(validateSampledRunConfig(runConfig));
    }
  }

  return generated;
}

function cloneConcreteRunConfig(base: SimulationRunConfig): SimulationRunConfig {
  const {
    uncertaintyConfig: _uncertaintyConfig,
    parameters,
    initializationOptions,
    agentComposition,
    environmentOptions,
    metadata,
    ...rest
  } = base;
  return {
    ...rest,
    parameters: deepClone(parameters),
    ...(initializationOptions ? { initializationOptions: deepClone(initializationOptions) } : {}),
    ...(agentComposition ? { agentComposition: deepClone(agentComposition) } : {}),
    ...(environmentOptions ? { environmentOptions: deepClone(environmentOptions) } : {}),
    metadata: deepClone(metadata ?? {})
  };
}

function sampleDistribution(distribution: UncertaintyDistribution, stream: RandomStream, sampleIndex: number): JsonValue {
  if (distribution.type === "fixed") {
    return deepClone(distribution.value);
  }
  if (distribution.type === "uniform") {
    return distribution.min + stream.float() * (distribution.max - distribution.min);
  }
  if (distribution.type === "integerRange") {
    return stream.int(distribution.min, distribution.max);
  }
  if (distribution.type === "categorical") {
    return deepClone(stream.choice(distribution.options));
  }
  return distribution.seeds[sampleIndex % distribution.seeds.length]!;
}

function applySampledValue(config: SimulationRunConfig, variable: UncertaintyVariable, value: JsonValue): string[] {
  if (variable.target === "seed") {
    config.seed = String(value);
    return [];
  }
  if (variable.target === "behaviorMode") {
    config.behaviorMode = String(value);
    return [];
  }
  const field = fieldFromTargetPath(variable);
  const synced: string[] = [];
  if (variable.target === "parameter") {
    config.parameters = withField(config.parameters, field, value);
    if (config.agentComposition && Object.prototype.hasOwnProperty.call(config.agentComposition, field)) {
      config.agentComposition = withField(config.agentComposition, field, value);
      synced.push(`agentComposition.${field}`);
    }
    if (config.environmentOptions && Object.prototype.hasOwnProperty.call(config.environmentOptions, field)) {
      config.environmentOptions = withField(config.environmentOptions, field, value);
      synced.push(`environmentOptions.${field}`);
    }
    if (config.initializationOptions && Object.prototype.hasOwnProperty.call(config.initializationOptions, field)) {
      config.initializationOptions = withField(config.initializationOptions, field, value);
      synced.push(`initializationOptions.${field}`);
    }
    return synced;
  }
  if (variable.target === "agentComposition") {
    config.agentComposition = withField(config.agentComposition ?? {}, field, value);
    return [];
  }
  if (variable.target === "environmentOptions") {
    config.environmentOptions = withField(config.environmentOptions ?? {}, field, value);
    return [];
  }
  config.initializationOptions = withField(config.initializationOptions ?? {}, field, value);
  return [];
}

function fieldFromTargetPath(variable: UncertaintyVariable): string {
  const prefix = variable.target === "parameter" ? "parameters." : `${variable.target}.`;
  return variable.targetPath.startsWith(prefix) ? variable.targetPath.slice(prefix.length) : variable.targetPath;
}

function withField(values: ParameterValues, field: string, value: JsonValue): ParameterValues {
  return {
    ...values,
    [field]: deepClone(value)
  };
}
