# sub2utf

Convert subtitle files (.srt) from various encodings to UTF-8 for Plex compatibility.

## Problem

Plex requires UTF-8 encoded subtitles. Downloaded subtitle files (especially for Serbian, Croatian, Polish, etc.) often use legacy encodings like Windows-1250 or ISO-8859-2, causing special characters to display incorrectly.

## Solution

- **Web app**: https://sub2utf.org - works in any browser
- **Desktop app**: Native apps for macOS, Windows, Linux - saves files directly without dialogs

Both versions auto-detect encoding and convert to UTF-8 with Plex-compatible naming.

## Download

Get the latest release from [GitHub Releases](https://github.com/foksa/sub2utf/releases).

**Note:** Apps are unsigned. See [Code Signing](docs/roadmap.md#code-signing) for workarounds:
- **macOS**: Run `xattr -cr /Applications/sub2utf.app` then open
- **Windows**: Click "More info" → "Run anyway"

## Build from Source

### Prerequisites

- [Node.js](https://nodejs.org/) 18+
- [Rust](https://rustup.rs/) (for native app)

### Web App

```bash
cd app
npm install
npm run dev      # Development server
npm run build    # Production build (outputs to dist/)
```

### Native App (Tauri)

```bash
cd app
npm install
npm run tauri dev      # Development with hot reload
npm run tauri build    # Production build
```

Build outputs:
- **macOS**: `app/src-tauri/target/release/bundle/dmg/`
- **Windows**: `app/src-tauri/target/release/bundle/msi/`
- **Linux**: `app/src-tauri/target/release/bundle/appimage/`

#### Platform-specific dependencies

**Ubuntu/Debian:**
```bash
sudo apt install libwebkit2gtk-4.1-dev libappindicator3-dev librsvg2-dev patchelf
```

**macOS:** Xcode Command Line Tools
```bash
xcode-select --install
```

**Windows:** [Visual Studio Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/) with C++ workload

## Tech Stack

- **Frontend**: Svelte 5 + Pico CSS
- **Native Backend**: Tauri v2 + Rust
- **Encoding Detection**: chardetng (Mozilla's Firefox detector)
- **Build**: Vite

## Documentation

- [Architecture](docs/architecture.md)
- [Roadmap](docs/roadmap.md)

## License

MIT
