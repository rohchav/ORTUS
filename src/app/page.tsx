import type { Metadata } from "next";
import { StartHub } from "../components/start/StartHub";

export const metadata: Metadata = {
  title: "Start | ORTUS",
  description: "Choose a runnable system, start with a prepared exploration, or open ORTUS research tools."
};

export default function Home() {
  return <StartHub />;
}
