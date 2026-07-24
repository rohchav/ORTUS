import type { Metadata } from "next";
import { AppShell } from "../../components/AppShell";
import { simulationWorkspaceModeFromQuery } from "../../lib/workspaceModes";
import { templateDescriptors, type TemplateId } from "../../lib/templateVisuals";

export const metadata: Metadata = {
  title: "World | ORTUS",
  description: "Run, observe, and perturb an active modeled system."
};

interface WorldPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function WorldPage({ searchParams }: WorldPageProps) {
  const query = await searchParams;
  const template = singleValue(query.template);
  const task = singleValue(query.task);
  const starter = singleValue(query.starter);

  return (
    <AppShell
      initialTemplateId={isTemplateId(template) ? template : undefined}
      initialWorkspaceMode={simulationWorkspaceModeFromQuery(task)}
      showStarterGuide={starter === "flocking" && template === "flocking-boids"}
    />
  );
}

function singleValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function isTemplateId(value: string | undefined): value is TemplateId {
  return templateDescriptors.some((descriptor) => descriptor.id === value);
}
