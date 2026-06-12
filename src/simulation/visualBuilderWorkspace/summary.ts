import { validateVisualBuilderWorkspaceDefinition } from "./validation";
import {
  maxVisualBuilderWorkspaceWarnings,
  type VisualBuilderWorkspaceDefinition,
  type VisualBuilderWorkspaceSummary
} from "./types";

export function summarizeVisualBuilderWorkspace(workspace: VisualBuilderWorkspaceDefinition): VisualBuilderWorkspaceSummary {
  const valid = validateVisualBuilderWorkspaceDefinition(workspace);
  return {
    id: valid.id,
    name: valid.name,
    nodeCount: valid.nodes.length,
    edgeCount: (valid.edges ?? []).length,
    panelCount: (valid.panels ?? []).length,
    sectionCount: (valid.sections ?? []).length,
    artifactReferenceCount: (valid.artifactReferences ?? []).length,
    validationMarkerCount: (valid.validationMarkers ?? []).length,
    warningMarkerCount: (valid.warningMarkers ?? []).length,
    unsupportedMarkerCount: (valid.unsupportedMarkers ?? []).length,
    executableCount: 0,
    structuralOnlyNodeCount: valid.nodes.filter((node) => node.status === "structuralOnly").length,
    serviceOnlyNodeCount: valid.nodes.filter((node) => node.status === "serviceOnly").length,
    futureOnlyNodeCount: valid.nodes.filter((node) => node.status === "futureOnly").length,
    unsupportedNodeCount: valid.nodes.filter((node) => node.status === "unsupported").length,
    warnings: getVisualBuilderWorkspaceWarnings(valid)
  };
}

export function getVisualBuilderWorkspaceWarnings(workspace: VisualBuilderWorkspaceDefinition): readonly string[] {
  const valid = validateVisualBuilderWorkspaceDefinition(workspace);
  const warnings: string[] = [
    "Visual builder workspaces are structural planning artifacts; they do not implement runnable visual model authoring.",
    "Workspace nodes and edges are visual descriptors, not executable dataflow or runtime behavior.",
    "A valid visual builder workspace does not make a model schema runnable.",
    "Prompt 34 adds a read-only builder shell; it does not add drag-and-drop modeling, visual programming, or schema execution.",
    "No runnable visual builder runtime exists in V1.",
    "No schema execution exists in V1.",
    "No compiler exists in V1.",
    "No external framework interop exists in V1.",
    "No custom model runtime exists in V1.",
    "No LLM-agent runtime exists in V1.",
    "Valid workspace does not mean runnable model.",
    "Active workspace declarations are structurally active only; active does not mean runtime-executed.",
    "Workspace nodes are visual descriptors, not runtime objects.",
    "Workspace edges are visual/semantic links, not dataflow execution.",
    "Workspace layout metadata is visual metadata, not simulation topology.",
    "Viewport and camera metadata is display-only.",
    "Selection metadata does not mutate runtime state.",
    "Artifact references are structural references only; reference or attachment does not activate behavior.",
    "No node editor or graph editing exists in V1.",
    "Workspace artifacts cannot generate scenarios, RunConfigs, snapshots, templates, or engines."
  ];

  if (valid.nodes.length === 0) {
    warnings.push("Workspace has no nodes; it is only an empty planning container.");
  }
  for (const node of valid.nodes) {
    if (node.status === "futureOnly") {
      warnings.push(`Node ${node.id} is futureOnly; it is not implemented.`);
    }
    if (node.status === "unsupported" || node.status === "invalid") {
      warnings.push(`Node ${node.id} is ${node.status}; it is not runnable.`);
    }
    if (node.status === "templateRuntimeSupported") {
      warnings.push(`Node ${node.id} uses templateRuntimeSupported status; that must be justified by actual template runtime support.`);
    }
    if (node.referencedArtifactType) {
      addArtifactReferenceWarning(warnings, `Node ${node.id}`, node.referencedArtifactType);
    }
  }

  for (const reference of valid.artifactReferences ?? []) {
    warnings.push(`Artifact reference ${reference.id} is structural only and does not activate referenced behavior.`);
    addArtifactReferenceWarning(warnings, `Artifact reference ${reference.id}`, reference.artifactType);
    if (reference.role === "futureDependency") {
      warnings.push(`Artifact reference ${reference.id} is a futureDependency; that dependency is not implemented by this workspace.`);
    }
  }

  if (valid.modelSchemaId || valid.scope?.modelSchemaId) {
    warnings.push("ModelSchema references do not make schemas executable.");
  }
  if (valid.scope?.knowledgeMemorySocialLearningModelId) {
    warnings.push("Social-learning references do not implement cognition or runtime learning.");
  }
  if (valid.scope?.observabilityModelId) {
    warnings.push("Observability references do not measure runtime data.");
  }
  if (valid.scope?.causalAssumptionModelId) {
    warnings.push("Causal references do not prove causality.");
  }
  if (valid.scope?.networkDefinitionId) {
    warnings.push("Network references do not execute network behavior.");
  }
  if (valid.scope?.resourceSystemId) {
    warnings.push("Resource references do not execute stock/flow behavior.");
  }
  if (valid.scope?.feedbackLoopModelId) {
    warnings.push("Feedback references do not run feedback loops.");
  }
  if (valid.scope?.controlStrategyModelId) {
    warnings.push("Control references do not execute policies.");
  }

  if ((valid.assumptionNotes ?? []).length > 0 || (valid.limitationNotes ?? []).length > 0 || (valid.validationNotes ?? []).length > 0) {
    warnings.push("Assumption, limitation, and validation notes are transparency metadata; they do not make workspace output valid or runnable.");
  }

  const text = textFor(valid);
  if (mentionsUniversalBuilder(text)) {
    warnings.push("Universal builder wording is unsupported; this workspace is not a universal model builder.");
  }
  if (mentionsNodeGraphExecution(text)) {
    warnings.push("Node graph execution wording is unsupported; workspace graphs are not executed.");
  }
  if (mentionsDragDropRuntime(text)) {
    warnings.push("Drag-and-drop runtime wording is unsupported; Prompt 34 does not add drag-and-drop modeling.");
  }
  if (mentionsVisualProgramming(text)) {
    warnings.push("Visual programming wording is unsupported; Prompt 34 does not implement visual programming.");
  }
  if (mentionsExternalFrameworkCompatibility(text)) {
    warnings.push("NetLogo/Mesa/MASON compatibility wording is unsupported; external framework interop is not implemented.");
  }
  if (mentionsSocialCognitiveRuntime(text)) {
    warnings.push("Social/cognitive runtime wording is unsupported; social-learning workspace nodes do not implement cognition or runtime learning.");
  }
  if (mentionsLlmAgents(text)) {
    warnings.push("LLM-agent wording is unsupported; no LLM-agent runtime exists in V1.");
  }

  return Array.from(new Set(warnings)).slice(0, maxVisualBuilderWorkspaceWarnings);
}

function addArtifactReferenceWarning(warnings: string[], label: string, artifactType: string): void {
  if (artifactType === "ortus.modelSchema") {
    warnings.push(`${label} references a model schema structurally; it does not make the schema executable.`);
  }
  if (artifactType === "ortus.knowledgeMemorySocialLearningModel") {
    warnings.push(`${label} references social-learning semantics structurally; it does not implement cognition or runtime learning.`);
  }
  if (artifactType === "ortus.observabilityModel") {
    warnings.push(`${label} references observability structurally; it does not measure runtime data.`);
  }
  if (artifactType === "ortus.causalAssumptionModel") {
    warnings.push(`${label} references causal assumptions structurally; it does not prove causality.`);
  }
  if (artifactType === "ortus.networkDefinition" || artifactType === "ortus.networkMetrics") {
    warnings.push(`${label} references network artifacts structurally; it does not execute network behavior.`);
  }
  if (artifactType === "ortus.resourceSystem" || artifactType === "ortus.resourceMetrics") {
    warnings.push(`${label} references resource artifacts structurally; it does not execute stock/flow behavior.`);
  }
  if (artifactType === "ortus.feedbackLoops" || artifactType === "ortus.eventSchedule" || artifactType === "ortus.delayQueue") {
    warnings.push(`${label} references feedback/event artifacts structurally; it does not run feedback loops or scheduled behavior.`);
  }
  if (artifactType === "ortus.controlStrategyModel") {
    warnings.push(`${label} references control semantics structurally; it does not execute policies.`);
  }
  if (artifactType === "ortus.hybridComposition") {
    warnings.push(`${label} references hybrid composition structurally; it does not make a composition runnable.`);
  }
}

function mentionsUniversalBuilder(text: string): boolean {
  return text.match(/\buniversal builder\b|\buniversal model builder\b|\bgeneral purpose builder\b|\bbuild any model\b/i) !== null;
}

function mentionsNodeGraphExecution(text: string): boolean {
  return text.match(/\bnode graph execution\b|\bexecute node graph\b|\brun node graph\b|\bgraph execution\b|\bdataflow execution\b/i) !== null;
}

function mentionsDragDropRuntime(text: string): boolean {
  return text.match(/\bdrag.?and.?drop runtime\b|\bdrag.?drop runtime\b|\bdrag.?and.?drop model execution\b|\bdrag.?drop model execution\b/i) !== null;
}

function mentionsVisualProgramming(text: string): boolean {
  return text.match(/\bvisual programming\b|\bblock program\b|\bblock-program\b|\bvisual program\b|\bno-code runtime\b/i) !== null;
}

function mentionsExternalFrameworkCompatibility(text: string): boolean {
  return text.match(/\bnetlogo\b|\bmesa\b|\bmason\b|\bexternal framework\b|\binterop\b|\bcompatib/i) !== null;
}

function mentionsSocialCognitiveRuntime(text: string): boolean {
  return text.match(/\bsocial cognition runtime\b|\bsocial-learning runtime\b|\bsocial learning runtime\b|\bhuman cognition\b|\bmind simulation\b/i) !== null;
}

function mentionsLlmAgents(text: string): boolean {
  return text.match(/\bllm\b|\blarge language model\b|\bllm agent\b|\bagentic\b|\bembedding\b|\bmodel weight\b/i) !== null;
}

function textFor(workspace: VisualBuilderWorkspaceDefinition): string {
  return JSON.stringify(workspace).toLowerCase();
}
