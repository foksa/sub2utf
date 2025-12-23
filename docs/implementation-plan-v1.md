# Implementation Plan: v0.5 → v1.0 (Tauri)

Step-by-step plan to wrap the web app in Tauri for native desktop experience.

> **Goal**: Same UI, native file system access on all platforms, no browser limitations.

---

## Prerequisites

- Rust toolchain (rustup)
- Node.js 18+
- Platform-specific dependencies:
  - macOS: Xcode Command Line Tools
  - Windows: Microsoft Visual Studio C++ Build Tools
  - Linux: `webkit2gtk`, `libappindicator3`

---

## Phase 1: Tauri Setup

### Step 1.1: Install Tauri CLI
```bash
cd webapp
npm install -D @tauri-apps/cli@latest
```

### Step 1.2: Initialize Tauri
```bash
npm run tauri init
```

Configuration prompts:
- App name: `sub2utf`
- Window title: `sub2utf`
- Web assets location: `../dist`
- Dev server URL: `http://localhost:5173`
- Dev command: `npm run dev`
- Build command: `npm run build`

**Checkpoint**: `src-tauri/` folder created with `Cargo.toml` and `tauri.conf.json`

### Step 1.3: Configure Tauri
Edit `src-tauri/tauri.conf.json`:
- Set `productName`: `"sub2utf"`
- Set `identifier`: `"org.sub2utf.app"`
- Set window `title`: `"sub2utf - Subtitle Encoding Converter"`
- Set window `width`: 800, `height`: 600
- Enable file drop: `"fileDropEnabled": true`

### Step 1.4: Test dev mode
```bash
npm run tauri dev
```

**Checkpoint**: Native window opens with web app running inside

### Step 1.5: Git checkpoint
```bash
git checkout -b feat/tauri-v1
git add .
git commit -m "Add Tauri scaffolding"
```

---

## Phase 2: Tauri Adapter

### Step 2.1: Add Rust dependencies
Edit `src-tauri/Cargo.toml`:
```toml
[dependencies]
chardetng = "0.1"
encoding_rs = "0.8"
```

### Step 2.2: Implement Rust commands
Create/edit `src-tauri/src/main.rs`:

```rust
#[tauri::command]
fn detect_encoding(data: Vec<u8>) -> Result<(String, f32), String> {
    // Use chardetng to detect encoding
    // Return (encoding_name, confidence)
}

#[tauri::command]
fn convert_to_utf8(data: Vec<u8>, encoding: String) -> Result<String, String> {
    // Use encoding_rs to decode and return UTF-8 string
}
```

**Checkpoint**: Commands compile without errors

### Step 2.3: Create Tauri adapter
Create `src/lib/adapters/tauri.ts`:
```typescript
import { invoke } from '@tauri-apps/api/core';

export const tauriAdapter: FileAdapter = {
  async detectEncoding(data: ArrayBuffer) {
    const [encoding, confidence] = await invoke<[string, number]>(
      'detect_encoding',
      { data: Array.from(new Uint8Array(data)) }
    );
    return { encoding, confidence };
  },

  async convertFile(data: ArrayBuffer, encoding: string) {
    return await invoke<string>('convert_to_utf8', {
      data: Array.from(new Uint8Array(data)),
      encoding
    });
  },

  async saveFile(content: string, originalPath: string, lang: string) {
    // Use Tauri file dialog or save directly
  }
};
```

### Step 2.4: Update adapter index
Edit `src/lib/adapters/index.ts`:
```typescript
import { webAdapter } from './web';
import { tauriAdapter } from './tauri';

const isTauri = '__TAURI__' in window;
export const adapter = isTauri ? tauriAdapter : webAdapter;
```

**Checkpoint**: App uses correct adapter based on environment

### Step 2.5: Git checkpoint
```bash
git add .
git commit -m "Implement Tauri adapter with chardetng"
```

---

## Phase 3: Native File Handling

### Step 3.1: File drop handling
Update `src-tauri/tauri.conf.json`:
```json
{
  "app": {
    "windows": [{
      "fileDropEnabled": true
    }]
  }
}
```

Listen for file drops in Rust or use Tauri's JS API.

### Step 3.2: Native file dialogs
Use `@tauri-apps/plugin-dialog` for save dialogs:
```bash
npm install @tauri-apps/plugin-dialog
```

### Step 3.3: Direct file saving
Implement saving converted files directly to disk:
- Parse original file path
- Generate output path with language suffix
- Write UTF-8 content to file

```rust
#[tauri::command]
fn save_file(path: String, content: String) -> Result<(), String> {
    std::fs::write(&path, content).map_err(|e| e.to_string())
}
```

**Checkpoint**: Files save directly without browser dialogs

### Step 3.4: Git checkpoint
```bash
git add .
git commit -m "Add native file handling"
```

---

## Phase 4: Platform Polish

### Step 4.1: App icon
Create app icons for each platform:
- `src-tauri/icons/icon.icns` (macOS)
- `src-tauri/icons/icon.ico` (Windows)
- `src-tauri/icons/icon.png` (Linux)

Use `npm run tauri icon` to generate from a source image.

### Step 4.2: Menu bar (optional)
Add native menu bar if needed:
- File → Open (shortcut: Cmd/Ctrl+O)
- File → Clear All
- Help → About

### Step 4.3: Remove browser compatibility notice
Update `App.svelte` to hide the "Use Chrome/Edge" notice when running in Tauri.

### Step 4.4: Window state persistence
Remember window size/position between sessions:
```bash
npm install @tauri-apps/plugin-window-state
```

### Step 4.5: Git checkpoint
```bash
git add .
git commit -m "Platform polish: icons, menus, window state"
```

---

## Phase 5: Build & Release

### Step 5.1: Test on all platforms
- Build and test on macOS
- Build and test on Windows
- Build and test on Linux (if applicable)

### Step 5.2: Build release binaries
```bash
npm run tauri build
```

Outputs:
- macOS: `.dmg` installer
- Windows: `.msi` installer
- Linux: `.deb`, `.AppImage`

### Step 5.3: Code signing (optional but recommended)
- macOS: Sign with Apple Developer certificate
- Windows: Sign with code signing certificate

### Step 5.4: Create GitHub Release
```bash
git tag v1.0.0
git push origin v1.0.0
```

Upload binaries to GitHub Releases.

### Step 5.5: Update README
- Add download links for each platform
- Update installation instructions
- Add screenshots

---

## File Structure (v1.0)

```
sub2utf/
├── webapp/
│   ├── src/
│   │   ├── lib/adapters/
│   │   │   ├── types.ts
│   │   │   ├── web.ts
│   │   │   ├── tauri.ts      ← NEW
│   │   │   └── index.ts      ← UPDATED
│   │   └── ...
│   ├── src-tauri/            ← NEW
│   │   ├── Cargo.toml
│   │   ├── tauri.conf.json
│   │   ├── icons/
│   │   └── src/
│   │       └── main.rs
│   └── ...
└── docs/
    └── implementation-plan-v1.md
```

---

## PR Strategy

1. **PR #1**: Tauri scaffolding (Phase 1)
2. **PR #2**: Tauri adapter + Rust commands (Phase 2)
3. **PR #3**: Native file handling (Phase 3)
4. **PR #4**: Platform polish (Phase 4)
5. **PR #5**: Release preparation (Phase 5)

---

## Rollback Plan

The web adapter remains fully functional. If Tauri issues arise:
- Web version continues working at sub2utf.org
- Users can use Chrome/Edge for native-like file saving
- Tauri development can continue independently
