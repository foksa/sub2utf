# Implementation Plan

Step-by-step build order for the Subtitle Encoding Converter. Each step produces a working checkpoint.

## Prerequisites

- Node.js 18+
- Rust toolchain (rustup)
- Tauri CLI (`cargo install tauri-cli`)

## Phase 1: Project Setup

### Step 1.1: Initialize Tauri + Svelte project
```bash
npm create tauri-app@latest subtitle-converter -- --template svelte-ts
cd subtitle-converter
npm install
npm install bulma
```

**Checkpoint**: `npm run tauri dev` opens empty window

### Step 1.2: Configure Bulma
- Import Bulma in `src/app.css`
- Test with a simple button

**Checkpoint**: Bulma-styled button renders

### Step 1.3: Git setup
```bash
git init
git add .
git commit -m "Initial Tauri + Svelte + Bulma setup"
```

---

## Phase 2: Rust Backend

### Step 2.1: Encoding detection command
Create `src-tauri/src/encoding.rs`:
- Add `chardetng` and `encoding_rs` to Cargo.toml
- Implement `detect_encoding(path)` command
- Return encoding name + confidence

**Checkpoint**: Can call from frontend, logs detected encoding

### Step 2.2: File conversion command
- Implement `convert_file(path, encoding, lang)` command
- Read file with detected/specified encoding
- Write UTF-8 file with `.utf8.{lang}.srt` suffix

**Checkpoint**: Converting a test `.srt` file works

### Step 2.3: Git checkpoint
```bash
git add .
git commit -m "Add Rust encoding detection and conversion"
```

---

## Phase 3: Frontend Components

### Step 3.1: DropZone component
- Create `src/components/DropZone.svelte`
- Drag-and-drop zone with Bulma file upload styling
- Accept only `.srt` files
- Emit file list on drop

**Checkpoint**: Can drop files, see them logged

### Step 3.2: File store
- Create `src/stores/files.ts`
- Svelte writable store for file list
- File state: path, encoding, status, error

**Checkpoint**: Store updates when files dropped

### Step 3.3: FileList and FileItem components
- Create `src/components/FileList.svelte`
- Create `src/components/FileItem.svelte`
- Display file name, detected encoding, status icon

**Checkpoint**: Dropped files appear in list

### Step 3.4: Git checkpoint
```bash
git add .
git commit -m "Add DropZone, FileList, FileItem components"
```

---

## Phase 4: Integration

### Step 4.1: Wire up encoding detection
- On file drop, call Rust `detect_encoding` for each file
- Update store with detected encoding
- Show encoding in FileItem

**Checkpoint**: Dropped files show detected encoding

### Step 4.2: EncodingSelect component
- Create `src/components/EncodingSelect.svelte`
- Dropdown with supported encodings
- Pre-select detected encoding
- User can override

**Checkpoint**: Can change encoding per file

### Step 4.3: LanguageSelect component
- Create `src/components/LanguageSelect.svelte`
- Dropdown with language codes (sr, hr, en, etc.)
- Default to "sr"

**Checkpoint**: Can select output language

### Step 4.4: Git checkpoint
```bash
git add .
git commit -m "Integrate encoding detection, add selectors"
```

---

## Phase 5: Conversion Flow

### Step 5.1: Convert button
- Add "Convert All" button
- On click, iterate files and call `convert_file`
- Update status: pending → processing → done/error

**Checkpoint**: Files convert with status updates

### Step 5.2: Error handling
- Display errors in FileItem
- Continue processing other files on error
- Show summary when complete

**Checkpoint**: Errors display correctly, batch continues

### Step 5.3: Skip UTF-8 files
- If detected encoding is UTF-8, mark as "skipped"
- Don't call convert for these

**Checkpoint**: UTF-8 files show skipped status

### Step 5.4: Git checkpoint
```bash
git add .
git commit -m "Complete conversion flow with error handling"
```

---

## Phase 6: Polish

### Step 6.1: UI refinement
- Add app title/header
- Style file list table
- Add progress feedback during conversion
- Clear file list button

### Step 6.2: Window configuration
- Set window title in `tauri.conf.json`
- Set default window size
- Add app icon

### Step 6.3: Final testing
- Test with various encodings (Windows-1250, ISO-8859-2, Cyrillic)
- Test error cases (read-only location, invalid files)
- Test on macOS, Windows if possible

### Step 6.4: Git checkpoint
```bash
git add .
git commit -m "UI polish and configuration"
```

---

## Phase 7: Release

### Step 7.1: Build production binaries
```bash
npm run tauri build
```

### Step 7.2: GitHub release
- Create GitHub repository
- Push code
- Create release with binaries
- Write release notes

### Step 7.3: README
- Update root README.md with:
  - Project description
  - Screenshots
  - Download links
  - Build instructions

---

## File Checklist

After all phases, project should have:

```
subtitle-converter/
├── src/
│   ├── App.svelte
│   ├── app.css
│   ├── components/
│   │   ├── DropZone.svelte
│   │   ├── FileList.svelte
│   │   ├── FileItem.svelte
│   │   ├── EncodingSelect.svelte
│   │   └── LanguageSelect.svelte
│   └── stores/
│       └── files.ts
├── src-tauri/
│   ├── src/
│   │   ├── main.rs
│   │   ├── lib.rs
│   │   └── encoding.rs
│   ├── Cargo.toml
│   └── tauri.conf.json
├── docs/
│   └── (planning docs)
├── package.json
├── vite.config.ts
├── svelte.config.js
└── README.md
```

---

## PR Strategy

Each phase can be a separate PR for review:

1. **PR #1**: Project setup (Phase 1)
2. **PR #2**: Rust backend (Phase 2)
3. **PR #3**: Frontend components (Phase 3)
4. **PR #4**: Integration (Phase 4)
5. **PR #5**: Conversion flow (Phase 5)
6. **PR #6**: Polish (Phase 6)

Or combine into fewer PRs:
- **PR #1**: Setup + Backend (Phases 1-2)
- **PR #2**: Frontend + Integration (Phases 3-4)
- **PR #3**: Conversion + Polish (Phases 5-6)
