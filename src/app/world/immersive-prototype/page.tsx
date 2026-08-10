import type { Metadata } from "next";
import Link from "next/link";
import { ImmersiveWorldPrototype } from "../../../components/immersive/ImmersiveWorldPrototype";
import { parseImmersivePrototypeQuery } from "../../../lib/immersiveWorld";

export const metadata: Metadata = {
  title: "Immersive World Prototype | ORTUS",
  description: "Internal I0 comparison surface for immersive Flocking presentation concepts.",
  robots: { index: false, follow: false }
};

interface ImmersivePrototypePageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function ImmersivePrototypePage({ searchParams }: ImmersivePrototypePageProps) {
  if (hasUnsafeAsyncSearchParamKey(searchParams)) {
    return <ImmersivePrototypeRouteError message="The prototype URL contains an unsafe query key." />;
  }
  const parsed = parseImmersivePrototypeQuery(await searchParams);
  if (!parsed.ok) {
    return <ImmersivePrototypeRouteError message={parsed.message} />;
  }
  return <ImmersiveWorldPrototype initialConfig={parsed.config} />;
}

function ImmersivePrototypeRouteError({ message }: { message: string }) {
  return (
    <section className="immersive-prototype-error" role="alert" data-immersive-prototype-error>
      <span>Prototype route stopped</span>
      <h1>This immersive comparison could not be prepared</h1>
      <p>{message}</p>
      <div>
        <Link href="/world/immersive-prototype?concept=living-diorama&agents=100">Open the default prototype</Link>
        <Link href="/world?template=flocking-boids">Return to World</Link>
      </div>
    </section>
  );
}

function hasUnsafeAsyncSearchParamKey(searchParams: ImmersivePrototypePageProps["searchParams"]): boolean {
  return ["__proto__", "prototype", "constructor", "then", "catch", "finally"]
    .some((key) => Object.prototype.hasOwnProperty.call(searchParams, key));
}
