import { detect as chardetngDetect } from 'chardetng-wasm';
import type { FileAdapter, EncodingInfo, ConversionResult } from './types';

/**
 * Web-based file adapter using chardetng-wasm and browser APIs.
 * Uses Mozilla's Firefox encoding detector compiled to WASM.
 */
class WebAdapter implements FileAdapter {
  /**
   * Detect the encoding of a file using chardetng-wasm.
   * @param file - File to analyze
   * @returns Detected encoding information
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
   * Convert file content from source encoding to UTF-8 using TextDecoder.
   * @param file - File to convert
   * @param sourceEncoding - Source encoding name (e.g., 'windows-1251')
   * @returns Conversion result with UTF-8 content or error
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
   * Save content by triggering a browser download.
   * @param filename - Suggested filename for the download
   * @param content - UTF-8 content to save
   */
  async saveFile(filename: string, content: string): Promise<void> {
    const encoder = new TextEncoder();
    const utf8Content = encoder.encode(content);
    const blob = new Blob([utf8Content], { type: 'text/plain;charset=utf-8' });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    // Delay revocation to ensure download starts in all browsers (Firefox/Safari)
    setTimeout(() => URL.revokeObjectURL(url), 100);
  }
}

// Export singleton instance
export const webAdapter = new WebAdapter();

// Export class for testing
export { WebAdapter };
