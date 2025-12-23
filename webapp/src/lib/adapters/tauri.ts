import { invoke } from '@tauri-apps/api/core';
import type { FileAdapter, EncodingInfo, ConversionResult } from './types';

/**
 * Tauri adapter - uses native Rust backend for encoding detection and conversion
 */
export const tauriAdapter: FileAdapter = {
  async detectEncoding(file: File): Promise<EncodingInfo> {
    const buffer = await file.arrayBuffer();
    const data = Array.from(new Uint8Array(buffer));

    const [encoding] = await invoke<[string, number]>('detect_encoding', { data });

    return { encoding };
  },

  async convertFile(file: File, sourceEncoding: string): Promise<ConversionResult> {
    try {
      const buffer = await file.arrayBuffer();
      const data = Array.from(new Uint8Array(buffer));

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
    // Path should be the full path (including directory) passed from the store
    await invoke('save_file', { path, content });
  },
};
