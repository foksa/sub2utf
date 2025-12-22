# Roadmap

Future enhancements for the Subtitle Encoding Converter.

## v0.5 — Web App (Current)

Web-first implementation:
- Drag-and-drop `.srt` files
- Auto-detect encoding with chardetng-wasm (Mozilla's Firefox detector compiled to WebAssembly)
- Encoding dropdown — override auto-detected encoding per file
- Language-encoding mismatch warnings
- Per-file language selector — Plex-compatible naming (`movie.{lang}.srt`)
- Convert to UTF-8
- File System Access API for Chrome/Edge (save next to original)
- Download fallback for Safari/Firefox
- Configurable settings (encodings, languages) with localStorage persistence
- Svelte 5 + Bulma frontend

### Future Web Improvements
- JSZip bundling for multiple file downloads in Safari/Firefox
- Completion summary after batch conversion

## v1.0 — Native App (Tauri)

Wrap web app in Tauri for native experience:
- Same Svelte + Bulma UI
- Tauri + Rust backend
- Native file system access (all platforms) — save next to original without dialogs
- Same chardetng detection (native Rust instead of WASM)

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
