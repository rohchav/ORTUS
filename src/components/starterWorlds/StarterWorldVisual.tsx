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
const populationBars = [
  [35, 68], [44, 76], [57, 70], [73, 57], [86, 42], [78, 31], [61, 38], [43, 56],
  [31, 73], [38, 82], [55, 74], [72, 53], [84, 36], [72, 29]
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
        <div className="starter-world-visual__cycles">
          {populationBars.map(([prey, predator], index) => (
            <span key={index} className="starter-world-visual__cycle-column">
              <i className="starter-world-visual__cycle-bar starter-world-visual__cycle-bar--prey" style={{ "--height": `${prey}%` } as VisualStyle} />
              <i
                className="starter-world-visual__cycle-bar starter-world-visual__cycle-bar--predator"
                style={{ "--height": `${predator}%` } as VisualStyle}
              />
            </span>
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
    </div>
  );
}
