"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { getProductionTemplate, type AuthoredScenario } from "../../../simulation";
import {
  createStarterWorldScenario, requireStarterWorldById, resolveStarterWorldLaunch,
  runnableStarterWorlds, starterRemixWorkshopHref, type StarterWorldDefinition
} from "../../../lib/starterWorlds";
import {
  deriveWorkbenchMaterialUsage, deriveWorkbenchModel, resolveWorkbenchControlDefinition,
  workbenchMaterials, type WorkbenchCapability, type WorkbenchPiece
} from "../../../lib/workbench";
import { CornerFramePanel } from "../../ui/CornerFramePanel";
import { WorkbenchGlyph } from "./WorkbenchGlyph";
import "./workbench.css";

interface VisualSystemsWorkbenchProps {
  world: StarterWorldDefinition;
  scenario: AuthoredScenario;
  initialPieceId?: string;
  renderControls?: (piece: WorkbenchPiece) => ReactNode;
  footer?: ReactNode;
  sourceContext?: ReactNode;
}

// Product-authored navigation prompts. They select examples, never generate a model.
const questions = [
  { label: "What makes groups coordinate?", ids: ["flocking", "opinion-dynamics"], hint: "Local neighborhoods · interaction · variation" },
  { label: "How does something spread?", ids: ["epidemic", "forest-spread", "neural-excitation"], hint: "Contact · state transitions · networks" },
  { label: "What keeps populations in balance?", ids: ["predator-prey"], hint: "Consumption · reproduction · energy" },
  { label: "How do local choices make patterns?", ids: ["schelling", "flocking"], hint: "Neighborhoods · movement · initial conditions" }
] as const;

const capabilityLabels: Record<WorkbenchCapability, string> = {
  executable: "Executable in this template",
  structural: "Structural only · not executable",
  reference: "Reference · not executable",
  future: "Future · not implemented"
};
const shelfCapabilityLabels: Record<WorkbenchCapability, string> = {
  executable: "In this template", structural: "Structural only", reference: "Reference only", future: "Not implemented"
};

export function WorkbenchLanding() {
  const world = requireStarterWorldById("flocking");
  const scenario = useMemo(() => {
    const result = resolveStarterWorldLaunch({ starterId: world.id });
    if (!result.ok) throw new Error(result.message);
    return createStarterWorldScenario(result.launch);
  }, [world]);
  return <VisualSystemsWorkbench world={world} scenario={scenario} />;
}

export function VisualSystemsWorkbench({ world, scenario, initialPieceId, renderControls, footer, sourceContext }: VisualSystemsWorkbenchProps) {
  const model = useMemo(() => deriveWorkbenchModel(world), [world]);
  const examples = useMemo(() => runnableStarterWorlds.filter(candidate => resolveStarterWorldLaunch({ starterId: candidate.id }).ok), []);
  const exampleModels = useMemo(() => examples.map(example => ({ world: example, model: deriveWorkbenchModel(example) })), [examples]);
  const [selectedId, setSelectedId] = useState(initialPieceId ?? model.rootIds[0]);
  const [expanded, setExpanded] = useState<ReadonlySet<string>>(() => {
    const ids = new Set(["population", "dynamics", "steering"]);
    let piece = model.pieces.find(candidate => candidate.id === initialPieceId);
    while (piece?.parentId) {
      ids.add(piece.parentId);
      piece = model.pieces.find(candidate => candidate.id === piece!.parentId);
    }
    return ids;
  });
  const [discovery, setDiscovery] = useState<"examples" | "materials" | "questions">("examples");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [materialId, setMaterialId] = useState<string | null>(null);
  const [drillId, setDrillId] = useState<string | null>(null);
  const [narrowInspection, setNarrowInspection] = useState(Boolean(initialPieceId));
  const [narrowLayout, setNarrowLayout] = useState(false);
  const [compactExamples, setCompactExamples] = useState(false);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const query = window.matchMedia("(max-width: 700px)");
    const compactQuery = window.matchMedia("(max-width: 700px), (max-height: 700px)");
    const update = () => { setNarrowLayout(query.matches); setCompactExamples(compactQuery.matches); };
    update();
    setReady(true);
    query.addEventListener("change", update);
    compactQuery.addEventListener("change", update);
    return () => { query.removeEventListener("change", update); compactQuery.removeEventListener("change", update); };
  }, []);
  const inspectorRef = useRef<HTMLDivElement>(null);
  const selected = model.pieces.find(piece => piece.id === selectedId) ?? model.pieces[0]!;
  const selectedMaterial = workbenchMaterials.find(material => material.id === materialId);
  const usage = useMemo(() => deriveWorkbenchMaterialUsage(model), [model]);
  const currentUsage = usage.find(material => material.id === materialId);
  const template = getProductionTemplate(model.templateId)!;
  const childrenOf = (id: string) => model.pieces.filter(piece => piece.parentId === id);
  const relationships = model.relationships.filter(relation => relation.from === selected.id || relation.to === selected.id);
  const ancestors: WorkbenchPiece[] = [];
  let parent = selected.parentId;
  while (parent) {
    const piece = model.pieces.find(candidate => candidate.id === parent);
    if (!piece) break;
    ancestors.unshift(piece);
    parent = piece.parentId;
  }

  function focusPiece(id: string) {
    window.requestAnimationFrame(() => document.getElementById(`workbench-piece-${id}`)?.focus());
  }

  function inspect(piece: WorkbenchPiece, fromRelationship = false) {
    setSelectedId(piece.id);
    setMaterialId(null);
    if (window.matchMedia("(max-width: 700px)").matches) {
      if (childrenOf(piece.id).length > 0 && !fromRelationship) {
        setDrillId(piece.id);
        setNarrowInspection(false);
        window.requestAnimationFrame(() => document.getElementById("workbench-level-title")?.focus());
      } else {
        setNarrowInspection(true);
        window.requestAnimationFrame(() => inspectorRef.current?.focus());
      }
    } else if (fromRelationship) {
      setExpanded(current => {
        const next = new Set(current);
        let ancestorId = piece.parentId;
        while (ancestorId) {
          next.add(ancestorId);
          ancestorId = model.pieces.find(candidate => candidate.id === ancestorId)?.parentId;
        }
        return next;
      });
      focusPiece(piece.id);
    }
  }

  function returnToSystem() {
    const returnId = narrowInspection ? selected.id : drillId;
    if (narrowInspection) {
      setNarrowInspection(false);
      setDrillId(selected.parentId ?? null);
    } else {
      setDrillId(model.pieces.find(piece => piece.id === drillId)?.parentId ?? null);
    }
    if (returnId) focusPiece(returnId);
  }

  function toggle(piece: WorkbenchPiece) {
    setExpanded(current => {
      const next = new Set(current);
      if (next.has(piece.id)) next.delete(piece.id); else next.add(piece.id);
      return next;
    });
  }

  function pieceValue(piece: WorkbenchPiece): string | null {
    const ref = piece.controls.find(control => control.group !== "run" && resolveWorkbenchControlDefinition(control, template, scenario));
    if (!ref || ref.group === "run") return null;
    const definition = resolveWorkbenchControlDefinition(ref, template, scenario);
    const value = scenario[ref.group][ref.key] ?? definition?.defaultValue;
    return definition && value !== undefined ? `${definition.label}: ${String(value)}` : null;
  }

  function pieceButton(piece: WorkbenchPiece, prominent = false) {
    const value = pieceValue(piece);
    return (
      <button type="button" id={`workbench-piece-${piece.id}`} data-workbench-piece={piece.id}
        className={`workbench-piece${prominent ? " workbench-piece--prominent" : ""}`}
        aria-label={`Inspect ${piece.label}`} aria-pressed={selected.id === piece.id && !selectedMaterial}
        onClick={() => inspect(piece)}>
        <WorkbenchGlyph motif={piece.motif} large={prominent} />
        <span className="workbench-piece__copy"><small>{piece.kind === "group" ? "Open this assembly" : piece.kind}</small><strong>{piece.label}</strong>
          {value ? <em>{value}</em> : <em>{childrenOf(piece.id).length > 0 ? `${childrenOf(piece.id).length} pieces inside` : "Inspect relationships"}</em>}
        </span>
        <span className="workbench-piece__affordance" aria-hidden="true">↗</span>
      </button>
    );
  }

  function nestedPieces(piece: WorkbenchPiece, depth = 0): ReactNode {
    const children = childrenOf(piece.id);
    if (children.length === 0) return <li key={piece.id}>{pieceButton(piece)}</li>;
    return (
      <li key={piece.id} className={`workbench-group workbench-group--${depth}`} data-workbench-group={piece.id}>
        <div className="workbench-group__heading">
          <button type="button" id={`workbench-piece-${piece.id}`} data-workbench-piece={piece.id}
            aria-label={`Inspect ${piece.label}`} aria-pressed={selected.id === piece.id && !selectedMaterial} onClick={() => inspect(piece)}>
            <WorkbenchGlyph motif={piece.motif} />
            <span className="workbench-group__index" aria-hidden="true">{String(model.pieces.indexOf(piece) + 1).padStart(2, "0")}</span>
            <strong>{piece.label}</strong>
          </button>
          <button type="button" className="workbench-group__expand" aria-label={`${expanded.has(piece.id) ? "Collapse" : "Expand"} ${piece.label}`}
            aria-expanded={expanded.has(piece.id)} aria-controls={`workbench-children-${piece.id}`} onClick={() => toggle(piece)}>
            {expanded.has(piece.id) ? "−" : "+"}
          </button>
        </div>
        <ul id={`workbench-children-${piece.id}`} hidden={!expanded.has(piece.id)}>
          {children.map(child => nestedPieces(child, depth + 1))}
        </ul>
        {!expanded.has(piece.id) ? <p className="workbench-group__folded">{children.length} pieces · expand to take apart</p> : null}
      </li>
    );
  }

  const currentLevel = model.pieces.find(piece => piece.id === drillId);
  const materialExamples = selectedMaterial ? exampleModels.filter(example =>
    deriveWorkbenchMaterialUsage(example.model).some(material => material.id === selectedMaterial.id && material.pieceIds.length > 0)
  ) : [];

  return (
    <div className="visual-workbench" data-visual-workbench data-workbench-template={model.templateId} data-workbench-ready={ready}
      data-narrow-mode={narrowInspection ? "inspect" : "browse"}>
      <div className="workbench-content" data-intentional-scroll-region="workbench" tabIndex={0} aria-label="Visual systems workbench content">
        <nav className="workbench-entry" aria-label="Ways to explore systems">
          {([
            ["examples", "Take apart a system", "01"], ["materials", "Browse building blocks", "02"], ["questions", "Start from a question", "03"]
          ] as const).map(([id, label, number]) => <button key={id} type="button" aria-pressed={discovery === id}
            onClick={() => { setDiscovery(id); setMaterialId(null); }}><small>{number}</small>{label}<span aria-hidden="true">↗</span></button>)}
        </nav>

        {discovery === "examples" ? <details className="workbench-example-picker" open={!compactExamples}>
          <summary>Choose a worked system</summary>
          <nav className="workbench-examples" aria-label="Worked systems">
          {examples.map(example => <Link key={example.id} href={starterRemixWorkshopHref(example.id)}
            className={world.id === example.id ? "is-current" : ""} aria-current={world.id === example.id ? "true" : undefined}
            aria-label={`Open ${example.title} on Workbench`}>
            <WorkbenchGlyph motif={example.visualKind} /><span>{example.title}</span><small>{example.systemForms.join(" · ").replaceAll("-", " ")}</small>
          </Link>)}
        </nav></details> : null}

        {discovery === "materials" ? <section className="workbench-materials" aria-label="Systems materials shelf">
          <div className="workbench-discovery-intro"><h2>Different systems. Related ingredients.</h2><p>Select a material to see where it is used and what ORTUS can represent.</p></div>
          <ul>{usage.map(material => <li key={material.id}><button type="button" aria-pressed={materialId === material.id}
            onClick={() => { setMaterialId(material.id); setNarrowInspection(true); window.requestAnimationFrame(() => inspectorRef.current?.focus()); }}>
            <WorkbenchGlyph motif={material.motif} /><span><strong>{material.label}</strong><small>{shelfCapabilityLabels[material.capability]}</small></span>
          </button></li>)}</ul>
        </section> : null}

        {discovery === "questions" ? <section className="workbench-questions" aria-label="Curated systems questions">
          <div className="workbench-discovery-intro"><h2>Begin with something you wonder about.</h2><p>Choose a question, then choose a worked model. These are curated starting points.</p></div>
          <div className="workbench-question-options">{questions.map((question, index) => <button key={question.label} type="button" aria-pressed={questionIndex === index} onClick={() => setQuestionIndex(index)}>{question.label}</button>)}</div>
          <p>{questions[questionIndex]!.hint}</p>
          <nav aria-label="Examples for this question">{questions[questionIndex]!.ids.map(id => { const example = requireStarterWorldById(id); return <Link key={id} href={starterRemixWorkshopHref(id)}>Open {example.title} <span aria-hidden="true">↗</span></Link>; })}</nav>
        </section> : null}

        <header className="workbench-system-heading">
          <div><p>{renderControls ? "Your derivative · assembled system" : "A worked system · open it, piece by piece"}</p><h2>{world.title}</h2><span>{world.hookQuestion}</span></div>
          {sourceContext ?? <div className="workbench-source"><strong>Immutable Starter</strong><span>{model.templateName}</span><Link href={starterRemixWorkshopHref(world.id)}>Make a remix <span aria-hidden="true">↗</span></Link></div>}
        </header>

        <div className="workbench-path" aria-label="System decomposition path">
          <button type="button" onClick={() => { setDrillId(null); setNarrowInspection(false); setMaterialId(null); focusPiece(model.rootIds[0]!); }}>Whole system</button>
          {ancestors.map(piece => <span key={piece.id}><i aria-hidden="true">/</i><button type="button" onClick={() => inspect(piece)}>{piece.label}</button></span>)}
          <span><i aria-hidden="true">/</i>{selectedMaterial?.label ?? selected.label}</span>
          <small>Explanatory structure · no live simulation</small>
        </div>

        <div className="workbench-layout">
          <CornerFramePanel title="System on the bench" eyebrow="SELECT A PIECE TO LOOK INSIDE" className="workbench-bench">
            {!narrowLayout ? <nav className="workbench-relationship-trace" aria-label="A path through this model">
              <span>Follow a relationship</span>
              {model.relationships.slice(0, 3).map(relation => {
                const from = model.pieces.find(piece => piece.id === relation.from)!;
                const to = model.pieces.find(piece => piece.id === relation.to)!;
                return <button type="button" key={relation.id} onClick={() => inspect(from, true)}>
                  {from.label}<i aria-hidden="true">→</i>{to.label}
                </button>;
              })}
            </nav> : null}
            {!narrowLayout ? <div className="workbench-desktop-assembly">
              <ul className="workbench-assembly" aria-label={`${world.title} system pieces`}>
                {model.rootIds.map(id => model.pieces.find(piece => piece.id === id)!).map(piece => nestedPieces(piece))}
              </ul>
            </div> : <div className="workbench-narrow-assembly" data-system-overview={!drillId}>
              {drillId ? <button className="workbench-back" type="button" onClick={returnToSystem}>← Back to {currentLevel?.parentId ? model.pieces.find(piece => piece.id === currentLevel.parentId)?.label : "system"}</button> : null}
              <h3 id="workbench-level-title" tabIndex={-1}>{currentLevel?.label ?? "Choose a system assembly"}</h3>
              {currentLevel ? <button type="button" onClick={() => { setSelectedId(currentLevel.id); setNarrowInspection(true); window.requestAnimationFrame(() => inspectorRef.current?.focus()); }}>Inspect {currentLevel.label} properties</button> : null}
              <ul>{(drillId ? childrenOf(drillId) : model.rootIds.map(id => model.pieces.find(piece => piece.id === id)!)).map(piece => <li key={piece.id}>{pieceButton(piece, true)}</li>)}</ul>
            </div>}
            <p className="workbench-assembly-note">Take apart the explanation; the template keeps its rules. Shapes illustrate model ingredients, not a running world.</p>
          </CornerFramePanel>

          <CornerFramePanel title={selectedMaterial ? "Material connections" : "Inside the selected piece"} eyebrow={selectedMaterial ? "MATERIALS SHELF" : "INSPECT & REMIX"} className="workbench-inspector">
            <div ref={inspectorRef} tabIndex={-1} data-workbench-inspector>
              <button className="workbench-back workbench-back--narrow" type="button" onClick={returnToSystem}>← Back to {selected.parentId ? model.pieces.find(piece => piece.id === selected.parentId)?.label : "system"}</button>
              {selectedMaterial ? <>
                <WorkbenchGlyph motif={selectedMaterial.motif} /><h3>{selectedMaterial.label}</h3><p>{selectedMaterial.description}</p>
                <CapabilityMark capability={currentUsage?.capability ?? "reference"} />
                <p>{currentUsage?.capabilityReason ?? "Explanatory vocabulary; no executable assembly is created here."}</p>
                <h4>Find it in a working system</h4>
                {materialExamples.length ? <ul className="workbench-related">{materialExamples.map(example => <li key={example.world.id}><Link href={starterRemixWorkshopHref(example.world.id)}>{example.world.title} ↗</Link></li>)}</ul> : <p>No current worked example executes this material.</p>}
                <p className="workbench-fixed">Materials are connections to explore. They cannot be dragged into a runnable custom model.</p>
                <button type="button" onClick={() => { setMaterialId(null); setNarrowInspection(false); }}>Back to selected piece</button>
              </> : <>
                <div className="workbench-inspector__identity"><WorkbenchGlyph motif={selected.motif} /><div><small>{selected.kind}</small><h3>{selected.label}</h3></div></div>
                <CapabilityMark capability={selected.capability} />
                <p>{selected.description}</p>
                {selected.reads.length || selected.affects.length ? <dl className="workbench-read-write">
                  {selected.reads.length ? <div><dt>Reads</dt><dd>{selected.reads.join(" · ")}</dd></div> : null}
                  {selected.affects.length ? <div><dt>Affects</dt><dd>{selected.affects.join(" · ")}</dd></div> : null}
                </dl> : null}
                {relationships.length ? <section className="workbench-relationships" aria-label={`Relationships for ${selected.label}`}><h4>Connected in this model</h4><ul>{relationships.map(relation => {
                  const otherId = relation.from === selected.id ? relation.to : relation.from;
                  const other = model.pieces.find(piece => piece.id === otherId)!;
                  return <li key={relation.id}><span>{relation.label}</span><button type="button" onClick={() => inspect(other, true)}>{other.label} <span aria-hidden="true">↗</span></button><small>{relation.description}</small></li>;
                })}</ul></section> : null}
                <div className="workbench-contextual-controls">
                  {renderControls && selected.capability === "executable" ? renderControls(selected) : <>
                    {selected.controls.length ? <><h4>Source properties</h4><dl>{selected.controls.map(control => {
                      if (control.group === "run") return <div key={control.key}><dt>{control.key === "seed" ? "Seed" : control.key === "behaviorMode" ? "Behavior mode" : "Initialization preset"}</dt><dd>{String(scenario[control.key as "seed" | "behaviorMode" | "initializationPreset"])}</dd></div>;
                      const definition = resolveWorkbenchControlDefinition(control, template, scenario);
                      return definition ? <div key={`${control.group}.${control.key}`}><dt>{definition.label}</dt><dd>{String(scenario[control.group][control.key] ?? definition.defaultValue)}</dd></div> : null;
                    })}</dl></> : null}
                    {selected.capability === "executable" ? <Link className="workbench-remix-link" href={starterRemixWorkshopHref(world.id, {
                      ...(selected.controls.find(control => control.group === "parameters") ? { focusParameterId: selected.controls.find(control => control.group === "parameters")!.key } : {})
                    })}>Remix this system to change it ↗</Link> : null}
                  </>}
                </div>
                <p className="workbench-fixed"><strong>Fixed in this remix</strong>{selected.fixed}</p>
                <p className="workbench-capability-reason">{selected.capabilityReason}</p>
                {selected.materialIds.length ? <div className="workbench-piece-materials"><h4>Related building blocks</h4>{selected.materialIds.map(id => {
                  const material = workbenchMaterials.find(candidate => candidate.id === id);
                  return material ? <button key={id} type="button" onClick={() => { setDiscovery("materials"); setMaterialId(id); }}>{material.label} ↗</button> : null;
                })}</div> : null}
              </>}
            </div>
          </CornerFramePanel>
        </div>
      </div>
      <footer className="workbench-footer">{footer ?? <><p><strong>See a system. Take it apart. Make it your own.</strong><span>Remix supported properties. General executable composition is not implemented.</span></p><Link className="workbench-primary-action" href={starterRemixWorkshopHref(world.id)}>Remix this system ↗</Link></>}</footer>
    </div>
  );
}

function CapabilityMark({ capability }: { capability: WorkbenchCapability }) {
  return <span className={`workbench-capability workbench-capability--${capability}`}><i aria-hidden="true">{capability === "executable" ? "●" : capability === "structural" ? "◇" : "○"}</i>{capabilityLabels[capability]}</span>;
}
