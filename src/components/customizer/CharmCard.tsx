import { useState, type CSSProperties } from "react";
import type { CharmDefinition } from "../../charms/registry";
import type { ThreadId } from "../../types/settings";
import Thread from "../charm/Thread";
import "./CharmCard.css";

interface CharmCardProps {
  charm: CharmDefinition;
  selected: boolean;
  threadId: ThreadId;
  onSelect: () => void;
}

function CharmCard({ charm, selected, threadId, onSelect }: CharmCardProps) {
  const [ritualRun, setRitualRun] = useState(0);
  const Artwork = charm.artwork;

  return (
    <article
      className={`charm-card${selected ? " charm-card--chosen" : ""}`}
      style={{ "--charm-accent": charm.accent } as CSSProperties}
    >
      <button
        type="button"
        className="charm-card__select"
        aria-pressed={selected}
        aria-label={`Hang ${charm.name}`}
        onClick={onSelect}
      >
        <span className="charm-card__stage">
          <span className="charm-card__rail" aria-hidden="true" />
          {/* The thread and the charm share one swinging element so a ritual
              never pulls the charm away from the end of its thread. */}
          <span
            key={ritualRun}
            className="charm-card__hanging"
            data-ritual={ritualRun > 0 ? charm.animation.interaction : undefined}
          >
            <Thread id={threadId} />
            <span className="charm-card__art">
              <Artwork />
            </span>
          </span>
        </span>
        <span className="charm-card__name">{charm.name}</span>
        <span className="charm-card__region">{charm.category}</span>
        <span className="charm-card__story">{charm.description}</span>
      </button>
      <div className="charm-card__actions">
        <button
          type="button"
          className="charm-card__ritual"
          onClick={() => setRitualRun((run) => run + 1)}
        >
          {charm.animation.actionLabel}
        </button>
      </div>
      <span className="charm-card__badge" aria-hidden="true">
        Hanging
      </span>
    </article>
  );
}

export default CharmCard;
