# Technical Specification: Subtitle Encoding Converter

## Overview

A cross-platform desktop application built with Tauri that converts subtitle files (.srt) from various encodings to UTF-8 for Plex compatibility.

## Problem Statement

Plex media server requires UTF-8 encoded subtitles. Downloaded Serbian subtitle files often use Central European encodings (Windows-1250, ISO-8859-2), causing special characters (ć, đ, ž, š, č) to display incorrectly.

## Solution

A lightweight Tauri app with:
- Drag-and-drop interface for files and folders
- Automatic encoding detection
- In-place conversion (creates `.utf8.sr.srt` next to original)

## Architecture

```
┌─────────────────────────────────────────┐
│           Frontend (Web UI)             │
│  ┌───────────────────────────────────┐  │
│  │  React + TypeScript + Tailwind    │  │
│  │  - Drag-and-drop zone             │  │
│  │  - File list with status          │  │
│  │  - Progress indicators            │  │
│  └───────────────────────────────────┘  │
├─────────────────────────────────────────┤
│           Tauri IPC Bridge              │
├─────────────────────────────────────────┤
│           Backend (Rust)                │
│  ┌───────────────────────────────────┐  │
│  │  - File system operations         │  │
│  │  - Charset detection (chardetng)  │  │
│  │  - Encoding conversion            │  │
│  │  - Recursive folder scanning      │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

## Tech Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS
- **Build**: Vite
- **State**: React hooks (simple enough, no Redux needed)

%% I don't wanna go with react with this. I think this would be good enough app for me to play with svelte. Also I like bulma, and even out of the box state it would fit nicely into UI for this app %%

•%%>Svelte + Bulma is a great combo! Svelte is simpler than React, perfect for learning. Bulma's clean defaults will look polished out of the box. Updated stack below. <%%•

%% ?: Do we need any component library?%%

•%%>No — Bulma provides all the UI components you need (buttons, cards, progress bars, file upload styling). No extra library required. <%%•

%% Svelte + Bulma it is then %%

•%%>Done. <%%•

%% ?: Can we use this frontend for webapp also? %%

•%%>Yes! Same Svelte code can run as: (1) Tauri desktop app with native file access, (2) standalone web app with File System Access API (Chrome/Edge) or download fallback. Share 95% of the code. <%%•

%% Can we build both from same project? We need to take special care about architecture, to make web / native functionality switchable %%

•%%>Yes! Use an adapter pattern: abstract file operations behind an interface. Tauri adapter uses Rust IPC, Web adapter uses File System Access API + jschardet. Same Svelte components, swap adapter at build time. Will detail in architecture doc. <%%•

%% Create architecture docs and put details there %%

•%%>Created [architecture.md](architecture.md) with adapter pattern details for web/native builds. <%%•

### Backend (Rust)
- **Framework**: Tauri 2.x
- **Charset detection**: `chardetng` crate (Mozilla's uchardet port)
- **Encoding conversion**: `encoding_rs` crate
- **File walking**: `walkdir` crate
%% I'm not familiar with rust, how complicated this part would be? %%

•%%>Not complicated — Tauri handles most boilerplate. The Rust code is ~100-150 lines: read file → detect encoding → convert → write. Crates do the heavy lifting. I can provide copy-paste code. <%%•

%% How precise charset detection is? %%

•%%>`chardetng` is very accurate for Central European/Cyrillic text. For .srt files with dialogue, expect 95%+ accuracy. It analyzes byte patterns and character frequencies. Falls back to user-selected encoding if confidence is low. <%%•

%% We need to handle that fallback. Maybe some dropdown in UI also%%

•%%>Good idea — add encoding dropdown per file. Auto-select detected encoding, but user can override. Will include in UI spec. <%%•

## Core Features

### 1. File Input
- Drag-and-drop files or folders onto app window
- Click to open file/folder picker
- Filter: only `.srt` files processed, others ignored

%%Lets start with files only for first version, add folders support later%%

•%%>Agreed — files-only for v1. Simpler UX, faster to ship. Folder support as v2 feature. <%%•

### 2. Encoding Detection
- Auto-detect source encoding using `chardetng`
- Supported encodings:
  - Windows-1250 (Central European)
  - ISO-8859-2 (Latin-2)
  - UTF-8 (already correct, skip)
  - Windows-1252 (Western European)
  - ISO-8859-1 (Latin-1)

%%Does this support Cyrillic letters? From time to time that is only subtitle I can find%%

•%%>Yes! `chardetng` and `encoding_rs` support Cyrillic encodings: Windows-1251, KOI8-R, ISO-8859-5. Adding to supported list. <%%•

### 3. Conversion
- Convert detected encoding → UTF-8
- Output filename: `original.srt` → `original.utf8.sr.srt`
- Preserve original file (non-destructive)

%% This is not problem only for Serbia. Other Balkan counties have similar issue. Probably more countries in the world %%

•%%>Correct — affects Croatia, Bosnia, Slovenia, Poland, Czech Republic, Hungary, and more. Also CJK countries with their encodings. The tool is useful globally, not just for Serbian. <%%•

%% We should probably add some way for user to select language of generated subtitle. I think there is some rule how Plex recognizes for what language subtitles are %%

•%%>Plex uses filename suffixes: `movie.sr.srt` for Serbian, `movie.en.srt` for English. We can add a language selector dropdown. Output: `movie.utf8.sr.srt`. Will research full Plex naming conventions. <%%•

%% TODO: Need to investigate this %%

•%%> NOTE: Keeping as future research item. <%%•

### 4. Folder Processing
- Recursive scan of subfolders
- Process all `.srt` files found
- Ignore video files (.mkv, .mp4, .avi, etc.)
- Show progress for batch operations

%% Leave folders for later %%

•%%>Agreed — deferring to v2. <%%•

%% Move all future improvements to new v2 roadmap document %%

•%%>Created [roadmap.md](roadmap.md) with v2 features: folder processing, language selector, Plex naming conventions, encoding override dropdown. <%%•

%% I think Encoding dropdown and language selector should be v1 features %%

•%%>Agreed — moving encoding dropdown and language selector to v1. Updated roadmap. These are essential for usability. <%%•

## User Interface

%% Create separate file for user interface, we need to discuss this in more detail %%

•%%>Created [ui-spec.md](ui-spec.md) with detailed UI discussion. Moving wireframes and states there. Includes encoding dropdown and language selector from comments above. <%%•

%% There are some comments above that also might affect interface %%

•%%>Noted — UI spec incorporates: encoding dropdown override, language selector for Plex naming. <%%•

### Main Window
```
┌────────────────────────────────────────────────┐
│  Subtitle Converter                        [─] │
├────────────────────────────────────────────────┤
│                                                │
│     ┌──────────────────────────────────┐       │
│     │                                  │       │
│     │   Drop .srt files or folders    │       │
│     │         here                     │       │
│     │                                  │       │
│     │      📁 or click to browse       │       │
│     │                                  │       │
│     └──────────────────────────────────┘       │
│                                                │
│  Files:                                        │
│  ┌──────────────────────────────────────────┐  │
│  │ movie1.srt     Windows-1250    ✓ Done    │  │
│  │ movie2.srt     ISO-8859-2      ✓ Done    │  │
│  │ movie3.srt     UTF-8           ⊘ Skipped │  │
│  │ movie4.srt     Windows-1250    ⟳ Processing│ │
│  └──────────────────────────────────────────┘  │
│                                                │
│  [Convert All]                    4 files      │
└────────────────────────────────────────────────┘
```

### States
- **Pending**: File queued, encoding detected
- **Processing**: Currently converting
- **Done**: Successfully converted
- **Skipped**: Already UTF-8
- **Error**: Conversion failed (show reason)

%% Move implementation details into separate file, no need for it here until we decide on stack / flow %%

•%%>Done — moving Rust API, Types, File Structure, Dependencies to [implementation-details.md](implementation-details.md). Will update for Svelte + Bulma stack once confirmed. <%%•

## Future Enhancements

- Settings panel (default encoding fallback, output naming)
- Preview converted text before saving
- Undo/restore original
- Watch folder for auto-conversion
- Menu bar icon for quick access

%% This also belongs in v2 roadmap %%

•%%>Moved to roadmap under v3 power user features. <%%•

%% This looks good to me now.
Create new document where we summarize our decision
Create new folder called planning and put this and problem-description.md there
See if any documents need update, like implementation-details.md
Create README.MD in this folder where you link all the files and write brief description %%

•%%>Done. Created:
- [decisions.md](planning/decisions.md) — summary of all decisions
- [planning/](planning/) folder with problem-description.md and tech-spec.md
- Updated implementation-details.md for Svelte + Bulma
- [README.md](README.md) with links to all docs <%%•

%% I like our final decision. We need some implementation plan to use now when we start coding %%

•%%>Created [implementation-plan.md](implementation-plan.md) with step-by-step build order. Each step produces a working checkpoint. <%%•

%% After that add git version control to this project anc commit everything %%

•%%>Done. Initialized git, created .gitignore, committed all planning docs. Ready for development. <%%•

%% This will be open source project, so we will need to add this to github also, but let's discuss that in chat, still need some nice name for it :) %%

•%%>Sounds good — let's brainstorm names in chat. Some quick ideas: SubFix, PlexSub, SubShift, Titlify, SRTify... <%%•
