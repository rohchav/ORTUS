import { SimulationSerializationError } from "../kernel/Errors";
import { knowledgeMemorySocialLearningArtifactType, type KnowledgeMemorySocialLearningModel } from "./types";
import { parseKnowledgeMemorySocialLearningModelJson, validateKnowledgeMemorySocialLearningModel } from "./validation";

export function serializeKnowledgeMemorySocialLearningModel(model: KnowledgeMemorySocialLearningModel): string {
  return JSON.stringify(validateKnowledgeMemorySocialLearningModel(model), null, 2);
}

export function deserializeKnowledgeMemorySocialLearningModel(json: string | unknown): KnowledgeMemorySocialLearningModel {
  if (typeof json !== "string" && (!json || typeof json !== "object" || Array.isArray(json))) {
    throw new SimulationSerializationError(`Expected artifact type ${knowledgeMemorySocialLearningArtifactType}`);
  }
  return parseKnowledgeMemorySocialLearningModelJson(json);
}
