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
    purpose: "Describe, author, and inspect model structure with the current Advanced Builder tools.",
    startLabel: "Start here",
    startHere: "load, import, or author a structural artifact, then inspect its validation and boundaries.",
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
    purpose: "Understand how future investigation records would organize evidence about model behavior.",
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
    purpose: "Understand how model behavior could vary across model conditions and how future evidence would be organized.",
    startLabel: "Current state",
    startHere: "conceptual, non-persistent model-space orientation and probe-planning foundation.",
    boundary: "No sampled landscape, saved map, probe execution, regime detection, or discovery record exists here yet.",
    status: {
      label: "GW4 foundation",
      description: "Non-persistent information architecture and evidence semantics only.",
      category: "capability",
      state: "planning-only"
    },
    technicalDetails: [
      {
        plainLanguage: "Where behavior changes across model conditions",
        technicalLanguage: "Behavioral landscape; no sampled landscape exists."
      },
      {
        plainLanguage: "Future investigation sketch",
        technicalLanguage: "Non-executable landscape probe plan; no probe execution or saved plan exists."
      },
      {
        plainLanguage: "Sampled versus unsampled",
        technicalLanguage: "Evidence-state vocabulary; sampled would require source-backed model-run evidence."
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
