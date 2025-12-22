# Documentation

Documentation for **sub2utf** — a subtitle encoding converter for Plex.

## Planning

Documents from the initial planning and requirements gathering phase.

- [problem-description.md](planning/problem-description.md) — Original problem statement and requirements discussion
- [tech-spec.md](planning/tech-spec.md) — Technical specification with iterative feedback
- [decisions.md](planning/decisions.md) — Summary of all key decisions

## Archive

Historical versions of documents (before iteration/pivots).

- [archive/](archive/) — Original proposals and superseded plans

## Design

Detailed design documents for implementation.

- [architecture.md](architecture.md) — System architecture, adapter pattern for web/native builds
- [ui-spec.md](ui-spec.md) — User interface design, components, states
- [implementation-details.md](implementation-details.md) — Rust API, file structure, dependencies

## Roadmap

- [roadmap.md](roadmap.md) — Version roadmap (v1, v2, v3 features)

## Quick Reference

### Tech Stack
- **Frontend**: Svelte + Bulma
- **Backend**: Tauri + Rust
- **Build**: Vite

### v1 Features
- Drag-and-drop `.srt` files
- Auto-detect encoding
- Encoding dropdown (manual override)
- Language selector (Plex naming)
- Convert to UTF-8
- Save next to original

### Key Files
| Document | Purpose |
|----------|---------|
| [decisions.md](planning/decisions.md) | What we decided and why |
| [architecture.md](architecture.md) | How it's built |
| [ui-spec.md](ui-spec.md) | How it looks |
| [roadmap.md](roadmap.md) | What's next |
