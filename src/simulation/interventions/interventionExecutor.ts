import type { SimulationEngine } from "../kernel/SimulationEngine";
import type { ParameterValues } from "../kernel/types";
import { appendSimulationEventLog } from "../kernel/EventLog";
import { SimulationValidationError } from "../kernel/Errors";
import { deepClone, resolveParameters } from "../kernel/Validation";
import { appendInterventionHistory, nextInterventionOrder } from "./interventionHistory";
import { getInterventionDefinition } from "./interventionRegistry";
import type { AppliedInterventionRecord, InterventionExecutionResult, InterventionRequest } from "./interventionTypes";

export function executeIntervention(engine: SimulationEngine, request: InterventionRequest): InterventionExecutionResult {
  const order = nextInterventionOrder(engine);
  const requestId = `intervention-${engine.world.tick}-${order}`;
  const definition = getInterventionDefinition(request.templateId, request.interventionId);
  const baseRecord = {
    id: requestId,
    templateId: request.templateId,
    interventionId: request.interventionId,
    label: definition?.label ?? request.interventionId,
    tickApplied: engine.world.tick,
    simulationTime: engine.world.time,
    targetSummary: "not applied",
    parameters: deepClone((request.parameters ?? {}) as ParameterValues),
    order
  };

  try {
    if (request.templateId !== engine.template.id) {
      throw new SimulationValidationError(`Intervention template ${request.templateId} does not match engine template ${engine.template.id}`);
    }
    if (!definition) {
      throw new SimulationValidationError(`Unsupported intervention ${request.interventionId} for template ${request.templateId}`);
    }
    const params = resolveParameters(definition.parameterDefinitions, request.parameters ?? {});
    const built = definition.build({
      engine,
      world: engine.world.view(),
      params,
      target: request.target ?? {},
      requestId,
      historyIndex: order - 1
    });
    const applied = engine.applyCommands(built.commands, {
      sourceSystemId: `intervention:${definition.id}`,
      reason: definition.label
    });
    const record: AppliedInterventionRecord = {
      ...baseRecord,
      label: definition.label,
      parameters: deepClone(params),
      targetSummary: built.targetSummary,
      status: "applied",
      ...(built.visualMarker ? { visualMarker: built.visualMarker } : {})
    };
    appendInterventionHistory(engine, record);
    appendSimulationEventLog(engine, {
      type: definition.eventType,
      source: `intervention:${definition.id}`,
      target: built.targetSummary,
      label: definition.label,
      category: "intervention",
      severity: "info",
      payload: {
        interventionId: definition.id,
        templateId: definition.templateId,
        status: "applied",
        targetSummary: built.targetSummary,
        parameters: deepClone(params),
        mutates: [...definition.mutates],
        appliedCommandCount: applied.length
      }
    });
    return { record, appliedCommandCount: applied.length };
  } catch (error) {
    const record: AppliedInterventionRecord = {
      ...baseRecord,
      status: "failed",
      error: messageFor(error)
    };
    appendInterventionHistory(engine, record);
    appendSimulationEventLog(engine, {
      type: "intervention.failed",
      source: `intervention:${request.interventionId}`,
      label: definition?.label ?? request.interventionId,
      category: "intervention",
      severity: "error",
      payload: {
        interventionId: request.interventionId,
        templateId: request.templateId,
        status: "failed",
        parameters: deepClone((request.parameters ?? {}) as ParameterValues),
        ...(record.error ? { error: record.error } : {})
      }
    });
    throw error;
  }
}

function messageFor(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  return message.length > 360 ? `${message.slice(0, 357)}...` : message;
}
