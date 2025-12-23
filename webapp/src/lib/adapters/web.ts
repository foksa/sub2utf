import { detect as chardetngDetect } from 'chardetng-wasm';
import type { FileAdapter, EncodingInfo, ConversionResult } from './types';

/**
 * Web-based file adapter using chardetng-wasm (Mozilla's Firefox detector) and File System Access API
 */
class WebAdapter implements FileAdapter {
  /**
   * Detect encoding using chardetng-wasm (Firefox's encoding detector compiled to WASM)
   */
  async detectEncoding(file: File): Promise<EncodingInfo> {
    const buffer = await file.arrayBuffer();
    const bytes = new Uint8Array(buffer);

    // chardetng returns the encoding name directly (deterministic, no confidence scores)
    const encoding = chardetngDetect(bytes);

    console.log(`[${file.name}] chardetng detected: ${encoding}`);

    return {
      encoding: encoding || 'unknown'
    };
  }

  /**
   * Convert file from source encoding to UTF-8
   */
  async convertFile(file: File, sourceEncoding: string): Promise<ConversionResult> {
    try {
      const buffer = await file.arrayBuffer();

      // Decode from source encoding
      const decoder = new TextDecoder(sourceEncoding);
      const content = decoder.decode(buffer);

      return {
        success: true,
        content
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error during conversion'
      };
    }
  }

  /**
   * Save file using File System Access API or fallback to download
   */
  async saveFile(filename: string, content: string): Promise<void> {
    // Encode as UTF-8
    const encoder = new TextEncoder();
    const utf8Content = encoder.encode(content);
    const blob = new Blob([utf8Content], { type: 'text/plain;charset=utf-8' });

    // Check if File System Access API is available
    if ('showSaveFilePicker' in window) {
      try {
        const handle = await (window as any).showSaveFilePicker({
          suggestedName: filename,
          types: [{
            description: 'SubRip Subtitle',
            accept: { 'text/plain': ['.srt'] }
          }]
        });
        const writable = await handle.createWritable();
        await writable.write(blob);
        await writable.close();
        return;
      } catch (err) {
        // User cancelled or API failed, fall through to download
        if ((err as Error).name === 'AbortError') {
          throw err; // Re-throw if user cancelled
        }
      }
    }

    // Fallback: trigger download
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /**
   * Check if File System Access API is available
   */
  hasFileSystemAccess(): boolean {
    return 'showSaveFilePicker' in window;
  }
}

// Export singleton instance
export const webAdapter = new WebAdapter();

// Export class for testing
export { WebAdapter };
