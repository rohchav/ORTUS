export function WorkshopModelExample() {
  return (
    <section className="workshop-model-example" aria-labelledby="workshop-example-title" data-workshop-decomposition="flocking">
      <header>
        <div>
          <span>Read-only example</span>
          <h2 id="workshop-example-title">Flocking, decomposed into model pieces</h2>
        </div>
        <div className="workshop-model-example__status" aria-label="Workshop capability status">
          <span><strong>Current</strong> structural drafting</span>
          <span><strong>Not yet</strong> runnable visual composition</span>
        </div>
      </header>
      <ol>
        <li><span>Entities</span><strong>Boids</strong><small>bounded moving model agents</small></li>
        <li><span>State</span><strong>Position + velocity</strong><small>heading follows velocity</small></li>
        <li><span>Interactions</span><strong>Align + cohere + separate</strong><small>local neighbor steering</small></li>
        <li><span>Space</span><strong>Continuous 2D domain</strong><small>configured edge handling</small></li>
        <li><span>Stochasticity</span><strong>Seeded noise</strong><small>reproducible random streams</small></li>
      </ol>
      <p>This explanatory decomposition does not load a workspace, generate a template, rewire rules, or execute a model.</p>
    </section>
  );
}
