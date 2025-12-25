# Gemini Feedback Refactor Plan

Based on the code review from Gemini and our discussion, here are the changes to implement.

## Steps

### Step 1: Fix IPC Performance - Remove `Array.from()` overhead
- [x] In `app/src/lib/adapters/tauri.ts`, pass `Uint8Array` directly to `invoke()` instead of converting with `Array.from()`
- [x] Verify Rust side still works with `Vec<u8>` (no changes needed there)

### Step 2: Add File Size Safety Check
- [x] Add max file size constant (5MB)
- [x] Refactor `filesStore.addFilesWithDetection` to separate concerns
- [x] Add size validation before processing files
- [ ] Show inline error for files that exceed size limit (moved to Step 6)

### Step 3: Fix `URL.revokeObjectURL` Timing
- [x] In `app/src/lib/adapters/web.ts`, wrap `URL.revokeObjectURL()` in `setTimeout(..., 100)`

### Step 4: Use `tauri-plugin-fs` Instead of Custom `save_file` Command
- [x] ~~In `tauri.ts`, import `writeTextFile` from `@tauri-apps/plugin-fs`~~ **REVERTED**
- [x] ~~Replace `invoke('save_file', ...)` with `writeTextFile()`~~ **REVERTED**
- [x] ~~Remove custom `save_file` command from `lib.rs`~~ **REVERTED**
- [x] ~~Remove from `invoke_handler` macro~~ **REVERTED**

**Note:** Tauri v2's fs plugin doesn't support arbitrary absolute paths - it requires paths relative to base directories. Since save dialog returns absolute paths, keeping the custom command is the correct approach.

### Step 5: Create Shared Platform Detection Util
- [x] Create `app/src/lib/platform.ts` with `isTauri` detection (using `__TAURI_INTERNALS__` for v2 reliability)
- [x] Update `App.svelte` to import from shared util

### Step 6: Add Inline Error Display for Failed Files
- [x] Add error state to file entries in store (already existed)
- [x] Update `FileItem.svelte` to show error message inline (not just tooltip)
- [ ] Handle file read errors in `readFilesFromPaths` (optional - errors already surface via store)

---

## Progress

Currently working on: **Step 6 complete - awaiting feedback**
