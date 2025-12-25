import { invoke } from '@tauri-apps/api/core';
import type { FileAdapter, EncodingInfo, ConversionResult, FileReadResult } from './types';

/**
 * Helper to read a file from a path using Tauri's fs plugin
 */
async function readFileFromPath(path: string): Promise<File> {
  const { readFile } = await import('@tauri-apps/plugin-fs');
  const contents = await readFile(path);
  const name = path.split('/').pop() || path;
  return new File([contents], name);
}

/**
 * Tauri adapter - uses native Rust backend for encoding detection and conversion
 */
export const tauriAdapter: FileAdapter = {
  async detectEncoding(file: File): Promise<EncodingInfo> {
    const buffer = await file.arrayBuffer();
    const data = new Uint8Array(buffer);

    const [encoding] = await invoke<[string, number]>('detect_encoding', { data });

    return { encoding };
  },

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

  async saveFile(path: string, content: string): Promise<void> {
    await invoke('save_file', { path, content });
  },

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
};
