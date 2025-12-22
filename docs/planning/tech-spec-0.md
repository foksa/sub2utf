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

### Backend (Rust)
- **Framework**: Tauri 2.x
- **Charset detection**: `chardetng` crate (Mozilla's uchardet port)
- **Encoding conversion**: `encoding_rs` crate
- **File walking**: `walkdir` crate

## Core Features

### 1. File Input
- Drag-and-drop files or folders onto app window
- Click to open file/folder picker
- Filter: only `.srt` files processed, others ignored

### 2. Encoding Detection
- Auto-detect source encoding using `chardetng`
- Supported encodings:
  - Windows-1250 (Central European)
  - ISO-8859-2 (Latin-2)
  - UTF-8 (already correct, skip)
  - Windows-1252 (Western European)
  - ISO-8859-1 (Latin-1)

### 3. Conversion
- Convert detected encoding → UTF-8
- Output filename: `original.srt` → `original.utf8.sr.srt`
- Preserve original file (non-destructive)

### 4. Folder Processing
- Recursive scan of subfolders
- Process all `.srt` files found
- Ignore video files (.mkv, .mp4, .avi, etc.)
- Show progress for batch operations

## User Interface

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

## Rust Backend API

### Commands (Tauri IPC)

```rust
#[tauri::command]
async fn detect_encoding(path: String) -> Result<EncodingInfo, String>

#[tauri::command]
async fn convert_file(path: String) -> Result<ConversionResult, String>

#[tauri::command]
async fn scan_folder(path: String) -> Result<Vec<FileInfo>, String>

#[tauri::command]
async fn convert_batch(paths: Vec<String>) -> Result<BatchResult, String>
```

### Types

```rust
struct EncodingInfo {
    path: String,
    encoding: String,
    confidence: f32,
}

struct ConversionResult {
    original_path: String,
    output_path: String,
    original_encoding: String,
    success: bool,
    error: Option<String>,
}

struct FileInfo {
    path: String,
    relative_path: String,
    encoding: String,
    size: u64,
}

struct BatchResult {
    total: usize,
    converted: usize,
    skipped: usize,
    failed: usize,
    results: Vec<ConversionResult>,
}
```

## File Structure

```
subtitle-converter/
├── src/                    # React frontend
│   ├── App.tsx
│   ├── components/
│   │   ├── DropZone.tsx
│   │   ├── FileList.tsx
│   │   └── FileItem.tsx
│   ├── hooks/
│   │   └── useConverter.ts
│   └── styles/
│       └── index.css
├── src-tauri/              # Rust backend
│   ├── src/
│   │   ├── main.rs
│   │   ├── commands.rs
│   │   ├── encoding.rs
│   │   └── converter.rs
│   ├── Cargo.toml
│   └── tauri.conf.json
├── package.json
├── vite.config.ts
└── tailwind.config.js
```

## Build & Distribution

### Development
```bash
npm install
npm run tauri dev
```

### Production Build
```bash
npm run tauri build
```

### Output
- **macOS**: `.dmg` installer (~5MB)
- **Windows**: `.msi` installer (~5MB)
- **Linux**: `.AppImage` or `.deb` (~5MB)

## Dependencies

### Frontend (package.json)
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@tauri-apps/api": "^2.0.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "vite": "^5.0.0",
    "@vitejs/plugin-react": "^4.0.0",
    "tailwindcss": "^3.4.0",
    "@tauri-apps/cli": "^2.0.0"
  }
}
```

### Backend (Cargo.toml)
```toml
[dependencies]
tauri = { version = "2.0", features = ["shell-open"] }
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0"
chardetng = "0.1"
encoding_rs = "0.8"
walkdir = "2.4"
tokio = { version = "1", features = ["full"] }
```

## Error Handling

- **Unreadable file**: Show error, continue with others
- **Unknown encoding**: Fallback to Windows-1250 (most common for Serbian)
- **Write permission denied**: Alert user, suggest different location
- **Disk full**: Alert user before partial write

## Future Enhancements

- Settings panel (default encoding fallback, output naming)
- Preview converted text before saving
- Undo/restore original
- Watch folder for auto-conversion
- Menu bar icon for quick access
