"use client";

import {
  modelArtifactReferenceRoles,
  modelComponentKinds,
  modelEntityKinds,
  modelMetricKinds,
  modelParameterValueKinds,
  modelRuleKinds,
  modelSpaceKinds,
  modelValueKinds,
  type ModelSchemaDefinition,
  type ModelSchemaScope
} from "../../simulation/modelSchema";
import type { AssumptionConfidence, AssumptionItem, AssumptionSeverity } from "../../simulation/assumptions";
import type { JsonValue } from "../../simulation/kernel/types";
import { primitiveIds } from "../../simulation/registry";
import {
  addModelSchemaDeclaration,
  createArtifactReference,
  createAssumptionItem,
  createAttributeTypeDeclaration,
  createComponentTypeDeclaration,
  createEntityTypeDeclaration,
  createMetricDeclaration,
  createParameterDeclaration,
  createRuleDeclaration,
  createSpaceDeclaration,
  formatNotes,
  formatReferenceIds,
  getArtifactReferenceStatus,
  parseNotes,
  parseReferenceIds,
  primitiveIdOrUndefined,
  updateModelSchemaDeclaration,
  type ModelSchemaAuthoringSectionId,
  type ModelSchemaRepeatedKey
} from "./modelSchemaAuthoring";

interface RemovalRequest {
  key: ModelSchemaRepeatedKey | "assumptionNotes" | "limitationNotes" | "validationNotes";
  index: number;
  label: string;
  triggerId: string;
  focusAfterId: string;
}

interface MetadataRemovalRequest {
  metadataKey: string;
  triggerId: string;
  focusAfterId: string;
}

interface ModelSchemaSectionEditorProps {
  draft: ModelSchemaDefinition;
  activeSection: ModelSchemaAuthoringSectionId;
  fieldErrorId: string | null;
  onDraftChange: (draft: ModelSchemaDefinition) => void;
  onRequestRemoval: (request: RemovalRequest) => void;
  onRequestMetadataRemoval: (request: MetadataRemovalRequest) => void;
}

type SectionEditorProps = Omit<ModelSchemaSectionEditorProps, "activeSection" | "onRequestMetadataRemoval">;

const scopeFields: ReadonlyArray<{ key: keyof ModelSchemaScope; label: string }> = [
  { key: "templateId", label: "Template id" },
  { key: "scenarioId", label: "Scenario id" },
  { key: "runConfigId", label: "RunConfig id" },
  { key: "hybridCompositionId", label: "Hybrid composition id" },
  { key: "networkDefinitionId", label: "Network definition id" },
  { key: "resourceSystemId", label: "Resource system id" },
  { key: "eventScheduleId", label: "Event schedule id" },
  { key: "delayQueueId", label: "Delay queue id" },
  { key: "feedbackLoopModelId", label: "Feedback loop model id" },
  { key: "scaleModelId", label: "Scale model id" },
  { key: "scaleViewStateId", label: "Scale view state id" },
  { key: "boundaryModelId", label: "Boundary model id" },
  { key: "fieldLayerId", label: "Field layer id" },
  { key: "observabilityModelId", label: "Observability model id" },
  { key: "causalAssumptionModelId", label: "Causal assumption model id" },
  { key: "quantitySemanticsModelId", label: "Quantity semantics model id" },
  { key: "emergencePatternModelId", label: "Emergence pattern model id" },
  { key: "robustnessResilienceModelId", label: "Robustness/resilience model id" },
  { key: "controlStrategyModelId", label: "Control strategy model id" }
];

export function ModelSchemaSectionEditor({
  draft,
  activeSection,
  fieldErrorId,
  onDraftChange,
  onRequestRemoval,
  onRequestMetadataRemoval
}: ModelSchemaSectionEditorProps) {
  switch (activeSection) {
    case "identity":
      return <IdentityEditor draft={draft} fieldErrorId={fieldErrorId} onDraftChange={onDraftChange} />;
    case "entities":
      return <EntitiesEditor draft={draft} fieldErrorId={fieldErrorId} onDraftChange={onDraftChange} onRequestRemoval={onRequestRemoval} />;
    case "components":
      return <ComponentsEditor draft={draft} fieldErrorId={fieldErrorId} onDraftChange={onDraftChange} onRequestRemoval={onRequestRemoval} />;
    case "attributes":
      return <AttributesEditor draft={draft} fieldErrorId={fieldErrorId} onDraftChange={onDraftChange} onRequestRemoval={onRequestRemoval} />;
    case "spaces":
      return <SpacesEditor draft={draft} fieldErrorId={fieldErrorId} onDraftChange={onDraftChange} onRequestRemoval={onRequestRemoval} />;
    case "parameters":
      return <ParametersEditor draft={draft} fieldErrorId={fieldErrorId} onDraftChange={onDraftChange} onRequestRemoval={onRequestRemoval} />;
    case "metrics":
      return <MetricsEditor draft={draft} fieldErrorId={fieldErrorId} onDraftChange={onDraftChange} onRequestRemoval={onRequestRemoval} />;
    case "rules":
      return <RulesEditor draft={draft} fieldErrorId={fieldErrorId} onDraftChange={onDraftChange} onRequestRemoval={onRequestRemoval} />;
    case "artifacts":
      return <ArtifactsEditor draft={draft} fieldErrorId={fieldErrorId} onDraftChange={onDraftChange} onRequestRemoval={onRequestRemoval} />;
    case "notes":
      return (
        <NotesEditor
          draft={draft}
          fieldErrorId={fieldErrorId}
          onDraftChange={onDraftChange}
          onRequestRemoval={onRequestRemoval}
          onRequestMetadataRemoval={onRequestMetadataRemoval}
        />
      );
  }
}

function IdentityEditor({
  draft,
  fieldErrorId,
  onDraftChange
}: Pick<ModelSchemaSectionEditorProps, "draft" | "fieldErrorId" | "onDraftChange">) {
  return (
    <section id="schema-section-identity" className="schema-editor-section" aria-labelledby="schema-editor-title-identity" tabIndex={-1}>
      <SectionHeading id="identity" title="Schema Identity" description="Required fields identify the structural artifact. They do not create runtime identity." />
      <div className="schema-form-grid">
        <FixedField label="Artifact type" value={draft.artifactType} description="Fixed artifact family. It cannot be changed in this form." />
        <FixedField label="Schema version" value={draft.schemaVersion} description="Fixed service schema version." />
        <TextField
          id="schema-identity-id"
          label="Schema id"
          value={draft.id}
          required
          invalid={fieldErrorId === "schema-identity-id"}
          description="Required stable identifier, up to 160 characters."
          onChange={(id) => onDraftChange({ ...draft, id })}
        />
        <TextField
          id="schema-identity-name"
          label="Name"
          value={draft.name}
          required
          invalid={fieldErrorId === "schema-identity-name"}
          description="Required display name, up to 180 characters."
          onChange={(name) => onDraftChange({ ...draft, name })}
        />
        <TextField
          id="schema-identity-version"
          label="Version"
          value={draft.version}
          required
          invalid={fieldErrorId === "schema-identity-version"}
          description="Required bounded version label. The service accepts text up to 80 characters."
          onChange={(version) => onDraftChange({ ...draft, version })}
        />
        <TextField
          id="schema-identity-description"
          label="Description"
          value={draft.description ?? ""}
          multiline
          invalid={fieldErrorId === "schema-identity-description"}
          description="Structural purpose and boundaries only. Do not claim prediction, calibration, or validation."
          onChange={(description) => onDraftChange({ ...draft, description })}
        />
      </div>
      <details className="schema-form-disclosure">
        <summary>Optional structural scope references</summary>
        <p>Scope ids are references only. They do not load, activate, convert, or execute another artifact.</p>
        <div className="schema-form-grid">
          {scopeFields.map(({ key, label }) => (
            <TextField
              key={key}
              id={`schema-scope-${key}`}
              label={label}
              value={typeof draft.scope?.[key] === "string" ? String(draft.scope?.[key]) : ""}
              onChange={(value) => {
                const scope = { ...(draft.scope ?? {}), [key]: optionalString(value) };
                onDraftChange({ ...draft, scope });
              }}
            />
          ))}
          <TextField
            id="schema-scope-notes"
            label="Scope notes"
            value={formatNotes(draft.scope?.notes)}
            multiline
            description="One bounded note per line."
            onChange={(value) => onDraftChange({ ...draft, scope: { ...(draft.scope ?? {}), notes: parseNotes(value) } })}
          />
        </div>
      </details>
      <p className="schema-risk-note">A valid model schema is still not a runnable simulation.</p>
    </section>
  );
}

function EntitiesEditor({
  draft,
  fieldErrorId,
  onDraftChange,
  onRequestRemoval
}: SectionEditorProps) {
  const addButtonId = "schema-add-entityTypes";
  return (
    <RepeatedSection
      id="entities"
      title="Entity Types"
      description="At least one entity type is required by the model-schema service."
      count={draft.entityTypes.length}
      addLabel="Add entity"
      addButtonId={addButtonId}
      onAdd={() => {
        const index = draft.entityTypes.length;
        onDraftChange(addModelSchemaDeclaration(draft, "entityTypes", createEntityTypeDeclaration(draft)));
        focusAfterRender(`schema-entityTypes-${index}-id`);
      }}
    >
      {draft.entityTypes.map((entity, index) => (
        <DeclarationCard
          key={`entity-${index}`}
          title={entity.label || entity.id || `Entity ${index + 1}`}
          kind={entity.entityKind}
          removeId={`schema-entityTypes-${index}-remove`}
          removeLabel={`Remove entity ${entity.label || entity.id || index + 1}`}
          onRemove={() =>
            onRequestRemoval({
              key: "entityTypes",
              index,
              label: entity.label || entity.id || `Entity ${index + 1}`,
              triggerId: `schema-entityTypes-${index}-remove`,
              focusAfterId: addButtonId
            })
          }
        >
          <div className="schema-form-grid">
            <TextField
              id={`schema-entityTypes-${index}-id`}
              label="Entity id"
              value={entity.id}
              required
              invalid={fieldErrorId === `schema-entityTypes-${index}-id`}
              onChange={(id) => onDraftChange(updateModelSchemaDeclaration(draft, "entityTypes", index, { ...entity, id }))}
            />
            <TextField
              id={`schema-entityTypes-${index}-label`}
              label="Label"
              value={entity.label}
              required
              invalid={fieldErrorId === `schema-entityTypes-${index}-label`}
              onChange={(label) => onDraftChange(updateModelSchemaDeclaration(draft, "entityTypes", index, { ...entity, label }))}
            />
            <SelectField
              id={`schema-entityTypes-${index}-entityKind`}
              label="Entity kind"
              value={entity.entityKind}
              options={modelEntityKinds}
              onChange={(entityKind) =>
                onDraftChange(updateModelSchemaDeclaration(draft, "entityTypes", index, { ...entity, entityKind: entityKind as typeof entity.entityKind }))
              }
            />
            <ActiveField
              id={`schema-entityTypes-${index}-active`}
              active={entity.active}
              onChange={(active) => onDraftChange(updateModelSchemaDeclaration(draft, "entityTypes", index, { ...entity, active }))}
            />
            <TextField
              id={`schema-entityTypes-${index}-description`}
              label="Description"
              value={entity.description ?? ""}
              multiline
              onChange={(description) =>
                onDraftChange(updateModelSchemaDeclaration(draft, "entityTypes", index, { ...entity, description: optionalString(description) }))
              }
            />
            <ReferenceListField
              id={`schema-entityTypes-${index}-componentTypeIds`}
              label="Component type ids"
              value={entity.componentTypeIds}
              onChange={(componentTypeIds) =>
                onDraftChange(updateModelSchemaDeclaration(draft, "entityTypes", index, { ...entity, componentTypeIds }))
              }
            />
            <ReferenceListField
              id={`schema-entityTypes-${index}-attributeTypeIds`}
              label="Attribute type ids"
              value={entity.attributeTypeIds}
              onChange={(attributeTypeIds) =>
                onDraftChange(updateModelSchemaDeclaration(draft, "entityTypes", index, { ...entity, attributeTypeIds }))
              }
            />
            <ReferenceListField
              id={`schema-entityTypes-${index}-spaceIds`}
              label="Space ids"
              value={entity.spaceIds}
              onChange={(spaceIds) => onDraftChange(updateModelSchemaDeclaration(draft, "entityTypes", index, { ...entity, spaceIds }))}
            />
            <ReferenceListField
              id={`schema-entityTypes-${index}-relationTypeIds`}
              label="Relation type ids"
              value={entity.relationTypeIds}
              onChange={(relationTypeIds) =>
                onDraftChange(updateModelSchemaDeclaration(draft, "entityTypes", index, { ...entity, relationTypeIds }))
              }
            />
            <NotesField
              id={`schema-entityTypes-${index}-notes`}
              value={entity.notes}
              onChange={(notes) => onDraftChange(updateModelSchemaDeclaration(draft, "entityTypes", index, { ...entity, notes }))}
            />
            <ExecutableField />
          </div>
        </DeclarationCard>
      ))}
    </RepeatedSection>
  );
}

function ComponentsEditor(props: SectionEditorProps) {
  const { draft, fieldErrorId, onDraftChange, onRequestRemoval } = props;
  const items = draft.componentTypes ?? [];
  const addButtonId = "schema-add-componentTypes";
  return (
    <RepeatedSection
      id="components"
      title="Component Types"
      description="Components group structural attributes. Entity references are checked by the model-schema service."
      count={items.length}
      addLabel="Add component"
      addButtonId={addButtonId}
      onAdd={() => {
        const index = items.length;
        onDraftChange(addModelSchemaDeclaration(draft, "componentTypes", createComponentTypeDeclaration(draft)));
        focusAfterRender(`schema-componentTypes-${index}-id`);
      }}
    >
      {items.map((component, index) => (
        <DeclarationCard
          key={`component-${index}`}
          title={component.label || component.id || `Component ${index + 1}`}
          kind={component.componentKind}
          removeId={`schema-componentTypes-${index}-remove`}
          removeLabel={`Remove component ${component.label || component.id || index + 1}`}
          onRemove={() =>
            onRequestRemoval({
              key: "componentTypes",
              index,
              label: component.label || component.id || `Component ${index + 1}`,
              triggerId: `schema-componentTypes-${index}-remove`,
              focusAfterId: addButtonId
            })
          }
        >
          <div className="schema-form-grid">
            <TextField
              id={`schema-componentTypes-${index}-id`}
              label="Component id"
              value={component.id}
              required
              invalid={fieldErrorId === `schema-componentTypes-${index}-id`}
              onChange={(id) => onDraftChange(updateModelSchemaDeclaration(draft, "componentTypes", index, { ...component, id }))}
            />
            <TextField
              id={`schema-componentTypes-${index}-label`}
              label="Label"
              value={component.label}
              required
              invalid={fieldErrorId === `schema-componentTypes-${index}-label`}
              onChange={(label) => onDraftChange(updateModelSchemaDeclaration(draft, "componentTypes", index, { ...component, label }))}
            />
            <SelectField
              id={`schema-componentTypes-${index}-componentKind`}
              label="Component kind"
              value={component.componentKind}
              options={modelComponentKinds}
              onChange={(componentKind) =>
                onDraftChange(
                  updateModelSchemaDeclaration(draft, "componentTypes", index, {
                    ...component,
                    componentKind: componentKind as typeof component.componentKind
                  })
                )
              }
            />
            <ActiveField
              id={`schema-componentTypes-${index}-active`}
              active={component.active}
              onChange={(active) => onDraftChange(updateModelSchemaDeclaration(draft, "componentTypes", index, { ...component, active }))}
            />
            <ReferenceListField
              id={`schema-componentTypes-${index}-attributeTypeIds`}
              label="Attribute type ids"
              value={component.attributeTypeIds}
              onChange={(attributeTypeIds) =>
                onDraftChange(updateModelSchemaDeclaration(draft, "componentTypes", index, { ...component, attributeTypeIds }))
              }
            />
            <NotesField
              id={`schema-componentTypes-${index}-notes`}
              value={component.notes}
              onChange={(notes) => onDraftChange(updateModelSchemaDeclaration(draft, "componentTypes", index, { ...component, notes }))}
            />
            <ExecutableField />
          </div>
        </DeclarationCard>
      ))}
    </RepeatedSection>
  );
}

function AttributesEditor(props: SectionEditorProps) {
  const { draft, fieldErrorId, onDraftChange, onRequestRemoval } = props;
  const items = draft.attributeTypes ?? [];
  const addButtonId = "schema-add-attributeTypes";
  return (
    <RepeatedSection
      id="attributes"
      title="Attribute Types"
      description="Attributes describe bounded value shapes. This form does not accept formulas or executable defaults."
      count={items.length}
      addLabel="Add attribute"
      addButtonId={addButtonId}
      onAdd={() => {
        const index = items.length;
        onDraftChange(addModelSchemaDeclaration(draft, "attributeTypes", createAttributeTypeDeclaration(draft)));
        focusAfterRender(`schema-attributeTypes-${index}-id`);
      }}
    >
      {items.map((attribute, index) => (
        <DeclarationCard
          key={`attribute-${index}`}
          title={attribute.label || attribute.id || `Attribute ${index + 1}`}
          kind={attribute.valueKind}
          removeId={`schema-attributeTypes-${index}-remove`}
          removeLabel={`Remove attribute ${attribute.label || attribute.id || index + 1}`}
          onRemove={() =>
            onRequestRemoval({
              key: "attributeTypes",
              index,
              label: attribute.label || attribute.id || `Attribute ${index + 1}`,
              triggerId: `schema-attributeTypes-${index}-remove`,
              focusAfterId: addButtonId
            })
          }
        >
          <div className="schema-form-grid">
            <TextField
              id={`schema-attributeTypes-${index}-id`}
              label="Attribute id"
              value={attribute.id}
              required
              invalid={fieldErrorId === `schema-attributeTypes-${index}-id`}
              onChange={(id) => onDraftChange(updateModelSchemaDeclaration(draft, "attributeTypes", index, { ...attribute, id }))}
            />
            <TextField
              id={`schema-attributeTypes-${index}-label`}
              label="Label"
              value={attribute.label}
              required
              invalid={fieldErrorId === `schema-attributeTypes-${index}-label`}
              onChange={(label) => onDraftChange(updateModelSchemaDeclaration(draft, "attributeTypes", index, { ...attribute, label }))}
            />
            <SelectField
              id={`schema-attributeTypes-${index}-valueKind`}
              label="Value kind"
              value={attribute.valueKind}
              options={modelValueKinds}
              onChange={(valueKind) =>
                onDraftChange(
                  updateModelSchemaDeclaration(draft, "attributeTypes", index, {
                    ...attribute,
                    valueKind: valueKind as typeof attribute.valueKind
                  })
                )
              }
            />
            <ActiveField
              id={`schema-attributeTypes-${index}-active`}
              active={attribute.active}
              onChange={(active) => onDraftChange(updateModelSchemaDeclaration(draft, "attributeTypes", index, { ...attribute, active }))}
            />
            <TextField
              id={`schema-attributeTypes-${index}-defaultValueDescription`}
              label="Default value description"
              value={attribute.defaultValueDescription ?? ""}
              description="Descriptive text only. It is not parsed or executed."
              onChange={(defaultValueDescription) =>
                onDraftChange(
                  updateModelSchemaDeclaration(draft, "attributeTypes", index, {
                    ...attribute,
                    defaultValueDescription: optionalString(defaultValueDescription)
                  })
                )
              }
            />
            {!attribute.allowedValues || attribute.allowedValues.every((value) => typeof value === "string") ? (
              <TextField
                id={`schema-attributeTypes-${index}-allowedValues`}
                label="Allowed text values"
                value={formatAllowedValues(attribute.allowedValues)}
                multiline
                description="One literal text value per line. No expressions or executable content."
                onChange={(allowedValues) =>
                  onDraftChange(
                    updateModelSchemaDeclaration(draft, "attributeTypes", index, {
                      ...attribute,
                      allowedValues: parseAllowedValues(allowedValues)
                    })
                  )
                }
              />
            ) : (
              <FixedField
                label="Imported non-text allowed values"
                value={JSON.stringify(attribute.allowedValues)}
                description="Preserved as inert JSON and read-only in this V1 form to avoid changing value types."
              />
            )}
            <TextField
              id={`schema-attributeTypes-${index}-quantityId`}
              label="Quantity id"
              value={attribute.quantityId ?? ""}
              onChange={(quantityId) =>
                onDraftChange(
                  updateModelSchemaDeclaration(draft, "attributeTypes", index, { ...attribute, quantityId: optionalString(quantityId) })
                )
              }
            />
            <TextField
              id={`schema-attributeTypes-${index}-unitId`}
              label="Unit id"
              value={attribute.unitId ?? ""}
              onChange={(unitId) =>
                onDraftChange(updateModelSchemaDeclaration(draft, "attributeTypes", index, { ...attribute, unitId: optionalString(unitId) }))
              }
            />
            <TextField
              id={`schema-attributeTypes-${index}-dimensionId`}
              label="Dimension id"
              value={attribute.dimensionId ?? ""}
              onChange={(dimensionId) =>
                onDraftChange(
                  updateModelSchemaDeclaration(draft, "attributeTypes", index, { ...attribute, dimensionId: optionalString(dimensionId) })
                )
              }
            />
            <NotesField
              id={`schema-attributeTypes-${index}-notes`}
              value={attribute.notes}
              onChange={(notes) => onDraftChange(updateModelSchemaDeclaration(draft, "attributeTypes", index, { ...attribute, notes }))}
            />
            <ExecutableField />
          </div>
        </DeclarationCard>
      ))}
    </RepeatedSection>
  );
}

function SpacesEditor(props: SectionEditorProps) {
  const { draft, fieldErrorId, onDraftChange, onRequestRemoval } = props;
  const items = draft.spaces ?? [];
  const addButtonId = "schema-add-spaces";
  return (
    <RepeatedSection
      id="spaces"
      title="Spaces"
      description="Space declarations are structural references. They do not generate geometry, fields, maps, or runtime topology."
      count={items.length}
      addLabel="Add space"
      addButtonId={addButtonId}
      onAdd={() => {
        const index = items.length;
        onDraftChange(addModelSchemaDeclaration(draft, "spaces", createSpaceDeclaration(draft)));
        focusAfterRender(`schema-spaces-${index}-id`);
      }}
    >
      {items.map((space, index) => (
        <DeclarationCard
          key={`space-${index}`}
          title={space.label || space.id || `Space ${index + 1}`}
          kind={space.spaceKind}
          removeId={`schema-spaces-${index}-remove`}
          removeLabel={`Remove space ${space.label || space.id || index + 1}`}
          onRemove={() =>
            onRequestRemoval({
              key: "spaces",
              index,
              label: space.label || space.id || `Space ${index + 1}`,
              triggerId: `schema-spaces-${index}-remove`,
              focusAfterId: addButtonId
            })
          }
        >
          <div className="schema-form-grid">
            <TextField
              id={`schema-spaces-${index}-id`}
              label="Space id"
              value={space.id}
              required
              invalid={fieldErrorId === `schema-spaces-${index}-id`}
              onChange={(id) => onDraftChange(updateModelSchemaDeclaration(draft, "spaces", index, { ...space, id }))}
            />
            <TextField
              id={`schema-spaces-${index}-label`}
              label="Label"
              value={space.label}
              required
              invalid={fieldErrorId === `schema-spaces-${index}-label`}
              onChange={(label) => onDraftChange(updateModelSchemaDeclaration(draft, "spaces", index, { ...space, label }))}
            />
            <SelectField
              id={`schema-spaces-${index}-spaceKind`}
              label="Space kind"
              value={space.spaceKind}
              options={modelSpaceKinds}
              onChange={(spaceKind) =>
                onDraftChange(updateModelSchemaDeclaration(draft, "spaces", index, { ...space, spaceKind: spaceKind as typeof space.spaceKind }))
              }
            />
            <ActiveField
              id={`schema-spaces-${index}-active`}
              active={space.active}
              onChange={(active) => onDraftChange(updateModelSchemaDeclaration(draft, "spaces", index, { ...space, active }))}
            />
            {(["boundaryModelId", "fieldLayerId", "networkDefinitionId", "scaleModelId"] as const).map((key) => (
              <TextField
                key={key}
                id={`schema-spaces-${index}-${key}`}
                label={labelFromCamelCase(key)}
                value={space[key] ?? ""}
                onChange={(value) =>
                  onDraftChange(updateModelSchemaDeclaration(draft, "spaces", index, { ...space, [key]: optionalString(value) }))
                }
              />
            ))}
            <TextField
              id={`schema-spaces-${index}-coordinateDescription`}
              label="Coordinate description"
              value={space.coordinateDescription ?? ""}
              multiline
              description="Describe coordinate semantics only. No map or geometry import is performed."
              onChange={(coordinateDescription) =>
                onDraftChange(
                  updateModelSchemaDeclaration(draft, "spaces", index, {
                    ...space,
                    coordinateDescription: optionalString(coordinateDescription)
                  })
                )
              }
            />
            <NotesField
              id={`schema-spaces-${index}-notes`}
              value={space.notes}
              onChange={(notes) => onDraftChange(updateModelSchemaDeclaration(draft, "spaces", index, { ...space, notes }))}
            />
            <ExecutableField />
          </div>
        </DeclarationCard>
      ))}
    </RepeatedSection>
  );
}

function ParametersEditor(props: SectionEditorProps) {
  const { draft, fieldErrorId, onDraftChange, onRequestRemoval } = props;
  const items = draft.parameters ?? [];
  const addButtonId = "schema-add-parameters";
  return (
    <RepeatedSection
      id="parameters"
      title="Parameters"
      description="Parameters describe a future model surface. They are not applied to a template or active run."
      count={items.length}
      addLabel="Add parameter"
      addButtonId={addButtonId}
      onAdd={() => {
        const index = items.length;
        onDraftChange(addModelSchemaDeclaration(draft, "parameters", createParameterDeclaration(draft)));
        focusAfterRender(`schema-parameters-${index}-id`);
      }}
    >
      {items.map((parameter, index) => (
        <DeclarationCard
          key={`parameter-${index}`}
          title={parameter.label || parameter.id || `Parameter ${index + 1}`}
          kind={parameter.valueKind}
          removeId={`schema-parameters-${index}-remove`}
          removeLabel={`Remove parameter ${parameter.label || parameter.id || index + 1}`}
          onRemove={() =>
            onRequestRemoval({
              key: "parameters",
              index,
              label: parameter.label || parameter.id || `Parameter ${index + 1}`,
              triggerId: `schema-parameters-${index}-remove`,
              focusAfterId: addButtonId
            })
          }
        >
          <div className="schema-form-grid">
            <TextField
              id={`schema-parameters-${index}-id`}
              label="Parameter id"
              value={parameter.id}
              required
              invalid={fieldErrorId === `schema-parameters-${index}-id`}
              onChange={(id) => onDraftChange(updateModelSchemaDeclaration(draft, "parameters", index, { ...parameter, id }))}
            />
            <TextField
              id={`schema-parameters-${index}-label`}
              label="Label"
              value={parameter.label}
              required
              invalid={fieldErrorId === `schema-parameters-${index}-label`}
              onChange={(label) => onDraftChange(updateModelSchemaDeclaration(draft, "parameters", index, { ...parameter, label }))}
            />
            <SelectField
              id={`schema-parameters-${index}-valueKind`}
              label="Value kind"
              value={parameter.valueKind}
              options={modelParameterValueKinds}
              onChange={(valueKind) =>
                onDraftChange(
                  updateModelSchemaDeclaration(draft, "parameters", index, { ...parameter, valueKind: valueKind as typeof parameter.valueKind })
                )
              }
            />
            <ActiveField
              id={`schema-parameters-${index}-active`}
              active={parameter.active}
              onChange={(active) => onDraftChange(updateModelSchemaDeclaration(draft, "parameters", index, { ...parameter, active }))}
            />
            <TextField
              id={`schema-parameters-${index}-defaultValueDescription`}
              label="Default value description"
              value={parameter.defaultValueDescription ?? ""}
              description="Descriptive text only. No formula or expression is evaluated."
              onChange={(defaultValueDescription) =>
                onDraftChange(
                  updateModelSchemaDeclaration(draft, "parameters", index, {
                    ...parameter,
                    defaultValueDescription: optionalString(defaultValueDescription)
                  })
                )
              }
            />
            <TextField
              id={`schema-parameters-${index}-rangeDescription`}
              label="Range description"
              value={parameter.rangeDescription ?? ""}
              description="Human-readable bounds only; this form does not add executable constraints."
              onChange={(rangeDescription) =>
                onDraftChange(
                  updateModelSchemaDeclaration(draft, "parameters", index, {
                    ...parameter,
                    rangeDescription: optionalString(rangeDescription)
                  })
                )
              }
            />
            {(["quantityId", "unitId", "uncertaintyVariableId"] as const).map((key) => (
              <TextField
                key={key}
                id={`schema-parameters-${index}-${key}`}
                label={labelFromCamelCase(key)}
                value={parameter[key] ?? ""}
                onChange={(value) =>
                  onDraftChange(updateModelSchemaDeclaration(draft, "parameters", index, { ...parameter, [key]: optionalString(value) }))
                }
              />
            ))}
            <NotesField
              id={`schema-parameters-${index}-notes`}
              value={parameter.notes}
              onChange={(notes) => onDraftChange(updateModelSchemaDeclaration(draft, "parameters", index, { ...parameter, notes }))}
            />
            <ExecutableField />
          </div>
        </DeclarationCard>
      ))}
    </RepeatedSection>
  );
}

function MetricsEditor(props: SectionEditorProps) {
  const { draft, fieldErrorId, onDraftChange, onRequestRemoval } = props;
  const items = draft.metrics ?? [];
  const addButtonId = "schema-add-metrics";
  return (
    <RepeatedSection
      id="metrics"
      title="Metrics"
      description="Metric declarations describe intended model outputs. They are not computed, measured, calibrated, or validated here."
      count={items.length}
      addLabel="Add metric"
      addButtonId={addButtonId}
      onAdd={() => {
        const index = items.length;
        onDraftChange(addModelSchemaDeclaration(draft, "metrics", createMetricDeclaration(draft)));
        focusAfterRender(`schema-metrics-${index}-id`);
      }}
    >
      <p className="schema-risk-note">Declared metrics are model-output semantics, not empirical measurements or validation evidence.</p>
      {items.map((metric, index) => (
        <DeclarationCard
          key={`metric-${index}`}
          title={metric.label || metric.id || `Metric ${index + 1}`}
          kind={metric.metricKind}
          removeId={`schema-metrics-${index}-remove`}
          removeLabel={`Remove metric ${metric.label || metric.id || index + 1}`}
          onRemove={() =>
            onRequestRemoval({
              key: "metrics",
              index,
              label: metric.label || metric.id || `Metric ${index + 1}`,
              triggerId: `schema-metrics-${index}-remove`,
              focusAfterId: addButtonId
            })
          }
        >
          <div className="schema-form-grid">
            <TextField
              id={`schema-metrics-${index}-id`}
              label="Metric id"
              value={metric.id}
              required
              invalid={fieldErrorId === `schema-metrics-${index}-id`}
              onChange={(id) => onDraftChange(updateModelSchemaDeclaration(draft, "metrics", index, { ...metric, id }))}
            />
            <TextField
              id={`schema-metrics-${index}-label`}
              label="Label"
              value={metric.label}
              required
              invalid={fieldErrorId === `schema-metrics-${index}-label`}
              onChange={(label) => onDraftChange(updateModelSchemaDeclaration(draft, "metrics", index, { ...metric, label }))}
            />
            <SelectField
              id={`schema-metrics-${index}-metricKind`}
              label="Metric kind"
              value={metric.metricKind}
              options={modelMetricKinds}
              onChange={(metricKind) =>
                onDraftChange(updateModelSchemaDeclaration(draft, "metrics", index, { ...metric, metricKind: metricKind as typeof metric.metricKind }))
              }
            />
            <ActiveField
              id={`schema-metrics-${index}-active`}
              active={metric.active}
              onChange={(active) => onDraftChange(updateModelSchemaDeclaration(draft, "metrics", index, { ...metric, active }))}
            />
            <TextField
              id={`schema-metrics-${index}-quantityId`}
              label="Quantity id"
              value={metric.quantityId ?? ""}
              onChange={(quantityId) =>
                onDraftChange(updateModelSchemaDeclaration(draft, "metrics", index, { ...metric, quantityId: optionalString(quantityId) }))
              }
            />
            <TextField
              id={`schema-metrics-${index}-unitId`}
              label="Unit id"
              value={metric.unitId ?? ""}
              onChange={(unitId) =>
                onDraftChange(updateModelSchemaDeclaration(draft, "metrics", index, { ...metric, unitId: optionalString(unitId) }))
              }
            />
            <TextField
              id={`schema-metrics-${index}-sourceDescription`}
              label="Source description"
              value={metric.sourceDescription ?? ""}
              multiline
              description="Describe intended model-side source only. Do not claim observed or empirical provenance."
              onChange={(sourceDescription) =>
                onDraftChange(
                  updateModelSchemaDeclaration(draft, "metrics", index, { ...metric, sourceDescription: optionalString(sourceDescription) })
                )
              }
            />
            <NotesField
              id={`schema-metrics-${index}-notes`}
              value={metric.notes}
              onChange={(notes) => onDraftChange(updateModelSchemaDeclaration(draft, "metrics", index, { ...metric, notes }))}
            />
            <ExecutableField />
          </div>
        </DeclarationCard>
      ))}
    </RepeatedSection>
  );
}

function RulesEditor(props: SectionEditorProps) {
  const { draft, fieldErrorId, onDraftChange, onRequestRemoval } = props;
  const items = draft.ruleDeclarations ?? [];
  const addButtonId = "schema-add-ruleDeclarations";
  return (
    <RepeatedSection
      id="rules"
      title="Rule Declarations"
      description="Rules record intended structural semantics only. No parser, compiler, preview, or runtime behavior is connected."
      count={items.length}
      addLabel="Add rule declaration"
      addButtonId={addButtonId}
      onAdd={() => {
        const index = items.length;
        onDraftChange(addModelSchemaDeclaration(draft, "ruleDeclarations", createRuleDeclaration(draft)));
        focusAfterRender(`schema-ruleDeclarations-${index}-id`);
      }}
    >
      <p className="schema-risk-note">Rule declarations describe intended behavior only. They are not executed by ORTUS.</p>
      {items.map((rule, index) => (
        <DeclarationCard
          key={`rule-${index}`}
          title={rule.label || rule.id || `Rule ${index + 1}`}
          kind={rule.ruleKind}
          removeId={`schema-ruleDeclarations-${index}-remove`}
          removeLabel={`Remove rule ${rule.label || rule.id || index + 1}`}
          onRemove={() =>
            onRequestRemoval({
              key: "ruleDeclarations",
              index,
              label: rule.label || rule.id || `Rule ${index + 1}`,
              triggerId: `schema-ruleDeclarations-${index}-remove`,
              focusAfterId: addButtonId
            })
          }
        >
          <div className="schema-form-grid">
            <TextField
              id={`schema-ruleDeclarations-${index}-id`}
              label="Rule id"
              value={rule.id}
              required
              invalid={fieldErrorId === `schema-ruleDeclarations-${index}-id`}
              onChange={(id) => onDraftChange(updateModelSchemaDeclaration(draft, "ruleDeclarations", index, { ...rule, id }))}
            />
            <TextField
              id={`schema-ruleDeclarations-${index}-label`}
              label="Label"
              value={rule.label}
              required
              invalid={fieldErrorId === `schema-ruleDeclarations-${index}-label`}
              onChange={(label) => onDraftChange(updateModelSchemaDeclaration(draft, "ruleDeclarations", index, { ...rule, label }))}
            />
            <SelectField
              id={`schema-ruleDeclarations-${index}-ruleKind`}
              label="Rule kind"
              value={rule.ruleKind}
              options={modelRuleKinds}
              onChange={(ruleKind) =>
                onDraftChange(
                  updateModelSchemaDeclaration(draft, "ruleDeclarations", index, { ...rule, ruleKind: ruleKind as typeof rule.ruleKind })
                )
              }
            />
            <ActiveField
              id={`schema-ruleDeclarations-${index}-active`}
              active={rule.active}
              onChange={(active) => onDraftChange(updateModelSchemaDeclaration(draft, "ruleDeclarations", index, { ...rule, active }))}
            />
            <TextField
              id={`schema-ruleDeclarations-${index}-ruleDescription`}
              label="Structural behavior description"
              value={rule.ruleDescription}
              required
              multiline
              invalid={fieldErrorId === `schema-ruleDeclarations-${index}-ruleDescription`}
              description="Conceptual prose only. Do not enter formulas, code, scripts, function bodies, runtime hooks, or execution instructions."
              onChange={(ruleDescription) =>
                onDraftChange(updateModelSchemaDeclaration(draft, "ruleDeclarations", index, { ...rule, ruleDescription }))
              }
            />
            <ReferenceListField
              id={`schema-ruleDeclarations-${index}-sourceEntityTypeIds`}
              label="Source entity type ids"
              value={rule.sourceEntityTypeIds}
              onChange={(sourceEntityTypeIds) =>
                onDraftChange(updateModelSchemaDeclaration(draft, "ruleDeclarations", index, { ...rule, sourceEntityTypeIds }))
              }
            />
            <ReferenceListField
              id={`schema-ruleDeclarations-${index}-targetEntityTypeIds`}
              label="Target entity type ids"
              value={rule.targetEntityTypeIds}
              onChange={(targetEntityTypeIds) =>
                onDraftChange(updateModelSchemaDeclaration(draft, "ruleDeclarations", index, { ...rule, targetEntityTypeIds }))
              }
            />
            <ReferenceListField
              id={`schema-ruleDeclarations-${index}-parameterIds`}
              label="Parameter ids"
              value={rule.parameterIds}
              onChange={(parameterIds) =>
                onDraftChange(updateModelSchemaDeclaration(draft, "ruleDeclarations", index, { ...rule, parameterIds }))
              }
            />
            <ReferenceListField
              id={`schema-ruleDeclarations-${index}-metricIds`}
              label="Metric ids"
              value={rule.metricIds}
              onChange={(metricIds) => onDraftChange(updateModelSchemaDeclaration(draft, "ruleDeclarations", index, { ...rule, metricIds }))}
            />
            <ReferenceListField
              id={`schema-ruleDeclarations-${index}-referencedArtifactIds`}
              label="Artifact reference ids"
              value={rule.referencedArtifactIds}
              onChange={(referencedArtifactIds) =>
                onDraftChange(updateModelSchemaDeclaration(draft, "ruleDeclarations", index, { ...rule, referencedArtifactIds }))
              }
            />
            <NotesField
              id={`schema-ruleDeclarations-${index}-notes`}
              value={rule.notes}
              onChange={(notes) => onDraftChange(updateModelSchemaDeclaration(draft, "ruleDeclarations", index, { ...rule, notes }))}
            />
            <ExecutableField />
          </div>
          {(rule.ruleKind === "socialLearning" || rule.ruleKind === "memoryUpdate" || rule.ruleKind === "beliefUpdate") && (
            <p className="schema-risk-note">
              This social/cognitive rule kind is a structural placeholder. It does not implement human cognition, memory, belief updates, or social-learning runtime.
            </p>
          )}
        </DeclarationCard>
      ))}
    </RepeatedSection>
  );
}

function ArtifactsEditor(props: SectionEditorProps) {
  const { draft, fieldErrorId, onDraftChange, onRequestRemoval } = props;
  const items = draft.artifactReferences ?? [];
  const addButtonId = "schema-add-artifactReferences";
  return (
    <RepeatedSection
      id="artifacts"
      title="Artifact References"
      description="References attach structural context only. They do not import, activate, convert, execute, or validate another artifact."
      count={items.length}
      addLabel="Add artifact reference"
      addButtonId={addButtonId}
      onAdd={() => {
        const index = items.length;
        onDraftChange(addModelSchemaDeclaration(draft, "artifactReferences", createArtifactReference(draft)));
        focusAfterRender(`schema-artifactReferences-${index}-id`);
      }}
    >
      {items.map((reference, index) => {
        const status = getArtifactReferenceStatus(reference);
        return (
          <DeclarationCard
            key={`artifact-reference-${index}`}
            title={reference.label || reference.id || `Artifact reference ${index + 1}`}
            kind={reference.role}
            removeId={`schema-artifactReferences-${index}-remove`}
            removeLabel={`Remove artifact reference ${reference.label || reference.id || index + 1}`}
            onRemove={() =>
              onRequestRemoval({
                key: "artifactReferences",
                index,
                label: reference.label || reference.id || `Artifact reference ${index + 1}`,
                triggerId: `schema-artifactReferences-${index}-remove`,
                focusAfterId: addButtonId
              })
            }
          >
            <div className="schema-form-grid">
              <TextField
                id={`schema-artifactReferences-${index}-id`}
                label="Reference id"
                value={reference.id}
                required
                invalid={fieldErrorId === `schema-artifactReferences-${index}-id`}
                onChange={(id) => onDraftChange(updateModelSchemaDeclaration(draft, "artifactReferences", index, { ...reference, id }))}
              />
              <TextField
                id={`schema-artifactReferences-${index}-label`}
                label="Label"
                value={reference.label}
                required
                invalid={fieldErrorId === `schema-artifactReferences-${index}-label`}
                onChange={(label) =>
                  onDraftChange(updateModelSchemaDeclaration(draft, "artifactReferences", index, { ...reference, label }))
                }
              />
              <TextField
                id={`schema-artifactReferences-${index}-artifactType`}
                label="Artifact type"
                value={reference.artifactType}
                required
                invalid={fieldErrorId === `schema-artifactReferences-${index}-artifactType`}
                onChange={(artifactType) =>
                  onDraftChange(updateModelSchemaDeclaration(draft, "artifactReferences", index, { ...reference, artifactType }))
                }
              />
              <TextField
                id={`schema-artifactReferences-${index}-artifactId`}
                label="Artifact id"
                value={reference.artifactId}
                required
                invalid={fieldErrorId === `schema-artifactReferences-${index}-artifactId`}
                onChange={(artifactId) =>
                  onDraftChange(updateModelSchemaDeclaration(draft, "artifactReferences", index, { ...reference, artifactId }))
                }
              />
              <SelectField
                id={`schema-artifactReferences-${index}-primitiveId`}
                label="Primitive id"
                value={reference.primitiveId ?? ""}
                options={["", ...primitiveIds]}
                optionLabel={(value) => value || "Not declared"}
                onChange={(primitiveId) =>
                  onDraftChange(
                    updateModelSchemaDeclaration(draft, "artifactReferences", index, {
                      ...reference,
                      primitiveId: primitiveIdOrUndefined(primitiveId)
                    })
                  )
                }
              />
              <SelectField
                id={`schema-artifactReferences-${index}-role`}
                label="Role"
                value={reference.role}
                options={modelArtifactReferenceRoles}
                onChange={(role) =>
                  onDraftChange(updateModelSchemaDeclaration(draft, "artifactReferences", index, { ...reference, role: role as typeof reference.role }))
                }
              />
              <ActiveField
                id={`schema-artifactReferences-${index}-active`}
                active={reference.active}
                onChange={(active) =>
                  onDraftChange(updateModelSchemaDeclaration(draft, "artifactReferences", index, { ...reference, active }))
                }
              />
              <NotesField
                id={`schema-artifactReferences-${index}-notes`}
                value={reference.notes}
                onChange={(notes) =>
                  onDraftChange(updateModelSchemaDeclaration(draft, "artifactReferences", index, { ...reference, notes }))
                }
              />
              <ExecutableField />
            </div>
            <dl className="schema-reference-status">
              <div>
                <dt>Artifact service</dt>
                <dd>{status.artifactStatus}</dd>
              </div>
              <div>
                <dt>Primitive status</dt>
                <dd>{status.primitiveStatus}</dd>
              </div>
              <div>
                <dt>Runtime effect</dt>
                <dd>{status.runtimeNote}</dd>
              </div>
            </dl>
          </DeclarationCard>
        );
      })}
    </RepeatedSection>
  );
}

function NotesEditor(props: SectionEditorProps & Pick<ModelSchemaSectionEditorProps, "onRequestMetadataRemoval">) {
  const { draft, fieldErrorId, onDraftChange, onRequestRemoval, onRequestMetadataRemoval } = props;
  return (
    <section id="schema-section-notes" className="schema-editor-section" aria-labelledby="schema-editor-title-notes" tabIndex={-1}>
      <SectionHeading
        id="notes"
        title="Notes + Metadata"
        description="Bounded modeling-transparency notes and inert JSON metadata. Imported content is always rendered as text."
      />
      <p className="schema-risk-note">
        Do not enter real-person profiles, protected-class inference, psychological diagnosis, persuasion targeting, prediction, calibration, proof, or certification claims.
      </p>
      <AssumptionGroup
        title="Assumptions"
        keyName="assumptionNotes"
        items={draft.assumptionNotes ?? []}
        fieldErrorId={fieldErrorId}
        onChange={(assumptionNotes) => onDraftChange({ ...draft, assumptionNotes })}
        onRequestRemoval={onRequestRemoval}
      />
      <AssumptionGroup
        title="Limitations"
        keyName="limitationNotes"
        items={draft.limitationNotes ?? []}
        fieldErrorId={fieldErrorId}
        onChange={(limitationNotes) => onDraftChange({ ...draft, limitationNotes })}
        onRequestRemoval={onRequestRemoval}
      />
      <AssumptionGroup
        title="Validation notes"
        keyName="validationNotes"
        items={draft.validationNotes ?? []}
        fieldErrorId={fieldErrorId}
        onChange={(validationNotes) => onDraftChange({ ...draft, validationNotes })}
        onRequestRemoval={onRequestRemoval}
      />
      <MetadataEditor draft={draft} onDraftChange={onDraftChange} onRequestMetadataRemoval={onRequestMetadataRemoval} />
    </section>
  );
}

function AssumptionGroup({
  title,
  keyName,
  items,
  fieldErrorId,
  onChange,
  onRequestRemoval
}: {
  title: string;
  keyName: "assumptionNotes" | "limitationNotes" | "validationNotes";
  items: readonly AssumptionItem[];
  fieldErrorId: string | null;
  onChange: (items: readonly AssumptionItem[]) => void;
  onRequestRemoval: ModelSchemaSectionEditorProps["onRequestRemoval"];
}) {
  const addButtonId = `schema-add-${keyName}`;
  return (
    <section className="schema-note-group" aria-labelledby={`schema-note-title-${keyName}`}>
      <header>
        <div>
          <h3 id={`schema-note-title-${keyName}`}>{title}</h3>
          <p>{items.length} items</p>
        </div>
        <button
          id={addButtonId}
          type="button"
          onClick={() => {
            const index = items.length;
            onChange([...items, createAssumptionItem(keyName.replace("Notes", "-note"), items)]);
            focusAfterRender(`schema-${keyName}-${index}-id`);
          }}
          suppressHydrationWarning
        >
          Add {title.toLowerCase().replace(/s$/, "")}
        </button>
      </header>
      {items.length === 0 ? <p className="builder-muted">No {title.toLowerCase()} declared.</p> : null}
      {items.map((item, index) => (
        <DeclarationCard
          key={`${keyName}-${index}`}
          title={item.label || item.id || `${title} ${index + 1}`}
          kind={item.severity ?? "unspecified severity"}
          removeId={`schema-${keyName}-${index}-remove`}
          removeLabel={`Remove ${title.toLowerCase()} ${item.label || item.id || index + 1}`}
          onRemove={() =>
            onRequestRemoval({
              key: keyName,
              index,
              label: item.label || item.id || `${title} ${index + 1}`,
              triggerId: `schema-${keyName}-${index}-remove`,
              focusAfterId: addButtonId
            })
          }
        >
          <div className="schema-form-grid">
            <TextField
              id={`schema-${keyName}-${index}-id`}
              label="Note id"
              value={item.id}
              required
              invalid={fieldErrorId === `schema-${keyName}-${index}-id`}
              onChange={(id) => onChange(replaceAt(items, index, { ...item, id }))}
            />
            <TextField
              id={`schema-${keyName}-${index}-label`}
              label="Label"
              value={item.label}
              required
              onChange={(label) => onChange(replaceAt(items, index, { ...item, label }))}
            />
            <TextField
              id={`schema-${keyName}-${index}-description`}
              label="Description"
              value={item.description}
              required
              multiline
              onChange={(description) => onChange(replaceAt(items, index, { ...item, description }))}
            />
            <SelectField
              id={`schema-${keyName}-${index}-severity`}
              label="Severity"
              value={item.severity ?? ""}
              options={["", "info", "caution", "critical"] satisfies readonly (AssumptionSeverity | "")[]}
              optionLabel={(value) => value || "Not specified"}
              onChange={(severity) =>
                onChange(replaceAt(items, index, { ...item, severity: optionalString(severity) as AssumptionSeverity | undefined }))
              }
            />
            <TextField
              id={`schema-${keyName}-${index}-category`}
              label="Category"
              value={item.category ?? ""}
              onChange={(category) => onChange(replaceAt(items, index, { ...item, category: optionalString(category) }))}
            />
            <TextField
              id={`schema-${keyName}-${index}-source`}
              label="Source"
              value={item.source ?? ""}
              description="Provenance text only. A source label is not validation evidence."
              onChange={(source) => onChange(replaceAt(items, index, { ...item, source: optionalString(source) }))}
            />
            <SelectField
              id={`schema-${keyName}-${index}-confidence`}
              label="Confidence"
              value={item.confidence ?? ""}
              options={["", "low", "medium", "high", "unknown"] satisfies readonly (AssumptionConfidence | "")[]}
              optionLabel={(value) => value || "Not specified"}
              onChange={(confidence) =>
                onChange(replaceAt(items, index, { ...item, confidence: optionalString(confidence) as AssumptionConfidence | undefined }))
              }
            />
          </div>
        </DeclarationCard>
      ))}
    </section>
  );
}

function MetadataEditor({
  draft,
  onDraftChange,
  onRequestMetadataRemoval
}: Pick<ModelSchemaSectionEditorProps, "draft" | "onDraftChange" | "onRequestMetadataRemoval">) {
  const entries = Object.entries(draft.metadata ?? {});
  const addButtonId = "schema-add-metadata";
  return (
    <section className="schema-note-group" aria-labelledby="schema-metadata-title">
      <header>
        <div>
          <h3 id="schema-metadata-title">Metadata</h3>
          <p>{entries.length} inert JSON entries</p>
        </div>
        <button
          id={addButtonId}
          type="button"
          onClick={() => {
            const metadata = { ...(draft.metadata ?? {}) };
            let index = entries.length + 1;
            while (`metadata-${index}` in metadata) {
              index += 1;
            }
            metadata[`metadata-${index}`] = "";
            onDraftChange({ ...draft, metadata });
          }}
          suppressHydrationWarning
        >
          Add metadata entry
        </button>
      </header>
      <p className="builder-muted">
        Metadata is inert and validated by the model-schema service. Forbidden runtime, code, formula, compiler, profiling, dataset, and LLM payload keys are rejected.
      </p>
      {entries.length === 0 ? <p className="builder-muted">No metadata declared.</p> : null}
      {entries.map(([key, value], index) => {
        return (
          <div className="schema-metadata-row" key={`${key}-${index}`}>
            <TextField
              id={`schema-metadata-${index}-key`}
              label="Metadata key"
              value={key}
              required
              onChange={(nextKey) => {
                if (!nextKey || (nextKey !== key && Object.prototype.hasOwnProperty.call(draft.metadata ?? {}, nextKey))) {
                  return;
                }
                const metadata = renameMetadataKey(draft.metadata ?? {}, key, nextKey);
                onDraftChange({ ...draft, metadata });
              }}
            />
            {typeof value === "string" ? (
              <TextField
                id={`schema-metadata-${index}-value`}
                label="Metadata text value"
                value={value}
                onChange={(nextValue) => {
                  const metadata = { ...(draft.metadata ?? {}), [key]: nextValue };
                  onDraftChange({ ...draft, metadata });
                }}
              />
            ) : (
              <FixedField
                label="Imported non-text value"
                value={JSON.stringify(value)}
                description="Preserved with its original JSON type and read-only in this V1 form."
              />
            )}
            <button
              id={`schema-metadata-${index}-remove`}
              type="button"
              className="schema-remove-button"
              aria-label={`Remove metadata ${key}`}
              onClick={() =>
                onRequestMetadataRemoval({
                  metadataKey: key,
                  triggerId: `schema-metadata-${index}-remove`,
                  focusAfterId: addButtonId
                })
              }
              suppressHydrationWarning
            >
              Remove metadata
            </button>
          </div>
        );
      })}
    </section>
  );
}

function RepeatedSection({
  id,
  title,
  description,
  count,
  addLabel,
  addButtonId,
  onAdd,
  children
}: {
  id: ModelSchemaAuthoringSectionId;
  title: string;
  description: string;
  count: number;
  addLabel: string;
  addButtonId: string;
  onAdd: () => void;
  children: React.ReactNode;
}) {
  return (
    <section id={`schema-section-${id}`} className="schema-editor-section" aria-labelledby={`schema-editor-title-${id}`} tabIndex={-1}>
      <header className="schema-editor-section__heading">
        <div>
          <h2 id={`schema-editor-title-${id}`}>{title}</h2>
          <p>{description}</p>
        </div>
        <div>
          <span>{count} declared</span>
          <button id={addButtonId} type="button" onClick={onAdd} suppressHydrationWarning>
            {addLabel}
          </button>
        </div>
      </header>
      {count === 0 ? <p className="schema-empty-state">None declared. Add an item only when the structural model needs it.</p> : null}
      <div className="schema-declaration-list">{children}</div>
    </section>
  );
}

function SectionHeading({ id, title, description }: { id: ModelSchemaAuthoringSectionId; title: string; description: string }) {
  return (
    <header className="schema-editor-section__heading">
      <div>
        <h2 id={`schema-editor-title-${id}`}>{title}</h2>
        <p>{description}</p>
      </div>
    </header>
  );
}

function DeclarationCard({
  title,
  kind,
  removeId,
  removeLabel,
  onRemove,
  children
}: {
  title: string;
  kind: string;
  removeId: string;
  removeLabel: string;
  onRemove: () => void;
  children: React.ReactNode;
}) {
  return (
    <article className="schema-declaration-card">
      <header>
        <div>
          <h3>{title}</h3>
          <span>{kind}</span>
        </div>
        <button
          id={removeId}
          type="button"
          className="schema-remove-button"
          aria-label={removeLabel}
          onClick={onRemove}
          suppressHydrationWarning
        >
          Remove
        </button>
      </header>
      {children}
    </article>
  );
}

function TextField({
  id,
  label,
  value,
  onChange,
  required = false,
  multiline = false,
  invalid = false,
  description
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  multiline?: boolean;
  invalid?: boolean;
  description?: string;
}) {
  const descriptionId = description ? `${id}-description` : undefined;
  const errorId = invalid ? `${id}-error` : undefined;
  const describedBy = [descriptionId, errorId].filter(Boolean).join(" ") || undefined;
  return (
    <label className={`schema-field ${multiline ? "schema-field--wide" : ""}`} htmlFor={id}>
      <span>
        {label}
        {required ? <b>Required</b> : null}
      </span>
      {multiline ? (
        <textarea
          id={id}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          aria-invalid={invalid}
          aria-describedby={describedBy}
          rows={4}
        />
      ) : (
        <input
          id={id}
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          aria-invalid={invalid}
          aria-describedby={describedBy}
        />
      )}
      {description ? <small id={descriptionId}>{description}</small> : null}
      {invalid ? (
        <small id={errorId} className="schema-field-error" role="alert">
          Structural validation error. Review the linked Error Summary for details.
        </small>
      ) : null}
    </label>
  );
}

function SelectField({
  id,
  label,
  value,
  options,
  onChange,
  optionLabel = (option) => option
}: {
  id: string;
  label: string;
  value: string;
  options: readonly string[];
  onChange: (value: string) => void;
  optionLabel?: (value: string) => string;
}) {
  return (
    <label className="schema-field" htmlFor={id}>
      <span>{label}</span>
      <select id={id} value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => (
          <option key={option || "empty"} value={option}>
            {optionLabel(option)}
          </option>
        ))}
      </select>
    </label>
  );
}

function ReferenceListField({
  id,
  label,
  value,
  onChange
}: {
  id: string;
  label: string;
  value: readonly string[] | undefined;
  onChange: (value: readonly string[] | undefined) => void;
}) {
  return (
    <TextField
      id={id}
      label={label}
      value={formatReferenceIds(value)}
      description="Comma-separated ids. Cross-references are checked by the model-schema service."
      onChange={(nextValue) => onChange(parseReferenceIds(nextValue))}
    />
  );
}

function NotesField({ id, value, onChange }: { id: string; value: readonly string[] | undefined; onChange: (value: readonly string[] | undefined) => void }) {
  return (
    <TextField
      id={id}
      label="Notes"
      value={formatNotes(value)}
      multiline
      description="One bounded structural note per line."
      onChange={(nextValue) => onChange(parseNotes(nextValue))}
    />
  );
}

function ActiveField({ id, active, onChange }: { id: string; active: boolean; onChange: (active: boolean) => void }) {
  return (
    <label className="schema-toggle-field" htmlFor={id}>
      <input id={id} type="checkbox" checked={active} onChange={(event) => onChange(event.target.checked)} />
      <span>
        Structurally active
        <small>Active means included in the artifact, not runtime-executed.</small>
      </span>
    </label>
  );
}

function ExecutableField() {
  return <FixedField label="Executable" value="false" description="Fixed by the model-schema contract. This form cannot author executable declarations." />;
}

function FixedField({ label, value, description }: { label: string; value: string; description?: string }) {
  return (
    <div className="schema-fixed-field">
      <span>{label}</span>
      <output>{value}</output>
      {description ? <small>{description}</small> : null}
    </div>
  );
}

function optionalString(value: string): string | undefined {
  return value.trim() ? value : undefined;
}

function parseAllowedValues(value: string): readonly JsonValue[] | undefined {
  const values = value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
  return values.length > 0 ? values : undefined;
}

function formatAllowedValues(value: readonly JsonValue[] | undefined): string {
  return value?.map((item) => String(item)).join("\n") ?? "";
}

function replaceAt<T>(items: readonly T[], index: number, item: T): readonly T[] {
  return items.map((candidate, candidateIndex) => (candidateIndex === index ? item : candidate));
}

function labelFromCamelCase(value: string): string {
  return value.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/^./, (character) => character.toUpperCase());
}

function renameMetadataKey(metadata: Record<string, JsonValue>, previousKey: string, nextKey: string): Record<string, JsonValue> {
  return Object.fromEntries(Object.entries(metadata).map(([key, value]) => [key === previousKey ? nextKey : key, value]));
}

function focusAfterRender(id: string): void {
  if (typeof document === "undefined") {
    return;
  }
  window.requestAnimationFrame(() => {
    document.getElementById(id)?.focus();
  });
}

export type { RemovalRequest };
