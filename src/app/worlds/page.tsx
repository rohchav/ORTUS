import type { Metadata } from "next";
import { ExploreWorldsCatalog } from "../../components/starterWorlds/ExploreWorldsCatalog";
import { featuredStarterWorld, runnableStarterWorlds } from "../../lib/starterWorlds";

export const metadata: Metadata = {
  title: "Explore Worlds | ORTUS",
  description: "Browse runnable Starter Worlds by question, mechanism, system form, and interaction depth."
};

export default function ExploreWorldsPage() {
  return <ExploreWorldsCatalog worlds={runnableStarterWorlds} featuredWorldId={featuredStarterWorld.id} />;
}
