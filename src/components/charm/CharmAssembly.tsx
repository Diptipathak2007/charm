import type { CSSProperties } from "react";
import { getCharm } from "../../charms/registry";
import type { CharmSettings } from "../../types/settings";
import Thread from "./Thread";
import "./CharmAssembly.css";

interface CharmAssemblyProps {
  settings: CharmSettings;
  compact?: boolean;
}

type AssemblyStyle = CSSProperties & {
  "--user-scale": number;
  "--art-scale": number;
  "--idle-rotation": string;
  "--idle-rotation-negative": string;
  "--idle-duration": string;
  "--charm-accent": string;
};

function CharmAssembly({ settings, compact = false }: CharmAssemblyProps) {
  const charm = getCharm(settings.charmId);
  const Artwork = charm.artwork;
  const style: AssemblyStyle = {
    "--user-scale": settings.scale,
    "--art-scale": charm.defaultScale,
    "--idle-rotation": `${charm.animation.idleRotation}deg`,
    "--idle-rotation-negative": `${-charm.animation.idleRotation}deg`,
    "--idle-duration": `${charm.animation.idleDurationMs}ms`,
    "--charm-accent": charm.accent,
  };

  return (
    <div
      className={`charm-assembly${compact ? " charm-assembly--compact" : ""}`}
      style={style}
      data-thread={settings.thread.id}
    >
      <Thread key={settings.thread.id} id={settings.thread.id} />
      <div className="charm-assembly__artwork" key={charm.id}>
        <Artwork />
      </div>
    </div>
  );
}

export default CharmAssembly;
