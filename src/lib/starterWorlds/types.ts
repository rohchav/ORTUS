import { z } from "zod";
import { simulationWorkspaceModeIds } from "../workspaceModes";

export const starterWorldSchemaVersion = "1" as const;

export const starterWorldRuntimeStatuses = ["runnable", "planned", "concept-only"] as const;
export const starterWorldDomains = [
  "living-systems",
  "collective-behavior",
  "information-and-society",
  "networks-and-signals",
  "environment-and-spread",
  "population-dynamics"
] as const;
export const starterWorldMechanisms = [
  "local-neighbor",
  "spatial-contact",
  "network-influence",
  "resource-consumption",
  "predation",
  "contagion",
  "threshold",
  "competition",
  "cooperation",
  "signal-propagation",
  "feedback",
  "adaptation",
  "event-resolution",
  "stochastic-transition"
] as const;
export const starterWorldSystemForms = ["spatial-agents", "grid", "network", "population", "hybrid"] as const;
export const starterWorldComplexities = ["quick-start", "layered", "advanced"] as const;
export const starterWorldSourceTypes = [
  "peer-reviewed-paper",
  "book",
  "official-institution",
  "research-project",
  "educational-reference",
  "historical-source"
] as const;
export const starterWorldSourceRelationships = [
  "canonical-model",
  "mechanism-inspiration",
  "research-context",
  "educational-context",
  "historical-context"
] as const;
export const starterWorldRemixStatuses = ["runtime-now", "advanced-tools", "future-capability"] as const;
export const starterWorldVisualKinds = [
  "collective-motion",
  "contact-spread",
  "opinion-field",
  "population-cycle",
  "neighborhood-grid",
  "landscape-spread",
  "signal-network"
] as const;

export type StarterWorldRuntimeStatus = (typeof starterWorldRuntimeStatuses)[number];
export type StarterWorldDomain = (typeof starterWorldDomains)[number];
export type StarterWorldMechanism = (typeof starterWorldMechanisms)[number];
export type StarterWorldSystemForm = (typeof starterWorldSystemForms)[number];
export type StarterWorldComplexity = (typeof starterWorldComplexities)[number];
export type StarterWorldRemixStatus = (typeof starterWorldRemixStatuses)[number];
export type StarterWorldVisualKind = (typeof starterWorldVisualKinds)[number];

const boundedText = (min: number, max: number) => z.string().trim().min(min).max(max);
const boundedTextList = (min: number, max: number, itemMax = 260) =>
  z.array(boundedText(2, itemMax)).min(min).max(max);

const runtimeReferenceSchema = z
  .object({
    templateId: boundedText(2, 120),
    defaultScenarioId: boundedText(2, 120),
    supportedScenarioIds: z.array(boundedText(2, 120)).min(1).max(16),
    recommendedTask: z.enum(simulationWorkspaceModeIds),
    recommendedMetricId: boundedText(2, 120),
    recommendedParameterId: boundedText(2, 120)
  })
  .strict();

const anatomySchema = z
  .object({
    entities: boundedTextList(1, 6).optional(),
    groups: boundedTextList(1, 6).optional(),
    environment: boundedTextList(1, 6).optional(),
    resources: boundedTextList(1, 6).optional(),
    networks: boundedTextList(1, 6).optional(),
    fields: boundedTextList(1, 6).optional(),
    boundaries: boundedTextList(1, 6).optional(),
    scales: boundedTextList(1, 6).optional(),
    feedbackLoops: boundedTextList(1, 6).optional(),
    delays: boundedTextList(1, 6).optional(),
    adaptation: boundedTextList(1, 6).optional(),
    selection: boundedTextList(1, 6).optional(),
    stochasticity: boundedTextList(1, 6).optional(),
    observables: boundedTextList(1, 6).optional()
  })
  .strict()
  .refine((anatomy) => Object.values(anatomy).some((items) => items && items.length > 0), {
    message: "Starter World anatomy must represent at least one system facet."
  });

const firstRunSchema = z
  .object({
    action: boundedText(12, 260),
    demonstrates: boundedText(20, 420),
    recommendedTask: z.enum(simulationWorkspaceModeIds)
  })
  .strict();

const firstChangeSchema = z
  .object({
    targetType: z.enum(["parameter", "intervention"]),
    targetId: boundedText(2, 120),
    targetLabel: boundedText(2, 120),
    action: boundedText(12, 260),
    direction: z.enum(["increase", "decrease", "set", "apply"]),
    suggestedValue: z.union([z.string().max(120), z.number().finite(), z.boolean()]).optional(),
    runSemantics: z.enum(["rebuild-world", "current-run"]),
    differenceToLookFor: boundedText(20, 420)
  })
  .strict()
  .superRefine((change, context) => {
    if (change.targetType === "parameter" && change.runSemantics !== "rebuild-world") {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["runSemantics"],
        message: "Starter parameter changes must use the existing fresh-world rebuild path."
      });
    }
    if (change.targetType === "intervention" && change.runSemantics !== "current-run") {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["runSemantics"],
        message: "Starter interventions must use the existing current-run intervention path."
      });
    }
  });

const observationSchema = z
  .object({
    label: boundedText(2, 120),
    description: boundedText(12, 360),
    metricId: boundedText(2, 120).optional()
  })
  .strict();

const sourceSchema = z
  .object({
    sourceId: boundedText(2, 120),
    title: boundedText(4, 260),
    authorsOrOrganization: boundedText(2, 240),
    year: z.number().int().min(1600).max(2100),
    sourceType: z.enum(starterWorldSourceTypes),
    urlOrDoi: z.string().trim().url().max(500).refine((value) => value.startsWith("https://"), {
      message: "Starter World sources must use HTTPS URLs."
    }),
    relationship: z.enum(starterWorldSourceRelationships),
    note: boundedText(12, 420)
  })
  .strict();

const remixIdeaSchema = z
  .object({
    title: boundedText(2, 140),
    description: boundedText(12, 360),
    status: z.enum(starterWorldRemixStatuses)
  })
  .strict();

const futureExpansionSchema = z
  .object({
    title: boundedText(2, 140),
    description: boundedText(12, 360),
    requiredCapability: boundedText(4, 180)
  })
  .strict();

const starterWorldDefinitionObjectSchema = z
  .object({
    id: boundedText(2, 120).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    version: z.literal(starterWorldSchemaVersion),
    slug: boundedText(2, 120).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    title: boundedText(2, 120),
    shortTitle: boundedText(2, 80),
    hookQuestion: boundedText(12, 220).refine((value) => value.endsWith("?"), {
      message: "Starter World hooks must be questions."
    }),
    oneSentencePremise: boundedText(20, 280),
    summary: boundedText(60, 800),
    runtimeStatus: z.enum(starterWorldRuntimeStatuses),
    catalogOrder: z.number().int().min(0).max(10_000),
    featured: z.boolean(),
    domain: z.array(z.enum(starterWorldDomains)).min(1).max(3),
    mechanisms: z.array(z.enum(starterWorldMechanisms)).min(1).max(6),
    systemForms: z.array(z.enum(starterWorldSystemForms)).min(1).max(2),
    complexity: z.enum(starterWorldComplexities),
    estimatedFirstActivity: boundedText(4, 80),
    visualKind: z.enum(starterWorldVisualKinds),
    catalogIndicators: boundedTextList(2, 4, 80),
    runtime: runtimeReferenceSchema.optional(),
    anatomy: anatomySchema,
    primaryMechanisms: z.array(z.enum(starterWorldMechanisms)).min(1).max(4),
    interactionPattern: boundedText(20, 500),
    systemDynamics: boundedText(30, 700),
    firstRun: firstRunSchema,
    firstChange: firstChangeSchema,
    whatToWatch: z.array(observationSchema).min(1).max(4),
    investigationPrompts: boundedTextList(2, 4, 320),
    sources: z.array(sourceSchema).max(3),
    mainLimitation: boundedText(20, 420),
    remixIdeas: z.array(remixIdeaSchema).min(1).max(5),
    futureExpansion: z.array(futureExpansionSchema).min(1).max(5)
  })
  .strict()
  .superRefine((definition, context) => {
    if (definition.runtimeStatus === "runnable" && !definition.runtime) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["runtime"],
        message: "Runnable Starter Worlds require an authoritative runtime reference."
      });
    }
    if (definition.runtimeStatus !== "runnable" && definition.runtime) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["runtime"],
        message: "Only runnable Starter Worlds may define launch runtime references."
      });
    }
    if (definition.runtimeStatus === "runnable" && (definition.sources.length < 1 || definition.sources.length > 3)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["sources"],
        message: "Runnable Starter Worlds require one to three research or conceptual sources."
      });
    }
  });

export const starterWorldDefinitionSchema = starterWorldDefinitionObjectSchema;
export const starterWorldDefinitionListSchema = z.array(starterWorldDefinitionObjectSchema).min(1).max(64);

export type StarterWorldDefinition = z.infer<typeof starterWorldDefinitionSchema>;
export type StarterWorldRuntimeReference = z.infer<typeof runtimeReferenceSchema>;
export type StarterWorldAnatomy = z.infer<typeof anatomySchema>;
export type StarterWorldSource = z.infer<typeof sourceSchema>;

export const starterWorldDomainLabels: Record<StarterWorldDomain, string> = {
  "living-systems": "Living systems",
  "collective-behavior": "Collective behavior",
  "information-and-society": "Information and society",
  "networks-and-signals": "Networks and signals",
  "environment-and-spread": "Environment and spread",
  "population-dynamics": "Population dynamics"
};

export const starterWorldMechanismLabels: Record<StarterWorldMechanism, string> = {
  "local-neighbor": "Local neighbors",
  "spatial-contact": "Spatial contact",
  "network-influence": "Network influence",
  "resource-consumption": "Resource consumption",
  predation: "Predation",
  contagion: "Contagion",
  threshold: "Threshold response",
  competition: "Competition",
  cooperation: "Cooperation",
  "signal-propagation": "Signal propagation",
  feedback: "Feedback",
  adaptation: "Adaptation",
  "event-resolution": "Event timing",
  "stochastic-transition": "Seeded stochasticity"
};

export const starterWorldSystemFormLabels: Record<StarterWorldSystemForm, string> = {
  "spatial-agents": "Spatial agents",
  grid: "Grid",
  network: "Network",
  population: "Population",
  hybrid: "Hybrid"
};

export const starterWorldComplexityLabels: Record<StarterWorldComplexity, string> = {
  "quick-start": "Quick start",
  layered: "Layered",
  advanced: "Advanced"
};

export const starterWorldAnatomyLabels: Record<keyof StarterWorldAnatomy, string> = {
  entities: "Entities",
  groups: "Groups",
  environment: "Environment",
  resources: "Resources",
  networks: "Network",
  fields: "Fields",
  boundaries: "Boundaries",
  scales: "Scales",
  feedbackLoops: "Feedbacks",
  delays: "Delays",
  adaptation: "Adaptation",
  selection: "Selection",
  stochasticity: "Randomness",
  observables: "Observables"
};

export const starterWorldRemixStatusLabels: Record<StarterWorldRemixStatus, string> = {
  "runtime-now": "Available in this runtime",
  "advanced-tools": "Available through current Advanced tools",
  "future-capability": "Future engine capability required"
};
