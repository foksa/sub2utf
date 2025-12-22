# Decisions Summary

Summary of key decisions made during the planning phase for the Subtitle Encoding Converter.

## Tech Stack

| Layer | Decision | Rationale |
|-------|----------|-----------|
| **Frontend** | Svelte + Bulma | Svelte is simpler than React, good for learning. Bulma provides polished defaults out of the box. |
| **Backend** | Tauri + Rust | Native file access on all platforms, tiny binary (~5MB), reliable charset detection. |
| **Build** | Vite | Fast dev server, works well with Svelte and Tauri. |

## Architecture

| Decision | Details |
|----------|---------|
| **Adapter Pattern** | Abstract file operations behind interface. Tauri adapter for desktop, Web adapter for browser. Share 95% of UI code. |
| **Dual Build** | Same codebase produces Tauri desktop app and standalone web app. |

## v1 Scope

**Included:**
- Drag-and-drop single `.srt` files
- Auto-detect encoding with `chardetng`
- Encoding dropdown (override detection per file)
- Language selector (Plex-compatible naming)
- Convert to UTF-8
- Save `.utf8.{lang}.srt` next to original

**Deferred to v2:**
- Folder/batch processing
- Plex forced/SDH subtitle naming

## Encoding Support

| Category | Encodings |
|----------|-----------|
| **Central European** | Windows-1250, ISO-8859-2 |
| **Cyrillic** | Windows-1251, KOI8-R, ISO-8859-5 |
| **Western** | Windows-1252, ISO-8859-1 |
| **Unicode** | UTF-8 (skip if already correct) |

## UI Decisions

| Feature | Decision |
|---------|----------|
| **Encoding dropdown** | Per-file dropdown, auto-selected from detection, user can override |
| **Language selector** | Dropdown for Plex naming (sr, hr, en, etc.) |
| **Status indicators** | Pending, Processing, Done, Skipped, Error |
| **Framework** | Bulma components (no extra component library) |

## File Naming

- Input: `movie.srt`
- Output: `movie.utf8.{lang}.srt` (e.g., `movie.utf8.sr.srt`)
- Non-destructive: original file preserved

## Platform Support

| Platform | Support |
|----------|---------|
| **macOS** | Full (Tauri native) |
| **Windows** | Full (Tauri native) |
| **Linux** | Full (Tauri native) |
| **Web (Chrome/Edge)** | Full with File System Access API |
| **Web (Safari/Firefox)** | Download fallback |