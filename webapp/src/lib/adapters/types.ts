/**
 * Encoding detection result
 */
export interface EncodingInfo {
  encoding: string;
}

/**
 * Result of a file conversion
 */
export interface ConversionResult {
  success: boolean;
  content?: string;
  error?: string;
}

/**
 * File adapter interface - abstracts file operations for web/native
 */
export interface FileAdapter {
  /**
   * Detect the encoding of a file
   */
  detectEncoding(file: File): Promise<EncodingInfo>;

  /**
   * Convert file content from source encoding to UTF-8
   */
  convertFile(file: File, sourceEncoding: string): Promise<ConversionResult>;

  /**
   * Save converted content to a file
   */
  saveFile(filename: string, content: string): Promise<void>;
}
