"use client";

import { getSystemCatalogEntry } from "../lib/systemCatalog";
import { getTemplateDescriptor } from "../lib/templateVisuals";
import { templateAssumptionProfile } from "../simulation";
import { useSimulationStore } from "../state/simulationStore";
import { CornerFramePanel } from "./ui/CornerFramePanel";
import { Disclosure } from "./ui/Disclosure";

export function ModelExplanationPanel() {
  const selectedTemplateId = useSimulationStore((state) => state.selectedTemplateId);
  const descriptor = getTemplateDescriptor(selectedTemplateId);
  const system = getSystemCatalogEntry(selectedTemplateId);
  const documentation = descriptor.template.documentation;
  const profile = templateAssumptionProfile(descriptor.template);
  const seen = new Set<string>();

  const question = uniqueLine(system.question, seen);
  const process = uniqueLine(documentation.processOverview, seen);
  const watchFor = uniqueLine(system.watchFor, seen);
  const suggestedChange = uniqueLine(system.suggestedChange, seen);
  const deduplicatedAssumptions = uniqueLines(documentation.assumptions, seen);
  const keyAssumptions = deduplicatedAssumptions.slice(0, 2);
  const prioritizedLimitations = prioritizeModelLimitations(documentation.limitations);
  const deduplicatedLimitations = uniqueLines(prioritizedLimitations, seen);
  const mainLimitation = deduplicatedLimitations[0] ?? "No model limitation is documented.";

  const additionalAssumptions = deduplicatedAssumptions.slice(2);
  const additionalLimitations = deduplicatedLimitations.slice(1);
  const notRepresented = uniqueLines(documentation.notRepresented ?? [], seen);
  const appropriateUse = uniqueLines(documentation.appropriateUse ?? [], seen);
  const inappropriateUse = uniqueLines(documentation.inappropriateUse ?? [], seen);
  const ethicsNotes = uniqueLines(profile.ethicsNotes.map((item) => item.description), seen);

  return (
    <CornerFramePanel title={descriptor.template.name} eyebrow="Understand the model" variant="compact">
      <div className="model-explanation" data-model-explanation={selectedTemplateId}>
        <ExplanationSection title="Question" text={question} />
        <ExplanationSection title="How the model works" text={process} />
        <ExplanationSection title="What to watch" text={watchFor} />
        <ExplanationSection title="Try changing" text={suggestedChange} />
        <section>
          <h3>Key assumptions</h3>
          <TextList items={keyAssumptions} />
        </section>
        <ExplanationSection title="Main limitation" text={mainLimitation} />

        <Disclosure expandLabel="Full model notes" collapseLabel="Hide full model notes" className="model-explanation__details">
          <div className="model-explanation__full">
            <ExplanationSection title="Entities" text={documentation.entities.join(" ")} />
            <ExplanationSection title="State represented" text={documentation.stateVariables.join(", ")} />
            <ExplanationSection title="Scheduling" text={documentation.scheduling} />
            <ExplanationSection title="Initialization" text={documentation.initialization} />
            <section>
              <h3>Submodels</h3>
              <TextList items={documentation.submodels} />
            </section>
            {additionalAssumptions.length > 0 ? (
              <section>
                <h3>Additional assumptions</h3>
                <TextList items={additionalAssumptions} />
              </section>
            ) : null}
            {additionalLimitations.length > 0 ? (
              <section>
                <h3>Additional limitations</h3>
                <TextList items={additionalLimitations} />
              </section>
            ) : null}
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
        </Disclosure>
      </div>
    </CornerFramePanel>
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

function prioritizeModelLimitations(values: readonly string[]): string[] {
  const productBoundary = /builder|model[- ]schema|visual programming|netlogo|mesa|mason|llm/i;
  return [...values.filter((value) => !productBoundary.test(value)), ...values.filter((value) => productBoundary.test(value))];
}

function normalizationKeys(value: string): string[] {
  const normalized = normalizeText(value);
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
  return value.trim().toLowerCase().replace(/[\s.!?,;:]+/g, " ").trim();
}
