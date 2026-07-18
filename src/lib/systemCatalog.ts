import { templateDescriptors, type TemplateDescriptor, type TemplateId } from "./templateVisuals";

export interface SystemCatalogEntry {
  descriptor: TemplateDescriptor;
  question: string;
  manipulation: string;
  visibleOutput: string;
  watchFor: string;
  suggestedChange: string;
  quickParameterKeys: readonly string[];
  highlightedParameterKey: string;
}

type SystemPresentation = Omit<SystemCatalogEntry, "descriptor">;

const systemPresentationById = {
  "epidemic-spread": {
    question: "How can local contact produce a population-level outbreak curve?",
    manipulation: "Change contact radius, transmission chance, recovery time, or movement speed.",
    visibleOutput: "Moving agents and susceptible, infected, and recovered counts.",
    watchFor: "The outbreak peak, how quickly infections spread, and whether infections fade out.",
    suggestedChange: "Lower infection probability, then compare the peak and duration with the baseline run.",
    quickParameterKeys: ["infectionRadius", "infectionProbability", "recoveryTicks", "movementSpeed"],
    highlightedParameterKey: "infectionProbability"
  },
  "opinion-dynamics": {
    question: "When do repeated local interactions produce convergence or polarization?",
    manipulation: "Change influence range, influence strength, noise, or initial polarization.",
    visibleOutput: "Bounded model opinions, their spatial distribution, and aggregate polarization metrics.",
    watchFor: "Clusters, movement toward consensus, and persistent separation around the neutral point.",
    suggestedChange: "Increase influence strength, then watch whether opinions converge or split more quickly.",
    quickParameterKeys: ["influenceRadius", "influenceStrength", "noise", "initialPolarization"],
    highlightedParameterKey: "influenceStrength"
  },
  "predator-prey": {
    question: "How can reproduction, predation, and energy loss create population cycles?",
    manipulation: "Change prey reproduction, predator energy loss, predation range, or movement speed.",
    visibleOutput: "Moving predator and prey agents with population counts over time.",
    watchFor: "Lagged population peaks, collapse, recovery, or extinction inside the model.",
    suggestedChange: "Raise predator energy loss, then compare predator survival and prey recovery.",
    quickParameterKeys: ["preyReproductionProbability", "predatorEnergyLoss", "predationRadius", "movementSpeed"],
    highlightedParameterKey: "predatorEnergyLoss"
  },
  "schelling-segregation": {
    question: "How can local similarity preferences reshape a mixed population?",
    manipulation: "Change density, group balance, similarity threshold, or movement fraction.",
    visibleOutput: "Grid occupancy, local group patterns, movement, and satisfaction metrics.",
    watchFor: "Clustering, dissatisfied agents, and how quickly the arrangement stabilizes.",
    suggestedChange: "Raise the similarity threshold, then watch clustering and the satisfaction rate.",
    quickParameterKeys: ["density", "groupRatio", "similarityThreshold", "moveFractionPerTick"],
    highlightedParameterKey: "similarityThreshold"
  },
  "flocking-boids": {
    question: "How do simple local steering rules produce coordinated flock motion?",
    manipulation: "Change alignment, cohesion, separation, or perception range.",
    visibleOutput: "Moving boids with alignment, neighborhood, density, and dispersion metrics.",
    watchFor: "Flock formation, splitting, crowding, and changes in collective direction.",
    suggestedChange: "Lower alignment weight, then watch flock shape and the alignment score.",
    quickParameterKeys: ["alignmentWeight", "cohesionWeight", "separationWeight", "perceptionRadius"],
    highlightedParameterKey: "alignmentWeight"
  },
  "forest-fire": {
    question: "How do local spread and regrowth shape repeated fire patterns?",
    manipulation: "Change fuel density, spread chance, lightning chance, or regrowth chance.",
    visibleOutput: "A changing fuel grid with burning, burned, empty, and ignition metrics.",
    watchFor: "Connected burns, fire extinction, fuel recovery, and recurring ignition.",
    suggestedChange: "Lower spread probability, then compare the connected burn area with the baseline.",
    quickParameterKeys: ["initialFuelDensity", "spreadProbability", "lightningProbability", "regrowthProbability"],
    highlightedParameterKey: "spreadProbability"
  },
  "neural-excitation-network": {
    question: "How do bounded activation rules shape cascades in a stylized influence network?",
    manipulation: "Change threshold, activation decay, external stimulus rate, or connection density.",
    visibleOutput: "Abstract node activation, influence edges, cascades, and model-output readouts.",
    watchFor: "Cascade size, synchronization, saturation, and whether activity dies out.",
    suggestedChange: "Raise the global threshold, then compare cascade size and firing rate.",
    quickParameterKeys: ["globalThreshold", "activationDecay", "externalStimulusRate", "connectionDensity"],
    highlightedParameterKey: "globalThreshold"
  }
} satisfies Record<TemplateId, SystemPresentation>;

export const systemCatalog: readonly SystemCatalogEntry[] = templateDescriptors.map((descriptor) => ({
  descriptor,
  ...systemPresentationById[descriptor.id]
}));

export function getSystemCatalogEntry(templateId: TemplateId): SystemCatalogEntry {
  const entry = systemCatalog.find((candidate) => candidate.descriptor.id === templateId);
  if (!entry) {
    throw new Error(`Unknown system catalog template: ${templateId}`);
  }
  return entry;
}
