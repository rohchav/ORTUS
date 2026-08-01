import type { Metadata } from "next";
import { ExploreWorldsCatalog } from "../../components/starterWorlds/ExploreWorldsCatalog";
import {
  preparedStarterComparisons,
  runnableStarterWorlds,
  starterWorldPacks
} from "../../lib/starterWorlds";

export const metadata: Metadata = {
  title: "Explore Worlds | ORTUS",
  description: "Browse runnable Starter Worlds by question, mechanism, system form, and interaction depth."
};

export default function ExploreWorldsPage() {
  return (
    <ExploreWorldsCatalog
      worlds={runnableStarterWorlds}
      featuredPack={starterWorldPacks[0]!}
      featuredComparisons={preparedStarterComparisons}
    />
  );
}
