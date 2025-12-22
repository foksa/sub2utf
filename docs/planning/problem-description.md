# Subtitle Encoding Converter

## Problem

Local Plex media server used for streaming movies with Serbian subtitles. Plex only supports UTF-8 encoded subtitles, but downloaded `.srt` files often use Central European encodings (Windows-1250, ISO-8859-2). This causes Serbian special characters (ć, đ, ž, š, č) to render incorrectly.

## Current Workarounds

- Command-line `iconv` — requires knowing source encoding beforehand
- Existing Mac tools — inadequate or clunky for this use case

%% I want something more user friendly, that works on mac, or even better all platforms %%

•%%>Added solution requirements section below with cross-platform, user-friendly options. <%%•

## Solution Requirements

- **Cross-platform**: Works on Mac, Windows, and Linux
- **User-friendly**: No command-line knowledge required
- **Auto-detect encoding**: No need to know source encoding beforehand
- **Batch processing**: Convert multiple files at once

## Potential Approaches

1. **Desktop GUI app** (Electron/Tauri) — drag-and-drop interface, works offline
2. **Web app** — zero install, runs in browser, processes files locally via JavaScript
3. **Python script with GUI** (Tkinter/PyQt) — lightweight, easy to distribute
4. **CLI tool with smart defaults** — auto-detect encoding, simple `convert *.srt` usage

%% I would like something with polished user interface and no dependencies on user system %%

•%%>Web app is the best fit: polished UI, zero install, no dependencies. Runs entirely in browser using JavaScript for encoding detection and conversion. <%%•

%% How good is charset detection.. What if i want to batch process files or even subfolders?%%

•%%>Charset detection is reliable for Serbian/Central European text — enough content in .srt files to detect accurately. For batch/subfolder processing: browsers support folder upload via `webkitdirectory` attribute, and File System Access API allows selecting folders. Updated features below. <%%•

%% You said upload folders... but i have files in folders with movies... i need to change only .srt files%%

•%%>Good point! The app will filter by extension — when you drop a folder, it scans recursively but only processes `.srt` files. Movie files (.mkv, .mp4, etc.) are ignored. Updated below. <%%•

%% What about download then... how do I put files back into respective folders? %%

•%%>Two options: (1) Download as zip preserving folder structure — unzip replaces original files. (2) Use File System Access API to write directly back to original locations (Chrome/Edge only, requires permission). Option 1 is more universal. <%%•

%% I wold like not to download anything... drag .stt, new file .utf8.sr.srt apperas next to it... same for folders %%

•%%>That requires File System Access API — lets the browser write directly to disk. Works in Chrome/Edge, creates `.utf8.sr.srt` next to original. For Safari/Firefox fallback: auto-download with same naming. Updated recommendation below. <%%•

%% Safari is used on mac a lot %%

•%%>True — Safari lacks File System Access API. For Safari: a lightweight native Mac app (Swift/Tauri) might be better, or accept the zip download workflow. Another option: Tauri app — web UI with native file access, works on all platforms including Mac. Tiny binary, no Electron bloat. <%%•

%% Explain me tauri more. Would it work on other platforms. how good is charset detection %%

•%%>**Tauri**: Rust backend + web frontend (HTML/CSS/JS). Builds native apps for Mac, Windows, Linux. ~3-5MB binary vs 150MB+ Electron. Full file system access on all platforms. **Charset detection**: Rust has `chardet` crate (very accurate, port of Mozilla's uchardet). For Serbian/Central European encodings, detection is reliable — .srt files have enough text. Updating recommendation to Tauri below. <%%•

## Recommended: Tauri App

A **cross-platform desktop app** built with Tauri:
- **Native file access** — drag folders, writes `.utf8.sr.srt` next to originals
- **Tiny binary** — ~5MB vs 150MB+ Electron
- **Works on Mac, Windows, Linux** — including Safari users
- **Web UI** — polished React/Vue/Tailwind interface, same as web app
- **Rust backend** — fast, reliable charset detection via `chardet` crate
- **Recursive folder scan** — filters `.srt` only, ignores video files
- **Offline by default** — no internet required

%% This looks like something that might be good for me. Write me tech-spec.md  proposal%%

•%%>Done. Created [tech-spec.md](tech-spec.md) with full technical specification. <%%•

