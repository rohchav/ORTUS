"use client";

import { useEffect, useRef, useState, type KeyboardEvent, type MouseEvent } from "react";
import {
  createFlockingExplorationScenario,
  flockingExplorationTargets,
  getFlockingExplorationTarget,
  type FlockingExplorationTarget
} from "../lib/flockingExploration";
import { useSimulationStore } from "../state/simulationStore";
import { useActiveWorldRuntime } from "./runtime/ProductionRuntimeProvider";

export function FlockingExplorationPanel() {
  const applyScenario = useSimulationStore((state) => state.applyScenario);
  const runtime = useActiveWorldRuntime();
  const [pendingId, setPendingId] = useState<FlockingExplorationTarget["id"] | null>(null);
  const [appliedId, setAppliedId] = useState<FlockingExplorationTarget["id"] | null>(null);
  const pendingTriggerRef = useRef<HTMLButtonElement | null>(null);
  const pendingActionRef = useRef<HTMLButtonElement | null>(null);
  const pending = pendingId ? getFlockingExplorationTarget(pendingId) : null;

  useEffect(() => {
    if (!pendingId) {
      return;
    }
    window.requestAnimationFrame(() => pendingActionRef.current?.focus());
  }, [pendingId]);

  function applyPending() {
    if (!pending) {
      return;
    }
    applyScenario(createFlockingExplorationScenario(pending.id));
    setAppliedId(pending.id);
    setPendingId(null);
    window.requestAnimationFrame(() => pendingTriggerRef.current?.focus());
  }

  function prepareTarget(event: MouseEvent<HTMLButtonElement>, id: FlockingExplorationTarget["id"]) {
    pendingTriggerRef.current = event.currentTarget;
    setPendingId(id);
  }

  function cancelPending() {
    setPendingId(null);
    window.requestAnimationFrame(() => pendingTriggerRef.current?.focus());
  }

  function handleConfirmationKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      cancelPending();
    }
  }

  return (
    <div className="flocking-exploration" data-flocking-exploration>
      <section className="flocking-exploration__orientation" aria-labelledby="flocking-orientation-title">
        <span>What you are looking at</span>
        <h3 id="flocking-orientation-title">Directional agents responding to nearby neighbors</h3>
        <p>
          Each mark is a simplified boid with position and velocity. No leader sets the group direction; repeated local steering changes who becomes a neighbor next.
        </p>
        <dl className="flocking-rule-key">
          <div><dt>Alignment</dt><dd>turn toward nearby headings</dd></div>
          <div><dt>Cohesion</dt><dd>steer toward the nearby center</dd></div>
          <div><dt>Separation</dt><dd>move away when too close</dd></div>
        </dl>
        <p className="flocking-domain-note">
          The runtime domain is 100 x 100 model units. Edge handling is part of the model configuration; camera framing changes presentation only.
        </p>
      </section>

      <section aria-labelledby="flocking-targets-title">
        <div className="world-tool-section__head">
          <div>
            <span>Audited exact setups</span>
            <h3 id="flocking-targets-title">Try a visibly different run</h3>
          </div>
          <span>Fresh tick 0</span>
        </div>
        <div className="flocking-target-list">
          {flockingExplorationTargets.map((target) => (
            <article key={target.id} data-flocking-target={target.id}>
              <div>
                <h4>{target.label}</h4>
                <p>{target.summary}</p>
                <small>{target.mechanism}. Watch near tick {target.watchTick}.</small>
              </div>
              <button type="button" onClick={(event) => prepareTarget(event, target.id)} aria-pressed={pendingId === target.id}>
                Prepare
              </button>
            </article>
          ))}
        </div>
      </section>

      <section className="flocking-investigation-cue" aria-labelledby="flocking-investigation-title">
        <span>Question to try</span>
        <h3 id="flocking-investigation-title">What happens when boids care less about matching direction?</h3>
        <dl>
          <div><dt>Relevant mechanism</dt><dd>Alignment</dd></div>
          <div><dt>Try</dt><dd>Reduce alignment while keeping cohesion present.</dd></div>
          <div><dt>Watch</dt><dd>Alignment, dispersion, and visible group structure.</dd></div>
        </dl>
      </section>

      {pending ? (
        <section
          className="flocking-target-confirmation"
          aria-labelledby="flocking-target-confirmation-title"
          aria-live="polite"
          onKeyDown={handleConfirmationKeyDown}
        >
          <div>
            <span>Replace active run?</span>
            <h3 id="flocking-target-confirmation-title">Prepare {pending.label}</h3>
            <p>
              This discards the current trajectory at tick {runtime.tick} and loads the audited seed and exact configuration as a fresh paused run. {pending.watch}
            </p>
            <small>Seed {pending.seed} / watch near tick {pending.watchTick}</small>
          </div>
          <div>
            <button ref={pendingActionRef} type="button" onClick={applyPending}>Load fresh run</button>
            <button type="button" onClick={cancelPending}>Keep current run</button>
          </div>
        </section>
      ) : null}

      <p className="flocking-exploration__status" aria-live="polite">
        {appliedId ? `${getFlockingExplorationTarget(appliedId).label} loaded as a fresh paused run.` : "Choose Prepare to review a run replacement before it happens."}
      </p>

      <section className="flocking-capability-gap" aria-labelledby="flocking-gap-title">
        <span>Current model limit</span>
        <h3 id="flocking-gap-title">Sustained milling is not implemented</h3>
        <p>
          Ring Formation sets only the tick-0 arrangement and tangential headings. The current steering rules do not supply a persistent orbit rule, so a ring must not be presented as reliable milling behavior.
        </p>
      </section>
    </div>
  );
}
