export type CharmId =
  | "nazar"
  | "nimbu-mirchi"
  | "lucky-cat"
  | "horseshoe"
  | "clover"
  | "hamsa"
  | "daruma"
  | "drishti-bommai"
  | "scarab"
  | "lucky-coin"
  | "red-knot"
  | "eye-bead";

export type ThreadId =
  | "classic"
  | "red"
  | "gold"
  | "beaded"
  | "minimal"
  | "none";

export type MonitorMode = "primary" | "selected";

export interface CharmSettings {
  charmId: CharmId;
  position: {
    /** Horizontal attachment point across the monitor work area, from 0 to 1. */
    normalizedX: number;
  };
  thread: {
    id: ThreadId;
  };
  scale: number;
  visible: boolean;
  monitor: {
    mode: MonitorMode;
    selectedId: string | null;
  };
}

export const MIN_CHARM_SCALE = 0.75;
export const MAX_CHARM_SCALE = 1.3;
export const CHARM_SCALE_STEP = 0.05;
export const LEFT_POSITION_X = 0.18;
export const CENTER_POSITION_X = 0.5;
export const RIGHT_POSITION_X = 0.82;
