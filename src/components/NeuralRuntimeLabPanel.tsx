"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { ParameterValues, SimulationSnapshotView } from "../simulation";
import { formatNumber } from "../lib/format";
import { renderNeuralDecisionReadout } from "../lib/templateVisuals";
import { useSimulationStore } from "../state/simulationStore";
import {
  boundNeuralRpsRounds,
  boundNeuralTimelineEvents,
  createNeuralLabMission,
  createNeuralLiveExplanations,
  createNeuralRpsRound,
  deriveNeuralRuntimeEvents,
  neuralDirectActions,
  neuralLabScenarioCards,
  neuralPlainEnglishControls,
  neuralRuntimeLabBoundaryCopy,
  neuralRuntimeLabTemplateId,
  neuralRpsDistribution,
  titleCase,
  type NeuralDirectAction,
  type NeuralLabScenarioCard,
  type NeuralRpsRound,
  type NeuralTimelineEvent
} from "./neuralRuntimeLab";
import { CornerFramePanel } from "./ui/CornerFramePanel";

type RpsChoice = "rock" | "paper" | "scissors";

const rpsChoices: readonly RpsChoice[] = ["rock", "paper", "scissors"];

export function NeuralRuntimeLabPanel() {
  const selectedTemplateId = useSimulationStore((state) => state.selectedTemplateId);
  const latestSnapshot = useSimulationStore((state) => state.latestSnapshot);
  const isRunning = useSimulationStore((state) => state.isRunning);
  const selectedEntityId = useSimulationStore((state) => state.selectedEntityId);
  const applyIntervention = useSimulationStore((state) => state.applyIntervention);
  const setParameters = useSimulationStore((state) => state.setParameters);
  const regenerateSeed = useSimulationStore((state) => state.regenerateSeed);
  const reset = useSimulationStore((state) => state.reset);
  const stepOnce = useSimulationStore((state) => state.stepOnce);

  const [activeScenarioId, setActiveScenarioId] = useState<NeuralLabScenarioCard["id"]>("cascade-spread");
  const [events, setEvents] = useState<NeuralTimelineEvent[]>([]);
  const [rpsRounds, setRpsRounds] = useState<NeuralRpsRound[]>([]);
  const previousSnapshotRef = useRef<SimulationSnapshotView | null>(null);
  const previousRunningRef = useRef(isRunning);
  const pendingRpsChoiceRef = useRef<RpsChoice | null>(null);

  const isNeural = selectedTemplateId === neuralRuntimeLabTemplateId;
  const activeScenario = useMemo(
    () => neuralLabScenarioCards.find((scenario) => scenario.id === activeScenarioId) ?? neuralLabScenarioCards[0]!,
    [activeScenarioId]
  );
  const readout = renderNeuralDecisionReadout(latestSnapshot);
  const mission = createNeuralLabMission(latestSnapshot, activeScenario);
  const explanations = createNeuralLiveExplanations(latestSnapshot);
  const showRpsShell = activeScenario.id === "rps-readout-demo" || activeScenario.id === "stay-unpredictable" || Boolean(readout?.enabled);

  useEffect(() => {
    if (!isNeural) {
      previousSnapshotRef.current = latestSnapshot;
      return;
    }
    const derived = deriveNeuralRuntimeEvents(previousSnapshotRef.current, latestSnapshot);
    previousSnapshotRef.current = latestSnapshot;
    if (derived.length > 0) {
      setEvents((current) => mergeTimelineEvents(current, derived));
    }
  }, [isNeural, latestSnapshot]);

  useEffect(() => {
    if (!isNeural || previousRunningRef.current === isRunning) {
      previousRunningRef.current = isRunning;
      return;
    }
    previousRunningRef.current = isRunning;
    appendEvent({
      id: `run-${latestSnapshot?.tick ?? 0}-${isRunning ? "started" : "paused"}`,
      tick: latestSnapshot?.tick ?? 0,
      kind: "run",
      label: isRunning ? "Run started" : "Run paused",
      detail: isRunning ? "Neural run is stepping from current state." : "Run paused; state and bounded history remain local."
    });
  }, [isNeural, isRunning, latestSnapshot?.tick]);

  useEffect(() => {
    if (!latestSnapshot || !isNeural) {
      return;
    }
    const pending = pendingRpsChoiceRef.current;
    if (!pending) {
      return;
    }
    const round = createNeuralRpsRound(latestSnapshot, pending);
    if (!round) {
      return;
    }
    pendingRpsChoiceRef.current = null;
    setRpsRounds((current) => {
      if (current.some((candidate) => candidate.id === round.id)) {
        return current;
      }
      return boundNeuralRpsRounds([...current, round]);
    });
  }, [isNeural, latestSnapshot]);

  if (!isNeural) {
    return null;
  }

  function appendEvent(event: NeuralTimelineEvent): void {
    setEvents((current) => mergeTimelineEvents(current, [event]));
  }

  function selectScenario(scenario: NeuralLabScenarioCard): void {
    setActiveScenarioId(scenario.id);
    appendEvent({
      id: `scenario-${scenario.id}-${Date.now()}`,
      tick: latestSnapshot?.tick ?? 0,
      kind: "scenario",
      label: "Scenario selected",
      detail: `${scenario.title}. Selection changes lab guidance only until Apply setup is clicked.`
    });
  }

  function applyScenarioSetup(scenario: NeuralLabScenarioCard): void {
    setParameters(scenario.parameterPatch, `Neural lab scenario ${scenario.title}`);
    appendEvent({
      id: `scenario-setup-${scenario.id}-${Date.now()}`,
      tick: 0,
      kind: "network",
      label: "Network regenerated",
      detail: `${scenario.title} setup applied through validated parameters. Training and adaptation are not active.`
    });
  }

  function applyPlainControl(label: string, patch: ParameterValues): void {
    setParameters(patch, `Neural lab control ${label}`);
    appendEvent({
      id: `plain-control-${label}-${Date.now()}`,
      tick: 0,
      kind: "network",
      label: "Network regenerated",
      detail: `${label} applied through deterministic parameter mapping.`
    });
  }

  function runDirectAction(action: NeuralDirectAction): void {
    if (action.id === "reset-activity") {
      reset();
      appendEvent({
        id: `reset-${Date.now()}`,
        tick: 0,
        kind: "network",
        label: "Activity reset",
        detail: "Fresh tick-0 run rebuilt with the same seed and parameters."
      });
      return;
    }
    if (action.id === "regenerate-network") {
      regenerateSeed();
      appendEvent({
        id: `regenerate-${Date.now()}`,
        tick: 0,
        kind: "network",
        label: "Network regenerated",
        detail: "New seed requested for a fresh validated Neural network."
      });
      return;
    }
    if (action.id === "show-advanced-config") {
      openAdvancedConfig();
      appendEvent({
        id: `advanced-${Date.now()}`,
        tick: latestSnapshot?.tick ?? 0,
        kind: "run",
        label: "Advanced config opened",
        detail: "Exact numeric parameters remain available for expert configuration."
      });
      return;
    }
    if (!action.interventionId) {
      return;
    }
    applyIntervention(action.interventionId, defaultActionParameters(action.interventionId));
    appendEvent({
      id: `intervention-${action.id}-${Date.now()}`,
      tick: latestSnapshot?.tick ?? 0,
      kind: "intervention",
      label: action.label,
      detail: "Applied through the template-scoped intervention executor; it is not a Builder graph or schema action."
    });
  }

  function cueRpsRound(choice: RpsChoice): void {
    const interventionId = `neural.stimulate${titleCase(choice)}Assembly`;
    pendingRpsChoiceRef.current = choice;
    applyIntervention(interventionId, { strength: 2 });
    stepOnce();
    appendEvent({
      id: `rps-cue-${choice}-${Date.now()}`,
      tick: latestSnapshot?.tick ?? 0,
      kind: "rps",
      label: `RPS cue ${titleCase(choice)}`,
      detail: "Stimulated a designer-labeled output assembly and stepped one tick for observational payoff."
    });
  }

  return (
    <CornerFramePanel title="Neural Runtime Lab" eyebrow="Scenario guided" variant="compact" className="neural-lab-panel">
      <section className="neural-lab" aria-label="Neural Runtime Lab">
        <div className="neural-lab__boundary" aria-label="Neural lab boundary">
          {neuralRuntimeLabBoundaryCopy.slice(0, 4).map((copy) => (
            <p key={copy}>{copy}</p>
          ))}
        </div>

        <section className="neural-lab__section" aria-label="Neural lab scenarios">
          <div className="neural-lab__section-head">
            <span>Goal to scenario</span>
            <strong>{activeScenario.title}</strong>
          </div>
          <p className="neural-lab__microcopy">
            Apply setup rebuilds a fresh tick-0 Neural run and discards the current tick, metric trace, selection, intervention target, and intervention history.
          </p>
          <div className="neural-lab__cards">
            {neuralLabScenarioCards.map((scenario) => (
              <article key={scenario.id} className={`neural-lab-card ${scenario.id === activeScenario.id ? "is-active" : ""}`}>
                <button
                  type="button"
                  className="neural-lab-card__select"
                  aria-pressed={scenario.id === activeScenario.id}
                  onClick={() => selectScenario(scenario)}
                  suppressHydrationWarning
                >
                  <strong>{scenario.title}</strong>
                  <span>{scenario.objective}</span>
                </button>
                <p>{scenario.setupImpact}</p>
                <em>{scenario.actionHint}</em>
                <button type="button" className="neural-lab-card__apply" onClick={() => applyScenarioSetup(scenario)} suppressHydrationWarning>
                  Apply setup
                </button>
              </article>
            ))}
          </div>
        </section>

        <section className="neural-lab__mission" aria-label="Neural lab mission">
          <div className="neural-lab__section-head">
            <span>Mission</span>
            <strong>{mission.title}</strong>
          </div>
          <p>{mission.objective}</p>
          <dl className="neural-lab-status">
            {mission.statusRows.map((row) => (
              <div key={row.label}>
                <dt>{row.label}</dt>
                <dd>{row.value}</dd>
              </div>
            ))}
          </dl>
          {mission.rpsRows.length > 0 ? (
            <dl className="neural-lab-status neural-lab-status--rps" aria-label="RPS readout mission status">
              {mission.rpsRows.map((row) => (
                <div key={row.label}>
                  <dt>{row.label}</dt>
                  <dd>{row.value}</dd>
                </div>
              ))}
            </dl>
          ) : null}
          <div className="neural-lab-next">
            <span>Try next</span>
            <ul>
              {mission.tryNext.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </section>

        <section className="neural-lab__section" aria-label="Live neural explanation">
          <div className="neural-lab__section-head">
            <span>Explanation</span>
            <strong>Live readout</strong>
          </div>
          <ul className="neural-lab-explanations">
            {explanations.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section className="neural-lab__section" aria-label="Neural direct actions">
          <div className="neural-lab__section-head">
            <span>Intervention</span>
            <strong>Direct actions</strong>
          </div>
          <div className="neural-lab-actions">
            {neuralDirectActions.map((action) => {
              const disabledReason = actionDisabledReason(action, selectedEntityId, Boolean(readout?.enabled), latestSnapshot);
              return (
                <div key={action.id} className="neural-lab-action">
                  <button
                    type="button"
                    onClick={() => runDirectAction(action)}
                    disabled={Boolean(disabledReason)}
                    aria-describedby={disabledReason ? `neural-action-${action.id}-reason` : undefined}
                    suppressHydrationWarning
                  >
                    {action.label}
                  </button>
                  <span>{action.description}</span>
                  {disabledReason ? <em id={`neural-action-${action.id}-reason`}>{disabledReason}</em> : null}
                </div>
              );
            })}
          </div>
        </section>

        <section className="neural-lab__section" aria-label="Plain English Neural controls">
          <div className="neural-lab__section-head">
            <span>Plain-English controls</span>
            <strong>Validated setup mappings</strong>
          </div>
          <p className="neural-lab__microcopy">
            These controls map to existing Neural parameters and regenerate a fresh tick-0 run. Exact numeric controls remain in Advanced config.
            The current run state is replaced when a setup mapping is applied.
          </p>
          <div className="neural-lab-controls">
            {neuralPlainEnglishControls.map((group) => (
              <section key={group.id} className="neural-lab-control-group" aria-label={group.label}>
                <strong>{group.label}</strong>
                <p>{group.helper}</p>
                <div>
                  {group.options.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => applyPlainControl(`${group.label}: ${option.label}`, option.parameterPatch)}
                      title={option.description}
                      suppressHydrationWarning
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </section>

        {showRpsShell ? (
          <RpsChallengeShell readout={readout} rounds={rpsRounds} onCue={cueRpsRound} enabled={Boolean(readout?.enabled)} />
        ) : null}

        <section className="neural-lab__section" aria-label="Neural lab timeline">
          <div className="neural-lab__section-head">
            <span>Timeline</span>
            <strong>Latest bounded events</strong>
          </div>
          {events.length === 0 ? (
            <p className="neural-lab__microcopy">No lab events yet. Select a scenario, run the model, or apply a direct action.</p>
          ) : (
            <ol className="neural-lab-timeline">
              {events
                .slice()
                .reverse()
                .map((event) => (
                  <li key={event.id} data-event-kind={event.kind}>
                    <span>{event.kind}</span>
                    <strong>{event.label}</strong>
                    <em>
                      tick {event.tick}: {event.detail}
                    </em>
                  </li>
                ))}
            </ol>
          )}
        </section>

        <div className="neural-lab__boundary" aria-label="Neural lab runtime honesty">
          {neuralRuntimeLabBoundaryCopy.slice(4).map((copy) => (
            <p key={copy}>{copy}</p>
          ))}
          <p>Training and adaptation are deferred to Neural Strategy Adaptation V1.</p>
        </div>
      </section>
    </CornerFramePanel>
  );
}

function RpsChallengeShell({
  readout,
  rounds,
  enabled,
  onCue
}: {
  readout: ReturnType<typeof renderNeuralDecisionReadout>;
  rounds: readonly NeuralRpsRound[];
  enabled: boolean;
  onCue: (choice: RpsChoice) => void;
}) {
  const distribution = neuralRpsDistribution(rounds);
  const latestRound = rounds[rounds.length - 1];

  return (
    <section className="neural-lab__section neural-lab-rps" aria-label="Challenge shell: Stay unpredictable">
      <div className="neural-lab__section-head">
        <span>Challenge shell</span>
        <strong>Stay unpredictable</strong>
      </div>
      <p>
        No adaptation is active. RPS payoff is recorded but does not change weights, biases, or future choices.
      </p>
      <p>Rock-Paper-Scissors labels are assigned to output assemblies by the model designer; the network does not understand the labels.</p>
      <div className="neural-lab-rps__buttons">
        {rpsChoices.map((choice) => (
          <button key={choice} type="button" onClick={() => onCue(choice)} disabled={!enabled} suppressHydrationWarning>
            Cue {titleCase(choice)} + step
          </button>
        ))}
      </div>
      {!enabled ? <p className="neural-lab__microcopy">Enable Decision Readout V1 with the RPS scenario or plain-English control first.</p> : null}
      <dl className="neural-lab-status neural-lab-status--rps">
        <div>
          <dt>User cue</dt>
          <dd>{latestRound ? titleCase(latestRound.userChoice) : "None yet"}</dd>
        </div>
        <div>
          <dt>Opponent choice</dt>
          <dd>{readout?.rps ? titleCase(readout.rps.opponentChoice) : "None"}</dd>
        </div>
        <div>
          <dt>Network readout</dt>
          <dd>{readout?.enabled ? titleCase(readout.selected) : "Disabled"}</dd>
        </div>
        <div>
          <dt>Outcome</dt>
          <dd>{readout?.rps ? `${titleCase(readout.rps.outcome)} / ${formatNumber(readout.rps.payoff, 0)}` : "None / 0"}</dd>
        </div>
        <div>
          <dt>Confidence</dt>
          <dd>{readout?.enabled ? formatNumber(readout.confidence, 3) : "0"}</dd>
        </div>
      </dl>
      <div className="neural-lab-rps__distribution" aria-label="RPS readout distribution">
        {distribution.map((item) => (
          <span key={item.choice}>
            {titleCase(item.choice)} <strong>{item.count}</strong>
          </span>
        ))}
      </div>
      {rounds.length > 0 ? (
        <ol className="neural-lab-rps__history" aria-label="RPS round history">
          {rounds
            .slice()
            .reverse()
            .map((round) => (
              <li key={round.id}>
                <strong>tick {round.tick}</strong>
                <span>
                  cue {titleCase(round.userChoice)} · readout {titleCase(round.networkChoice)} · opponent {titleCase(round.opponentChoice)} ·{" "}
                  {titleCase(round.outcome)} / {formatNumber(round.payoff, 0)}
                </span>
              </li>
            ))}
        </ol>
      ) : (
        <p className="neural-lab__microcopy">No RPS rounds recorded in this bounded local shell.</p>
      )}
    </section>
  );
}

function defaultActionParameters(interventionId: string): ParameterValues {
  if (interventionId === "neural.increaseGlobalInhibition") {
    return { delta: 0.25 };
  }
  if (interventionId === "neural.toggleExternalStimulus") {
    return {};
  }
  return { strength: 2 };
}

function actionDisabledReason(
  action: NeuralDirectAction,
  selectedEntityId: string | null,
  readoutEnabled: boolean,
  snapshot: SimulationSnapshotView | null
): string | null {
  if (!snapshot) {
    return "Start or initialize the Neural run first.";
  }
  if (action.requiresSelection && !selectedEntityId) {
    return "Select a neuron on the canvas first.";
  }
  if (action.requiresReadout && !readoutEnabled) {
    return "Enable Decision Readout V1 first.";
  }
  return null;
}

function mergeTimelineEvents(current: readonly NeuralTimelineEvent[], additions: readonly NeuralTimelineEvent[]): NeuralTimelineEvent[] {
  const seen = new Set(current.map((event) => event.id));
  return boundNeuralTimelineEvents([...current, ...additions.filter((event) => !seen.has(event.id))]);
}

function openAdvancedConfig(): void {
  if (typeof window === "undefined") {
    return;
  }
  window.dispatchEvent(new CustomEvent("ortus:open-neural-advanced-config"));
  window.requestAnimationFrame(() => {
    document.getElementById("neural-advanced-config-toggle")?.focus();
  });
}
