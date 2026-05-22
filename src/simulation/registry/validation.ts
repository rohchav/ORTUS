import { productionTemplates } from "../templates/registry";
import { artifactFamilyRegistry } from "./artifacts";
import { primitiveRegistry } from "./primitives";
import { templatePrimitiveCapabilities } from "./templateCapabilities";
import {
  primitiveCapabilityStatuses,
  primitiveIds,
  primitiveSupportLevels,
  type ArtifactFamilyEntry,
  type PrimitiveId,
  type SystemsPrimitiveEntry,
  type TemplatePrimitiveCapability
} from "./types";

const statusSet = new Set<string>(primitiveCapabilityStatuses);
const supportLevelSet = new Set<string>(primitiveSupportLevels);
const primitiveIdSet = new Set<string>(primitiveIds);
const liveStateKeys = new Set([
  "snapshot",
  "snapshots",
  "world",
  "metricsHistory",
  "interventionHistory",
  "rng",
  "events",
  "entities",
  "components",
  "spaces",
  "engine",
  "runState",
  "runSummary",
  "runSummaries",
  "template",
  "activeEngine"
]);

export function validatePrimitiveRegistryEntries(
  primitives: readonly SystemsPrimitiveEntry[] = primitiveRegistry
): readonly SystemsPrimitiveEntry[] {
  assertPlainRegistryPayload(primitives, "primitive registry");
  const ids = new Set<string>();
  for (const primitive of primitives) {
    if (!primitive.id || !primitiveIdSet.has(primitive.id)) {
      throw new Error(`Unknown primitive id: ${String(primitive.id)}`);
    }
    if (ids.has(primitive.id)) {
      throw new Error(`Duplicate primitive id: ${primitive.id}`);
    }
    ids.add(primitive.id);
    if (!primitive.label || !primitive.description) {
      throw new Error(`Primitive ${primitive.id} must have label and description`);
    }
    if (!statusSet.has(primitive.status)) {
      throw new Error(`Primitive ${primitive.id} has unknown status: ${primitive.status}`);
    }
    if (!supportLevelSet.has(primitive.supportLevel)) {
      throw new Error(`Primitive ${primitive.id} has unknown support level: ${primitive.supportLevel}`);
    }
    assertStatusSupportLevelConsistency(primitive.status, primitive.supportLevel, `Primitive ${primitive.id}`);
    if (primitive.status === "deprecated" && primitive.limitations.length === 0) {
      throw new Error(`Deprecated primitive ${primitive.id} must explain its limitations`);
    }
    if (primitive.docsRefs.length === 0) {
      throw new Error(`Primitive ${primitive.id} must reference documentation`);
    }
    for (const relatedPrimitive of primitive.relatedPrimitives) {
      if (!primitiveIdSet.has(relatedPrimitive)) {
        throw new Error(`Primitive ${primitive.id} references unknown primitive ${relatedPrimitive}`);
      }
    }
  }
  return primitives;
}

export function validateArtifactFamilyRegistry(
  artifacts: readonly ArtifactFamilyEntry[] = artifactFamilyRegistry,
  primitives: readonly SystemsPrimitiveEntry[] = primitiveRegistry
): readonly ArtifactFamilyEntry[] {
  assertPlainRegistryPayload(artifacts, "artifact family registry");
  const knownPrimitives = new Map(primitives.map((primitive) => [primitive.id, primitive]));
  const artifactTypes = new Set<string>();
  for (const artifact of artifacts) {
    if (!artifact.id || !artifact.artifactType) {
      throw new Error("Artifact family entries must include id and artifactType");
    }
    if (artifactTypes.has(artifact.artifactType)) {
      throw new Error(`Duplicate artifact type: ${artifact.artifactType}`);
    }
    artifactTypes.add(artifact.artifactType);
    const primitive = knownPrimitives.get(artifact.primitiveId);
    if (!primitive) {
      throw new Error(`Artifact ${artifact.artifactType} references unknown primitive ${artifact.primitiveId}`);
    }
    if (primitive.status === "reserved" && (artifact.importSupported || artifact.exportSupported || artifact.implemented)) {
      throw new Error(`Reserved artifact ${artifact.artifactType} must not claim implementation or import/export support`);
    }
    if (!artifact.implemented && (artifact.importSupported || artifact.exportSupported)) {
      throw new Error(`Unimplemented artifact ${artifact.artifactType} must not claim import/export support`);
    }
  }
  return artifacts;
}

export function validateTemplatePrimitiveCapabilityRegistry(
  capabilities: readonly TemplatePrimitiveCapability[] = templatePrimitiveCapabilities,
  primitives: readonly SystemsPrimitiveEntry[] = primitiveRegistry,
  templateIds: readonly string[] = productionTemplates.map((template) => template.id)
): readonly TemplatePrimitiveCapability[] {
  assertPlainRegistryPayload(capabilities, "template capability registry");
  const knownPrimitiveMap = new Map<PrimitiveId, SystemsPrimitiveEntry>(primitives.map((primitive) => [primitive.id, primitive]));
  const reservedPrimitiveIds = new Set<PrimitiveId>(primitives.filter((primitive) => primitive.status === "reserved").map((primitive) => primitive.id));
  const knownTemplateIds = new Set(templateIds);
  const seen = new Set<string>();
  for (const capability of capabilities) {
    if (!knownTemplateIds.has(capability.templateId)) {
      throw new Error(`Template capability references unknown template ${capability.templateId}`);
    }
    const primitive = knownPrimitiveMap.get(capability.primitiveId);
    if (!primitive) {
      throw new Error(`Template capability references unknown primitive ${capability.primitiveId}`);
    }
    const key = `${capability.templateId}:${capability.primitiveId}`;
    if (seen.has(key)) {
      throw new Error(`Duplicate template capability ${key}`);
    }
    seen.add(key);
    if (!statusSet.has(capability.status)) {
      throw new Error(`Template capability ${key} has unknown status ${capability.status}`);
    }
    if (!supportLevelSet.has(capability.supportLevel)) {
      throw new Error(`Template capability ${key} has unknown support level ${capability.supportLevel}`);
    }
    if (reservedPrimitiveIds.has(capability.primitiveId) && capability.runtimeActive) {
      throw new Error(`Template ${capability.templateId} cannot mark reserved primitive ${capability.primitiveId} runtime-active`);
    }
    if ((primitive.status === "serviceOnly" || primitive.status === "metadataOnly") && capability.runtimeActive) {
      throw new Error(`Template ${capability.templateId} cannot mark ${primitive.status} primitive ${capability.primitiveId} runtime-active`);
    }
    if (primitive.status === "reserved" && (capability.status !== "unsupported" || capability.supportLevel !== "none")) {
      throw new Error(`Template capability ${key} must keep reserved primitive unsupported`);
    }
    if (capability.runtimeActive && (capability.supportLevel === "none" || capability.supportLevel === "documentation")) {
      throw new Error(`Template capability ${key} cannot be runtime-active with support level ${capability.supportLevel}`);
    }
    assertStatusSupportLevelConsistency(capability.status, capability.supportLevel, `Template capability ${key}`);
    if (capability.runtimeActive && capability.status !== "implemented") {
      throw new Error(`Template capability ${key} must use implemented status when runtime-active`);
    }
    if (capability.status === "implemented" && capability.supportLevel === "none") {
      throw new Error(`Implemented template capability ${key} must declare a support level`);
    }
  }
  for (const templateId of knownTemplateIds) {
    for (const primitive of primitives) {
      if (!seen.has(`${templateId}:${primitive.id}`)) {
        throw new Error(`Missing template capability ${templateId}:${primitive.id}`);
      }
    }
  }
  return capabilities;
}

export function validateSystemsPrimitiveRegistry(): void {
  const primitives = validatePrimitiveRegistryEntries();
  validateArtifactFamilyRegistry(artifactFamilyRegistry, primitives);
  validateTemplatePrimitiveCapabilityRegistry(templatePrimitiveCapabilities, primitives);
}

function assertStatusSupportLevelConsistency(status: string, supportLevel: string, label: string): void {
  if (status === "implemented" && supportLevel === "none") {
    throw new Error(`${label} uses implemented status without an active support level`);
  }
  if (status === "serviceOnly" && supportLevel !== "service") {
    throw new Error(`${label} uses serviceOnly status without service support level`);
  }
  if (status === "metadataOnly" && supportLevel !== "metadata" && supportLevel !== "documentation") {
    throw new Error(`${label} uses metadataOnly status without metadata or documentation support level`);
  }
  if (status === "reserved" && supportLevel !== "documentation" && supportLevel !== "none") {
    throw new Error(`${label} uses reserved status with active support level ${supportLevel}`);
  }
  if (status === "unsupported" && supportLevel !== "none" && supportLevel !== "documentation") {
    throw new Error(`${label} uses unsupported status with active support level ${supportLevel}`);
  }
}

function assertPlainRegistryPayload(value: unknown, label: string): void {
  const stack: unknown[] = [value];
  while (stack.length > 0) {
    const current = stack.pop();
    if (current === null || current === undefined) {
      continue;
    }
    if (typeof current === "function" || typeof current === "symbol" || typeof current === "bigint") {
      throw new Error(`${label} must be plain JSON`);
    }
    if (typeof current !== "object") {
      if (typeof current === "number" && !Number.isFinite(current)) {
        throw new Error(`${label} must not contain non-finite numbers`);
      }
      continue;
    }
    if (Array.isArray(current)) {
      stack.push(...current);
      continue;
    }
    if (!isPlainRecord(current)) {
      throw new Error(`${label} must be plain JSON`);
    }
    for (const [key, child] of Object.entries(current)) {
      if (liveStateKeys.has(key)) {
        throw new Error(`${label} must not contain live-state-shaped key ${key}`);
      }
      stack.push(child);
    }
  }
}

function isPlainRecord(value: object): value is Record<string, unknown> {
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}
