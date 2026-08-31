import { z } from "zod";
import {
  agentCompositionDefinitionsForTemplate,
  behaviorModesForTemplate,
  createGenericResetRunConfig,
  environmentOptionDefinitionsForTemplate,
  findInitializationPreset,
  getProductionTemplate,
  initializationPresetsForTemplate,
  runConfigFromScenario,
  validateRunConfig,
  validateScenario,
  type AuthoredScenario,
  type JsonValue,
  type ParameterValues,
  type SimulationRunConfig
} from "../../simulation";
import {
  createStarterWorldScenario,
  resolveStarterWorldLaunch,
  starterWorldLaunchSchema,
  type StarterWorldLaunch
} from "./launch";
import { getStarterWorldPackForWorld } from "./packs";
import { getStarterWorldById } from "./registry";
import type { StarterWorldDefinition } from "./types";
import { assertSafeStarterWorldValue, validateRuntimeReferences } from "./validation";

export const starterRemixMetadataKey = "ortusStarterRemixV1" as const;
export const starterRemixSchemaVersion = "1" as const;

const idSchema = z.string().trim().min(2).max(160).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
const runtimeKeySchema = z.string().trim().min(1).max(120).regex(/^[A-Za-z][A-Za-z0-9]*(?:[-_.][A-Za-z0-9]+)*$/);
const primitiveValueSchema = z.union([z.string().max(240), z.number().finite(), z.boolean()]);
const boundedValuesSchema = z.record(primitiveValueSchema).superRefine((values, context) => {
  if (Object.keys(values).length > 64) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Remix configuration groups may contain at most 64 values."
    });
  }
});

const starterRemixRequestSchema = z
  .object({
    starterId: idSchema,
    recipeId: idSchema.optional(),
    entry: z.enum(["starter", "world"]).optional(),
    focusParameterId: runtimeKeySchema.optional()
  })
  .strict();

const starterRemixSourceConfigurationSchema = z
  .object({
    schemaVersion: z.literal("1"),
    templateId: idSchema,
    seed: z.string().trim().min(1).max(240),
    parameters: boundedValuesSchema,
    initializationPreset: idSchema,
    initializationOptions: boundedValuesSchema,
    behaviorMode: idSchema,
    agentComposition: boundedValuesSchema,
    environmentOptions: boundedValuesSchema
  })
  .strict();

export const starterRemixLineageSchema = z
  .object({
    kind: z.literal("ortus-starter-remix"),
    schemaVersion: z.literal(starterRemixSchemaVersion),
    draftId: idSchema,
    status: z.literal("unsaved"),
    entry: z.enum(["starter", "world"]),
    createdAt: z.string().datetime(),
    source: z
      .object({
        starterWorldId: idSchema,
        starterWorldVersion: z.literal("1"),
        starterWorldSlug: idSchema,
        recipeId: idSchema.optional(),
        collectionId: idSchema.optional(),
        collectionVersion: z.literal("1").optional(),
        templateId: idSchema,
        templateVersion: z.string().trim().min(1).max(120),
        scenarioId: z.string().trim().min(1).max(240),
        scenarioName: z.string().trim().min(1).max(120),
        configuration: starterRemixSourceConfigurationSchema
      })
      .strict(),
    parentScenarioId: z.string().trim().min(1).max(240).optional()
  })
  .strict();

export type StarterRemixLineage = z.infer<typeof starterRemixLineageSchema>;
export type StarterRemixEntry = StarterRemixLineage["entry"];
export type StarterRemixCoverageCategory = "A" | "B" | "C";

const activeWorldHandoffSourceSchema = z
  .object({
    starterWorldId: idSchema,
    starterWorldVersion: z.literal("1"),
    recipeId: idSchema.optional(),
    templateId: idSchema
  })
  .strict();

interface StarterRemixActiveWorldHandoff {
  source: z.infer<typeof activeWorldHandoffSourceSchema>;
  runConfig: SimulationRunConfig;
}

let pendingActiveWorldHandoff: StarterRemixActiveWorldHandoff | null = null;

export interface StarterRemixEligibility {
  category: StarterRemixCoverageCategory;
  eligible: boolean;
  editableParameterCount: number;
  editableVariantCount: number;
  explanation: string;
}

export interface StarterRemixSource {
  launch: StarterWorldLaunch;
  sourceScenario: AuthoredScenario;
  draft: AuthoredScenario;
  lineage: StarterRemixLineage;
  eligibility: StarterRemixEligibility;
  focusParameterId?: string;
  entry: StarterRemixEntry;
}

export type ResolveStarterRemixResult =
  | { ok: true; source: StarterRemixSource }
  | {
      ok: false;
      code:
        | "invalid-request"
        | "unknown-source"
        | "source-not-runnable"
        | "source-mismatch"
        | "unsupported-focus"
        | "not-remixable";
      message: string;
    };

export const starterRemixWorldLaunchSchema = z
  .object({
    draftId: idSchema,
    starterWorldId: idSchema,
    starterWorldVersion: z.literal("1"),
    recipeId: idSchema.optional(),
    templateId: idSchema,
    task: z.enum(["setup", "observe", "intervene", "compare", "understand", "experiment", "debug"]),
    sourceLaunch: starterWorldLaunchSchema,
    href: z.string().startsWith("/world?")
  })
  .strict();

export type StarterRemixWorldLaunch = z.infer<typeof starterRemixWorldLaunchSchema>;

export function classifyStarterRemixEligibility(world: StarterWorldDefinition): StarterRemixEligibility {
  if (world.runtimeStatus !== "runnable" || !world.runtime) {
    return {
      category: "C",
      eligible: false,
      editableParameterCount: 0,
      editableVariantCount: 0,
      explanation: "This Starter World has no approved runtime configuration to fork."
    };
  }
  if (validateRuntimeReferences(world).length > 0) {
    return {
      category: "C",
      eligible: false,
      editableParameterCount: 0,
      editableVariantCount: 0,
      explanation: "The Starter World no longer matches the authoritative runtime contracts."
    };
  }
  const template = getProductionTemplate(world.runtime.templateId);
  if (!template) {
    return {
      category: "C",
      eligible: false,
      editableParameterCount: 0,
      editableVariantCount: 0,
      explanation: "The Starter World runtime template is unavailable."
    };
  }
  const editableParameterCount = template.parameterDefinitions.length;
  const editableVariantCount =
    Math.max(0, behaviorModesForTemplate(template).length - 1) +
    Math.max(0, initializationPresetsForTemplate(template).length - 1) +
    agentCompositionDefinitionsForTemplate(template).length +
    environmentOptionDefinitionsForTemplate(template).length +
    initializationPresetsForTemplate(template).reduce(
      (count, preset) => count + (preset.optionDefinitions?.length ?? 0),
      0
    );
  if (editableParameterCount === 0 && editableVariantCount === 0) {
    return {
      category: "C",
      eligible: false,
      editableParameterCount,
      editableVariantCount,
      explanation: "The current template exposes no validated executable configuration fields."
    };
  }
  return {
    category: editableParameterCount > 0 ? "A" : "B",
    eligible: true,
    editableParameterCount,
    editableVariantCount,
    explanation: editableParameterCount > 0
      ? "The source can be forked through its existing validated scenario and template configuration."
      : "The source can be forked through bounded template variants, but it has no general parameter surface."
  };
}

export function resolveStarterRemixRequest(
  input: unknown,
  options: { now?: string } = {}
): ResolveStarterRemixResult {
  try {
    assertSafeStarterWorldValue(input);
  } catch {
    return remixFailure("invalid-request", "The remix request contains unsupported data.");
  }
  const parsed = starterRemixRequestSchema.safeParse(input);
  if (!parsed.success) {
    return remixFailure("invalid-request", "The remix request is malformed.");
  }
  const launchResult = resolveStarterWorldLaunch({
    starterId: parsed.data.starterId,
    ...(parsed.data.recipeId ? { recipeId: parsed.data.recipeId } : {})
  });
  if (!launchResult.ok) {
    const code = launchResult.code === "unknown-starter"
      ? "unknown-source"
      : launchResult.code === "not-runnable"
        ? "source-not-runnable"
        : "source-mismatch";
    return remixFailure(code, launchResult.message);
  }
  const world = getStarterWorldById(launchResult.launch.starterWorldId);
  if (!world) {
    return remixFailure("unknown-source", "That Starter World is not available.");
  }
  const eligibility = classifyStarterRemixEligibility(world);
  if (!eligibility.eligible) {
    return remixFailure("not-remixable", eligibility.explanation);
  }
  const template = getProductionTemplate(launchResult.launch.templateId);
  if (!template) {
    return remixFailure("source-mismatch", "The Starter World runtime template is unavailable.");
  }
  if (
    parsed.data.focusParameterId &&
    !template.parameterDefinitions.some((definition) => definition.key === parsed.data.focusParameterId)
  ) {
    return remixFailure("unsupported-focus", "That question does not map to an editable parameter for this Starter World.");
  }

  try {
    const sourceScenario = createStarterWorldScenario(launchResult.launch);
    const now = options.now ?? new Date().toISOString();
    const entry = parsed.data.entry ?? "starter";
    const draft = createStarterRemixDraft({
      launch: launchResult.launch,
      sourceScenario,
      entry,
      now
    });
    const lineage = requireStarterRemixLineage(draft.metadata);
    return {
      ok: true,
      source: {
        launch: launchResult.launch,
        sourceScenario,
        draft,
        lineage,
        eligibility,
        ...(parsed.data.focusParameterId ? { focusParameterId: parsed.data.focusParameterId } : {}),
        entry
      }
    };
  } catch {
    return remixFailure("source-mismatch", "The Starter World could not be converted into a validated derivative draft.");
  }
}

export function createStarterRemixDraft(input: {
  launch: StarterWorldLaunch;
  sourceScenario: AuthoredScenario;
  entry: StarterRemixEntry;
  now: string;
  initialRunConfig?: SimulationRunConfig;
  draftId?: string;
  parentScenarioId?: string;
}): AuthoredScenario {
  const sourceScenario = validateScenario(input.sourceScenario).scenario;
  const sourceConfig = runConfigFromScenario(sourceScenario);
  if (
    input.launch.starterWorldId !== sourceScenario.metadata.starterWorldId ||
    input.launch.templateId !== sourceScenario.templateId ||
    input.launch.recipeId !== metadataString(sourceScenario.metadata.starterWorldRecipeId)
  ) {
    throw new Error("Starter remix source scenario does not match its launch identity.");
  }
  const world = getStarterWorldById(input.launch.starterWorldId);
  const template = getProductionTemplate(input.launch.templateId);
  if (!world || !template) {
    throw new Error("Starter remix source is unavailable.");
  }
  const initialConfig = input.initialRunConfig ? validateRunConfig(input.initialRunConfig, template) : sourceConfig;
  const initializationPreset = initialConfig.initializationPreset ?? sourceConfig.initializationPreset;
  if (!initializationPreset || !findInitializationPreset(template, initializationPreset)) {
    throw new Error("Starter remix source has no supported initialization preset.");
  }
  const draftId = input.draftId ?? createStarterRemixDraftId(world.id, input.launch.recipeId, input.now);
  const pack = getStarterWorldPackForWorld(world.id);
  const lineage = starterRemixLineageSchema.parse({
    kind: "ortus-starter-remix",
    schemaVersion: starterRemixSchemaVersion,
    draftId,
    status: "unsaved",
    entry: input.entry,
    createdAt: input.now,
    source: {
      starterWorldId: world.id,
      starterWorldVersion: world.version,
      starterWorldSlug: world.slug,
      ...(input.launch.recipeId ? { recipeId: input.launch.recipeId } : {}),
      ...(pack ? { collectionId: pack.id, collectionVersion: pack.version } : {}),
      templateId: template.id,
      templateVersion: template.version,
      scenarioId: sourceScenario.scenarioId,
      scenarioName: sourceScenario.name,
      configuration: sourceConfigurationFromRunConfig(sourceConfig)
    },
    ...(input.parentScenarioId ? { parentScenarioId: input.parentScenarioId } : {})
  });
  return validateScenario({
    ...sourceScenario,
    scenarioId: draftId,
    name: `Unsaved remix of ${sourceScenario.name}`.slice(0, 120),
    description: `Page-session derivative of ${world.title}. It uses only this template's validated executable configuration fields.`,
    tags: [...new Set([...sourceScenario.tags, "remix"])].slice(0, 12),
    seed: initialConfig.seed,
    parameters: initialConfig.parameters,
    initializationPreset,
    initializationOptions: initialConfig.initializationOptions ?? sourceConfig.initializationOptions ?? {},
    behaviorMode: initialConfig.behaviorMode ?? sourceConfig.behaviorMode ?? "default",
    agentComposition: initialConfig.agentComposition ?? sourceConfig.agentComposition ?? {},
    environmentOptions: initialConfig.environmentOptions ?? sourceConfig.environmentOptions ?? {},
    metadata: {
      [starterRemixMetadataKey]: lineage as unknown as JsonValue
    },
    createdAt: input.now,
    updatedAt: input.now
  }, template).scenario;
}

export function createStarterRemixDraftFromActiveRun(
  source: StarterRemixSource,
  acceptedRunConfig: SimulationRunConfig
): AuthoredScenario {
  const accepted = validateRunConfig(acceptedRunConfig);
  if (!starterSourceMatchesMetadata(accepted.metadata, source.launch)) {
    throw new Error("The active run no longer carries the requested Starter World lineage.");
  }
  return createStarterRemixDraft({
    launch: source.launch,
    sourceScenario: source.sourceScenario,
    entry: "world",
    now: source.draft.createdAt,
    initialRunConfig: accepted,
    draftId: source.draft.scenarioId,
    ...(accepted.scenarioId ? { parentScenarioId: accepted.scenarioId } : {})
  });
}

export function prepareStarterRemixActiveWorldHandoff(
  launch: StarterWorldLaunch,
  acceptedRunConfig: SimulationRunConfig
): void {
  const source = activeWorldHandoffSourceSchema.parse({
    starterWorldId: launch.starterWorldId,
    starterWorldVersion: launch.starterWorldVersion,
    ...(launch.recipeId ? { recipeId: launch.recipeId } : {}),
    templateId: launch.templateId
  });
  const runConfig = validateRunConfig(acceptedRunConfig);
  if (runConfig.templateId !== source.templateId) {
    throw new Error("The accepted active run does not match the Starter template.");
  }
  pendingActiveWorldHandoff = { source, runConfig };
}

export function consumeStarterRemixActiveWorldHandoff(source: StarterRemixSource): AuthoredScenario | null {
  const handoff = pendingActiveWorldHandoff;
  pendingActiveWorldHandoff = null;
  if (!handoff || !sameActiveWorldHandoffSource(handoff.source, source.launch)) {
    return null;
  }
  const matchedConfig = validateRunConfig({
    ...handoff.runConfig,
    metadata: {
      starterWorldId: source.launch.starterWorldId,
      starterWorldVersion: source.launch.starterWorldVersion,
      ...(source.launch.recipeId ? { starterWorldRecipeId: source.launch.recipeId } : {})
    }
  });
  return createStarterRemixDraftFromActiveRun(source, matchedConfig);
}

export function starterRemixWorkshopHref(
  starterWorldId: string,
  options: { recipeId?: string; entry?: StarterRemixEntry; focusParameterId?: string } = {}
): string {
  const query = new URLSearchParams();
  query.set("starter", starterWorldId);
  if (options.recipeId) {
    query.set("recipe", options.recipeId);
  }
  if (options.entry === "world") {
    query.set("from", "world");
  }
  if (options.focusParameterId) {
    query.set("focus", options.focusParameterId);
  }
  return `/builder?${query.toString()}`;
}

export function createStarterRemixWorldLaunch(
  scenario: AuthoredScenario,
  task: StarterRemixWorldLaunch["task"] = "setup"
): StarterRemixWorldLaunch {
  const validated = validateScenario(scenario).scenario;
  const lineage = requireStarterRemixLineage(validated.metadata);
  if (validated.scenarioId !== lineage.draftId || validated.templateId !== lineage.source.templateId) {
    throw new Error("The remix draft identity does not match its source lineage.");
  }
  const sourceLaunchResult = resolveStarterWorldLaunch({
    starterId: lineage.source.starterWorldId,
    ...(lineage.source.recipeId ? { recipeId: lineage.source.recipeId } : {}),
    task
  });
  if (!sourceLaunchResult.ok || sourceLaunchResult.launch.templateId !== validated.templateId) {
    throw new Error("The remix source launch is stale or unavailable.");
  }
  return buildStarterRemixWorldLaunch({
    draftId: validated.scenarioId,
    sourceLaunch: sourceLaunchResult.launch,
    task
  });
}

export function resolveStarterRemixWorldLaunch(input: unknown):
  | { ok: true; launch: StarterRemixWorldLaunch }
  | { ok: false; message: string } {
  try {
    assertSafeStarterWorldValue(input);
  } catch {
    return { ok: false, message: "The remix launch request contains unsupported data." };
  }
  const parsed = z
    .object({
      starterId: idSchema,
      recipeId: idSchema.optional(),
      draftId: idSchema,
      task: z.enum(["setup", "observe", "intervene", "compare", "understand", "experiment", "debug"]).optional()
    })
    .strict()
    .safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: "The remix launch request is malformed." };
  }
  const task = parsed.data.task ?? "setup";
  const sourceLaunchResult = resolveStarterWorldLaunch({
    starterId: parsed.data.starterId,
    ...(parsed.data.recipeId ? { recipeId: parsed.data.recipeId } : {}),
    task
  });
  if (!sourceLaunchResult.ok) {
    return { ok: false, message: sourceLaunchResult.message };
  }
  return {
    ok: true,
    launch: buildStarterRemixWorldLaunch({
      draftId: parsed.data.draftId,
      sourceLaunch: sourceLaunchResult.launch,
      task
    })
  };
}

export function starterRemixWorldHref(
  starterWorldId: string,
  draftId: string,
  options: { recipeId?: string; task?: StarterRemixWorldLaunch["task"] } = {}
): string {
  const query = new URLSearchParams();
  query.set("starter", starterWorldId);
  if (options.recipeId) {
    query.set("recipe", options.recipeId);
  }
  query.set("remix", draftId);
  query.set("task", options.task ?? "setup");
  return `/world?${query.toString()}`;
}

export function readStarterRemixLineage(metadata: Record<string, JsonValue> | undefined): StarterRemixLineage | null {
  const parsed = starterRemixLineageSchema.safeParse(metadata?.[starterRemixMetadataKey]);
  if (!parsed.success) {
    return null;
  }
  try {
    const sourceConfig = parsed.data.source.configuration;
    const validatedSource = validateRunConfig({
      ...sourceConfig,
      metadata: {}
    });
    if (
      validatedSource.templateId !== parsed.data.source.templateId ||
      parsed.data.source.templateId !== sourceConfig.templateId
    ) {
      return null;
    }
  } catch {
    return null;
  }
  return parsed.data;
}

export function starterRemixLaunchMatchesMetadata(
  metadata: Record<string, JsonValue> | undefined,
  launch: StarterRemixWorldLaunch
): boolean {
  const lineage = readStarterRemixLineage(metadata);
  return Boolean(
    lineage &&
    lineage.draftId === launch.draftId &&
    lineage.source.starterWorldId === launch.starterWorldId &&
    lineage.source.starterWorldVersion === launch.starterWorldVersion &&
    lineage.source.recipeId === launch.recipeId &&
    lineage.source.templateId === launch.templateId
  );
}

export function starterSourceMatchesMetadata(
  metadata: Record<string, JsonValue> | undefined,
  launch: StarterWorldLaunch
): boolean {
  const remix = readStarterRemixLineage(metadata);
  if (remix) {
    return (
      remix.source.starterWorldId === launch.starterWorldId &&
      remix.source.starterWorldVersion === launch.starterWorldVersion &&
      remix.source.recipeId === launch.recipeId &&
      remix.source.templateId === launch.templateId
    );
  }
  return (
    metadataString(metadata?.starterWorldId) === launch.starterWorldId &&
    metadataString(metadata?.starterWorldVersion) === launch.starterWorldVersion &&
    metadataString(metadata?.starterWorldRecipeId) === launch.recipeId
  );
}

export function createAcceptedLegacyRunConfig(input: {
  templateId: string;
  seed: string;
  parameters: ParameterValues;
  metadata: Record<string, JsonValue>;
}): SimulationRunConfig {
  const scenarioId = metadataString(input.metadata.scenarioId);
  const scenarioName = metadataString(input.metadata.scenarioName);
  const initializationPreset = metadataString(input.metadata.initializationPreset);
  const initializationOptions = metadataRecord(input.metadata.initializationOptions);
  const behaviorMode = metadataString(input.metadata.behaviorMode);
  const agentComposition = metadataRecord(input.metadata.agentComposition);
  const environmentOptions = metadataRecord(input.metadata.environmentOptions);
  return validateRunConfig({
    schemaVersion: "1",
    templateId: input.templateId,
    seed: input.seed,
    parameters: input.parameters,
    ...(scenarioId ? { scenarioId } : {}),
    ...(scenarioName ? { scenarioName } : {}),
    ...(initializationPreset ? { initializationPreset } : {}),
    ...(initializationOptions ? { initializationOptions } : {}),
    ...(behaviorMode ? { behaviorMode } : {}),
    ...(agentComposition ? { agentComposition } : {}),
    ...(environmentOptions ? { environmentOptions } : {}),
    metadata: input.metadata
  });
}

export function createRemixAwareResetRunConfig(config: SimulationRunConfig): SimulationRunConfig {
  const accepted = validateRunConfig(config);
  const lineage = readStarterRemixLineage(accepted.metadata);
  if (!lineage || accepted.scenarioId !== lineage.draftId) {
    return createGenericResetRunConfig(accepted);
  }
  const generic = createGenericResetRunConfig(accepted);
  return validateRunConfig({
    ...generic,
    scenarioId: accepted.scenarioId,
    ...(accepted.scenarioName ? { scenarioName: accepted.scenarioName } : {}),
    metadata: accepted.metadata
  });
}

function sourceConfigurationFromRunConfig(config: SimulationRunConfig): z.infer<typeof starterRemixSourceConfigurationSchema> {
  const validated = validateRunConfig(config);
  if (!validated.initializationPreset || !validated.behaviorMode) {
    throw new Error("Starter remix source configuration is incomplete.");
  }
  return starterRemixSourceConfigurationSchema.parse({
    schemaVersion: "1",
    templateId: validated.templateId,
    seed: validated.seed,
    parameters: validated.parameters,
    initializationPreset: validated.initializationPreset,
    initializationOptions: validated.initializationOptions ?? {},
    behaviorMode: validated.behaviorMode,
    agentComposition: validated.agentComposition ?? {},
    environmentOptions: validated.environmentOptions ?? {}
  });
}

function buildStarterRemixWorldLaunch(input: {
  draftId: string;
  sourceLaunch: StarterWorldLaunch;
  task: StarterRemixWorldLaunch["task"];
}): StarterRemixWorldLaunch {
  return starterRemixWorldLaunchSchema.parse({
    draftId: input.draftId,
    starterWorldId: input.sourceLaunch.starterWorldId,
    starterWorldVersion: input.sourceLaunch.starterWorldVersion,
    ...(input.sourceLaunch.recipeId ? { recipeId: input.sourceLaunch.recipeId } : {}),
    templateId: input.sourceLaunch.templateId,
    task: input.task,
    sourceLaunch: input.sourceLaunch,
    href: starterRemixWorldHref(input.sourceLaunch.starterWorldId, input.draftId, {
      ...(input.sourceLaunch.recipeId ? { recipeId: input.sourceLaunch.recipeId } : {}),
      task: input.task
    })
  });
}

function sameActiveWorldHandoffSource(
  handoff: z.infer<typeof activeWorldHandoffSourceSchema>,
  launch: StarterWorldLaunch
): boolean {
  return (
    handoff.starterWorldId === launch.starterWorldId &&
    handoff.starterWorldVersion === launch.starterWorldVersion &&
    handoff.recipeId === launch.recipeId &&
    handoff.templateId === launch.templateId
  );
}

function requireStarterRemixLineage(metadata: Record<string, JsonValue>): StarterRemixLineage {
  const lineage = readStarterRemixLineage(metadata);
  if (!lineage) {
    throw new Error("Starter remix lineage is missing or invalid.");
  }
  return lineage;
}

function createStarterRemixDraftId(starterWorldId: string, recipeId: string | undefined, now: string): string {
  return `remix-${starterWorldId}-${hashString(`${recipeId ?? "default"}:${now}`).slice(0, 12)}`;
}

function metadataString(value: JsonValue | undefined): string | undefined {
  return typeof value === "string" && value.trim().length > 0 ? value : undefined;
}

function metadataRecord(value: JsonValue | undefined): ParameterValues | undefined {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? value as ParameterValues
    : undefined;
}

function hashString(value: string): string {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36);
}

function remixFailure(code: Extract<ResolveStarterRemixResult, { ok: false }>["code"], message: string) {
  return { ok: false, code, message } as const;
}
