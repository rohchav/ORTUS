import type { CSSProperties } from "react";
import type { StarterWorldVisualKind } from "../../lib/starterWorlds";

interface StarterWorldVisualProps {
  kind: StarterWorldVisualKind;
  compact?: boolean;
}

type VisualStyle = CSSProperties & Record<`--${string}`, string | number>;

const motionPoints = [
  [12, 26, -18], [24, 44, 12], [34, 22, -5], [44, 39, 20], [54, 18, 8], [64, 32, -12],
  [75, 19, 16], [84, 39, -6], [18, 69, 14], [31, 61, -12], [48, 73, 9], [67, 64, -16], [82, 73, 10]
] as const;
const contactPoints = [
  [14, 62, "susceptible"], [24, 31, "susceptible"], [33, 55, "infected"], [43, 28, "infected"],
  [51, 62, "infected"], [61, 42, "recovered"], [70, 68, "susceptible"], [80, 31, "susceptible"], [88, 56, "recovered"]
] as const;
const opinionPoints = [
  [11, 31, "left"], [17, 58, "left"], [25, 40, "left"], [32, 69, "left"], [39, 27, "left"],
  [47, 49, "bridge"], [56, 34, "right"], [63, 67, "right"], [72, 42, "right"], [81, 25, "right"], [88, 60, "right"]
] as const;
const preyPoints = [
  [12, 27], [21, 58], [31, 36], [38, 72], [49, 23], [58, 55], [69, 35], [79, 69], [88, 43]
] as const;
const predatorPoints = [
  [28, 23], [52, 68], [75, 27]
] as const;
const neighborhoodCells = [
  "a", "a", "empty", "b", "b", "b", "a", "a",
  "a", "empty", "empty", "b", "b", "b", "a", "a",
  "a", "a", "b", "b", "empty", "a", "a", "empty",
  "b", "b", "b", "empty", "a", "a", "a", "a",
  "b", "b", "empty", "a", "a", "a", "empty", "b",
  "b", "b", "b", "a", "empty", "b", "b", "b"
] as const;
const landscapeCells = [
  "fuel", "fuel", "fuel", "empty", "fuel", "fuel", "fuel", "fuel", "empty", "fuel",
  "fuel", "burned", "burning", "burning", "fuel", "fuel", "empty", "fuel", "fuel", "fuel",
  "fuel", "burned", "burned", "burning", "burning", "fuel", "fuel", "fuel", "empty", "fuel",
  "empty", "burned", "burned", "burned", "burning", "burning", "fuel", "fuel", "fuel", "fuel",
  "fuel", "fuel", "burned", "burned", "burned", "burning", "fuel", "empty", "fuel", "fuel",
  "fuel", "empty", "fuel", "burned", "burned", "fuel", "fuel", "fuel", "fuel", "empty"
] as const;
const signalNodes = [
  [13, 50, "quiet"], [27, 25, "active"], [28, 73, "inhibited"], [45, 43, "firing"],
  [55, 72, "quiet"], [63, 22, "active"], [76, 48, "firing"], [88, 28, "quiet"], [88, 72, "active"]
] as const;
const signalEdges = [
  [13, 50, 27, 25, "excite"], [13, 50, 28, 73, "inhibit"], [27, 25, 45, 43, "excite"],
  [28, 73, 45, 43, "excite"], [45, 43, 63, 22, "inhibit"], [45, 43, 55, 72, "excite"],
  [63, 22, 76, 48, "excite"], [55, 72, 76, 48, "inhibit"], [76, 48, 88, 28, "excite"], [76, 48, 88, 72, "excite"]
] as const;
const comparisonMotionPoints = [
  [16, 22, 3], [34, 38, -4], [57, 24, 5], [76, 43, -2], [25, 70, 4], [52, 63, -3], [82, 74, 2]
] as const;
const comparisonOutbreakClusterPoints = [
  [35, 27], [48, 29], [58, 38], [39, 43], [51, 49], [63, 51], [35, 59], [48, 66], [60, 68]
] as const;
const comparisonOutbreakHotspotPoints = [
  [16, 22], [27, 27], [20, 38], [66, 24], [79, 31], [70, 42], [28, 67], [40, 75], [21, 80]
] as const;
const firebreakCells = Array.from({ length: 60 }, (_, index) => {
  const column = index % 10;
  if (column === 6) {
    return "corridor";
  }
  return column < 6 && index % 4 !== 0 ? "burned" : "fuel";
});

export function StarterWorldVisual({ kind, compact = false }: StarterWorldVisualProps) {
  return (
    <div
      className={`starter-world-visual starter-world-visual--${kind}${compact ? " starter-world-visual--compact" : ""}`}
      data-starter-visual={kind}
      aria-hidden="true"
    >
      {kind === "collective-motion" ? (
        <div className="starter-world-visual__motion">
          {motionPoints.map(([x, y, rotation], index) => (
            <span
              key={index}
              className="starter-world-visual__boid"
              style={{ "--x": `${x}%`, "--y": `${y}%`, "--rotation": `${rotation}deg` } as VisualStyle}
            />
          ))}
        </div>
      ) : null}

      {kind === "contact-spread" ? (
        <div className="starter-world-visual__contact">
          <span className="starter-world-visual__contact-ring starter-world-visual__contact-ring--one" />
          <span className="starter-world-visual__contact-ring starter-world-visual__contact-ring--two" />
          {contactPoints.map(([x, y, state], index) => (
            <span
              key={index}
              className={`starter-world-visual__contact-node starter-world-visual__contact-node--${state}`}
              style={{ "--x": `${x}%`, "--y": `${y}%` } as VisualStyle}
            />
          ))}
        </div>
      ) : null}

      {kind === "opinion-field" ? (
        <div className="starter-world-visual__opinion">
          <span className="starter-world-visual__opinion-axis" />
          {opinionPoints.map(([x, y, side], index) => (
            <span
              key={index}
              className={`starter-world-visual__opinion-node starter-world-visual__opinion-node--${side}`}
              style={{ "--x": `${x}%`, "--y": `${y}%` } as VisualStyle}
            />
          ))}
        </div>
      ) : null}

      {kind === "population-cycle" ? (
        <div className="starter-world-visual__ecology">
          <span className="starter-world-visual__encounter-ring starter-world-visual__encounter-ring--one" />
          <span className="starter-world-visual__encounter-ring starter-world-visual__encounter-ring--two" />
          {preyPoints.map(([x, y], index) => (
            <span
              key={`prey-${index}`}
              className="starter-world-visual__prey"
              style={{ "--x": `${x}%`, "--y": `${y}%` } as VisualStyle}
            />
          ))}
          {predatorPoints.map(([x, y], index) => (
            <span
              key={`predator-${index}`}
              className="starter-world-visual__predator"
              style={{ "--x": `${x}%`, "--y": `${y}%` } as VisualStyle}
            />
          ))}
        </div>
      ) : null}

      {kind === "neighborhood-grid" ? (
        <div className="starter-world-visual__grid starter-world-visual__grid--neighborhood">
          {neighborhoodCells.map((state, index) => (
            <span key={index} className={`starter-world-visual__cell starter-world-visual__cell--${state}`} />
          ))}
        </div>
      ) : null}

      {kind === "landscape-spread" ? (
        <div className="starter-world-visual__grid starter-world-visual__grid--landscape">
          {landscapeCells.map((state, index) => (
            <span key={index} className={`starter-world-visual__cell starter-world-visual__cell--${state}`} />
          ))}
        </div>
      ) : null}

      {kind === "signal-network" ? (
        <div className="starter-world-visual__signal">
          {signalEdges.map(([x1, y1, x2, y2, edgeKind], index) => {
            const dx = x2 - x1;
            const dy = y2 - y1;
            return (
              <span
                key={`edge-${index}`}
                className={`starter-world-visual__signal-edge starter-world-visual__signal-edge--${edgeKind}`}
                style={
                  {
                    "--x": `${x1}%`,
                    "--y": `${y1}%`,
                    "--length": `${Math.sqrt(dx * dx + dy * dy)}%`,
                    "--rotation": `${Math.atan2(dy, dx) * (180 / Math.PI)}deg`
                  } as VisualStyle
                }
              />
            );
          })}
          {signalNodes.map(([x, y, state], index) => (
            <span
              key={`node-${index}`}
              className={`starter-world-visual__signal-node starter-world-visual__signal-node--${state}`}
              style={{ "--x": `${x}%`, "--y": `${y}%` } as VisualStyle}
            />
          ))}
        </div>
      ) : null}

      {kind === "coordination-noise" ? (
        <div className="starter-world-visual__paired starter-world-visual__paired--coordination">
          <div>
            {comparisonMotionPoints.map(([x, y, rotation], index) => (
              <span
                key={`clear-${index}`}
                className="starter-world-visual__paired-boid"
                style={{ "--x": `${x}%`, "--y": `${y}%`, "--rotation": `${rotation}deg` } as VisualStyle}
              />
            ))}
          </div>
          <div>
            {comparisonMotionPoints.map(([x, y], index) => (
              <span
                key={`noise-${index}`}
                className="starter-world-visual__paired-boid"
                style={{ "--x": `${x}%`, "--y": `${y}%`, "--rotation": `${-56 + index * 23}deg` } as VisualStyle}
              />
            ))}
          </div>
        </div>
      ) : null}

      {kind === "clustered-outbreaks" ? (
        <div className="starter-world-visual__paired starter-world-visual__paired--outbreaks">
          <div>
            <span className="starter-world-visual__outbreak-ring" />
            {comparisonOutbreakClusterPoints.map(([x, y], index) => (
              <span
                key={`cluster-${index}`}
                className="starter-world-visual__outbreak-node"
                style={{ "--x": `${x}%`, "--y": `${y}%` } as VisualStyle}
              />
            ))}
          </div>
          <div>
            {comparisonOutbreakHotspotPoints.map(([x, y], index) => (
              <span
                key={`hotspot-${index}`}
                className="starter-world-visual__outbreak-node"
                style={{ "--x": `${x}%`, "--y": `${y}%` } as VisualStyle}
              />
            ))}
            <span className="starter-world-visual__hotspot starter-world-visual__hotspot--one" />
            <span className="starter-world-visual__hotspot starter-world-visual__hotspot--two" />
            <span className="starter-world-visual__hotspot starter-world-visual__hotspot--three" />
          </div>
        </div>
      ) : null}

      {kind === "predator-pressure" ? (
        <div className="starter-world-visual__pressure">
          <span className="starter-world-visual__pressure-line starter-world-visual__pressure-line--prey" />
          <span className="starter-world-visual__pressure-line starter-world-visual__pressure-line--predator" />
          <span className="starter-world-visual__pressure-marker starter-world-visual__pressure-marker--one" />
          <span className="starter-world-visual__pressure-marker starter-world-visual__pressure-marker--two" />
          <span className="starter-world-visual__pressure-marker starter-world-visual__pressure-marker--three" />
          <span className="starter-world-visual__pressure-axis" />
        </div>
      ) : null}

      {kind === "firebreak-corridor" ? (
        <div className="starter-world-visual__grid starter-world-visual__grid--firebreak">
          {firebreakCells.map((state, index) => (
            <span key={index} className={`starter-world-visual__cell starter-world-visual__cell--${state}`} />
          ))}
        </div>
      ) : null}
    </div>
  );
}
