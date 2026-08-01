import type { StarterWorldVisualKind } from "../../lib/starterWorlds";
import { StarterWorldVisual } from "./StarterWorldVisual";

export function GuidedInvestigationVisual({ kind }: { kind: StarterWorldVisualKind }) {
  return (
    <figure className="guided-investigation-visual">
      <StarterWorldVisual kind={kind} />
      <div className="guided-investigation-visual__reading" aria-hidden="true">
        <span className="guided-investigation-visual__direction">Direction</span>
        <span className="guided-investigation-visual__extent">Spread</span>
      </div>
      <figcaption>
        Alignment reads common direction. Dispersion reads how broadly the model agents occupy the model space.
      </figcaption>
    </figure>
  );
}
