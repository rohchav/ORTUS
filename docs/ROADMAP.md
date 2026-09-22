# ORTUS Canonical Roadmap

Status: CURRENT future-sequencing source of truth after S2

This roadmap controls milestone status and dependency order. It is not a capability claim. `CAPABILITIES.md` determines what exists now, and every implementation milestone requires its dedicated scope and audit.

## Current Handoff

| Milestone | Status | Meaning |
| --- | --- | --- |
| PERF1B - Runtime Performance Architecture Audit + Hardening | COMPLETE | Audited Flocking-only Local/Worker runtime and projection boundary later consumed by I1 |
| A0 - Canonical Architecture + Source-of-Truth Consolidation | COMPLETE | Four canonical documents and scoped static/source-of-truth gates established |
| A0B - Canonical Architecture + Source-of-Truth Audit | COMPLETE | Adversarial audit fixed authority, snapshot, source-hierarchy, lifecycle, scientific-language, and static-gate defects; see `CANONICAL_ARCHITECTURE_AUDIT.md` |
| I1 - Production Runtime Migration + Immersive Shell Foundation | COMPLETE | Production Flocking now uses Worker-owned execution, bounded frame/UI projections, and the minimum immersive shell; legacy templates remain explicit |
| I1B - Production Runtime Migration Audit | COMPLETE | Adversarial audit fixed authority, replacement, rejection, reset, provenance, and ordering defects; see `performance/PRODUCTION_RUNTIME_ADOPTION_AUDIT.md` |
| UR0 - Product Leverage + Comprehension Gate | TECHNICAL/EXPERT COMPLETE; HUMAN PENDING | Expert/source/rendered audit plus one highly informed formative pilot exist; the pilot supports defect discovery but not unbiased comprehension validation; see `product/PRODUCT_LEVERAGE_COMPREHENSION_GATE.md` |
| UR0R - Product Comprehension + Exploration Repair | COMPLETE | Repaired supported Flocking exploration, domain framing, observation context, bounded keyboard inspection, and Workshop/Lab/Atlas identity without changing simulation semantics; see `product/PRODUCT_COMPREHENSION_EXPLORATION_REPAIR.md` |
| S1 - Starter -> Remix Bridge | COMPLETE | Existing Starter-backed scenarios can be forked into unsaved, configuration-only derivatives and launched through established runtime authority without generic model execution; see `product/STARTER_REMIX_BRIDGE.md` |
| S1B - Starter -> Remix Bridge Audit | COMPLETE | Hardened canonical lineage, accepted-run isolation, one-use active-World transfer, reset/rebuild semantics, runtime authority, query rejection, accessibility evidence, and capability truth; see `product/STARTER_REMIX_BRIDGE_AUDIT.md` |
| S2 - Visual Systems Workbench | COMPLETE | Primary assembled-system Workshop with accepted rendered product review, contextual S1 controls and explicit capability states; no generic executable composition; see `product/VISUAL_SYSTEMS_WORKBENCH.md` |
| S2B - Visual Systems Workbench Audit | NEXT / UNSTARTED | Independent audit is the next handoff; not begun |

Canonical immediate dependency:

```text
PERF1B COMPLETE
  -> A0 COMPLETE
  -> A0B COMPLETE
  -> I1 COMPLETE
  -> I1B COMPLETE
  -> UR0 TECHNICAL/EXPERT COMPLETE
  -> UR0 HUMAN COMPREHENSION PENDING
  -> UR0R PRODUCT REPAIR COMPLETE
  -> S1 COMPLETE
  -> S1B COMPLETE
  -> S2 COMPLETE
  -> S2B NEXT / UNSTARTED
```

I1 does not automatically trigger I2, I3, I4, or I5. The former unconditional immersive sequence is superseded. C4 is not deferred until I5B. The human gate remains pending. S1/S1B establish only the bounded audited Starter derivative bridge; they do not validate beginner comprehension, endorse the former form-first Workshop as the future product, or authorize generic executable authoring. S2 is complete and makes the Visual Systems Workbench primary; S2B is next and remains unstarted. S3 remains blocked on explicit executable-composition foundations.

## Status Vocabulary

- **COMPLETE**: implementation/audit is committed and required gates passed.
- **TECHNICAL/EXPERT COMPLETE; HUMAN PENDING**: source, rendered, and expert work is complete, but no claim of validated human comprehension is allowed until broader participant evidence exists.
- **NEXT / UNSTARTED**: authorized next planning handoff but no implementation exists.
- **PLANNED / UNSTARTED**: named direction requiring a dedicated prompt and prerequisites.
- **PROPOSED**: candidate direction not yet accepted into a dependency path.
- **PAUSED**: retained direction whose prerequisites or leverage gate are not met.
- **DEPRECATED/HISTORICAL**: preserved sequence or evidence that no longer governs future work.

## Near-Term Dependency Map

UR0R selects one bounded product branch while leaving the human gate open:

```text
A0/A0B
  -> I1/I1B
  -> UR0 technical/expert audit
  -> informed formative pilot + UR0R bounded repair
  -> S1/S1B audited Starter-to-Remix bridge
  -> S2/S2B Visual Systems Workbench through its dedicated scope

parallel evidence obligation:
  UR0 broader formative study -> human comprehension gate decision

retained high-priority infrastructure:
  O1/O1B -> E1/E1B when explicitly authorized
```

The informed pilot identified the example-to-decomposition-to-remix break; S1 repairs and S1B audits that bounded bridge for existing Starter-backed templates. This is not proof that human comprehension is validated. S1/S1B do not establish generic executable custom-model authoring or validate the form-first Workshop as the intended future experience. O1/E1 remain high-priority scientific infrastructure, I2 remains deferred, and every planning label still requires its dedicated prompt and audit.

| Pair | Planning purpose | Required gate |
| --- | --- | --- |
| S1/S1B | Audited bounded Starter remix bridge | Existing template-backed recipe remains authoritative; no generic execution claim |
| S2/S2B | Example-first Visual Systems Workbench | Explicit capability states, comprehension evidence, and preserved structural-versus-runtime boundary |
| SA0/SA0B | Scientific architecture contract pass for model/run/research artifacts | No implementation by taxonomy alone; align with canonical planes |
| S3/S3B | First bounded executable composition primitive | Explicit runtime vocabulary, capability checks, determinism, and no arbitrary code |
| C4/C4B | Next user-facing content/Starter World work | Reuse audited runtime capability; no I5B dependency |
| S4/S4B | First bounded SystemView/scale/lens/regime architecture slice | Must supersede hierarchy assumptions without calling camera zoom scientific scale |
| O1/O1B | Canonical observation foundation | Explicit sampling, loss, provenance, identity, and no presentation-channel reuse |
| E1/E1B | Lab Investigation/evidence foundation | Canonical observations and provenance-bearing workflow contracts |
| UQ1/UQ1B | Uncertainty/identifiability research foundation | Distinguish assumed ranges, model sensitivity, calibrated uncertainty, and non-identifiability |
| E2/E2B | Atlas question/representation foundation | Source-backed evidence and explicit unknown/unsampled state |
| E3/E3B | Narrow analytical lenses | Defined observation inputs, estimators, scale ranges, uncertainty, and independent audit |

## Development Sub-Maps

| Map | Purpose | Current boundary |
| --- | --- | --- |
| A - Architecture consolidation | Canonical vocabulary, authority, dependency, capability, and source hierarchy | A0 and A0B complete |
| B - Production runtime / World | Adopt audited runtime ports and immersive shell without changing model semantics | I1/I1B complete for production Flocking; other templates remain on the explicit legacy path |
| C - Executable visual modeling | Move from constrained authoring toward narrowly executable composition | S1 can launch configuration-only derivatives of existing Starter templates; no generic compiler, interpreter, composition system, or executable graph exists |
| D - SystemView / scale / lens / regime | Scientific representation graph and explicit mappings | Conceptual direction only; old multi-scale services remain structural |
| E - Canonical observation | Evidence-bearing samples separate from snapshots and visual projections | Not implemented |
| F - Lab / investigations / uncertainty | Reproducible investigations, evidence, uncertainty, and identifiability | Current Lab is non-persistent information architecture |
| G - Atlas + manual analytical representations | Question maps and human-authored representations grounded in evidence | Current Atlas has vocabulary and one bounded ephemeral Flocking preview only |
| H - Model-family expansion | Reusable computational families with explicit runtime contracts | Existing hand-built basis only |
| I - Hook/content packs | Compelling worlds and collections over supported model families | C1-C3B content exists; later packs depend on real capability |
| J - Gated immersive capabilities | Additional visual/interaction depth only when performance and comprehension support it | No unconditional I2-I5 sequence |
| K - System Discovery research | Candidate representations, independent assessment, mappings, and explorer | SD1-SD13 planned research only |
| L - Later scientific infrastructure | Validation, calibration, data assimilation, interop, scalable research storage/compute | Not implemented |

## S2 - Visual Systems Workbench

S2 is complete. The Workbench is the primary Workshop surface, with accepted rendered product review and verification recorded in `product/VISUAL_SYSTEMS_WORKBENCH.md`. Its example-first interaction architecture provides:

- taking working systems apart visually;
- explicit agents, cells, nodes, edges, fields, spaces, processes, and interactions;
- expand/collapse decomposition and relationship inspection;
- contextual parameter edits and bounded existing variant substitution; split, duplicate, substitute, and merge concepts remain limited by explicit contracts, with broader structural operations blocked;
- Starter Worlds as worked modeling examples;
- curiosity-driven Remix;
- existing S1 controls in the selected-piece inspector, with Guided/Advanced as secondary structural tooling.

Every represented object and available operation must state one of four capability levels in text, not color alone:

- `EXECUTABLE NOW`: an identified current template/runtime executes the behavior and tests cover it;
- `STRUCTURALLY REPRESENTABLE`: ORTUS can validate or display the structure but does not execute it;
- `REFERENCE`: contextual or explanatory material with no runtime effect;
- `FUTURE`: planned direction with no current implementation.

S2 preserves structural validity distinct from runtime support. Diagrams do not execute behavior, service availability does not grant template support, and neither Builder edges nor schemas are compiled or executed. General executable composition is not implemented. The blocked-operation record in `product/VISUAL_SYSTEMS_WORKBENCH.md` identifies missing reusable primitives, compatibility contracts, typed ports/interfaces, composition validation, runtime capability dispatch, and generic compilation. Recording these gaps does not start SA0 or S3. The earlier S1B milestone remains plumbing-only: S1B adds no S2 components, controls, runtime, persistence, or capability status.

## Model-Family Strategy

Current hand-built templates provide an approximate basis in:

- mobile local-interaction agents;
- grid/cellular systems;
- spatial interacting populations;
- static template-owned network dynamics.

Future MF-series work should provide a few reusable computational families rather than one bespoke engine per world:

- coupled oscillators;
- continuous fields and reaction-diffusion;
- agent-field coupling;
- adaptive or temporal networks;
- reaction networks;
- event-driven systems;
- hybrid and multi-timescale systems.

The intended product relation is:

```text
few reusable model families
  + many ModelDefinitions
  + many compelling Starter Worlds
```

`ModelDefinition` and those future families are not implemented by A0.

## Content And Hook Strategy

MF-series milestones create reusable computational/scientific execution families. C-series milestones create user-facing worlds and content that exercise already supported capability. A hook family is a product theme, not a runtime ontology.

Possible hook collections include `No One Is In Charge`, `Patterns From Nothing`, `Tipping Points`, `Cascades & Contagion`, `Collective Intelligence`, `Competition & Cooperation`, `Systems That Change Their Own Structure`, and `Traffic, Queues & Congestion`. These names do not authorize new templates, mechanics, claims, or worlds.

## Research Program Direction

Long-term dependency:

```text
CanonicalObservation + ResearchContext
  -> candidate SystemViews / derivations
  -> RepresentationArtifacts
  -> EvidenceReports
  -> CandidateAssessments
  -> alternatives / identifiability
  -> ViewMappings
  -> World / Lab / Atlas
```

The System Discovery research sequence remains approximately SD1 observation/export, SD2 trusted adapters, SD3 candidate/evidence model, SD4 synthetic benchmarks, SD5 scale inference, SD6 regime inference, SD7 lens inference, SD8 effective dynamics/memory, SD9 intervention/causal validation, SD10 learned scale, SD11 learned lens/relation, SD12 joint SystemView search, and SD13 explorer.

Candidate generation is not validation. A generator may propose; an independent evaluator assesses. No SD work is implemented or authorized by A0.

## Branch Gates

All future work must pass the relevant gates:

1. **Runtime gate**: capability is actually executed by an identified template/model family.
2. **Determinism gate**: seeds, ordering, mutation, scheduling, and replay remain explicit.
3. **Authority gate**: UI, renderer, adapters, and research code do not acquire engine authority.
4. **Evidence gate**: presentation/model outputs are not relabeled as empirical observation.
5. **Comprehension gate**: users can distinguish setup, run, observation, representation, evidence, and assessment.
6. **Performance gate**: evidence matches the supported scale and platform; degradation never changes model semantics silently.
7. **Safety gate**: no profiling, protected-class inference, persuasion/microtargeting, hidden objectives, arbitrary code, or LLM-agent creep.
8. **Audit gate**: each feature milestone is followed by an independent adversarial audit.

## Paused And Superseded Direction

- I2-I5B remain unstarted planning labels, not an automatic sequence after I1B.
- C4/C4B remain unstarted and may proceed when their actual dependencies pass; I5B is not a prerequisite.
- F1 and the old fractal branch remain paused under E3 analytical-lens prerequisites.
- The old hierarchy-first multi-scale roadmap is superseded for future representation architecture by the SystemView graph direction.
- Old prompt numbers 40-102 and earlier product mini-roadmaps are historical inventories, not the canonical execution order.

## Next Action

S2B — Visual Systems Workbench Audit is next and unstarted. Its dedicated prompt should independently review the completed S2 product and authority boundaries. Do not begin S2B, SA0, S3, O1/E1, or I2 automatically. S3 remains blocked; general executable composition remains unimplemented. Continue broader UR0 formative study separately because the human comprehension gate remains pending.
