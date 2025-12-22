# Architecture

System architecture for the Subtitle Encoding Converter, supporting both Tauri desktop and web builds from a single codebase.

## Overview

```
┌─────────────────────────────────────────────────────────┐
│                    Svelte UI Layer                      │
│  ┌───────────────────────────────────────────────────┐  │
│  │  Components: DropZone, FileList, FileItem         │  │
│  │  Stores: files, settings                          │  │
│  └───────────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────────┤
│                   Adapter Interface                     │
│  ┌───────────────────────────────────────────────────┐  │
│  │  detectEncoding(file) → EncodingInfo              │  │
│  │  convertFile(file, encoding, lang) → Result       │  │
│  │  saveFile(content, path) → Result                 │  │
│  └───────────────────────────────────────────────────┘  │
├──────────────────────┬──────────────────────────────────┤
│   Tauri Adapter      │         Web Adapter              │
│  ┌────────────────┐  │  ┌────────────────────────────┐  │
│  │ Rust IPC calls │  │  │ File System Access API     │  │
│  │ chardetng      │  │  │ jschardet                  │  │
│  │ encoding_rs    │  │  │ TextDecoder/TextEncoder    │  │
│  └────────────────┘  │  └────────────────────────────┘  │
└──────────────────────┴──────────────────────────────────┘
```

## Adapter Pattern

Abstract file operations behind a common interface. Swap implementations at build time.

### Interface Definition

```typescript
// src/lib/adapters/types.ts

interface EncodingInfo {
  encoding: string;
  confidence: number;
}

interface ConversionResult {
  success: boolean;
  outputPath?: string;
  error?: string;
}

interface FileAdapter {
  detectEncoding(file: File | string): Promise<EncodingInfo>;
  convertFile(
    file: File | string,
    sourceEncoding: string,
    targetLang: string
  ): Promise<ConversionResult>;
  saveFile(content: string, originalPath: string, lang: string): Promise<string>;
}
```

### Tauri Adapter

Uses Rust backend via Tauri IPC.

```typescript
// src/lib/adapters/tauri.ts

import { invoke } from '@tauri-apps/api/core';

export const tauriAdapter: FileAdapter = {
  async detectEncoding(path: string) {
    return await invoke('detect_encoding', { path });
  },

  async convertFile(path: string, encoding: string, lang: string) {
    return await invoke('convert_file', { path, encoding, lang });
  },

  async saveFile(content: string, originalPath: string, lang: string) {
    return await invoke('save_file', { content, originalPath, lang });
  }
};
```

### Web Adapter

Uses browser APIs for file access and JavaScript for encoding.

```typescript
// src/lib/adapters/web.ts

import jschardet from 'jschardet';

export const webAdapter: FileAdapter = {
  async detectEncoding(file: File) {
    const buffer = await file.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    const result = jschardet.detect(bytes);
    return {
      encoding: result.encoding || 'windows-1250',
      confidence: result.confidence || 0
    };
  },

  async convertFile(file: File, encoding: string, lang: string) {
    const buffer = await file.arrayBuffer();
    const decoder = new TextDecoder(encoding);
    const text = decoder.decode(buffer);
    // Return converted text, saving handled separately
    return { success: true, content: text };
  },

  async saveFile(content: string, originalName: string, lang: string) {
    // Use File System Access API if available
    if ('showSaveFilePicker' in window) {
      // Direct save to disk
      const newName = originalName.replace('.srt', `.utf8.${lang}.srt`);
      const handle = await window.showSaveFilePicker({
        suggestedName: newName,
        types: [{ accept: { 'text/plain': ['.srt'] } }]
      });
      const writable = await handle.createWritable();
      await writable.write(content);
      await writable.close();
      return newName;
    } else {
      // Fallback: download file
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = originalName.replace('.srt', `.utf8.${lang}.srt`);
      a.click();
      URL.revokeObjectURL(url);
      return a.download;
    }
  }
};
```

### Adapter Selection

Select adapter based on build target.

```typescript
// src/lib/adapters/index.ts

import { tauriAdapter } from './tauri';
import { webAdapter } from './web';

const isTauri = '__TAURI__' in window;

export const adapter: FileAdapter = isTauri ? tauriAdapter : webAdapter;
```

## Build Configuration

### Tauri Build

```bash
npm run tauri build
```

Produces native binaries with Rust backend.

### Web Build

```bash
npm run build:web
```

Produces static site deployable to any host.

### Vite Config

```typescript
// vite.config.ts

export default defineConfig(({ mode }) => ({
  plugins: [svelte()],
  define: {
    __WEB_BUILD__: mode === 'web'
  },
  build: {
    outDir: mode === 'web' ? 'dist-web' : 'dist'
  }
}));
```

## Settings Store

User preferences persisted via localStorage. Works in both web and Tauri (webview).

```typescript
// src/stores/settings.ts

interface Settings {
  confidenceThreshold: number;  // Default: 0.7
  encodingList: string[];       // Available encodings
  languageList: string[];       // Available languages
  defaultLanguage: string;      // Default: 'sr'
}

const DEFAULTS: Settings = {
  confidenceThreshold: 0.7,
  encodingList: ['UTF-8', 'Windows-1250', 'Windows-1251', 'ISO-8859-2', 'ISO-8859-5', 'KOI8-R'],
  languageList: ['sr', 'hr', 'en', 'de', 'fr', 'es', 'it', 'pl', 'cs', 'ru'],
  defaultLanguage: 'sr'
};

function createSettingsStore() {
  const stored = localStorage.getItem('sub2utf-settings');
  const initial = stored ? { ...DEFAULTS, ...JSON.parse(stored) } : DEFAULTS;

  const { subscribe, set, update } = writable<Settings>(initial);

  return {
    subscribe,
    update: (changes: Partial<Settings>) => {
      update(s => {
        const newSettings = { ...s, ...changes };
        localStorage.setItem('sub2utf-settings', JSON.stringify(newSettings));
        return newSettings;
      });
    },
    reset: () => {
      localStorage.removeItem('sub2utf-settings');
      set(DEFAULTS);
    }
  };
}

export const settings = createSettingsStore();
```

### Why localStorage?

- Works in both environments (browser and Tauri webview)
- No additional adapter needed
- Simple API, no async operations
- Persists across sessions
- If native storage needed later (sync, backup), can add Rust adapter

## File Structure

```
subtitle-converter/
├── src/
│   ├── lib/
│   │   ├── adapters/
│   │   │   ├── types.ts      # Interface definitions
│   │   │   ├── tauri.ts      # Tauri/Rust adapter
│   │   │   ├── web.ts        # Browser adapter
│   │   │   └── index.ts      # Adapter selection
│   │   ├── stores/
│   │   │   ├── files.ts      # File list store
│   │   │   └── settings.ts   # Settings store
│   │   └── utils/
│   │       └── encoding.ts   # Encoding helpers
│   ├── components/
│   │   ├── DropZone.svelte
│   │   ├── FileList.svelte
│   │   ├── FileItem.svelte
│   │   ├── EncodingSelect.svelte
│   │   ├── LanguageSelect.svelte
│   │   └── Settings.svelte
│   ├── App.svelte
│   └── main.ts
├── src-tauri/                 # Rust backend (Tauri only)
│   ├── src/
│   │   ├── main.rs
│   │   ├── commands.rs
│   │   └── encoding.rs
│   └── Cargo.toml
├── package.json
├── vite.config.ts
└── svelte.config.js
```

## Data Flow

### Desktop (Tauri)

1. User drops file → Svelte component
2. Component calls `adapter.detectEncoding(path)`
3. Tauri adapter invokes Rust command
4. Rust reads file, detects encoding with `chardetng`
5. Result returned to UI
6. User clicks Convert
7. `adapter.convertFile()` → Rust converts and saves

### Web

1. User drops file → Svelte component
2. Component calls `adapter.detectEncoding(file)`
3. Web adapter uses `jschardet` on file bytes
4. Result returned to UI
5. User clicks Convert
6. `adapter.convertFile()` → JS converts with TextDecoder
7. `adapter.saveFile()` → File System Access API or download

## Platform Differences

| Feature | Tauri | Web (Chrome/Edge) | Web (Safari/Firefox) |
|---------|-------|-------------------|---------------------|
| File read | Native | File API | File API |
| Encoding detection | chardetng (Rust) | jschardet (JS) | jschardet (JS) |
| File write | Native | File System Access | Download |
| Folder access | Native | Limited | Not supported |
