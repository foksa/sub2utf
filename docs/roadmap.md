# Roadmap

Future enhancements for the Subtitle Encoding Converter.

## v0.5 — Web App

Web-first implementation:
- Drag-and-drop `.srt` files
- Auto-detect encoding with chardetng-wasm (Mozilla's Firefox detector compiled to WebAssembly)
- Encoding dropdown — override auto-detected encoding per file
- Language-encoding mismatch warnings
- Per-file language selector — Plex-compatible naming (`movie.{lang}.srt`)
- Convert to UTF-8
- Download converted files (all browsers)
- Configurable settings (encodings, languages) with localStorage persistence
- Svelte 5 + Bulma frontend

## v1.0 — Native App (Current)

Tauri desktop app with native file system access:
- Same Svelte + Bulma UI
- Tauri v2 + Rust backend
- Native drag-drop and file dialog with full path support
- Save converted files next to originals (no dialogs)
- chardetng (native Rust) for encoding detection
- encoding_rs for UTF-8 conversion
- macOS app bundle (10MB)

### Future Improvements
- JSZip bundling for multiple file downloads in web version
- Completion summary after batch conversion
- Evaluate lighter CSS alternatives to Bulma (Pico CSS, Open Props, custom CSS)
- Custom app icons
- Windows and Linux builds

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

- CLI version for scripting
- Integration with subtitle download sites
- Bulk rename tool for Plex naming
