import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { StarterWorldPackDetail } from "../../../../components/starterWorlds/StarterWorldPackDetail";
import { getStarterWorldPackBySlug, starterWorldPacks } from "../../../../lib/starterWorlds";

interface StarterWorldPackPageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return starterWorldPacks.map((pack) => ({ slug: pack.slug }));
}

export async function generateMetadata({ params }: StarterWorldPackPageProps): Promise<Metadata> {
  const { slug } = await params;
  const pack = getStarterWorldPackBySlug(slug);
  return pack
    ? { title: `${pack.title} | ORTUS`, description: pack.summary }
    : { title: "Starter World collection not found | ORTUS" };
}

export default async function StarterWorldPackPage({ params }: StarterWorldPackPageProps) {
  const { slug } = await params;
  const pack = getStarterWorldPackBySlug(slug);
  if (!pack) {
    notFound();
  }
  return <StarterWorldPackDetail pack={pack} />;
}
