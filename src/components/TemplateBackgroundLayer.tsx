"use client";

import { getTemplateDescriptor } from "../lib/templateVisuals";
import { useSimulationStore } from "../state/simulationStore";

interface TemplateBackgroundLayerProps {
  stage?: boolean;
}

export function TemplateBackgroundLayer({ stage = false }: TemplateBackgroundLayerProps) {
  const selectedTemplateId = useSimulationStore((state) => state.selectedTemplateId);
  const descriptor = getTemplateDescriptor(selectedTemplateId);

  return (
    <div
      className={`template-background template-background--${descriptor.atmosphere} ${stage ? "template-background--stage" : "template-background--page"}`}
      aria-hidden="true"
    >
      <span className="terrain terrain--a" />
      <span className="terrain terrain--b" />
      <span className="terrain terrain--c" />
    </div>
  );
}
