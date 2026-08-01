import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GuidedInvestigationLanding } from "../../../../components/starterWorlds/GuidedInvestigationLanding";
import {
  deriveGuidedInvestigationAuthority,
  getGuidedInvestigationBySlug,
  guidedInvestigations
} from "../../../../lib/starterWorlds";

interface GuidedInvestigationPageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return guidedInvestigations.map((guide) => ({ slug: guide.slug }));
}

export async function generateMetadata({ params }: GuidedInvestigationPageProps): Promise<Metadata> {
  const { slug } = await params;
  const guide = getGuidedInvestigationBySlug(slug);
  return guide
    ? { title: `${guide.title} | ORTUS`, description: guide.summary }
    : { title: "Guided investigation not found | ORTUS" };
}

export default async function GuidedInvestigationPage({ params }: GuidedInvestigationPageProps) {
  const { slug } = await params;
  const guide = getGuidedInvestigationBySlug(slug);
  if (!guide) {
    notFound();
  }
  return <GuidedInvestigationLanding authority={deriveGuidedInvestigationAuthority(guide)} />;
}
