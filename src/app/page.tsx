import type { Metadata } from "next";
import { AppShell } from "../components/AppShell";

export const metadata: Metadata = {
  title: "World | ORTUS",
  description: "Observe and perturb an active modeled system."
};

export default function Home() {
  return <AppShell />;
}
