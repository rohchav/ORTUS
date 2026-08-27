import Image from "next/image";
import Link from "next/link";
import { featuredStarterWorld, runnableStarterWorlds } from "../../lib/starterWorlds";

const pathways = [
  {
    label: "Explore a starter world",
    description: "Open a prepared model, run it, change one control, and compare what happens.",
    href: "/worlds"
  },
  {
    label: "Change a working system",
    description: "Choose any available model and work directly with its existing runtime controls.",
    href: "/world"
  },
  {
    label: "Draft a model structure",
    description: "Describe a non-runnable model structure step by step or inspect exact structural artifacts in Workshop.",
    href: "/builder"
  },
  {
    label: "Open research tools",
    description: "Run a bounded Flocking sample in Atlas or inspect Lab's non-persistent evidence-record foundation.",
    href: "/atlas"
  }
] as const;

export function StartHub() {
  const featured = featuredStarterWorld;

  return (
    <div className="start-hub" data-start-hub>
      <header className="start-hub__intro">
        <p className="start-hub__eyebrow">Interactive complex-systems sandbox</p>
        <h1>Start with a living system</h1>
        <p>Pick a system. Run it. Change something. See what happens. Then go deeper.</p>
      </header>

      <section className="start-feature" aria-labelledby="start-feature-title">
        <Image
          src="/starters/flocking-world.png"
          alt="ORTUS Flocking runtime showing directional boids moving across the world viewport"
          fill
          priority
          sizes="(max-width: 900px) 100vw, 72vw"
          className="start-feature__image"
        />
        <div className="start-feature__content">
          <p>Featured starter</p>
          <h2 id="start-feature-title">{featured.hookQuestion}</h2>
          <span>{featured.oneSentencePremise}</span>
          <span>{featured.firstChange.action}</span>
          <small>Run, change alignment, compare motion.</small>
          <Link className="start-feature__action" href={`/worlds/${featured.slug}`}>
            Explore {featured.title}
          </Link>
        </div>
      </section>

      <nav className="start-pathways" aria-label="Ways to begin">
        {pathways.map((pathway, index) => (
          <Link key={pathway.label} href={pathway.href} className="start-pathway">
            <span className="start-pathway__number" aria-hidden="true">
              {String(index + 1).padStart(2, "0")}
            </span>
            <strong>{pathway.label}</strong>
            <span>{pathway.description}</span>
          </Link>
        ))}
      </nav>

      <section className="start-catalog" aria-labelledby="start-catalog-title">
        <header className="start-section-heading">
          <div>
            <p>{runnableStarterWorlds.length} runnable worlds</p>
            <h2 id="start-catalog-title">Choose the question that pulls you in</h2>
          </div>
          <Link href="/worlds">Explore all worlds</Link>
        </header>
        <div className="start-world-index">
          {runnableStarterWorlds.map((world, index) => (
            <Link key={world.id} href={`/worlds/${world.slug}`}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{world.title}</strong>
              <p>{world.hookQuestion}</p>
              <small>{world.estimatedFirstActivity}</small>
            </Link>
          ))}
        </div>
      </section>

      <section className="start-advanced" aria-labelledby="start-advanced-title">
        <div>
          <p>For comparison and research workflows</p>
          <h2 id="start-advanced-title">Already know where you are going?</h2>
        </div>
        <div className="start-advanced__links">
          <Link href="/world?task=experiment">Experiments</Link>
          <Link href="/world?task=compare">Compare runs</Link>
          <Link href="/atlas">Atlas sampling</Link>
          <Link href="/lab">Lab overview</Link>
        </div>
      </section>
    </div>
  );
}
