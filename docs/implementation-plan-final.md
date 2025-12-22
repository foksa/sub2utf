# Implementation Plan (Final)

Step-by-step build order for sub2utf. Each step produces a working checkpoint.

> **Approach: Web-First**
>
> Build web app first (v0.5), then wrap in Tauri (v1.0).
> - Faster iteration with hot reload
> - Same Svelte + Bulma UI carries over to native
> - File System Access API provides native-like saving in Chrome/Edge

---

## Prerequisites

- Node.js 18+
- Chrome or Edge (for File System Access API)

---

## Phase 1: Project Setup

### Step 1.1: Initialize Svelte project
```bash
npm create vite@latest sub2utf -- --template svelte-ts
cd sub2utf
npm install
npm install bulma jschardet
```

**Checkpoint**: `npm run dev` opens in browser

### Step 1.2: Configure Bulma
- Import Bulma in `src/app.css`
- Test with a simple button

**Checkpoint**: Bulma-styled button renders

### Step 1.3: Git setup
```bash
git init
git add .
git commit -m "Initial Svelte + Bulma setup"
```

---

## Phase 2: Web Adapter

### Step 2.1: Adapter types
Create `src/lib/adapters/types.ts`:
- Define `EncodingInfo` and `ConversionResult` interfaces
- Define `FileAdapter` interface

**Checkpoint**: Types compile without errors

### Step 2.2: Web adapter implementation
Create `src/lib/adapters/web.ts`:
- Implement `detectEncoding()` using jschardet
- Implement `convertFile()` using TextDecoder/TextEncoder
- Implement `saveFile()` using File System Access API with download fallback

**Checkpoint**: Can detect encoding of a test file in browser console

### Step 2.3: Git checkpoint
```bash
git add .
git commit -m "Add web adapter with jschardet encoding detection"
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
- File state: name, file object, encoding, confidence, status, error

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
- On file drop, call `adapter.detectEncoding()` for each file
- Update store with detected encoding and confidence
- Show encoding in FileItem
- Show warning icon when confidence < threshold (default 0.7)

**Checkpoint**: Dropped files show detected encoding with confidence indicator

### Step 4.2: EncodingSelect component
- Create `src/components/EncodingSelect.svelte`
- Dropdown with supported encodings (from settings)
- Pre-select detected encoding
- User can override

**Checkpoint**: Can change encoding per file

### Step 4.3: LanguageSelect component
- Create `src/components/LanguageSelect.svelte`
- Dropdown with language codes (from settings)
- Default to configured language (default: sr)

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
- On click, iterate files and call `adapter.convertFile()`
- Update status: pending → processing → done/error

**Checkpoint**: Files convert with status updates

### Step 5.2: Save files
- Call `adapter.saveFile()` for each converted file
- Chrome/Edge: saves next to original (File System Access API)
- Other browsers: use JSZip to bundle multiple files, trigger single download

**Checkpoint**: Converted files are saved/downloaded

### Step 5.3: Error handling
- Display errors in FileItem
- Continue processing other files on error
- Show summary when complete

**Checkpoint**: Errors display correctly, batch continues

### Step 5.4: Skip UTF-8 files
- If detected encoding is UTF-8, mark as "skipped"
- Don't call convert for these

**Checkpoint**: UTF-8 files show skipped status

### Step 5.5: Git checkpoint
```bash
git add .
git commit -m "Complete conversion flow with error handling"
```

---

## Phase 6: Polish

### Step 6.1: UI refinement
- Add app title/header with settings gear icon
- Style file list table
- Add progress feedback during conversion
- Clear file list button

### Step 6.2: Settings panel
- Create `src/components/Settings.svelte`
- Create `src/stores/settings.ts`
- Settings:
  - Confidence threshold (default: 0.7)
  - Encoding list (editable)
  - Language list (editable)
  - Default language
- Persist to localStorage

**Checkpoint**: Settings saved and loaded on refresh

### Step 6.3: Browser compatibility notice
- Detect if File System Access API is available
- Show notice for Safari/Firefox users about download-only mode

### Step 6.4: Final testing
- Test with various encodings (Windows-1250, ISO-8859-2, Cyrillic)
- Test in Chrome, Edge, Firefox, Safari
- Test error cases (invalid files)

### Step 6.5: Git checkpoint
```bash
git add .
git commit -m "UI polish, settings panel, browser compatibility"
```

---

## Phase 7: Deploy Web Version (v0.5)

### Step 7.1: Build for production
```bash
npm run build
```

### Step 7.2: Deploy
- Deploy to GitHub Pages, Netlify, or Vercel
- Update README with live demo link

### Step 7.3: Tag release
```bash
git tag v0.5.0
git push origin v0.5.0
```

---

## Phase 8: Tauri Wrapper (v1.0)

*Future phase - add native app wrapper after web version is stable*

### Step 8.1: Add Tauri
```bash
npm install @tauri-apps/cli @tauri-apps/api
npm run tauri init
```

### Step 8.2: Tauri adapter
Create `src/lib/adapters/tauri.ts`:
- Implement same interface using Rust IPC
- Use chardetng for better encoding detection

### Step 8.3: Rust backend
- Implement `detect_encoding` command
- Implement `convert_file` command

### Step 8.4: Build and release
```bash
npm run tauri build
```

---

## File Checklist (v0.5 Web)

After phases 1-7, project should have:

```
sub2utf/
├── src/
│   ├── App.svelte
│   ├── app.css
│   ├── main.ts
│   ├── components/
│   │   ├── DropZone.svelte
│   │   ├── FileList.svelte
│   │   ├── FileItem.svelte
│   │   ├── EncodingSelect.svelte
│   │   ├── LanguageSelect.svelte
│   │   └── Settings.svelte
│   ├── lib/
│   │   └── adapters/
│   │       ├── types.ts
│   │       ├── web.ts
│   │       └── index.ts
│   └── stores/
│       ├── files.ts
│       └── settings.ts
├── docs/
│   └── (planning docs)
├── package.json
├── vite.config.ts
├── svelte.config.js
└── README.md
```

---

## PR Strategy

Each phase can be a separate PR:

1. **PR #1**: Project setup (Phase 1)
2. **PR #2**: Web adapter (Phase 2)
3. **PR #3**: Frontend components (Phase 3)
4. **PR #4**: Integration (Phase 4)
5. **PR #5**: Conversion flow (Phase 5)
6. **PR #6**: Polish (Phase 6)
7. **PR #7**: Tauri wrapper (Phase 8) - future
