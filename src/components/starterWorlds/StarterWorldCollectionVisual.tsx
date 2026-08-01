import type { StarterWorldDefinition } from "../../lib/starterWorlds";
import { StarterWorldVisual } from "./StarterWorldVisual";

interface StarterWorldCollectionVisualProps {
  worlds: readonly StarterWorldDefinition[];
  compact?: boolean;
}

export function StarterWorldCollectionVisual({ worlds, compact = false }: StarterWorldCollectionVisualProps) {
  return (
    <div
      className={`starter-collection-visual${compact ? " starter-collection-visual--compact" : ""}`}
      data-starter-collection-visual
      aria-hidden="true"
    >
      {worlds.slice(0, 4).map((world, index) => (
        <div key={world.id} data-collection-motif={index + 1}>
          <StarterWorldVisual kind={world.visualKind} compact />
        </div>
      ))}
    </div>
  );
}
