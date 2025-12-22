# sub2utf

Convert subtitle files (.srt) from various encodings to UTF-8 for Plex compatibility.

## Problem

Plex requires UTF-8 encoded subtitles. Downloaded subtitle files (especially for Serbian, Croatian, Polish, etc.) often use legacy encodings like Windows-1250 or ISO-8859-2, causing special characters to display incorrectly.

## Solution

A lightweight desktop app that:
- Auto-detects source encoding
- Converts to UTF-8
- Saves with Plex-compatible naming (`movie.utf8.sr.srt`)

## Tech Stack

- **Frontend**: Svelte + Bulma
- **Backend**: Tauri + Rust
- **Build**: Vite

## Status

Planning complete. Implementation starting.

## Documentation

See [docs/](docs/) for detailed documentation:
- [Architecture](docs/architecture.md)
- [Implementation Plan](docs/implementation-plan.md)
- [Roadmap](docs/roadmap.md)

## License

MIT
