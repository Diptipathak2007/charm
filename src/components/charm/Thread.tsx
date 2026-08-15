import type { ThreadId } from "../../types/settings";
import "./Thread.css";

export interface ThreadDefinition {
  id: ThreadId;
  name: string;
  description: string;
}

export const THREADS: readonly ThreadDefinition[] = [
  { id: "classic", name: "Classic String", description: "Soft woven charcoal cord" },
  { id: "red", name: "Red Thread", description: "A warm double red thread" },
  { id: "gold", name: "Gold Chain", description: "Fine linked golden chain" },
  { id: "beaded", name: "Beaded Thread", description: "Tiny alternating glass beads" },
  { id: "minimal", name: "Minimal", description: "An almost invisible fine line" },
  { id: "none", name: "No Thread", description: "The charm floats on its own" },
] as const;

interface ThreadProps {
  id: ThreadId;
}

function Thread({ id }: ThreadProps) {
  if (id === "none") {
    return <div className="thread thread--none" aria-hidden="true" />;
  }

  return (
    <svg
      className={`thread thread--${id}`}
      viewBox="0 0 64 118"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      {id === "classic" && (
        <>
          <path className="thread__classic-shadow" d="M31 0c-1 30 2 58 0 118" />
          <path className="thread__classic-fibre" d="M33 0c-1 30 2 58 0 118" />
        </>
      )}

      {id === "red" && (
        <>
          <path className="thread__red-dark" d="M30 0c3 25-2 51 2 78 2 15-2 27-1 40" />
          <path className="thread__red-light" d="M34 0c-3 25 2 51-2 78-2 15 2 27 1 40" />
        </>
      )}

      {id === "gold" && (
        <g className="thread__gold-links">
          {Array.from({ length: 15 }, (_, index) => (
            <ellipse
              key={index}
              cx="32"
              cy={4 + index * 8}
              rx="3.2"
              ry="5.2"
              transform={`rotate(${index % 2 === 0 ? -18 : 18} 32 ${4 + index * 8})`}
            />
          ))}
        </g>
      )}

      {id === "beaded" && (
        <>
          <path className="thread__beaded-cord" d="M32 0v118" />
          <g className="thread__beads">
            {Array.from({ length: 12 }, (_, index) => (
              <circle
                key={index}
                cx="32"
                cy={6 + index * 10}
                r={index % 3 === 0 ? 3.2 : 2.5}
                data-tone={index % 3}
              />
            ))}
          </g>
        </>
      )}

      {id === "minimal" && <path className="thread__minimal" d="M32 0v118" />}
    </svg>
  );
}

export default Thread;
