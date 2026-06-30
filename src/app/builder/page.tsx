import type { Metadata } from "next";
import { BuilderShell } from "../../components/builder";

export const metadata: Metadata = {
  title: "Workshop | ORTUS",
  description: "Construct and inspect model structure."
};

export default function BuilderPage() {
  return <BuilderShell />;
}
