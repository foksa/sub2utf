# Implementation Details

Technical implementation details for the Subtitle Encoding Converter. See [planning/tech-spec.md](planning/tech-spec.md) for high-level design.

## Rust Backend API

### Commands (Tauri IPC)

```rust
#[tauri::command]
async fn detect_encoding(path: String) -> Result<EncodingInfo, String>

#[tauri::command]
async fn convert_file(path: String, encoding: String, lang: String) -> Result<ConversionResult, String>
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

// Note: FileInfo and BatchResult are v2 features (folder processing)
```

## File Structure

```
subtitle-converter/
├── src/                        # Svelte frontend
│   ├── App.svelte
│   ├── components/
│   │   ├── DropZone.svelte
│   │   ├── FileList.svelte
│   │   ├── FileItem.svelte
│   │   ├── EncodingSelect.svelte
│   │   └── LanguageSelect.svelte
│   ├── lib/
│   │   └── adapters/           # Web/Tauri abstraction
│   │       ├── types.ts
│   │       ├── tauri.ts
│   │       ├── web.ts
│   │       └── index.ts
│   ├── stores/
│   │   └── files.ts
│   └── app.css                 # Bulma imports
├── src-tauri/                  # Rust backend
│   ├── src/
│   │   ├── main.rs
│   │   ├── commands.rs
│   │   └── encoding.rs
│   ├── Cargo.toml
│   └── tauri.conf.json
├── docs/                       # Documentation
│   ├── planning/
│   ├── architecture.md
│   ├── implementation-details.md
│   ├── roadmap.md
│   └── ui-spec.md
├── package.json
├── vite.config.ts
└── svelte.config.js
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
    "@tauri-apps/api": "^2.0.0",
    "bulma": "^1.0.0"
  },
  "devDependencies": {
    "svelte": "^4.0.0",
    "@sveltejs/vite-plugin-svelte": "^3.0.0",
    "typescript": "^5.0.0",
    "vite": "^5.0.0",
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
