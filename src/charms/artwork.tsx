import type { SVGProps } from "react";

export type CharmArtworkProps = SVGProps<SVGSVGElement>;

export function NazarCharm(props: CharmArtworkProps) {
  return (
    <svg viewBox="0 0 120 126" role="img" aria-label="Nazar charm" {...props}>
      <defs>
        <radialGradient id="nazar-blue" cx="38%" cy="30%">
          <stop offset="0" stopColor="#52c9e2" />
          <stop offset="1" stopColor="#11779d" />
        </radialGradient>
      </defs>
      <path d="M50 8h20l5 13-7 8H52l-7-8z" fill="#d8aa55" />
      <circle cx="60" cy="72" r="43" fill="url(#nazar-blue)" />
      <circle cx="60" cy="72" r="30" fill="#f7fbf8" />
      <circle cx="60" cy="72" r="20" fill="#4ab8d2" />
      <circle cx="60" cy="72" r="11" fill="#15364d" />
      <circle cx="56" cy="67" r="3.5" fill="#fff" opacity=".9" />
      <path
        d="M31 98c8 9 18 14 29 14s22-5 29-14"
        fill="none"
        stroke="#0d6487"
        strokeLinecap="round"
        strokeWidth="3"
        opacity=".35"
      />
    </svg>
  );
}

export function NimbuMirchiCharm(props: CharmArtworkProps) {
  return (
    <svg viewBox="0 0 120 142" role="img" aria-label="Nimbu mirchi charm" {...props}>
      <defs>
        <linearGradient id="lemon" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#ffe875" />
          <stop offset="1" stopColor="#e8b92f" />
        </linearGradient>
        <linearGradient id="chilli" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#4fa956" />
          <stop offset="1" stopColor="#1e6f43" />
        </linearGradient>
      </defs>
      <path d="M60 5v25" stroke="#9d6c43" strokeWidth="5" strokeLinecap="round" />
      <path d="M51 27q9-8 18 0l-3 10H54z" fill="#7a9b45" />
      <ellipse cx="60" cy="56" rx="29" ry="25" fill="url(#lemon)" />
      <path d="M42 48q17-15 34 0" fill="none" stroke="#fff6b1" strokeWidth="4" opacity=".65" />
      <path d="M60 81v10" stroke="#9d6c43" strokeWidth="4" />
      <path d="M47 87c-9 12-8 30 5 44 2-18 8-30 13-39-5-5-11-7-18-5z" fill="url(#chilli)" />
      <path d="M60 89c-2 15 6 33 20 43-3-17-2-30 0-40-6-4-13-5-20-3z" fill="#297d43" />
      <path d="M73 88c5 10 15 18 26 20-7-10-10-19-11-27-6 0-11 2-15 7z" fill="#3e9651" />
      <circle cx="60" cy="87" r="6" fill="#a64c38" />
    </svg>
  );
}

export function LuckyCatCharm(props: CharmArtworkProps) {
  return (
    <svg viewBox="0 0 120 136" role="img" aria-label="Lucky cat charm" {...props}>
      <defs>
        <linearGradient id="cat-fur" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#fffdf5" />
          <stop offset="1" stopColor="#e9dfc9" />
        </linearGradient>
      </defs>
      <path d="M52 5h16l4 13-7 7H55l-7-7z" fill="#c9903f" />
      <path d="M33 43 39 22l16 13M87 43 81 22 65 35" fill="url(#cat-fur)" stroke="#cbbd9f" strokeWidth="2" />
      <circle cx="60" cy="58" r="31" fill="url(#cat-fur)" stroke="#cbbd9f" strokeWidth="2" />
      <path d="M33 79c-8-16-10-29-2-33 10-5 13 8 12 21" fill="url(#cat-fur)" stroke="#cbbd9f" strokeWidth="2" />
      <path d="M87 79c10-18 17-20 21-15 5 7-4 18-15 25" fill="url(#cat-fur)" stroke="#cbbd9f" strokeWidth="2" />
      <ellipse cx="60" cy="104" rx="34" ry="28" fill="url(#cat-fur)" stroke="#cbbd9f" strokeWidth="2" />
      <path d="M40 82q20 11 40 0" fill="none" stroke="#c94c4c" strokeWidth="7" />
      <circle cx="60" cy="89" r="7" fill="#dbad45" />
      <path d="M48 55h7M68 55h7" stroke="#294857" strokeLinecap="round" strokeWidth="3" />
      <path d="m57 64 3 2 3-2M60 66v4" fill="none" stroke="#b86f68" strokeLinecap="round" strokeWidth="2" />
      <ellipse cx="60" cy="108" rx="18" ry="14" fill="#d9a849" />
      <path d="M50 108h20M60 98v20" stroke="#fff0b1" strokeWidth="2" opacity=".8" />
    </svg>
  );
}

export function HorseshoeCharm(props: CharmArtworkProps) {
  return (
    <svg viewBox="0 0 120 132" role="img" aria-label="Horseshoe charm" {...props}>
      <defs>
        <linearGradient id="shoe-gold" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#f4d27b" />
          <stop offset=".5" stopColor="#c8923f" />
          <stop offset="1" stopColor="#8f612d" />
        </linearGradient>
      </defs>
      <path d="M52 5h16l5 13-7 8H54l-7-8z" fill="#b98238" />
      <path
        d="M32 37v34c0 26 11 43 28 43S88 97 88 71V37"
        fill="none"
        stroke="url(#shoe-gold)"
        strokeLinecap="round"
        strokeWidth="19"
      />
      <path d="M32 38h16M72 38h16" stroke="#f0cd72" strokeLinecap="round" strokeWidth="8" />
      {[48, 70, 92].map((y) => (
        <g key={y} fill="#6e4b2c">
          <circle cx="36" cy={y} r="3" />
          <circle cx="84" cy={y} r="3" />
        </g>
      ))}
      <path d="M50 111q10 7 20 0" fill="none" stroke="#f6dd94" strokeWidth="3" opacity=".55" />
    </svg>
  );
}

export function CloverCharm(props: CharmArtworkProps) {
  return (
    <svg viewBox="0 0 120 136" role="img" aria-label="Four leaf clover charm" {...props}>
      <defs>
        <linearGradient id="clover-green" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#71bb6b" />
          <stop offset="1" stopColor="#27784c" />
        </linearGradient>
      </defs>
      <path d="M52 5h16l5 13-8 8H55l-8-8z" fill="#be944d" />
      <path d="M61 75c-1 22 8 38 20 51" fill="none" stroke="#397e4b" strokeLinecap="round" strokeWidth="7" />
      <path d="M60 72C38 68 24 54 29 40c5-13 24-10 31 7 7-17 26-20 31-7 5 14-9 28-31 32z" fill="url(#clover-green)" />
      <path d="M60 72c-22 4-36 18-31 32 5 13 24 10 31-7 7 17 26 20 31 7 5-14-9-28-31-32z" fill="url(#clover-green)" />
      <circle cx="60" cy="72" r="7" fill="#2d7447" />
      <path d="M45 51q15-10 30 0M45 93q15 10 30 0" fill="none" stroke="#b9dfa7" strokeWidth="2" opacity=".45" />
    </svg>
  );
}

export function HamsaCharm(props: CharmArtworkProps) {
  return (
    <svg viewBox="0 0 120 138" role="img" aria-label="Hamsa charm" {...props}>
      <defs>
        <linearGradient id="hamsa-metal" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#83d0c8" />
          <stop offset="1" stopColor="#347f85" />
        </linearGradient>
      </defs>
      <path d="M52 5h16l5 13-7 8H54l-7-8z" fill="#c99b49" />
      <path
        d="M60 31c-5 0-8 4-8 9v20-27c0-5-3-8-7-8s-7 3-7 8v31-20c0-5-3-8-7-8s-7 3-7 8v34c0 28 15 47 36 47s36-19 36-47V44c0-5-3-8-7-8s-7 3-7 8v20-31c0-5-3-8-7-8s-7 3-7 8v27-20c0-5-3-9-8-9z"
        fill="url(#hamsa-metal)"
        stroke="#2b7077"
        strokeLinejoin="round"
        strokeWidth="2"
      />
      <path d="M38 79q22-19 44 0-22 20-44 0z" fill="#f2eee0" />
      <circle cx="60" cy="79" r="10" fill="#2d9cba" />
      <circle cx="60" cy="79" r="5" fill="#183e53" />
      <path d="M46 101q14 9 28 0" fill="none" stroke="#b6e2d6" strokeLinecap="round" strokeWidth="3" />
    </svg>
  );
}

export function DarumaCharm(props: CharmArtworkProps) {
  return (
    <svg viewBox="0 0 120 136" role="img" aria-label="Daruma charm" {...props}>
      <defs>
        <linearGradient id="daruma-red" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#dc5a4c" />
          <stop offset="1" stopColor="#9e2e35" />
        </linearGradient>
      </defs>
      <path d="M52 5h16l5 13-7 8H54l-7-8z" fill="#c28a42" />
      <path d="M27 88c0-38 13-61 33-61s33 23 33 61c0 28-13 39-33 39S27 116 27 88z" fill="url(#daruma-red)" />
      <ellipse cx="60" cy="60" rx="24" ry="22" fill="#f3dfc5" />
      <path d="M39 50q10-12 19-2M62 48q9-10 19 2" fill="none" stroke="#4a3430" strokeLinecap="round" strokeWidth="4" />
      <circle cx="50" cy="59" r="5" fill="#f8f4e9" stroke="#3c3430" strokeWidth="2" />
      <circle cx="70" cy="59" r="5" fill="#f8f4e9" stroke="#3c3430" strokeWidth="2" />
      <path d="M51 73q9 7 18 0M44 91q16 14 32 0" fill="none" stroke="#f1c7a7" strokeLinecap="round" strokeWidth="3" />
      <path d="M36 105q24 17 48 0" fill="none" stroke="#7e2530" strokeWidth="4" opacity=".55" />
    </svg>
  );
}

export function DrishtiBommaiCharm(props: CharmArtworkProps) {
  return (
    <svg viewBox="0 0 120 140" role="img" aria-label="Drishti Bommai charm" {...props}>
      <path d="M52 5h16l5 13-7 8H54l-7-8z" fill="#c49243" />
      <path d="M31 43 43 27l17 8 17-8 12 16-5 64-24 24-24-24z" fill="#3d5660" />
      <path d="m37 44 9-10 14 7 14-7 9 10" fill="none" stroke="#e4a944" strokeWidth="5" />
      <ellipse cx="45" cy="65" rx="12" ry="14" fill="#f3f0d4" />
      <ellipse cx="75" cy="65" rx="12" ry="14" fill="#f3f0d4" />
      <circle cx="45" cy="66" r="6" fill="#263a42" />
      <circle cx="75" cy="66" r="6" fill="#263a42" />
      <path d="M51 83 60 75l9 8-9 6z" fill="#d47a48" />
      <path d="M42 99q18 17 36 0" fill="#f0e5cf" stroke="#263a42" strokeWidth="3" />
      <path d="M37 111 27 128M83 111l10 17" stroke="#d25552" strokeLinecap="round" strokeWidth="5" />
    </svg>
  );
}

export function ScarabCharm(props: CharmArtworkProps) {
  return (
    <svg viewBox="0 0 120 138" role="img" aria-label="Scarab charm" {...props}>
      <defs>
        <linearGradient id="scarab-wing" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#54b5a7" />
          <stop offset="1" stopColor="#236d72" />
        </linearGradient>
      </defs>
      <path d="M52 5h16l5 13-7 8H54l-7-8z" fill="#d0a34d" />
      <circle cx="60" cy="44" r="14" fill="#2c7777" />
      <ellipse cx="60" cy="88" rx="24" ry="38" fill="url(#scarab-wing)" />
      <path d="M60 51v74M57 62C37 48 24 55 20 72c15-5 26 1 37 12M63 62c20-14 33-7 37 10-15-5-26 1-37 12" fill="none" stroke="#d5b35f" strokeLinecap="round" strokeWidth="4" />
      <path d="M38 81 22 96M82 81l16 15M40 101l-14 18M80 101l14 18" stroke="#28636a" strokeLinecap="round" strokeWidth="5" />
      <path d="M45 83q15-13 30 0M45 102q15 12 30 0" fill="none" stroke="#8cd0bd" strokeWidth="2" opacity=".65" />
    </svg>
  );
}

export function LuckyCoinCharm(props: CharmArtworkProps) {
  return (
    <svg viewBox="0 0 120 132" role="img" aria-label="Lucky coin charm" {...props}>
      <defs>
        <radialGradient id="coin-gold" cx="35%" cy="28%">
          <stop stopColor="#f5db82" />
          <stop offset="1" stopColor="#b77b2e" />
        </radialGradient>
      </defs>
      <path d="M52 5h16l5 13-7 8H54l-7-8z" fill="#b77b2e" />
      <circle cx="60" cy="76" r="44" fill="url(#coin-gold)" stroke="#8d5e29" strokeWidth="3" />
      <circle cx="60" cy="76" r="35" fill="none" stroke="#ffe6a1" strokeWidth="2" opacity=".7" />
      <rect x="48" y="64" width="24" height="24" rx="3" fill="#8b5b2c" />
      <path d="M35 76h10M75 76h10M60 51v10M60 91v10" stroke="#91642f" strokeLinecap="round" strokeWidth="4" />
      <path d="M39 47q21-15 42 0" fill="none" stroke="#fff0b0" strokeWidth="3" opacity=".65" />
    </svg>
  );
}

export function RedKnotCharm(props: CharmArtworkProps) {
  return (
    <svg viewBox="0 0 120 142" role="img" aria-label="Red knot charm" {...props}>
      <path d="M52 5h16l5 13-7 8H54l-7-8z" fill="#c49343" />
      <path d="M60 27v18" stroke="#b73542" strokeLinecap="round" strokeWidth="5" />
      <path
        d="M60 44c-20-20-38 6-19 20-19 14-1 40 19 20 20 20 38-6 19-20 19-14 1-40-19-20zm0 7c9-12 24-2 13 8l-13 12-13-12c-11-10 4-20 13-8z"
        fill="#c93e49"
        stroke="#8f2634"
        strokeLinejoin="round"
        strokeWidth="2"
      />
      <path d="M50 87 39 130M70 87l11 43" stroke="#b73542" strokeLinecap="round" strokeWidth="5" />
      <path d="m39 130-6-11M39 130l10-7M81 130l-10-7M81 130l6-11" stroke="#d95a5b" strokeLinecap="round" strokeWidth="3" />
      <circle cx="60" cy="64" r="6" fill="#e9a54f" />
    </svg>
  );
}

export function EyeBeadCharm(props: CharmArtworkProps) {
  return (
    <svg viewBox="0 0 120 138" role="img" aria-label="Eye bead charm" {...props}>
      <defs>
        <linearGradient id="bead-glass" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#73d3df" />
          <stop offset="1" stopColor="#236c9b" />
        </linearGradient>
      </defs>
      <path d="M52 5h16l5 13-7 8H54l-7-8z" fill="#c69a4a" />
      <circle cx="60" cy="72" r="39" fill="url(#bead-glass)" stroke="#185f85" strokeWidth="3" />
      <path d="M26 72q34-33 68 0-34 33-68 0z" fill="#f4f2e9" />
      <ellipse cx="60" cy="72" rx="18" ry="25" fill="#45a9c6" />
      <ellipse cx="60" cy="72" rx="9" ry="14" fill="#183a53" />
      <ellipse cx="56" cy="66" rx="3" ry="5" fill="#fff" opacity=".85" />
      <circle cx="60" cy="119" r="7" fill="#d5a54b" />
    </svg>
  );
}
