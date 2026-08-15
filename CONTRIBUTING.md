# Contributing to LuckyDrop

Thank you for helping make LuckyDrop better. Keep pull requests focused,
reviewable, and respectful of the cultural traditions represented by its
charms.

## Setup

Install the [Tauri prerequisites](https://tauri.app/start/prerequisites/) for
your platform, Node.js 22, pnpm, and stable Rust.

```sh
pnpm install
pnpm tauri dev
```

Frontend-only development is available with `pnpm dev`, but native windows,
tray integration, desktop presence, and deep links require Tauri.

## Tests and quality checks

Before opening a pull request, run:

```sh
pnpm check:version
pnpm typecheck
pnpm build
pnpm test
cd src-tauri
cargo fmt --check
cargo check
cargo clippy --all-targets -- -D warnings
cargo test
```

For native or packaging changes, also run `pnpm tauri build` on an affected
platform.

## Pull requests

- Create a focused branch and keep unrelated cleanup out of the change.
- Explain the user-facing reason for the change and how it was tested.
- Add or update tests when behavior changes.
- Do not commit generated build output, credentials, certificates, or secrets.
- Preserve accessibility, reduced-motion behavior, privacy, and offline use.
- Expect platform-specific changes to need testing on that operating system.

## Adding a charm

1. Research the symbol and use culturally respectful, factual language.
2. Create original local SVG artwork in `src/charms/artwork.tsx`. Do not copy
   third-party assets.
3. Add its typed ID to `src/types/settings.ts` and the Rust allowlist in
   `src-tauri/src/settings/mod.rs`.
4. Add metadata, region, description, scale, accent, and ritual to
   `src/charms/registry.ts`.
5. Ensure the artwork works with every thread, at every supported scale, in
   light and dark appearances.
6. Keep animation transform origins attached to the thread and honor reduced
   motion.
7. Update registry tests and manually verify the desktop and collection views.

By participating, you agree to follow [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).
