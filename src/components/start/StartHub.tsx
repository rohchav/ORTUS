import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { systemCatalog } from "../../lib/systemCatalog";

const pathways = [
  {
    label: "Explore a starter world",
    description: "Open a prepared model, run it, change one control, and compare what happens.",
    href: "/world?template=flocking-boids&starter=flocking"
  },
  {
    label: "Change a working system",
    description: "Choose any available model and work directly with its existing runtime controls.",
    href: "/world"
  },
  {
    label: "Build a system",
    description: "Describe and inspect model structure in the non-executing Workshop.",
    href: "/builder"
  },
  {
    label: "Open advanced tools",
    description: "Sample bounded model spaces in Atlas or inspect the non-persistent Lab foundation.",
    href: "/atlas"
  }
] as const;

export function StartHub() {
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
          <h2 id="start-feature-title">How does local coordination create a flock?</h2>
          <span>Run a group whose members respond only to nearby neighbors.</span>
          <span>Then lower Alignment weight and watch the flock shape and model-output score change.</span>
          <small>Run, change alignment, compare motion.</small>
          <Link className="start-feature__action" href="/world?template=flocking-boids&starter=flocking">
            Open the Flocking starter
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
            <p>Runnable now</p>
            <h2 id="start-catalog-title">Choose a system by the question</h2>
          </div>
          <Link href="/world">Open World</Link>
        </header>
        <div className="start-catalog__grid">
          {systemCatalog.map((entry) => (
            <article key={entry.descriptor.id} className="system-card" style={{ "--system-accent": entry.descriptor.accent } as CSSProperties}>
              <div className="system-card__head">
                <span className="system-card__swatch" aria-hidden="true" />
                <h3>{entry.descriptor.template.name}</h3>
              </div>
              <p className="system-card__question">{entry.question}</p>
              <dl>
                <div>
                  <dt>Change</dt>
                  <dd>{entry.manipulation}</dd>
                </div>
                <div>
                  <dt>See</dt>
                  <dd>{entry.visibleOutput}</dd>
                </div>
              </dl>
              <Link href={`/world?template=${entry.descriptor.id}`}>Open in World</Link>
            </article>
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
          <Link href="/lab">Lab foundation</Link>
        </div>
      </section>
    </div>
  );
}
