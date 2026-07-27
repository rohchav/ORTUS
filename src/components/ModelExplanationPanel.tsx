"use client";

import { useRef, useState } from "react";
import { getSystemCatalogEntry } from "../lib/systemCatalog";
import { getTemplateDescriptor } from "../lib/templateVisuals";
import { isModelSpecificWorldGuidance, normalizeWorldGuidance, uniqueWorldGuidance } from "../lib/worldExplanation";
import { metricDefinitionsForTemplate, templateAssumptionProfile } from "../simulation";
import { useSimulationStore } from "../state/simulationStore";
import { ModalSurface } from "./ui/ModalSurface";

export function ModelExplanationPanel() {
  const selectedTemplateId = useSimulationStore((state) => state.selectedTemplateId);
  const descriptor = getTemplateDescriptor(selectedTemplateId);
  const system = getSystemCatalogEntry(selectedTemplateId);
  const documentation = descriptor.template.documentation;
  const profile = templateAssumptionProfile(descriptor.template);
  const outputMetrics = metricDefinitionsForTemplate(descriptor.template)
    .map((metric) => `${metric.label}: ${metric.description}`);
  const seen = new Set<string>();

  const question = uniqueLine(system.question, seen);
  const process = uniqueLine(documentation.processOverview, seen);
  const watchFor = uniqueLine(system.watchFor, seen);
  const suggestedChange = uniqueLine(system.suggestedChange, seen);
  const deduplicatedAssumptions = uniqueLines(documentation.assumptions, seen);
  const keyAssumptions = deduplicatedAssumptions.slice(0, 2);
  const prioritizedLimitations = documentation.limitations.filter(isModelSpecificWorldGuidance);
  const deduplicatedLimitations = uniqueLines(prioritizedLimitations, seen);
  const mainLimitation = deduplicatedLimitations[0] ?? "No model limitation is documented.";

  const fullAssumptions = uniqueWorldGuidance(documentation.assumptions.filter(isModelSpecificWorldGuidance));
  const fullLimitations = uniqueWorldGuidance(documentation.limitations.filter(isModelSpecificWorldGuidance));
  const notRepresented = uniqueWorldGuidance(documentation.notRepresented ?? []);
  const appropriateUse = uniqueWorldGuidance(documentation.appropriateUse ?? []);
  const inappropriateUse = uniqueWorldGuidance(documentation.inappropriateUse ?? []);
  const ethicsNotes = uniqueWorldGuidance(profile.ethicsNotes.map((item) => item.description));
  const [referenceOpen, setReferenceOpen] = useState(false);
  const referenceTriggerRef = useRef<HTMLButtonElement>(null);

  return (
    <div className="model-explanation" data-model-explanation={selectedTemplateId}>
      <div className="model-explanation__summary">
        <ExplanationSection title="Question" text={question} />
        <ExplanationSection title="How it works" text={process} />
        <ExplanationSection title="What to watch" text={watchFor} />
        <ExplanationSection title="Try changing" text={suggestedChange} />
        <section>
          <h3>Key assumptions</h3>
          <TextList items={keyAssumptions} />
        </section>
        <ExplanationSection title="Main limitation" text={mainLimitation} />
      </div>
      <button ref={referenceTriggerRef} type="button" className="model-explanation__reference-action" onClick={() => setReferenceOpen(true)}>
        Full model notes
      </button>
      <ModalSurface
        open={referenceOpen}
        eyebrow="Full model reference"
        title={descriptor.template.name}
        closeLabel="Close model reference"
        onClose={() => setReferenceOpen(false)}
        returnFocusRef={referenceTriggerRef}
        className="world-model-reference"
      >
          <div className="model-explanation__full">
            <ExplanationSection title="Purpose" text={documentation.purpose} />
            <ExplanationSection title="Process" text={documentation.processOverview} />
            <ExplanationSection title="Entities" text={documentation.entities.join(" ")} />
            <ExplanationSection title="State represented" text={documentation.stateVariables.join(", ")} />
            <ExplanationSection title="Scheduling" text={documentation.scheduling} />
            <ExplanationSection title="Initialization" text={documentation.initialization} />
            <section>
              <h3>Design concepts</h3>
              <TextList items={Object.values(documentation.designConcepts).filter((item): item is string => Boolean(item))} />
            </section>
            <section>
              <h3>Submodels</h3>
              <TextList items={documentation.submodels} />
            </section>
            <section>
              <h3>Model-output metrics</h3>
              <p>These are simulated runtime outputs. They are not empirical observations, calibrated estimates, or validation evidence.</p>
              <TextList items={outputMetrics} />
            </section>
            <section>
              <h3>Complete assumptions</h3>
              <TextList items={fullAssumptions} />
            </section>
            <section>
              <h3>Complete limitations</h3>
              <TextList items={fullLimitations} />
            </section>
            <section>
              <h3>Not represented</h3>
              <TextList items={notRepresented} />
            </section>
            <section>
              <h3>Appropriate use</h3>
              <TextList items={appropriateUse} />
            </section>
            <section>
              <h3>Inappropriate use</h3>
              <TextList items={inappropriateUse} />
            </section>
            <section>
              <h3>Ethics notes</h3>
              <TextList items={ethicsNotes} />
            </section>
            <section>
              <h3>Validation record</h3>
              <p>
                {profile.validationStatus}. {profile.validationNotes}
              </p>
              <p>Runnable means the template executes in ORTUS. It does not mean the model is calibrated or externally validated.</p>
            </section>
            <section>
              <h3>Technical provenance</h3>
              <p>
                Template version {descriptor.template.version}. Outputs are simulated model state and runtime metrics, not empirical measurements.
              </p>
            </section>
          </div>
      </ModalSurface>
    </div>
  );
}

function ExplanationSection({ title, text }: { title: string; text: string }) {
  return (
    <section>
      <h3>{title}</h3>
      <p>{text}</p>
    </section>
  );
}

function TextList({ items }: { items: readonly string[] }) {
  if (items.length === 0) {
    return <p>No additional items are documented.</p>;
  }
  return (
    <ul>
      {items.map((item) => (
        <li key={normalizeText(item)}>{item}</li>
      ))}
    </ul>
  );
}

function uniqueLine(value: string, seen: Set<string>): string {
  const keys = normalizationKeys(value);
  if (keys.length === 0 || keys.some((key) => seen.has(key))) {
    return "See the complete model notes for this item.";
  }
  keys.forEach((key) => seen.add(key));
  return value;
}

function uniqueLines(values: readonly string[], seen: Set<string>): string[] {
  return values.filter((value) => {
    const keys = normalizationKeys(value);
    if (keys.length === 0 || keys.some((key) => seen.has(key))) {
      return false;
    }
    keys.forEach((key) => seen.add(key));
    return true;
  });
}

function normalizationKeys(value: string): string[] {
  const normalized = normalizeWorldGuidance(value);
  if (!normalized) {
    return [];
  }
  const keys = [`exact:${normalized}`];
  const contrast = normalized.match(/\bnot (.+)$/)?.[1];
  if (contrast && contrast.split(" ").length >= 3) {
    keys.push(`contrast:not ${contrast}`);
  }
  return keys;
}

function normalizeText(value: string): string {
  return normalizeWorldGuidance(value);
}
