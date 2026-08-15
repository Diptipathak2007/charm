import type { ComponentType } from "react";
import type { CharmId } from "../types/settings";
import {
  CloverCharm,
  DarumaCharm,
  DrishtiBommaiCharm,
  EyeBeadCharm,
  HamsaCharm,
  HorseshoeCharm,
  LuckyCatCharm,
  LuckyCoinCharm,
  NazarCharm,
  NimbuMirchiCharm,
  RedKnotCharm,
  ScarabCharm,
  type CharmArtworkProps,
} from "./artwork";

export type CharmInteraction =
  | "flick"
  | "freshen"
  | "beckon"
  | "pendulum"
  | "flutter"
  | "glow"
  | "wobble"
  | "nod"
  | "wings"
  | "flip"
  | "sway"
  | "sparkle";

export interface CharmDefinition {
  id: CharmId;
  name: string;
  shortName: string;
  description: string;
  category: string;
  artwork: ComponentType<CharmArtworkProps>;
  defaultScale: number;
  accent: string;
  animation: {
    idleRotation: number;
    idleDurationMs: number;
    interaction: CharmInteraction;
    actionLabel: string;
  };
}

export const CHARMS: readonly CharmDefinition[] = [
  {
    id: "nazar",
    name: "Nazar",
    shortName: "Nazar",
    description:
      "A blue glass eye kept near doorways around the Mediterranean to watch for envy. Tap it and it looks the other way for a moment.",
    category: "Turkey & the Mediterranean",
    artwork: NazarCharm,
    defaultScale: 1,
    accent: "#2f7f9e",
    animation: {
      idleRotation: 1.2,
      idleDurationMs: 4200,
      interaction: "flick",
      actionLabel: "Turn its gaze",
    },
  },
  {
    id: "nimbu-mirchi",
    name: "Nimbu-mirchi",
    shortName: "Nimbu",
    description:
      "A lime and green chillies strung above the threshold in Indian homes and shops. Swap in a fresh garland whenever the last one tires out.",
    category: "India",
    artwork: NimbuMirchiCharm,
    defaultScale: 0.96,
    accent: "#b58a24",
    animation: {
      idleRotation: 1.6,
      idleDurationMs: 4600,
      interaction: "freshen",
      actionLabel: "String a fresh one",
    },
  },
  {
    id: "lucky-cat",
    name: "Maneki-neko",
    shortName: "Lucky Cat",
    description:
      "The beckoning cat that sits by Japanese shop counters, paw raised to wave good fortune inside. Ask, and the paw waves for you.",
    category: "Japan",
    artwork: LuckyCatCharm,
    defaultScale: 0.98,
    accent: "#b8823f",
    animation: {
      idleRotation: 1,
      idleDurationMs: 4400,
      interaction: "beckon",
      actionLabel: "Wave it over",
    },
  },
  {
    id: "horseshoe",
    name: "Horseshoe",
    shortName: "Horseshoe",
    description:
      "Iron hung above barn doors across Europe and the Americas, ends turned up so nothing spills out. It only ever asks for a good push.",
    category: "Europe & the Americas",
    artwork: HorseshoeCharm,
    defaultScale: 0.94,
    accent: "#9d7a3c",
    animation: {
      idleRotation: 1.1,
      idleDurationMs: 4800,
      interaction: "pendulum",
      actionLabel: "Set it swinging",
    },
  },
  {
    id: "clover",
    name: "Four-leaf clover",
    shortName: "Clover",
    description:
      "The one stem in a whole field with a fourth leaf, pressed into books and pockets across Ireland. Make the wish it was saved for.",
    category: "Ireland",
    artwork: CloverCharm,
    defaultScale: 0.98,
    accent: "#4a8b56",
    animation: {
      idleRotation: 1.4,
      idleDurationMs: 4500,
      interaction: "flutter",
      actionLabel: "Make a wish",
    },
  },
  {
    id: "hamsa",
    name: "Hamsa",
    shortName: "Hamsa",
    description:
      "An open palm carried across the Middle East and North Africa as a quiet answer to ill will. Warm it and the palm catches the light.",
    category: "Middle East & North Africa",
    artwork: HamsaCharm,
    defaultScale: 0.96,
    accent: "#3d8489",
    animation: {
      idleRotation: 1.1,
      idleDurationMs: 4700,
      interaction: "glow",
      actionLabel: "Warm the palm",
    },
  },
  {
    id: "daruma",
    name: "Daruma",
    shortName: "Daruma",
    description:
      "A round Japanese wishing doll that rights itself however often it topples. Its eyes are painted in as the goal comes true.",
    category: "Japan",
    artwork: DarumaCharm,
    defaultScale: 0.98,
    accent: "#a93a3f",
    animation: {
      idleRotation: 1.3,
      idleDurationMs: 4300,
      interaction: "wobble",
      actionLabel: "Rock it upright",
    },
  },
  {
    id: "drishti-bommai",
    name: "Drishti bommai",
    shortName: "Drishti",
    description:
      "A painted guardian face fixed to South Indian houses to take the first unkind glance. Greet it and it answers with a nod.",
    category: "South India",
    artwork: DrishtiBommaiCharm,
    defaultScale: 0.95,
    accent: "#c06c43",
    animation: {
      idleRotation: 1.5,
      idleDurationMs: 4500,
      interaction: "nod",
      actionLabel: "Trade a nod",
    },
  },
  {
    id: "scarab",
    name: "Scarab",
    shortName: "Scarab",
    description:
      "The beetle amulet ancient Egypt tied to sunrise and starting over. Open its wings, then let them settle again.",
    category: "Ancient Egypt",
    artwork: ScarabCharm,
    defaultScale: 0.96,
    accent: "#2f7573",
    animation: {
      idleRotation: 1.2,
      idleDurationMs: 4900,
      interaction: "wings",
      actionLabel: "Open the wings",
    },
  },
  {
    id: "lucky-coin",
    name: "Lucky coin",
    shortName: "Coin",
    description:
      "The worn coin that never gets spent, kept in a pocket seam for luck instead. Send it spinning when a call is too close to make.",
    category: "Pocket keepsake",
    artwork: LuckyCoinCharm,
    defaultScale: 0.94,
    accent: "#a8811f",
    animation: {
      idleRotation: 0.8,
      idleDurationMs: 5000,
      interaction: "flip",
      actionLabel: "Flip for it",
    },
  },
  {
    id: "red-knot",
    name: "Endless knot",
    shortName: "Red Knot",
    description:
      "Red cord tied into a knot with no beginning, given at East Asian new years and weddings. Give the tassel a gentle pull.",
    category: "East Asia",
    artwork: RedKnotCharm,
    defaultScale: 0.97,
    accent: "#b23a45",
    animation: {
      idleRotation: 1.5,
      idleDurationMs: 4600,
      interaction: "sway",
      actionLabel: "Pull the tassel",
    },
  },
  {
    id: "eye-bead",
    name: "Glass eye bead",
    shortName: "Eye Bead",
    description:
      "A single bead from a Mediterranean glassworker's rod, sold in strings at market stalls. Turn it until it catches the light.",
    category: "Mediterranean",
    artwork: EyeBeadCharm,
    defaultScale: 0.95,
    accent: "#347f9c",
    animation: {
      idleRotation: 1.3,
      idleDurationMs: 4400,
      interaction: "sparkle",
      actionLabel: "Catch the light",
    },
  },
] as const;

export function getCharm(id: CharmId): CharmDefinition {
  return CHARMS.find((charm) => charm.id === id) ?? CHARMS[0];
}
