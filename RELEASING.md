# Releasing LuckyDrop

GitHub Actions creates a draft release from every pushed `v*` tag. Build jobs
have read-only repository access; only the final release job can write release
assets.

## Checklist

1. Update the version in `package.json`, `src-tauri/Cargo.toml`, and
   `src-tauri/tauri.conf.json`.
2. Run `pnpm install` so JavaScript and Rust lockfiles are current.
3. Run `pnpm check:version`.
4. Run the frontend checks: `pnpm typecheck`, `pnpm build`, and `pnpm test`.
5. In `src-tauri`, run `cargo fmt --check`, `cargo check`,
   `cargo clippy --all-targets -- -D warnings`, and `cargo test`.
6. Run `pnpm tauri build` and test the local production bundle.
7. Commit the version, lockfiles, documentation, and release changes.
8. For a release candidate, tag and push `v1.0.0-rc.1`. Do not publish it as
   the final release.
9. For the final release, tag and push:

   ```sh
   git tag v1.0.0
   git push origin v1.0.0
   ```

10. Wait for the **Release LuckyDrop** workflow to finish on all platforms.
11. Verify the draft contains exactly:
    - `LuckyDrop_<version>_aarch64.dmg`
    - `LuckyDrop_<version>_x86_64.dmg`
    - `LuckyDrop_<version>_x64-setup.exe`
    - `LuckyDrop_<version>_x86_64.AppImage`
    - `LuckyDrop_<version>_x86_64.deb`
12. Download and test the installers on their native operating systems.
13. Review the generated notes and known limitations.
14. Publish the draft release only after artifact verification succeeds.

## Signing

The first public release is unsigned. Never commit signing certificates,
private keys, passwords, Apple credentials, or API tokens.

Future signing should use encrypted GitHub Actions secrets, with separate
signing steps added to the platform jobs. Likely secret names include:

- `APPLE_CERTIFICATE`
- `APPLE_CERTIFICATE_PASSWORD`
- `APPLE_SIGNING_IDENTITY`
- `APPLE_ID`
- `APPLE_TEAM_ID`
- `WINDOWS_CERTIFICATE`
- `WINDOWS_CERTIFICATE_PASSWORD`

Adding credentials is not sufficient by itself: signing and notarization steps
must be implemented and tested before documentation claims signed artifacts.

## Application identity

The production identifier is `com.luckydrop.desktop`. Changing it later can break
upgrade identity, settings paths, deep-link registration, and operating-system
trust, so treat it as permanent.
