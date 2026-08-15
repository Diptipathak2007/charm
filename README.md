# LuckyDrop

A little lucky charm for your desktop.

LuckyDrop is a free, open-source desktop companion for macOS, Windows, and
Linux. Pick a charm, hang it from the top edge of the desktop, and give it a
flick when a moment could use a little luck.

## Features

- 12 original vector charms, each with a small interaction
- Lightweight spring physics and drag-to-position placement
- Six interchangeable thread styles and live size controls
- Continuous, screen-aware horizontal positioning
- Desktop-only behavior that stays behind other applications
- System tray controls and `Cmd/Ctrl + Shift + L` visibility shortcut
- Local settings with no account, backend, analytics, or telemetry
- `luckydrop://` deep links and single-instance application behavior
- Reduced-motion support

## Download and install

Download the latest files from the repository's **Releases** page.

### macOS

Download the DMG for Apple Silicon (`aarch64`) or Intel (`x86_64`), open it,
and drag LuckyDrop to Applications.

The first public builds are not signed or notarized. macOS may block the first
launch. If it does, right-click LuckyDrop and choose **Open**, or use the
**Open Anyway** control in **System Settings → Privacy & Security**. Do not
disable Gatekeeper globally.

LuckyDrop uses Tauri's macOS private API support for transparent windows. It is
distributed directly and is not intended for the Mac App Store.

### Windows

Download and run `LuckyDrop_<version>_x64-setup.exe`. The first public builds
are unsigned, so Windows SmartScreen may display an unknown-publisher warning.

### Linux

The AppImage is the generic Linux download:

```sh
chmod +x LuckyDrop_<version>_x86_64.AppImage
./LuckyDrop_<version>_x86_64.AppImage
```

Debian and Ubuntu users can instead install the `.deb` package.

Strict desktop-only presence requires an X11 session. Wayland compositors do
not expose the global foreground-window APIs this behavior needs. Transparency
also requires a compositor.

## Deep links

Packaged builds register the `luckydrop://` scheme. A link such as:

```text
luckydrop://choose?charm=nazar
```

opens the existing LuckyDrop process, selects the requested known charm, and
opens customization. Unknown charm identifiers are rejected. Deep links are
handled by the same single-instance process, so repeated launches do not create
competing charm windows.

## Privacy

LuckyDrop has no account system or backend. It includes no analytics,
advertising, telemetry, or tracking. Preferences are validated and written to a
JSON file in the operating system's local application configuration directory.
No charm settings are sent anywhere.

## Development

Install the [Tauri prerequisites](https://tauri.app/start/prerequisites/) for
your operating system, plus Node.js 22, pnpm, and stable Rust.

```sh
pnpm install
pnpm tauri dev
```

Run the complete local checks:

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

Build a production installer for the current platform:

```sh
pnpm tauri build
```

## Releases

Application version `1.0.0` is kept in `package.json`,
`src-tauri/Cargo.toml`, and `src-tauri/tauri.conf.json`. Update all three for a
future release and run `pnpm check:version`.

After the release commit is on the default branch:

```sh
git tag v1.0.0
git push origin v1.0.0
```

The tag-triggered GitHub Actions workflow builds native installers on macOS,
Windows, and Linux, validates the expected files, and creates a draft GitHub
Release. Test the downloaded installers before publishing the draft. See
[RELEASING.md](RELEASING.md) for the full checklist.

## Contributing and security

See [CONTRIBUTING.md](CONTRIBUTING.md) for development and charm contribution
guidance. Please follow the [Code of Conduct](CODE_OF_CONDUCT.md). Security
issues should be reported as described in [SECURITY.md](SECURITY.md).

LuckyDrop is available under the [MIT License](LICENSE).
