import type { ResearchDestinationId } from "./researchDestinations";

export interface RouteOrientationDetail {
  plainLanguage: string;
  technicalLanguage: string;
}

export interface RouteOrientationDefinition {
  destinationId: ResearchDestinationId;
  routeName: string;
  purpose: string;
  startLabel: "Start here" | "Current state";
  startHere: string;
  boundary: string;
  status?: {
    label: string;
    description: string;
    category: "capability";
    state: "planning-only";
  };
  technicalDetails: readonly RouteOrientationDetail[];
}

export const routeOrientations: readonly RouteOrientationDefinition[] = [
  {
    destinationId: "world",
    routeName: "World",
    purpose: "Watch a model change over time and test supported perturbations.",
    startLabel: "Start here",
    startHere: "run, pause, step, or change the setup for the current modeled system.",
    boundary: "Model output describes this simulation, not automatically the real world.",
    technicalDetails: [
      {
        plainLanguage: "This run",
        technicalLanguage: "Active local run with explicit template, scenario, seed, parameters, tick, and engine provenance."
      },
      {
        plainLanguage: "Starting recipe",
        technicalLanguage: "Scenario / initial-condition and supported-variant recipe."
      },
      {
        plainLanguage: "Repeatable randomness",
        technicalLanguage: "Deterministic seed."
      },
      {
        plainLanguage: "Exact saved tick state",
        technicalLanguage: "Engine snapshot restore point."
      }
    ]
  },
  {
    destinationId: "workshop",
    routeName: "Workshop",
    purpose: "Describe, author, and inspect model structure through Guided or Advanced Builder tools.",
    startLabel: "Start here",
    startHere: "create a bounded guided draft or open the complete Advanced Builder for exact structural editing.",
    boundary: "A valid structure is not automatically runnable.",
    technicalDetails: [
      {
        plainLanguage: "Model structure draft",
        technicalLanguage: "ortus.modelSchema structural artifact."
      },
      {
        plainLanguage: "Structure map",
        technicalLanguage: "ortus.visualBuilderWorkspace artifact; its graph is inspection, not visual programming."
      },
      {
        plainLanguage: "Resembles existing templates",
        technicalLanguage: "Structural compatibility summary, not conversion."
      },
      {
        plainLanguage: "Questions to investigate",
        technicalLanguage: "Non-runnable scenario-planning artifact; it does not generate scenarios."
      }
    ]
  },
  {
    destinationId: "lab",
    routeName: "Lab",
    purpose: "See how future durable scientific memory will connect questions, runs, evidence, and unresolved findings.",
    startLabel: "Current state",
    startHere: "conceptual, non-persistent evidence-record and experiment-ledger foundation.",
    boundary: "Nothing on this route is a saved experiment, evidence record, notebook, or run history.",
    status: {
      label: "GW5 foundation",
      description: "Non-persistent evidence-record information architecture only.",
      category: "capability",
      state: "planning-only"
    },
    technicalDetails: [
      {
        plainLanguage: "What model evidence can support",
        technicalLanguage: "Model-behavior evidence state, not empirical validation."
      },
      {
        plainLanguage: "Future record anatomy",
        technicalLanguage: "Non-persistent evidence-record and experiment-ledger semantics; no saved Lab record exists."
      }
    ]
  },
  {
    destinationId: "atlas",
    routeName: "Atlas",
    purpose: "Orient among future questions, representations, evidence, alternatives, findings, and their relationships.",
    startLabel: "Current state",
    startHere: "map records are not implemented; one bounded deterministic preview remains available as a page-local inspection tool.",
    boundary: "A sparse ephemeral preview is not a complete landscape, detected regime, saved discovery, or real-world claim.",
    technicalDetails: [
      {
        plainLanguage: "Bounded sampled preview",
        technicalLanguage: "One- or two-axis exact parameter grid with isolated deterministic sample runs and final-tick numeric observation."
      },
      {
        plainLanguage: "Future investigation sketch",
        technicalLanguage: "Non-executable landscape probe plan; the current planning scaffold cannot be converted into a Preview V1 request."
      },
      {
        plainLanguage: "Sampled versus unsampled",
        technicalLanguage: "Only executed coordinates have numeric values; no values between them are inferred."
      }
    ]
  }
] as const;

export function getRouteOrientation(destinationId: ResearchDestinationId): RouteOrientationDefinition {
  const orientation = routeOrientations.find((candidate) => candidate.destinationId === destinationId);
  if (!orientation) {
    throw new Error(`Unknown route orientation destination: ${destinationId}`);
  }
  return orientation;
}
