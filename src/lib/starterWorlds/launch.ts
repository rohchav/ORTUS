import { z } from "zod";
import {
  createDefaultScenario,
  findInitializationPreset,
  getProductionTemplate,
  updateScenarioPreset,
  validateScenario,
  type AuthoredScenario
} from "../../simulation";
import {
  isSimulationWorkspaceModeId,
  simulationWorkspaceModeFromQuery,
  simulationWorkspaceModeQueryValue,
  type SimulationWorkspaceModeId
} from "../workspaceModes";
import { getStarterWorldById } from "./registry";
import { assertSafeStarterWorldValue } from "./validation";

const launchTimestamp = "2026-07-27T00:00:00.000Z";

const launchRequestSchema = z
  .object({
    starterId: z.string().trim().min(1).max(120),
    templateId: z.string().trim().min(1).max(120).optional(),
    scenarioId: z.string().trim().min(1).max(120).optional(),
    task: z.string().trim().min(1).max(40).optional()
  })
  .strict();

export const starterWorldLaunchSchema = z
  .object({
    starterWorldId: z.string().trim().min(1).max(120),
    starterWorldVersion: z.literal("1"),
    slug: z.string().trim().min(1).max(120),
    templateId: z.string().trim().min(1).max(120),
    scenarioId: z.string().trim().min(1).max(120),
    task: z.enum(["setup", "observe", "intervene", "compare", "understand", "experiment", "debug"]),
    href: z.string().startsWith("/world?")
  })
  .strict();

export type StarterWorldLaunch = z.infer<typeof starterWorldLaunchSchema>;

export type StarterWorldLaunchResult =
  | { ok: true; launch: StarterWorldLaunch }
  | {
      ok: false;
      code: StarterWorldLaunchErrorCode;
      message: string;
    };

type StarterWorldLaunchErrorCode =
  | "invalid-request"
  | "unknown-starter"
  | "not-runnable"
  | "runtime-mismatch"
  | "unknown-scenario"
  | "invalid-task";

export function resolveStarterWorldLaunch(input: unknown): StarterWorldLaunchResult {
  try {
    assertSafeStarterWorldValue(input);
  } catch {
    return failure("invalid-request", "The Starter World launch request contains unsupported data.");
  }
  const parsed = launchRequestSchema.safeParse(input);
  if (!parsed.success) {
    return failure("invalid-request", "The Starter World launch request is malformed.");
  }

  const definition = getStarterWorldById(parsed.data.starterId);
  if (!definition) {
    return failure("unknown-starter", "That Starter World is not available.");
  }
  if (definition.runtimeStatus !== "runnable" || !definition.runtime) {
    return failure("not-runnable", "That Starter World does not have an approved runtime launch.");
  }
  if (parsed.data.templateId && parsed.data.templateId !== definition.runtime.templateId) {
    return failure("runtime-mismatch", "The requested template does not match this Starter World.");
  }

  const template = getProductionTemplate(definition.runtime.templateId);
  if (!template) {
    return failure("runtime-mismatch", "The Starter World runtime template is unavailable.");
  }

  const scenarioId = parsed.data.scenarioId ?? definition.runtime.defaultScenarioId;
  if (
    !definition.runtime.supportedScenarioIds.includes(scenarioId) ||
    !findInitializationPreset(template, scenarioId)
  ) {
    return failure("unknown-scenario", "The requested Starter World scenario is unavailable.");
  }

  const task = parsed.data.task
    ? simulationWorkspaceModeFromQuery(parsed.data.task)
    : definition.runtime.recommendedTask;
  if (!task || !isSimulationWorkspaceModeId(task)) {
    return failure("invalid-task", "The requested World task is unavailable.");
  }

  const launchWithoutHref = {
    starterWorldId: definition.id,
    starterWorldVersion: definition.version,
    slug: definition.slug,
    templateId: template.id,
    scenarioId,
    task
  } as const;
  const launch = starterWorldLaunchSchema.parse({
    ...launchWithoutHref,
    href: starterWorldLaunchHref(launchWithoutHref)
  });
  return { ok: true, launch };
}

export function createDefaultStarterWorldLaunch(starterWorldId: string): StarterWorldLaunch {
  const result = resolveStarterWorldLaunch({ starterId: starterWorldId });
  if (!result.ok) {
    throw new Error(result.message);
  }
  return result.launch;
}

export function createStarterWorldScenario(input: unknown): AuthoredScenario {
  assertSafeStarterWorldValue(input);
  const launch = starterWorldLaunchSchema.parse(input);
  const resolved = resolveStarterWorldLaunch({
    starterId: launch.starterWorldId,
    templateId: launch.templateId,
    scenarioId: launch.scenarioId,
    task: launch.task
  });
  if (!resolved.ok || !sameLaunchIdentity(launch, resolved.launch)) {
    throw new Error("Starter World launch context is stale or invalid.");
  }

  const definition = getStarterWorldById(launch.starterWorldId);
  const template = getProductionTemplate(launch.templateId);
  if (!definition || !template) {
    throw new Error("Starter World runtime is unavailable.");
  }

  const base = createDefaultScenario({
    template,
    now: launchTimestamp,
    seed: "ortus-field-001",
    name: `${definition.shortTitle} baseline`
  });
  const scenario = updateScenarioPreset(base, launch.scenarioId, launchTimestamp);
  return validateScenario({
    ...scenario,
    metadata: {
      ...scenario.metadata,
      starterWorldId: definition.id,
      starterWorldSlug: definition.slug,
      starterWorldVersion: definition.version
    }
  }).scenario;
}

export function starterWorldLaunchHref(input: {
  starterWorldId: string;
  templateId: string;
  scenarioId: string;
  task: SimulationWorkspaceModeId;
}): string {
  const query = new URLSearchParams();
  query.set("starter", input.starterWorldId);
  query.set("template", input.templateId);
  query.set("scenario", input.scenarioId);
  const task = simulationWorkspaceModeQueryValue(input.task);
  if (task) {
    query.set("task", task);
  }
  return `/world?${query.toString()}`;
}

function sameLaunchIdentity(left: StarterWorldLaunch, right: StarterWorldLaunch): boolean {
  return (
    left.starterWorldId === right.starterWorldId &&
    left.starterWorldVersion === right.starterWorldVersion &&
    left.slug === right.slug &&
    left.templateId === right.templateId &&
    left.scenarioId === right.scenarioId &&
    left.task === right.task
  );
}

function failure(code: StarterWorldLaunchErrorCode, message: string) {
  return { ok: false, code, message } as const;
}
