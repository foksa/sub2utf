import { invoke } from '@tauri-apps/api/core';
import type { FileAdapter, EncodingInfo, ConversionResult, FileReadResult } from './types';

/**
 * Read a file from a filesystem path using Tauri's fs plugin.
 * @param path - Absolute path to the file
 * @returns File object with the file contents
 */
async function readFileFromPath(path: string): Promise<File> {
  const { readFile } = await import('@tauri-apps/plugin-fs');
  const contents = await readFile(path);
  const name = path.split('/').pop() || path;
  return new File([contents], name);
}

/**
 * Tauri adapter - uses native Rust backend for encoding detection and conversion.
 */
export const tauriAdapter: FileAdapter = {
  /**
   * Detect the encoding of a file using Rust's chardetng library.
   * @param file - File to analyze
   * @returns Detected encoding information
   */
  async detectEncoding(file: File): Promise<EncodingInfo> {
    const buffer = await file.arrayBuffer();
    const data = new Uint8Array(buffer);

    const [encoding] = await invoke<[string, number]>('detect_encoding', { data });

    return { encoding };
  },

  /**
   * Convert file content from source encoding to UTF-8 using Rust's encoding_rs.
   * @param file - File to convert
   * @param sourceEncoding - Source encoding name (e.g., 'windows-1251')
   * @returns Conversion result with UTF-8 content or error
   */
  async convertFile(file: File, sourceEncoding: string): Promise<ConversionResult> {
    try {
      const buffer = await file.arrayBuffer();
      const data = new Uint8Array(buffer);

      const content = await invoke<string>('convert_to_utf8', {
        data,
        encoding: sourceEncoding,
      });

      return { success: true, content };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  },

  /**
   * Save content to a file at the specified path.
   * @param path - Absolute path where to save the file
   * @param content - UTF-8 content to write
   */
  async saveFile(path: string, content: string): Promise<void> {
    await invoke('save_file', { path, content });
  },

  /**
   * Read multiple files from filesystem paths.
   * @param paths - Array of absolute file paths
   * @returns Files and their corresponding valid paths
   */
  async readFilesFromPaths(paths: string[]): Promise<FileReadResult> {
    const files: File[] = [];
    const validPaths: string[] = [];

    for (const path of paths) {
      try {
        const file = await readFileFromPath(path);
        files.push(file);
        validPaths.push(path);
      } catch (e) {
        console.error('Failed to read file:', path, e);
      }
    }

    return { files, paths: validPaths };
  },

  /**
   * Open native file picker dialog for selecting .srt files.
   * @returns Selected files with paths, or null if cancelled
   */
  async openFileDialog(): Promise<FileReadResult | null> {
    const { open } = await import('@tauri-apps/plugin-dialog');

    const selected = await open({
      multiple: true,
      filters: [{ name: 'Subtitles', extensions: ['srt'] }],
    });

    if (!selected) return null;

    const paths = Array.isArray(selected) ? selected : [selected];
    return this.readFilesFromPaths!(paths);
  },

  /**
   * Set up native drag-drop listener for .srt files.
   * @param onDrop - Callback invoked when valid files are dropped
   * @returns Cleanup function to remove the listener
   */
  async setupDragDrop(onDrop: (result: FileReadResult) => void): Promise<() => void> {
    const { getCurrentWebview } = await import('@tauri-apps/api/webview');
    const webview = getCurrentWebview();

    return webview.onDragDropEvent(async (event) => {
      if (event.payload.type !== 'drop') return;

      const paths = event.payload.paths.filter((p: string) => p.endsWith('.srt'));
      if (paths.length === 0) return;

      const result = await this.readFilesFromPaths!(paths);
      if (result.files.length > 0) {
        onDrop(result);
      }
    });
  },

  /**
   * Show native save dialog and save content to selected location.
   * @param defaultName - Suggested filename for the dialog
   * @param content - UTF-8 content to save
   * @returns true if saved successfully, false if user cancelled
   */
  async saveFileWithDialog(defaultName: string, content: string): Promise<boolean> {
    const { save } = await import('@tauri-apps/plugin-dialog');

    const path = await save({
      defaultPath: defaultName,
      filters: [{ name: 'Subtitles', extensions: ['srt'] }],
    });

    if (!path) return false;

    await invoke('save_file', { path, content });
    return true;
  },

  /**
   * Check if file exists and prompt user to confirm overwrite.
   * @param path - Absolute path to check
   * @param filename - Display name for the confirmation dialog
   * @returns true if file doesn't exist or user confirms, false if user cancels
   */
  async confirmOverwrite(path: string, filename: string): Promise<boolean> {
    const { exists } = await import('@tauri-apps/plugin-fs');
    const fileExists = await exists(path);

    if (!fileExists) return true;

    const { ask } = await import('@tauri-apps/plugin-dialog');
    return ask(
      `File "${filename}" already exists. Overwrite?`,
      { title: 'Confirm Overwrite', kind: 'warning' }
    );
  },
};
