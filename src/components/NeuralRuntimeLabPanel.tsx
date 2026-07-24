"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { ParameterValues, SimulationSnapshotView } from "../simulation";
import { formatNumber } from "../lib/format";
import { renderNeuralDecisionReadout } from "../lib/templateVisuals";
import { useSimulationStore } from "../state/simulationStore";
import {
  boundNeuralRpsRounds,
  boundNeuralTimelineEvents,
  chooseNeuralAdaptiveCue,
  clearNeuralRpsHistory,
  createInitialNeuralStrategyAdaptationState,
  createNeuralLabMission,
  createNeuralLiveExplanations,
  createNeuralRpsRound,
  createNeuralStrategyAdaptationConfig,
  deriveNeuralRuntimeEvents,
  defaultNeuralStrategyAdaptationConfig,
  neuralDirectActions,
  neuralLabScenarioCards,
  neuralPlainEnglishControls,
  neuralRuntimeLabBoundaryCopy,
  neuralRuntimeLabTemplateId,
  neuralRpsDistribution,
  neuralRpsChoices,
  neuralStrategyAdaptationConfigBounds,
  neuralStrategyAdaptationMetricsBoundary,
  neuralStrategyAdaptationPlainControls,
  neuralStrategyRandomPlayBoundary,
  nextNeuralRpsRoundIndex,
  resetNeuralStrategyAdaptation,
  roundsAfterNeuralStrategyReset,
  titleCase,
  updateNeuralStrategyAdaptation,
  type NeuralDirectAction,
  type NeuralLabScenarioCard,
  type NeuralRpsRound,
  type NeuralRpsChoice,
  type NeuralStrategyAdaptationConfig,
  type NeuralStrategyAdaptationState,
  type NeuralTimelineEvent
} from "./neuralRuntimeLab";
import { CornerFramePanel } from "./ui/CornerFramePanel";

export function NeuralRuntimeLabPanel({ active = true }: { active?: boolean } = {}) {
  const selectedTemplateId = useSimulationStore((state) => state.selectedTemplateId);
  const latestSnapshot = useSimulationStore((state) => active ? state.latestSnapshot : null);
  const isRunning = useSimulationStore((state) => active && state.isRunning);
  const seed = useSimulationStore((state) => state.seed);
  const selectedEntityId = useSimulationStore((state) => state.selectedEntityId);
  const applyIntervention = useSimulationStore((state) => state.applyIntervention);
  const setParameters = useSimulationStore((state) => state.setParameters);
  const regenerateSeed = useSimulationStore((state) => state.regenerateSeed);
  const reset = useSimulationStore((state) => state.reset);
  const stepOnce = useSimulationStore((state) => state.stepOnce);

  const [activeScenarioId, setActiveScenarioId] = useState<NeuralLabScenarioCard["id"]>("cascade-spread");
  const [events, setEvents] = useState<NeuralTimelineEvent[]>([]);
  const [rpsRounds, setRpsRounds] = useState<NeuralRpsRound[]>([]);
  const [adaptationConfig, setAdaptationConfig] = useState<NeuralStrategyAdaptationConfig>(defaultNeuralStrategyAdaptationConfig);
  const [adaptationState, setAdaptationState] = useState<NeuralStrategyAdaptationState>(() =>
    createInitialNeuralStrategyAdaptationState(defaultNeuralStrategyAdaptationConfig)
  );
  const [challengeRunning, setChallengeRunning] = useState(false);
  const [adaptationDetailsOpen, setAdaptationDetailsOpen] = useState(false);
  const previousSnapshotRef = useRef<SimulationSnapshotView | null>(null);
  const previousRunningRef = useRef(isRunning);
  const pendingRpsChoiceRef = useRef<{
    userChoice: NeuralRpsChoice;
    roundIndex: number;
    explorationActive: boolean;
  } | null>(null);
  const adaptationStateRef = useRef(adaptationState);
  const rpsRoundsRef = useRef(rpsRounds);
  const strategyResetAfterRoundRef = useRef(0);

  const isNeural = selectedTemplateId === neuralRuntimeLabTemplateId;
  const activeScenario = useMemo(
    () => neuralLabScenarioCards.find((scenario) => scenario.id === activeScenarioId) ?? neuralLabScenarioCards[0]!,
    [activeScenarioId]
  );
  const readout = renderNeuralDecisionReadout(latestSnapshot);
  const mission = createNeuralLabMission(latestSnapshot, activeScenario, adaptationState);
  const explanations = createNeuralLiveExplanations(latestSnapshot, adaptationState);
  const showRpsShell = activeScenario.id === "rps-readout-demo" || activeScenario.id === "stay-unpredictable" || Boolean(readout?.enabled);

  useEffect(() => {
    adaptationStateRef.current = adaptationState;
  }, [adaptationState]);

  useEffect(() => {
    rpsRoundsRef.current = rpsRounds;
  }, [rpsRounds]);

  useEffect(() => {
    if (!active) {
      return;
    }
    if (!isNeural) {
      previousSnapshotRef.current = latestSnapshot;
      return;
    }
    const derived = deriveNeuralRuntimeEvents(previousSnapshotRef.current, latestSnapshot);
    previousSnapshotRef.current = latestSnapshot;
    if (derived.length > 0) {
      setEvents((current) => mergeTimelineEvents(current, derived));
    }
  }, [active, isNeural, latestSnapshot]);

  useEffect(() => {
    if (!active) {
      return;
    }
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
  }, [active, isNeural, isRunning, latestSnapshot?.tick]);

  useEffect(() => {
    if (!active || !latestSnapshot || !isNeural) {
      return;
    }
    const pending = pendingRpsChoiceRef.current;
    if (!pending) {
      return;
    }
    const round = createNeuralRpsRound(latestSnapshot, pending.userChoice, pending.roundIndex, pending.explorationActive);
    if (!round) {
      return;
    }
    pendingRpsChoiceRef.current = null;
    setRpsRounds((current) => {
      if (current.some((candidate) => candidate.id === round.id)) {
        return current;
      }
      const nextRounds = boundNeuralRpsRounds([...current, round], adaptationConfig.historyWindow);
      const nextAdaptation = updateNeuralStrategyAdaptation(roundsSinceStrategyReset(nextRounds), adaptationConfig);
      setAdaptationState(nextAdaptation);
      appendAdaptationEvents(adaptationStateRef.current, nextAdaptation, round);
      return nextRounds;
    });
  }, [active, adaptationConfig, isNeural, latestSnapshot]);

  if (!isNeural) {
    return null;
  }

  function appendEvent(event: NeuralTimelineEvent): void {
    setEvents((current) => mergeTimelineEvents(current, [event]));
  }

  function appendAdaptationEvents(
    previous: NeuralStrategyAdaptationState,
    next: NeuralStrategyAdaptationState,
    round: NeuralRpsRound
  ): void {
    const additions: NeuralTimelineEvent[] = [
      {
        id: `adaptation-round-${round.roundIndex}-${Date.now()}`,
        tick: round.tick,
        kind: "adaptation",
        label: "Round recorded",
        detail: `Player ${titleCase(round.userChoice)}; readout ${titleCase(round.networkChoice)}; ${titleCase(round.outcome)}.`
      }
    ];
    if (round.explorationActive) {
      additions.push({
        id: `adaptation-exploration-${round.roundIndex}-${Date.now()}`,
        tick: round.tick,
        kind: "adaptation",
        label: "Exploration used",
        detail: "Deterministic exploration ignored the strongest counter-bias for this round."
      });
    }
    if (previous.predictedOpponentChoice !== next.predictedOpponentChoice) {
      additions.push({
        id: `adaptation-prediction-${round.roundIndex}-${Date.now()}`,
        tick: round.tick,
        kind: "adaptation",
        label: "Predicted move changed",
        detail:
          next.predictedOpponentChoice === "unknown"
            ? "No stable pattern detected."
            : `Recent rounds suggest ${titleCase(next.predictedOpponentChoice)} is more likely.`
      });
    }
    if (formatPanelBias(previous.choiceBias) !== formatPanelBias(next.choiceBias)) {
      additions.push({
        id: `adaptation-bias-${round.roundIndex}-${Date.now()}`,
        tick: round.tick,
        kind: "adaptation",
        label: "Readout bias updated",
        detail: `Bounded bias is now ${formatPanelBias(next.choiceBias)}.`
      });
    }
    setEvents((current) => mergeTimelineEvents(current, additions));
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
      detail: `${scenario.title} setup applied through validated parameters. Local learned strategy state is not cleared; use Reset learned strategy to clear it.`
    });
  }

  function applyPlainControl(label: string, patch: ParameterValues): void {
    setParameters(patch, `Neural lab control ${label}`);
    appendEvent({
      id: `plain-control-${label}-${Date.now()}`,
      tick: 0,
      kind: "network",
      label: "Network regenerated",
      detail: `${label} applied through deterministic parameter mapping. Local learned strategy state is not cleared unless Reset learned strategy is used.`
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
        detail: "Fresh tick-0 run rebuilt with the same seed and parameters. Local learned strategy state is not cleared unless Reset learned strategy is used."
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
        detail: "New seed requested for a fresh validated Neural network. Local learned strategy state is not cleared unless Reset learned strategy is used."
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

  function cueRpsRound(choice: NeuralRpsChoice): void {
    const nextRoundIndex = nextNeuralRpsRoundIndex(rpsRoundsRef.current);
    const cuePlan = chooseNeuralAdaptiveCue(choice, adaptationStateRef.current, adaptationConfig, seed, nextRoundIndex);
    const interventionId = `neural.stimulate${titleCase(cuePlan.cueChoice)}Assembly`;
    pendingRpsChoiceRef.current = {
      userChoice: choice,
      roundIndex: nextRoundIndex,
      explorationActive: cuePlan.explorationActive
    };
    applyIntervention(interventionId, { strength: cuePlan.strength });
    stepOnce();
    appendEvent({
      id: `rps-cue-${choice}-${nextRoundIndex}-${Date.now()}`,
      tick: latestSnapshot?.tick ?? 0,
      kind: "rps",
      label: `RPS round ${nextRoundIndex}`,
      detail: `Player choice ${titleCase(choice)}; network cue ${titleCase(cuePlan.cueChoice)}. ${cuePlan.reason}`
    });
  }

  function startChallenge(): void {
    setChallengeRunning(true);
    appendEvent({
      id: `adaptive-challenge-started-${Date.now()}`,
      tick: latestSnapshot?.tick ?? 0,
      kind: "adaptation",
      label: "Adaptive challenge started",
      detail: "Local RPS challenge is active. It resumes the visible local learned strategy state; use Reset learned strategy to clear it."
    });
  }

  function pauseChallenge(): void {
    setChallengeRunning(false);
    appendEvent({
      id: `adaptive-challenge-paused-${Date.now()}`,
      tick: latestSnapshot?.tick ?? 0,
      kind: "adaptation",
      label: "Adaptive challenge paused",
      detail: "Local challenge paused; neural run state is not reset."
    });
  }

  function toggleAdaptation(enabled: boolean): void {
    const nextConfig = createNeuralStrategyAdaptationConfig({ enabled }, adaptationConfig);
    setAdaptationConfig(nextConfig);
    const nextState = updateNeuralStrategyAdaptation(roundsSinceStrategyReset(rpsRoundsRef.current), nextConfig);
    setAdaptationState(nextState);
    appendEvent({
      id: `adaptation-${enabled ? "enabled" : "disabled"}-${Date.now()}`,
      tick: latestSnapshot?.tick ?? 0,
      kind: "adaptation",
      label: enabled ? "Adaptation enabled" : "Adaptation disabled",
      detail: enabled
        ? "Future rounds may shift bounded readout bias from explicit local RPS history."
        : "Future rounds are recorded observationally; learned readout bias is not applied."
    });
  }

  function applyAdaptationConfigPatch(label: string, patch: Partial<NeuralStrategyAdaptationConfig>): void {
    const nextConfig = createNeuralStrategyAdaptationConfig(patch, adaptationConfig);
    setAdaptationConfig(nextConfig);
    const nextState = updateNeuralStrategyAdaptation(roundsSinceStrategyReset(rpsRoundsRef.current), nextConfig);
    setAdaptationState(nextState);
    appendEvent({
      id: `adaptation-config-${label}-${Date.now()}`,
      tick: latestSnapshot?.tick ?? 0,
      kind: "adaptation",
      label: "Adaptation config changed",
      detail: `${label} updated bounded local strategy parameters.`
    });
  }

  function setAdaptationConfigValue(key: NumericAdaptationConfigKey, value: number): void {
    if (!Number.isFinite(value)) {
      return;
    }
    const bounds = neuralStrategyAdaptationConfigBounds[key];
    const boundedValue = Math.min(bounds.max, Math.max(bounds.min, value));
    const nextValue = key === "historyWindow" || key === "patternWindow" ? Math.round(boundedValue) : boundedValue;
    const patch = { [key]: nextValue } as Partial<NeuralStrategyAdaptationConfig>;
    if (key === "historyWindow" && typeof nextValue === "number" && nextValue < adaptationConfig.patternWindow) {
      patch.patternWindow = nextValue;
    }
    if (key === "patternWindow" && typeof nextValue === "number" && nextValue > adaptationConfig.historyWindow) {
      patch.historyWindow = nextValue;
    }
    applyAdaptationConfigPatch(key, patch);
  }

  function resetLearnedStrategy(): void {
    strategyResetAfterRoundRef.current = nextNeuralRpsRoundIndex(rpsRoundsRef.current) - 1;
    const nextState = resetNeuralStrategyAdaptation(adaptationConfig);
    setAdaptationState(nextState);
    appendEvent({
      id: `adaptation-reset-${Date.now()}`,
      tick: latestSnapshot?.tick ?? 0,
      kind: "adaptation",
      label: "Learned strategy reset",
      detail: "Choice bias, pattern statistics, transition counts, confidence, and local prediction state were cleared."
    });
  }

  function clearRpsHistory(): void {
    const emptyRounds = clearNeuralRpsHistory();
    strategyResetAfterRoundRef.current = 0;
    setRpsRounds(emptyRounds);
    const nextState = resetNeuralStrategyAdaptation(adaptationConfig);
    setAdaptationState(nextState);
    appendEvent({
      id: `rps-history-cleared-${Date.now()}`,
      tick: latestSnapshot?.tick ?? 0,
      kind: "adaptation",
      label: "Local history cleared",
      detail: "RPS round history, rolling stats, and derived learned strategy state were cleared."
    });
  }

  function roundsSinceStrategyReset(rounds: readonly NeuralRpsRound[]): readonly NeuralRpsRound[] {
    return roundsAfterNeuralStrategyReset(rounds, strategyResetAfterRoundRef.current);
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
          <RpsChallengeShell
            readout={readout}
            rounds={rpsRounds}
            enabled={Boolean(readout?.enabled)}
            challengeRunning={challengeRunning}
            adaptationConfig={adaptationConfig}
            adaptationState={adaptationState}
            detailsOpen={adaptationDetailsOpen}
            onCue={cueRpsRound}
            onStart={startChallenge}
            onPause={pauseChallenge}
            onToggleAdaptation={toggleAdaptation}
            onDetailsToggle={() => setAdaptationDetailsOpen((current) => !current)}
            onResetStrategy={resetLearnedStrategy}
            onClearHistory={clearRpsHistory}
            onConfigPatch={applyAdaptationConfigPatch}
            onConfigValueChange={setAdaptationConfigValue}
          />
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
          <p>{neuralStrategyRandomPlayBoundary}</p>
        </div>
      </section>
    </CornerFramePanel>
  );
}

function RpsChallengeShell({
  readout,
  rounds,
  enabled,
  challengeRunning,
  adaptationConfig,
  adaptationState,
  detailsOpen,
  onCue,
  onStart,
  onPause,
  onToggleAdaptation,
  onDetailsToggle,
  onResetStrategy,
  onClearHistory,
  onConfigPatch,
  onConfigValueChange
}: {
  readout: ReturnType<typeof renderNeuralDecisionReadout>;
  rounds: readonly NeuralRpsRound[];
  enabled: boolean;
  challengeRunning: boolean;
  adaptationConfig: NeuralStrategyAdaptationConfig;
  adaptationState: NeuralStrategyAdaptationState;
  detailsOpen: boolean;
  onCue: (choice: NeuralRpsChoice) => void;
  onStart: () => void;
  onPause: () => void;
  onToggleAdaptation: (enabled: boolean) => void;
  onDetailsToggle: () => void;
  onResetStrategy: () => void;
  onClearHistory: () => void;
  onConfigPatch: (label: string, patch: Partial<NeuralStrategyAdaptationConfig>) => void;
  onConfigValueChange: (key: NumericAdaptationConfigKey, value: number) => void;
}) {
  const distribution = neuralRpsDistribution(rounds);
  const latestRound = rounds[rounds.length - 1];
  const disabledReason = !enabled
    ? "Enable Decision Readout V1 with the RPS scenario or plain-English control first."
    : !challengeRunning
      ? "Start adaptive challenge before recording rounds."
      : null;

  return (
    <section className="neural-lab__section neural-lab-rps" aria-label="Adaptive RPS Challenge">
      <div className="neural-lab__section-head">
        <span>Adaptive RPS Challenge</span>
        <strong>{adaptationState.enabled ? "Adaptive mode" : "Observational mode"}</strong>
      </div>
      <p>Strategy Adaptation V1 updates bounded game-state variables from observed RPS rounds. It is not cognition, reasoning, or human intention inference.</p>
      <p>The adaptive readout can exploit repeated patterns, but it cannot beat truly random optimal play over time.</p>
      <p>Learned strategy state is local model state, not a psychological profile.</p>
      <p>Adaptation changes game-readout bias only; it does not simulate biological plasticity or human learning.</p>
      <p>Rock-Paper-Scissors labels are assigned to output assemblies by the model designer; the network does not understand the labels.</p>
      <div className="neural-lab-rps__toolbar" aria-label="Adaptive challenge controls">
        <button type="button" onClick={onStart} disabled={!enabled || challengeRunning} suppressHydrationWarning>
          Start adaptive challenge
        </button>
        <button type="button" onClick={onPause} disabled={!enabled || !challengeRunning} suppressHydrationWarning>
          Pause challenge
        </button>
        <label className="neural-lab-rps__toggle">
          <input
            type="checkbox"
            checked={adaptationConfig.enabled}
            onChange={(event) => onToggleAdaptation(event.currentTarget.checked)}
            aria-label="Enable adaptation"
          />
          <span>Enable adaptation</span>
        </label>
        <button type="button" onClick={onResetStrategy} aria-label="Reset learned strategy" suppressHydrationWarning>
          Reset learned strategy
        </button>
        <button type="button" onClick={onClearHistory} aria-label="Clear local RPS history" suppressHydrationWarning>
          Clear round history
        </button>
        <button
          type="button"
          onClick={onDetailsToggle}
          aria-expanded={detailsOpen}
          aria-controls="neural-adaptation-details"
          suppressHydrationWarning
        >
          {detailsOpen ? "Hide adaptation details" : "Show adaptation details"}
        </button>
      </div>
      <div className="neural-lab-rps__buttons">
        {neuralRpsChoices.map((choice) => (
          <button
            key={choice}
            type="button"
            onClick={() => onCue(choice)}
            disabled={Boolean(disabledReason)}
            aria-describedby={disabledReason ? "neural-rps-disabled-reason" : undefined}
            suppressHydrationWarning
          >
            Choose {titleCase(choice)}
          </button>
        ))}
      </div>
      {disabledReason ? (
        <p className="neural-lab__microcopy" id="neural-rps-disabled-reason">
          {disabledReason}
        </p>
      ) : null}
      <dl className="neural-lab-status neural-lab-status--rps">
        <div>
          <dt>Active mode</dt>
          <dd>{adaptationState.enabled ? "Adaptive" : "Observational"}</dd>
        </div>
        <div>
          <dt>Round count</dt>
          <dd>{rounds.length}</dd>
        </div>
        <div>
          <dt>Your last choice</dt>
          <dd>{latestRound ? titleCase(latestRound.userChoice) : "None yet"}</dd>
        </div>
        <div>
          <dt>Network readout</dt>
          <dd>{readout?.enabled ? titleCase(readout.selected) : "Disabled"}</dd>
        </div>
        <div>
          <dt>Latest outcome</dt>
          <dd>
            {latestRound
              ? `${titleCase(latestRound.outcome)} / ${formatNumber(latestRound.payoff, 0)}`
              : readout?.rps
                ? `${titleCase(readout.rps.outcome)} / ${formatNumber(readout.rps.payoff, 0)}`
                : "None / 0"}
          </dd>
        </div>
        <div>
          <dt>Rolling win/draw/loss</dt>
          <dd>
            {formatPercent(adaptationState.rollingWinRate)} / {formatPercent(adaptationState.rollingDrawRate)} /{" "}
            {formatPercent(adaptationState.rollingLossRate)}
          </dd>
        </div>
        <div>
          <dt>Predicted player move</dt>
          <dd>{adaptationState.predictedOpponentChoice === "unknown" ? "No stable pattern detected." : titleCase(adaptationState.predictedOpponentChoice)}</dd>
        </div>
        <div>
          <dt>Predicted counter-choice</dt>
          <dd>{adaptationState.predictedCounterChoice === "unknown" ? "Unknown" : titleCase(adaptationState.predictedCounterChoice)}</dd>
        </div>
        <div>
          <dt>Pattern confidence</dt>
          <dd>{formatNumber(adaptationState.patternConfidence, 3)}</dd>
        </div>
        <div>
          <dt>Exploration rate</dt>
          <dd>{formatPercent(adaptationState.explorationRate)}</dd>
        </div>
        <div>
          <dt>Readout bias</dt>
          <dd>{formatPanelBias(adaptationState.choiceBias)}</dd>
        </div>
        <div>
          <dt>Local-state caveat</dt>
          <dd>Local strategy state only</dd>
        </div>
      </dl>
      <p className="neural-lab__microcopy">{neuralStrategyRandomPlayBoundary}</p>
      <p className="neural-lab__microcopy">{neuralStrategyAdaptationMetricsBoundary}</p>
      <div className="neural-lab-rps__distribution" aria-label="RPS readout distribution">
        {distribution.map((item) => (
          <span key={item.choice}>
            {titleCase(item.choice)} <strong>{item.count}</strong>
          </span>
        ))}
      </div>
      {detailsOpen ? (
        <div className="neural-lab-rps__details" id="neural-adaptation-details" aria-label="Adaptation details">
          <section aria-label="Plain English adaptation controls">
            <strong>Plain-English adaptation controls</strong>
            <div className="neural-lab-controls">
              {neuralStrategyAdaptationPlainControls.map((group) => (
                <div key={group.id} className="neural-lab-control-group">
                  <strong>{group.label}</strong>
                  <p>{group.helper}</p>
                  <div>
                    {group.options.map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => onConfigPatch(`${group.label}: ${option.label}`, option.configPatch)}
                        title={option.description}
                        suppressHydrationWarning
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
          <section aria-label="Exact adaptation values">
            <strong>Exact adaptation values</strong>
            <div className="neural-lab-rps__config-grid">
              {adaptationConfigInputs.map((input) => (
                <label key={input.key}>
                  <span>{input.label}</span>
                  <input
                    type="number"
                    min={input.min}
                    max={input.max}
                    step={input.step}
                    value={adaptationConfig[input.key]}
                    onChange={(event) => onConfigValueChange(input.key, Number(event.currentTarget.value))}
                    aria-label={input.label}
                  />
                </label>
              ))}
            </div>
          </section>
          <dl className="neural-lab-status neural-lab-status--rps" aria-label="Adaptation statistics">
            {neuralRpsChoices.map((choice) => (
              <div key={`count-${choice}`}>
                <dt>{titleCase(choice)} player count</dt>
                <dd>{adaptationState.opponentChoiceCounts[choice]}</dd>
              </div>
            ))}
            {neuralRpsChoices.map((choice) => (
              <div key={`bias-${choice}`}>
                <dt>{titleCase(choice)} bias</dt>
                <dd>{formatNumber(adaptationState.choiceBias[choice], 3)}</dd>
              </div>
            ))}
            <div>
              <dt>Transition summary</dt>
              <dd>{formatTransitionSummary(adaptationState)}</dd>
            </div>
            <div>
              <dt>Strategy entropy</dt>
              <dd>{formatNumber(adaptationState.strategyEntropy, 3)}</dd>
            </div>
            <div>
              <dt>Transition stability</dt>
              <dd>{formatNumber(adaptationState.transitionStability, 3)}</dd>
            </div>
            <div>
              <dt>Last update</dt>
              <dd>{adaptationState.lastUpdateSummary}</dd>
            </div>
          </dl>
        </div>
      ) : null}
      {rounds.length > 0 ? (
        <ol className="neural-lab-rps__history" aria-label="RPS round history">
          {rounds
            .slice()
            .reverse()
            .map((round) => (
              <li key={round.id}>
                <strong>
                  round {round.roundIndex} · tick {round.tick}
                </strong>
                <span>
                  player {titleCase(round.userChoice)} · readout {titleCase(round.networkChoice)} · {titleCase(round.outcome)} /{" "}
                  {formatNumber(round.payoff, 0)} · confidence {formatNumber(round.readoutConfidence, 3)}
                  {round.explorationActive ? " · exploration used" : ""}
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

type NumericAdaptationConfigKey = Exclude<keyof NeuralStrategyAdaptationConfig, "enabled">;

const adaptationConfigInputs: Array<{
  key: NumericAdaptationConfigKey;
  label: string;
  min: number;
  max: number;
  step: number;
}> = [
  {
    key: "learningRate",
    label: "Learning rate",
    ...neuralStrategyAdaptationConfigBounds.learningRate
  },
  {
    key: "explorationRate",
    label: "Exploration rate",
    ...neuralStrategyAdaptationConfigBounds.explorationRate
  },
  {
    key: "historyWindow",
    label: "History window",
    ...neuralStrategyAdaptationConfigBounds.historyWindow
  },
  {
    key: "patternWindow",
    label: "Pattern window",
    ...neuralStrategyAdaptationConfigBounds.patternWindow
  },
  {
    key: "maxBiasMagnitude",
    label: "Max bias magnitude",
    ...neuralStrategyAdaptationConfigBounds.maxBiasMagnitude
  },
  {
    key: "decayRate",
    label: "Decay rate",
    ...neuralStrategyAdaptationConfigBounds.decayRate
  },
  {
    key: "minPatternConfidence",
    label: "Min pattern confidence",
    ...neuralStrategyAdaptationConfigBounds.minPatternConfidence
  }
];

function formatPercent(value: number): string {
  return `${formatNumber(Math.min(1, Math.max(0, value)) * 100, 0)}%`;
}

function formatPanelBias(choiceBias: Record<NeuralRpsChoice, number>): string {
  return neuralRpsChoices
    .map((choice) => `${titleCase(choice)} ${choiceBias[choice] >= 0 ? "+" : ""}${formatNumber(choiceBias[choice], 2)}`)
    .join(" / ");
}

function formatTransitionSummary(state: NeuralStrategyAdaptationState): string {
  return neuralRpsChoices
    .map((from) => {
      const row = state.transitionCounts[from];
      const best = neuralRpsChoices
        .map((to) => ({ to, count: row[to] }))
        .sort((left, right) => right.count - left.count || left.to.localeCompare(right.to))[0];
      return best && best.count > 0 ? `${titleCase(from)} -> ${titleCase(best.to)} (${best.count})` : `${titleCase(from)} -> none`;
    })
    .join("; ");
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
