import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { StarterWorldDetail } from "../../../components/starterWorlds/StarterWorldDetail";
import { getStarterWorldBySlug, runnableStarterWorlds } from "../../../lib/starterWorlds";

interface StarterWorldPageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return runnableStarterWorlds.map((world) => ({ slug: world.slug }));
}

export async function generateMetadata({ params }: StarterWorldPageProps): Promise<Metadata> {
  const { slug } = await params;
  const world = getStarterWorldBySlug(slug);
  if (!world || world.runtimeStatus !== "runnable") {
    return { title: "Starter World not found | ORTUS" };
  }
  return {
    title: `${world.title} | ORTUS`,
    description: world.oneSentencePremise
  };
}

export default async function StarterWorldPage({ params }: StarterWorldPageProps) {
  const { slug } = await params;
  const world = getStarterWorldBySlug(slug);
  if (!world || world.runtimeStatus !== "runnable") {
    notFound();
  }
  return <StarterWorldDetail world={world} />;
}
