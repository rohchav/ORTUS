# Starter World Portfolio

Date: 2026-07-27
Status: researched C1 planning artifact; no candidate below is a new runtime capability

## Portfolio Boundary

This portfolio prioritizes future Starter World content by demonstrated engine fit. It is not a template registry, launch catalog, implementation authorization, or promise. Only the seven definitions in `src/lib/starterWorlds/definitions.ts` are runnable Starter Worlds.

Research anchors connect candidates to related concepts. They do not validate, calibrate, or prescribe an ORTUS implementation. Any later implementation needs a dedicated prompt, exact runtime contract, focused tests, and its required audit.

## Readiness Summary

| Tier | Count | Meaning |
| --- | ---: | --- |
| A | 8 | Primarily content, presets, or bounded composition over mechanics that a current production template already executes. |
| B | 8 | Requires named bounded runtime primitives or template support that ORTUS does not currently execute. |
| C | 8 | Requires explicit scale levels, aggregation/disaggregation, and tested cross-scale coupling. |
| Total | 24 | Planned candidates only. |

Tier A is not shorthand for already implemented. It means repository evidence supports a narrow route to implementation without inventing a new general engine primitive. Tier B and C items must not appear in the runnable catalog until their gaps are implemented and audited.

## Tier A: Mainly Current Capabilities

### A1. Coordination Under Sensor Noise

- `workingTitle`: Coordination Under Sensor Noise
- `hookQuestion`: How much uncertain local sensing can a moving group tolerate before coordination fragments?
- `domain`: Collective behavior; engineering systems.
- `fictionalOrResearchContext`: Research-grounded stylized swarm.
- `entities`: Moving boids with local steering neighborhoods.
- `environment`: Existing bounded continuous Flocking space.
- `resources`: None represented.
- `networks`: Implicit proximity neighborhoods recalculated by the current template.
- `fields`: None represented.
- `scales`: Individual boid and aggregate flock metric only; not multiscale execution.
- `feedbacks`: Heading alignment changes neighborhoods, which then changes later alignment.
- `adaptation`: None; parameter change is not learning.
- `observableOutputs`: Alignment score, dispersion, and visible subgroup fragmentation.
- `researchAnchors`: Reynolds, [Flocks, Herds and Schools](https://doi.org/10.1145/37401.37406); Vicsek et al., [Novel Type of Phase Transition in a System of Self-Driven Particles](https://doi.org/10.1103/PhysRevLett.75.1226).
- `currentEngineFit`: High. Flocking already executes local alignment, cohesion, separation, noise, spatial movement, and required metrics.
- `capabilityGaps`: A dedicated named preset and content investigation; no new mechanic is justified.
- `estimatedImplementationTier`: A.
- `contentRisk`: Do not imply animal realism, autonomous-vehicle safety, or validated swarm control.
- `whyItIsCompelling`: One visible lever can move the system between coherent motion and fragmentation within seconds.

### A2. Clustered Outbreak Starts

- `workingTitle`: Clustered Outbreak Starts
- `hookQuestion`: When do several local outbreaks merge into one population-wide wave?
- `domain`: Epidemiology; spatial contagion.
- `fictionalOrResearchContext`: Research-grounded stylized contact process.
- `entities`: Existing susceptible, infected, and recovered model agents.
- `environment`: Existing bounded spatial contact world.
- `resources`: None represented.
- `networks`: Dynamic local contacts, not a persistent social network.
- `fields`: None represented.
- `scales`: Agent states and population counts only.
- `feedbacks`: More infected agents create more possible local transmissions while recovery removes infectious contacts.
- `adaptation`: None.
- `observableOutputs`: Infected count, recovered count, outbreak peak, and spatial coalescence.
- `researchAnchors`: Kermack and McKendrick, [A Contribution to the Mathematical Theory of Epidemics](https://doi.org/10.1098/rspa.1927.0118); Keeling, [The Effects of Local Spatial Structure on Epidemiological Invasions](https://doi.org/10.1098/rspb.1999.0716).
- `currentEngineFit`: High. The template already has random, single-cluster, and multiple-hotspot initialization plus stochastic transmission and recovery.
- `capabilityGaps`: Richer comparison copy and possibly a bounded scenario composition; no forecasting layer.
- `estimatedImplementationTier`: A.
- `contentRisk`: Not a public-health forecast, policy optimizer, or calibrated disease model.
- `whyItIsCompelling`: Users can see how initial spatial structure changes a familiar aggregate curve.

### A3. Bounded-Confidence Echoes

- `workingTitle`: Bounded-Confidence Echoes
- `hookQuestion`: When does limited willingness to interact preserve disagreement instead of creating consensus?
- `domain`: Information and society; collective behavior.
- `fictionalOrResearchContext`: Research-grounded stylized numeric-opinion system.
- `entities`: Existing agents with bounded numeric opinion state.
- `environment`: Existing Opinion Dynamics world.
- `resources`: None represented.
- `networks`: Current template interaction topology only.
- `fields`: None represented.
- `scales`: Agent opinion and aggregate polarization metric.
- `feedbacks`: Similarity affects influence, and influence changes later similarity.
- `adaptation`: Bounded template-owned opinion updating; not human learning.
- `observableOutputs`: Polarization score, opinion distribution, convergence, and persistent clusters.
- `researchAnchors`: Deffuant et al., [Mixing Beliefs Among Interacting Agents](https://doi.org/10.1142/S0219525900000078); Castellano et al., [Statistical Physics of Social Dynamics](https://doi.org/10.1103/RevModPhys.81.591).
- `currentEngineFit`: High. Existing bounded opinion, influence, confidence, and initialization modes support the investigation.
- `capabilityGaps`: A focused content preset may be useful; no real identity or free-text belief state.
- `estimatedImplementationTier`: A.
- `contentRisk`: No real-belief prediction, protected-class inference, psychological profiling, persuasion, or population claim.
- `whyItIsCompelling`: A simple interaction boundary produces visibly different consensus and fragmentation regimes.

### A4. Competing Information Sources

- `workingTitle`: Competing Information Sources
- `hookQuestion`: How do bounded source signals and peer influence interact when they point in different directions?
- `domain`: Information systems; social media as a synthetic context.
- `fictionalOrResearchContext`: Research-connected fictional information environment using synthetic labels only.
- `entities`: Existing Opinion Dynamics model agents and bounded template-defined information sources.
- `environment`: Existing Opinion Dynamics `socialLearning` mode.
- `resources`: None represented.
- `networks`: Existing peer topology plus aggregate source exposure represented by the template.
- `fields`: No SpatialFieldModel support is claimed.
- `scales`: Agent numeric state and aggregate opinion metrics.
- `feedbacks`: Peer and source influence alter later exposure responses.
- `adaptation`: Existing bounded stylized social-learning mode, not human cognition.
- `observableOutputs`: Polarization score, distribution shifts, source-attributed model effects where already exposed.
- `researchAnchors`: Deffuant et al., [Mixing Beliefs Among Interacting Agents](https://doi.org/10.1142/S0219525900000078); Castellano et al., [Statistical Physics of Social Dynamics](https://doi.org/10.1103/RevModPhys.81.591).
- `currentEngineFit`: Moderate to high. A narrow template-owned runtime mode exists; semantic artifacts are not executed.
- `capabilityGaps`: Dedicated safe content configuration and adversarial audit of labels and claims.
- `estimatedImplementationTier`: A.
- `contentRisk`: Highest Tier A risk. No truth scoring, misinformation detection, targeting, recommendation, persuasion optimization, identity labels, or claims about real people.
- `whyItIsCompelling`: It exposes the tension between peer interaction and exogenous signals without requiring an unbounded cognitive agent.

### A5. Vacancy and Neighborhood Sorting

- `workingTitle`: Vacancy and Neighborhood Sorting
- `hookQuestion`: How do local thresholds and empty locations reshape a neighborhood pattern?
- `domain`: Information and society; spatial collective behavior.
- `fictionalOrResearchContext`: Research-grounded abstract occupancy model.
- `entities`: Existing two model-agent categories and vacant cells.
- `environment`: Existing bounded neighborhood grid.
- `resources`: Vacancy is location availability, not a resource primitive.
- `networks`: Local grid neighborhoods.
- `fields`: None represented.
- `scales`: Agent satisfaction and aggregate spatial pattern only.
- `feedbacks`: Moves change local composition, which changes later satisfaction and movement.
- `adaptation`: None; relocation follows template rules.
- `observableOutputs`: Satisfaction rate, visible clustering, movement rate where currently exposed.
- `researchAnchors`: Schelling, [Dynamic Models of Segregation](https://doi.org/10.1080/0022250X.1971.9989794).
- `currentEngineFit`: High. The existing template executes neighborhood thresholds, vacancies, relocation, and satisfaction output.
- `capabilityGaps`: A content-specific initialization recipe if repository review supports one.
- `estimatedImplementationTier`: A.
- `contentRisk`: The simplified categories must not stand in for protected classes or claim to explain real segregation completely.
- `whyItIsCompelling`: Local satisfaction rules produce a large visible spatial pattern that invites repeated comparison.

### A6. Predator Pressure and Recovery

- `workingTitle`: Predator Pressure and Recovery
- `hookQuestion`: Which starting conditions let prey recover, sustain cycles, or collapse?
- `domain`: Ecology; population dynamics.
- `fictionalOrResearchContext`: Research-connected stylized ecology.
- `entities`: Existing predators and prey.
- `environment`: Existing bounded movement space.
- `resources`: Energy is template-owned predator state, not generic resource support.
- `networks`: Encounter relationships are transient spatial events.
- `fields`: None represented.
- `scales`: Individual encounters and population counts.
- `feedbacks`: Prey abundance affects predator encounters; predator abundance affects prey mortality; energy affects predator survival.
- `adaptation`: None.
- `observableOutputs`: Prey count, predator count, energy distribution where visible, cycle timing, and extinction.
- `researchAnchors`: Volterra, [Fluctuations in the Abundance of a Species Considered Mathematically](https://doi.org/10.1038/118558a0).
- `currentEngineFit`: High. Existing initialization presets, movement, encounters, reproduction, mortality, and counts support the question.
- `capabilityGaps`: Content-only comparison framing; no food-web generalization.
- `estimatedImplementationTier`: A.
- `contentRisk`: No claim that the template reproduces a particular ecosystem or estimates real conservation outcomes.
- `whyItIsCompelling`: Coupled populations make feedback and delayed consequences immediately legible.

### A7. Patch Density and Firebreaks

- `workingTitle`: Patch Density and Firebreaks
- `hookQuestion`: How does the arrangement of burnable cells decide whether spread crosses the landscape?
- `domain`: Environmental systems; propagation.
- `fictionalOrResearchContext`: Research-connected cellular spread model.
- `entities`: Existing grid cells in template-defined states.
- `environment`: Existing bounded rectangular grid.
- `resources`: Burnable cell state only; no generic fuel or weather field.
- `networks`: Orthogonal or template-defined local adjacency.
- `fields`: No executed spatial field.
- `scales`: Cell state and aggregate active-fire count.
- `feedbacks`: Burning converts available neighbors and removes future burnable pathways.
- `adaptation`: None.
- `observableOutputs`: Active fire count, burned extent, extinction, and visible crossing.
- `researchAnchors`: Drossel and Schwabl, [Self-Organized Critical Forest-Fire Model](https://doi.org/10.1103/PhysRevLett.69.1629).
- `currentEngineFit`: High. Existing dense, sparse, regrowing, and central-ignition presets plus spread probability support bounded investigations.
- `capabilityGaps`: A named firebreak-like arrangement must be an audited scenario, not a new environmental mechanic disguised as content.
- `estimatedImplementationTier`: A.
- `contentRisk`: Not a calibrated wildfire, weather, terrain, evacuation, or risk-assessment model.
- `whyItIsCompelling`: Geometry visibly changes whether local propagation remains contained or spans the grid.

### A8. Bounded Readout Adaptation Arena

- `workingTitle`: Bounded Readout Adaptation Arena
- `hookQuestion`: How can a fixed signal network map activity into categorical choices while a local strategy state adapts?
- `domain`: Adaptive networks; game-like engineering system.
- `fictionalOrResearchContext`: Original bounded arena over the existing Neural Runtime Lab readout mode.
- `entities`: Existing neural nodes, weighted directed connections, output assemblies, and local RPS strategy state.
- `environment`: Existing Neural Runtime Lab.
- `resources`: No generic resources.
- `networks`: Template-owned neural runtime graph only.
- `fields`: None represented.
- `scales`: Node activation, output assembly readout, and bounded round summary; not multiscale.
- `feedbacks`: Network propagation produces a readout; observational payoff updates only bounded local strategy state.
- `adaptation`: Existing resettable local readout strategy adaptation; no synapse learning.
- `observableOutputs`: Cascade size, labeled categorical readout, payoff history, and bounded strategy distribution.
- `researchAnchors`: Gerstner et al., [Neuronal Dynamics](https://neuronaldynamics.epfl.ch/online/index.html); Brunel, [Dynamics of Sparsely Connected Networks of Excitatory and Inhibitory Spiking Neurons](https://doi.org/10.1023/A:1008925309027).
- `currentEngineFit`: High but narrow. The implementation already supports the exact RPS/readout lab mode and bounded resettable adaptation.
- `capabilityGaps`: A content wrapper and audit; no generic adaptive-controller authoring.
- `estimatedImplementationTier`: A.
- `contentRisk`: Do not call the network cognitive, reasoning, biological, intelligent, or able to beat truly random optimal play.
- `whyItIsCompelling`: It demonstrates how reusable signal and readout primitives can create an interactive system without making RPS the identity of ORTUS.

## Tier B: Bounded New Runtime Support

### B1. Supply-Chain Bullwhip

- `workingTitle`: Supply-Chain Bullwhip
- `hookQuestion`: Why can small demand changes become large order swings farther up a supply chain?
- `domain`: Economics; organizational and engineering systems.
- `fictionalOrResearchContext`: Research-grounded stylized supply chain.
- `entities`: Retailers, distributors, factories, and shipments.
- `environment`: Ordered supply stages with transport lead times.
- `resources`: Inventory, backlog, orders, and goods in transit.
- `networks`: Directed supplier-customer links.
- `fields`: None required initially.
- `scales`: Firm, stage, and chain aggregate.
- `feedbacks`: Forecasting, ordering, inventory correction, backlog, and delayed delivery.
- `adaptation`: Bounded ordering policy, not optimizer-generated policy.
- `observableOutputs`: Demand/order variance by stage, stockouts, backlog, inventory, and delay.
- `researchAnchors`: Lee, Padmanabhan, and Whang, [Information Distortion in a Supply Chain: The Bullwhip Effect](https://doi.org/10.1287/mnsc.43.4.546).
- `currentEngineFit`: Low. Existing timing and quantity services are not template runtime support.
- `capabilityGaps`: Executed stocks/flows, conserved inventory, order queues, transport delays, staged network flow, and template-defined policies.
- `estimatedImplementationTier`: B.
- `contentRisk`: No business forecast, procurement advice, or claim of organizational realism without calibration.
- `whyItIsCompelling`: Delay and feedback create counterintuitive amplification in a system users recognize.

### B2. Infrastructure Overload Cascade

- `workingTitle`: Infrastructure Overload Cascade
- `hookQuestion`: When can one failed component redistribute enough load to trigger a wider collapse?
- `domain`: Infrastructure; network engineering.
- `fictionalOrResearchContext`: Research-grounded abstract load-capacity network.
- `entities`: Infrastructure nodes and links.
- `environment`: A bounded network topology.
- `resources`: Flow or load and finite node capacity.
- `networks`: Weighted routing graph.
- `fields`: None required.
- `scales`: Component and whole-network service level.
- `feedbacks`: Failure reroutes load, rerouted load causes overload, and overload causes more failure.
- `adaptation`: Optional bounded rerouting rule.
- `observableOutputs`: Surviving service fraction, cascade size, overload count, and disconnected demand.
- `researchAnchors`: Motter and Lai, [Cascade-Based Attacks on Complex Networks](https://doi.org/10.1103/PhysRevE.66.065102).
- `currentEngineFit`: Low. Network artifacts exist, but no production template executes load, routing, capacity, or cascading failure.
- `capabilityGaps`: Flow routing, capacity constraints, failure state, deterministic load redistribution, and service metrics.
- `estimatedImplementationTier`: B.
- `contentRisk`: No claim of operational infrastructure safety, threat assessment, or real-grid vulnerability.
- `whyItIsCompelling`: A small perturbation can create a visible, explainable cascade through a graph.

### B3. Congested Route Choice

- `workingTitle`: Congested Route Choice
- `hookQuestion`: How do individual route choices reshape congestion for everyone else?
- `domain`: Urban systems; transportation engineering.
- `fictionalOrResearchContext`: Research-grounded stylized road network.
- `entities`: Travelers or bounded vehicle aggregates.
- `environment`: Directed road graph with origins and destinations.
- `resources`: Road capacity and traveler time.
- `networks`: Route network with congestion-dependent edge cost.
- `fields`: Optional density field is future-only.
- `scales`: Traveler, road segment, route, and network summary.
- `feedbacks`: Route choice raises congestion, congestion changes route cost, and changed cost alters later choices.
- `adaptation`: Bounded route-choice update.
- `observableOutputs`: Travel time, segment flow, queue length, route share, and throughput.
- `researchAnchors`: Wardrop, [Some Theoretical Aspects of Road Traffic Research](https://doi.org/10.1680/ipeds.1952.11259).
- `currentEngineFit`: Low. Spatial movement exists, but graph routing and congestion costs do not.
- `capabilityGaps`: Pathfinding, edge capacity, queues, dynamic cost, origin-destination demand, and route-choice rules.
- `estimatedImplementationTier`: B.
- `contentRisk`: No traffic forecast, routing recommendation, or city-specific policy conclusion.
- `whyItIsCompelling`: It turns a familiar individual choice into a visible collective feedback problem.

### B4. Organizational Bottleneck Queue

- `workingTitle`: Organizational Bottleneck Queue
- `hookQuestion`: When does one constrained service stage create delay across an entire workflow?
- `domain`: Institutions; organizational engineering.
- `fictionalOrResearchContext`: Research-grounded generic service organization.
- `entities`: Tasks, service stations, and workers or service capacity.
- `environment`: Ordered or branching workflow.
- `resources`: Work-in-progress capacity and service time.
- `networks`: Directed dependency graph between stages.
- `fields`: None.
- `scales`: Task, station, and organization throughput.
- `feedbacks`: Queue length affects waiting time and prioritization; downstream blockage can reduce upstream release.
- `adaptation`: Optional bounded staffing or routing policy.
- `observableOutputs`: Work-in-progress, waiting time, throughput, utilization, and abandonment.
- `researchAnchors`: Little, [A Proof for the Queuing Formula: L = lambda W](https://doi.org/10.1287/opre.9.3.383).
- `currentEngineFit`: Low. Scheduling exists internally, but no queue/service runtime contract is exposed to templates.
- `capabilityGaps`: Explicit arrival process, queue discipline, finite service capacity, routing, and queue metrics.
- `estimatedImplementationTier`: B.
- `contentRisk`: No employee evaluation, labor optimization, or real workplace surveillance.
- `whyItIsCompelling`: Users can see why local utilization targets can worsen system-wide delay.

### B5. Commons Institutions and Renewal

- `workingTitle`: Commons Institutions and Renewal
- `hookQuestion`: Which simple institutions can keep a shared renewable resource from collapsing?
- `domain`: Institutions; economics; ecology.
- `fictionalOrResearchContext`: Research-grounded synthetic commons.
- `entities`: Resource users and optional monitors.
- `environment`: Bounded shared harvesting area.
- `resources`: Explicit renewable stock.
- `networks`: Communication or observation links among users.
- `fields`: Optional spatial resource density.
- `scales`: User, local stock, and commons aggregate.
- `feedbacks`: Harvest reduces stock, stock affects yield, and observed outcomes affect rule compliance.
- `adaptation`: Bounded strategy or institution switching, never persuasion optimization.
- `observableOutputs`: Stock level, extraction, inequality, violations, replenishment, and collapse/recovery.
- `researchAnchors`: Ostrom, [Governing the Commons](https://doi.org/10.1017/CBO9781316423936); Gordon, [The Economic Theory of a Common-Property Resource](https://doi.org/10.1086/257497).
- `currentEngineFit`: Low. Resource and strategy semantics are service-level or template-local, not a reusable executed commons runtime.
- `capabilityGaps`: Conserved renewable stocks, harvest transactions, institution rules, sanctions, payoff accounting, and bounded strategy updates.
- `estimatedImplementationTier`: B.
- `contentRisk`: No universal governance prescription, cultural stereotyping, or policy recommendation.
- `whyItIsCompelling`: It joins ecology, incentives, and institutions in one legible feedback system.

### B6. Cross-Platform Information Spread

- `workingTitle`: Cross-Platform Information Spread
- `hookQuestion`: How can a signal persist when several network layers carry it differently?
- `domain`: Information systems; social media.
- `fictionalOrResearchContext`: Research-grounded synthetic multilayer network.
- `entities`: Synthetic accounts or aggregate communities and bounded signal states.
- `environment`: Several named communication layers.
- `resources`: Attention as a bounded model variable only if explicitly implemented.
- `networks`: Intra-layer and inter-layer connections.
- `fields`: None required.
- `scales`: Node, layer, and multilayer aggregate.
- `feedbacks`: Layer-specific spread changes cross-layer exposure and later layer activity.
- `adaptation`: Optional bounded platform-switching rule.
- `observableOutputs`: Reach by layer, cross-layer transitions, persistence, and disagreement.
- `researchAnchors`: Kivela et al., [Multilayer Networks](https://doi.org/10.1093/comnet/cnu016).
- `currentEngineFit`: Low. ORTUS has no executed multilayer-network topology or cross-layer coupling.
- `capabilityGaps`: Explicit layer identity, inter-layer edges, layer-specific rules, coupling, and multilayer metrics.
- `estimatedImplementationTier`: B.
- `contentRisk`: No real-person data, identity inference, protected attributes, misinformation truth scores, recommendation, targeting, or persuasion optimization.
- `whyItIsCompelling`: The same signal can fade in one layer and revive through another, revealing why topology matters.

### B7. Immune Response Coordination

- `workingTitle`: Immune Response Coordination
- `hookQuestion`: How can local pathogen growth and several response pathways produce clearance, persistence, or overshoot?
- `domain`: Cellular and biological systems.
- `fictionalOrResearchContext`: Research-grounded but deliberately stylized immune dynamics.
- `entities`: Pathogens, target cells, and bounded response-cell types.
- `environment`: Well-mixed or simple spatial tissue compartment.
- `resources`: Target-cell availability and bounded signaling quantities.
- `networks`: Typed interaction network.
- `fields`: Optional cytokine-like signal field only after a real field runtime exists.
- `scales`: Cell and compartment aggregate, without organism-level claim.
- `feedbacks`: Pathogen growth activates response; response reduces pathogen; resource depletion changes growth.
- `adaptation`: No immune memory in the first bounded slice unless separately implemented.
- `observableOutputs`: Pathogen load, cell counts, response magnitude, clearance time, and damage proxy.
- `researchAnchors`: Perelson, [Modelling Viral and Immune System Dynamics](https://doi.org/10.1038/nri700).
- `currentEngineFit`: Low. Epidemic and neural templates do not compose into immune runtime support.
- `capabilityGaps`: Typed cell interactions, conserved populations, explicit signals, compartment rules, and model-specific kinetics.
- `estimatedImplementationTier`: B.
- `contentRisk`: Not a clinical model, diagnosis, treatment simulator, patient forecast, or medical advice.
- `whyItIsCompelling`: Competing positive and negative feedback can produce several qualitatively distinct trajectories.

### B8. Eco-Evolutionary Invasion

- `workingTitle`: Eco-Evolutionary Invasion
- `hookQuestion`: When can evolving defense and competitive ability change whether an invader establishes?
- `domain`: Ecology; evolution.
- `fictionalOrResearchContext`: Research-grounded synthetic species interaction.
- `entities`: Resident and invading organisms with bounded heritable traits.
- `environment`: Bounded patches or continuous space.
- `resources`: Renewable limiting resource.
- `networks`: Local interaction or dispersal links.
- `fields`: Optional resource field.
- `scales`: Individual trait, population, and community.
- `feedbacks`: Density changes selection pressure; trait frequencies change ecological interaction; ecology changes later selection.
- `adaptation`: Explicit bounded inheritance, mutation, and selection.
- `observableOutputs`: Population abundance, establishment probability as simulation frequency, trait distribution, and resource level.
- `researchAnchors`: Yoshida et al., [Rapid Evolution Drives Ecological Dynamics in a Predator-Prey System](https://doi.org/10.1038/nature01767).
- `currentEngineFit`: Low. Current Predator-Prey has no heritable trait, mutation, selection, or renewable-resource contract.
- `capabilityGaps`: Bounded genomes/traits, reproduction inheritance, mutation RNG stream, selection accounting, and resource runtime.
- `estimatedImplementationTier`: B.
- `contentRisk`: Simulation frequencies are not calibrated ecological probabilities or conservation forecasts.
- `whyItIsCompelling`: It makes eco-evolutionary feedback visible rather than treating evolution as a slow background process.

## Tier C: Explicit Multiscale Architecture

### C1. Wound Repair Across Scales

- `workingTitle`: Wound Repair Across Scales
- `hookQuestion`: How do local cell actions become tissue closure and whole-organism recovery constraints?
- `domain`: Cellular and biological systems.
- `fictionalOrResearchContext`: Research-grounded conceptual target.
- `entities`: Epithelial cells, immune cells, matrix elements, and vessels.
- `environment`: Tissue geometry nested within an organism context.
- `resources`: Oxygen, nutrients, matrix material, and signaling molecules.
- `networks`: Cell-cell signaling and vascular supply.
- `fields`: Chemical, oxygen, and mechanical fields.
- `scales`: Intracellular state, cell, tissue, and organism.
- `feedbacks`: Damage recruits response; response remodels tissue; tissue state changes transport and signaling.
- `adaptation`: Cell-state transitions and tissue remodeling.
- `observableOutputs`: Closure rate, cell-state composition, matrix integrity, perfusion, and organism-level burden.
- `researchAnchors`: Gurtner et al., [Wound Repair and Regeneration](https://doi.org/10.1038/nature07039).
- `currentEngineFit`: None at the required fidelity.
- `capabilityGaps`: Explicit scale definitions, aggregation/disaggregation, cell-field coupling, tissue mechanics, cross-scale clocks, and synthetic-detail warnings.
- `estimatedImplementationTier`: C.
- `contentRisk`: No clinical prediction, treatment comparison, or biological-fidelity claim.
- `whyItIsCompelling`: It demonstrates why cell behavior alone is insufficient to explain tissue and organism outcomes.

### C2. Tumor Microenvironment

- `workingTitle`: Tumor Microenvironment
- `hookQuestion`: How can competition, signaling, and spatial constraints reshape a heterogeneous tumor over time?
- `domain`: Cellular systems; oncology research context.
- `fictionalOrResearchContext`: Research-grounded conceptual target.
- `entities`: Tumor-cell phenotypes, stromal cells, immune cells, and vessels.
- `environment`: Tissue with spatial niches and boundaries.
- `resources`: Oxygen, nutrients, space, and growth factors.
- `networks`: Signaling and vascular transport networks.
- `fields`: Oxygen, nutrient, and signal gradients.
- `scales`: Intracellular phenotype, cell, local niche, tissue, and organism context.
- `feedbacks`: Growth changes perfusion; perfusion changes selection; signaling changes cell state and local competition.
- `adaptation`: Bounded phenotype transitions and selection, not patient-specific learning.
- `observableOutputs`: Cell composition, hypoxic fraction, spatial invasion, resource gradients, and burden.
- `researchAnchors`: Hanahan and Weinberg, [Hallmarks of Cancer: The Next Generation](https://doi.org/10.1016/j.cell.2011.02.013).
- `currentEngineFit`: None. Existing spatial agents and structural fields do not create this coupled runtime.
- `capabilityGaps`: Typed cells, explicit fields, cross-scale state transitions, vascular flow, mutation/selection, calibration provenance, and medical safety review.
- `estimatedImplementationTier`: C.
- `contentRisk`: No patient modeling, diagnosis, prognosis, therapy optimization, or clinical decision support.
- `whyItIsCompelling`: It exposes how local ecology and tissue structure can interact across levels.

### C3. Host-Microbiome Ecosystem

- `workingTitle`: Host-Microbiome Ecosystem
- `hookQuestion`: How can microbial competition and host conditions stabilize one community while destabilizing another?
- `domain`: Microbiology; ecology; biological systems.
- `fictionalOrResearchContext`: Research-grounded conceptual target.
- `entities`: Microbial guilds and bounded host cell or compartment states.
- `environment`: Nested body habitats.
- `resources`: Nutrients, metabolites, and carrying capacity.
- `networks`: Metabolic exchange and host-microbe interaction networks.
- `fields`: Nutrient, metabolite, and pH-like gradients.
- `scales`: Microbe, local community, body habitat, and host.
- `feedbacks`: Community metabolism changes habitat conditions; habitat conditions change community competition and host response.
- `adaptation`: Community composition and optional bounded trait evolution.
- `observableOutputs`: Diversity, abundance, metabolite flow, habitat state, and host-response proxy.
- `researchAnchors`: Human Microbiome Project Consortium, [Structure, Function and Diversity of the Healthy Human Microbiome](https://doi.org/10.1038/nature11234).
- `currentEngineFit`: None. ORTUS lacks executed compartments, metabolic networks, fields, and host-community coupling.
- `capabilityGaps`: Nested compartments, conserved metabolites, typed interaction networks, cross-scale aggregation, and provenance/calibration contracts.
- `estimatedImplementationTier`: C.
- `contentRisk`: No individual microbiome reconstruction, health diagnosis, treatment advice, or inference from real personal data.
- `whyItIsCompelling`: It combines ecology, exchange, and host feedback in a system where composition and function need not move together.

### C4. City, Neighborhood, Household

- `workingTitle`: City, Neighborhood, Household
- `hookQuestion`: How can household choices, neighborhood access, and city infrastructure reshape one another?
- `domain`: Urban systems; institutions; economics.
- `fictionalOrResearchContext`: Research-grounded synthetic city.
- `entities`: Households, firms, facilities, neighborhoods, and infrastructure nodes.
- `environment`: City parcels and transport/service networks.
- `resources`: Housing, time, mobility access, service capacity, and budget.
- `networks`: Transport, service, and bounded social-information layers.
- `fields`: Accessibility, land value, hazard, and environmental-quality fields.
- `scales`: Household, block, neighborhood, city, and region.
- `feedbacks`: Location choices change demand and value; infrastructure changes access; access changes later choices.
- `adaptation`: Household and institutional rules with explicit ethical limits.
- `observableOutputs`: Accessibility, travel burden, service load, displacement proxy, land-use composition, and inequality summaries.
- `researchAnchors`: Batty, [Cities and Complexity](https://mitpress.mit.edu/9780262524797/cities-and-complexity/).
- `currentEngineFit`: None at this coupled scale.
- `capabilityGaps`: Explicit scale hierarchy, land/resource markets, network flow, institutions, aggregation, demographic ethics, and synthetic-detail disclosure.
- `estimatedImplementationTier`: C.
- `contentRisk`: No real-person profiling, protected-class inference, housing policy prescription, or claim that abstract categories explain real inequity.
- `whyItIsCompelling`: It makes visible how local decisions and shared infrastructure co-produce urban patterns.

### C5. Climate, Infrastructure, Community

- `workingTitle`: Climate, Infrastructure, Community
- `hookQuestion`: How can one environmental shock cascade through services and communities at several scales?
- `domain`: Environmental systems; infrastructure; urban systems.
- `fictionalOrResearchContext`: Research-grounded synthetic region.
- `entities`: Infrastructure assets, service providers, households as aggregates, and local governments.
- `environment`: Regional hazard zones and connected settlements.
- `resources`: Water, energy, transport capacity, shelter, and response capacity.
- `networks`: Interdependent energy, water, transport, and communication layers.
- `fields`: Heat, flood, drought, or storm exposure.
- `scales`: Asset, neighborhood, city, region, and climate horizon.
- `feedbacks`: Hazard damages service; service loss changes vulnerability and response; response changes later exposure.
- `adaptation`: Bounded infrastructure and institutional adaptation scenarios.
- `observableOutputs`: Service interruption, unmet demand, recovery time, exposed population aggregate, and cascading failures.
- `researchAnchors`: IPCC AR6 WGII, [Cities, Settlements and Key Infrastructure](https://www.ipcc.ch/report/ar6/wg2/chapter/chapter-6/).
- `currentEngineFit`: None. Current fire spread and network services do not compose into climate-risk execution.
- `capabilityGaps`: Multilayer infrastructure, hazard fields, cross-scale clocks, resource flow, recovery, uncertainty provenance, and validation/calibration.
- `estimatedImplementationTier`: C.
- `contentRisk`: No climate forecast, disaster operations, risk certification, or policy optimization.
- `whyItIsCompelling`: It shows why resilience cannot be inferred from one asset or one network layer.

### C6. Nested Watershed Resource Cycles

- `workingTitle`: Nested Watershed Resource Cycles
- `hookQuestion`: How do local land and water processes accumulate across nested watersheds?
- `domain`: Hydrology; environmental systems; ecology.
- `fictionalOrResearchContext`: Research-grounded synthetic watershed hierarchy.
- `entities`: Land patches, stream reaches, reservoirs, users, and ecological populations.
- `environment`: Explicit nested catchments connected by a drainage network.
- `resources`: Water, sediment, nutrients, and reservoir storage.
- `networks`: Directed stream and allocation networks.
- `fields`: Rainfall, soil moisture, and land-cover fields.
- `scales`: Patch, subwatershed, watershed, and basin.
- `feedbacks`: Runoff moves material downstream; storage changes flow; use and land state alter later availability.
- `adaptation`: Bounded allocation or restoration rules.
- `observableOutputs`: Flow, storage, sediment/nutrient load, ecological state, and upstream/downstream balance.
- `researchAnchors`: U.S. Geological Survey, [Watershed Boundary Dataset Data Dictionary](https://www.usgs.gov/ngp-standards-and-specifications/watershed-boundary-dataset-wbd-data-dictionary).
- `currentEngineFit`: None. A grid and coordinates are not watershed or hydrologic runtime support.
- `capabilityGaps`: Nested spatial units, conservative flow, directed transport, aggregation, temporal-scale mapping, forcing provenance, and field coupling.
- `estimatedImplementationTier`: C.
- `contentRisk`: No flood forecast, water-allocation recommendation, or representation of real geography without data and calibration.
- `whyItIsCompelling`: Users can trace how many local processes become downstream system behavior.

### C7. Planetary Civilization Boundaries

- `workingTitle`: Planetary Civilization Boundaries
- `hookQuestion`: Can a fictional civilization expand while keeping coupled planetary resource cycles within chosen bounds?
- `domain`: Fictional systems; environmental systems; economics.
- `fictionalOrResearchContext`: Original speculative civilization informed by Earth-system boundary concepts, not a model of Earth.
- `entities`: Settlements, institutions, production sectors, ecosystems, and infrastructure.
- `environment`: Fictional planet with regions and biomes.
- `resources`: Energy, water, nutrients, land, materials, and waste capacity.
- `networks`: Trade, energy, communication, and migration links.
- `fields`: Climate-like, land-cover, pollution, and productivity fields.
- `scales`: Facility, settlement, region, planet, and generations.
- `feedbacks`: Production changes resources and waste; environmental state changes productivity; institutions change allocation and investment.
- `adaptation`: Bounded institutional and technology transitions.
- `observableOutputs`: Resource balances, service levels, inequality summaries, ecosystem state, and boundary crossings as model-defined thresholds.
- `researchAnchors`: Rockstrom et al., [A Safe Operating Space for Humanity](https://doi.org/10.1038/461472a), used only as conceptual inspiration for coupled limits.
- `currentEngineFit`: None.
- `capabilityGaps`: Planetary scale hierarchy, conservative stocks/flows, cross-scale coupling, institutions, technology transitions, long-horizon time mapping, and uncertainty.
- `estimatedImplementationTier`: C.
- `contentRisk`: Do not turn model-defined thresholds into predictions, policy advice, or claims about real planetary safety.
- `whyItIsCompelling`: It offers a coherent original speculative world where economics, ecology, and institutions must interact.

### C8. Living Archipelago Magic Commons

- `workingTitle`: Living Archipelago Magic Commons
- `hookQuestion`: What happens when islands share a conserved magical resource that also sustains their ecology?
- `domain`: Original fantasy ecology; institutions; resource economics.
- `fictionalOrResearchContext`: Fully original fictional system with explicit rules.
- `entities`: Island communities, harvesters, ecological species, councils, and transport vessels.
- `environment`: Nested island habitats connected by sea routes.
- `resources`: `Aether` is conserved globally, produced slowly by reefs, stored locally, consumed by transport and craft, and returned imperfectly through decay.
- `networks`: Trade, council communication, migration, and ecological dispersal.
- `fields`: Local aether density, reef health, and storm exposure.
- `scales`: Individual actor, island, archipelago, and generation.
- `feedbacks`: Harvest funds exchange but weakens reefs; reef decline lowers future production; scarcity changes trade and institutional rules.
- `adaptation`: Bounded harvesting strategies, council rules, species movement, and craft substitution.
- `observableOutputs`: Aether balance, reef health, island service level, migration, trade concentration, and rule compliance.
- `researchAnchors`: Original rule system. Later design may use commons and metapopulation research, but no borrowed authority is needed to make the fiction coherent.
- `currentEngineFit`: None. Current templates do not execute conserved cross-scale resources, institutions, or coupled fields.
- `capabilityGaps`: Conservation-enforced resources, nested environments, multilayer networks, institutional rules, cross-scale coupling, and generational time.
- `estimatedImplementationTier`: C.
- `contentRisk`: Avoid franchise resemblance, cultural stereotyping, and treating fictional social outcomes as claims about real groups.
- `whyItIsCompelling`: It demonstrates that rigorous modeling can support imaginative worlds when resources and consequences remain explicit.

## Breadth Audit

The 24 candidates cover:

- ecology and evolution: A5-A7, B5, B8, C3, C6-C8;
- epidemiology: A2;
- information systems and social media: A3-A4, B6;
- institutions and economics: B1, B4-B5, C4, C7-C8;
- infrastructure and engineering: A1, B1-B4, C5;
- urban systems: B3, C4-C5;
- adaptive networks and neuroscience context: A8;
- cellular and biological systems: B7, C1-C3;
- environmental systems: A7, C5-C8;
- original fictional systems: A8's arena context, C7, and C8.

This breadth is thematic, not runtime support. No one candidate may claim a domain merely because ORTUS has a service-level primitive with a similar name.

## Source Verification Record

Sources were checked during C1 at publisher, journal, university, or official-institution pages. Core seven-world sources are stored in the validated definitions. Portfolio-only anchors include:

- INFORMS for Lee et al. and Little;
- APS for Motter and Lai;
- Institution of Civil Engineers/Crossref metadata for Wardrop;
- Cambridge University Press for Ostrom;
- University of Chicago Press for Gordon;
- Oxford University Press for Kivela et al.;
- Nature and PubMed for Perelson, Yoshida et al., Human Microbiome Project, wound repair, and planetary boundaries;
- Cell/Elsevier metadata for Hanahan and Weinberg;
- MIT Press for Batty;
- IPCC for coupled urban climate and infrastructure risk;
- USGS for nested watershed units.

Link availability can change. Maintenance must re-check title, author/organization, date, DOI or stable URL, and the claimed relationship before promoting any candidate into product content.

## Decision Rule

Promote a candidate only when:

1. a dedicated prompt names the exact runtime slice;
2. authoritative registries prove every claimed capability;
3. defaults, bounds, metrics, and interventions are explicit;
4. deterministic tests cover runtime behavior and failure;
5. source language remains conceptual unless calibration and validation are actually performed;
6. the implementation is followed by its required audit.

For Tier C, camera zoom, aggregate metrics, nested labels, or a hierarchy drawn in the UI are insufficient. Real support requires explicit scales, aggregation/disaggregation, cross-scale coupling, and synthetic-detail warnings.
