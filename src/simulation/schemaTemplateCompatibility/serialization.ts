import { SimulationSerializationError } from "../kernel/Errors";
import {
  schemaTemplateCompatibilityReportArtifactType,
  templateMappingProfileArtifactType,
  type SchemaTemplateCompatibilityReport,
  type TemplateMappingProfile
} from "./types";
import {
  parseSchemaTemplateCompatibilityReportJson,
  parseTemplateMappingProfileJson,
  validateSchemaTemplateCompatibilityReport,
  validateTemplateMappingProfile
} from "./validation";

export function serializeSchemaTemplateCompatibilityReport(report: SchemaTemplateCompatibilityReport): string {
  return JSON.stringify(validateSchemaTemplateCompatibilityReport(report), null, 2);
}

export function deserializeSchemaTemplateCompatibilityReport(json: string | unknown): SchemaTemplateCompatibilityReport {
  if (typeof json !== "string" && (!json || typeof json !== "object" || Array.isArray(json))) {
    throw new SimulationSerializationError(`Expected artifact type ${schemaTemplateCompatibilityReportArtifactType}`);
  }
  return parseSchemaTemplateCompatibilityReportJson(json);
}

export function serializeTemplateMappingProfile(profile: TemplateMappingProfile): string {
  return JSON.stringify(validateTemplateMappingProfile(profile), null, 2);
}

export function deserializeTemplateMappingProfile(json: string | unknown): TemplateMappingProfile {
  if (typeof json !== "string" && (!json || typeof json !== "object" || Array.isArray(json))) {
    throw new SimulationSerializationError(`Expected artifact type ${templateMappingProfileArtifactType}`);
  }
  return parseTemplateMappingProfileJson(json);
}
