# Roadmap

Future enhancements for the Subtitle Encoding Converter.

## v1.0 — MVP

Core functionality:
- Drag-and-drop single `.srt` files
- Auto-detect encoding
- **Encoding dropdown** — override auto-detected encoding per file
- **Language selector** — Plex-compatible naming (`movie.utf8.{lang}.srt`)
- Convert to UTF-8
- Save next to original file
- Svelte + Bulma frontend
- Tauri + Rust backend

## v2.0 — Batch Processing

### Folder Processing
- Recursive folder scanning
- Filter `.srt` files only
- Batch progress indicators
- Preserve folder structure in output

### Plex Naming Conventions
- Investigate Plex subtitle naming rules
- Support forced subtitles (`movie.sr.forced.srt`)
- Support SDH subtitles (`movie.sr.sdh.srt`)

## v3.0 — Power User Features

### Settings Panel
- Default encoding fallback
- Output naming pattern customization
- Default language selection

### Preview Mode
- Show converted text before saving
- Side-by-side comparison (original vs UTF-8)

### Undo/Restore
- Keep backup of original file
- One-click restore

### Watch Folder
- Auto-convert new files in watched folder
- Background service / menu bar icon

## Future Ideas

- Web app version (same Svelte UI, browser-based)
- CLI version for scripting
- Integration with subtitle download sites
- Bulk rename tool for Plex naming
