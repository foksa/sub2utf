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
 * Result of reading files (from drop or dialog)
 */
export interface FileReadResult {
  files: File[];
  paths?: string[]; // Only available in Tauri
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
   * @param filenameOrPath - filename for web (shows dialog), full path for Tauri
   */
  saveFile(filenameOrPath: string, content: string): Promise<void>;

  /**
   * Read files from paths (for drag-drop with paths)
   * Only meaningful in Tauri where we have full paths
   */
  readFilesFromPaths?(paths: string[]): Promise<FileReadResult>;

  /**
   * Open file picker dialog
   * Returns files and optionally paths (Tauri only)
   */
  openFileDialog?(): Promise<FileReadResult | null>;

  /**
   * Set up drag-drop listener (Tauri only)
   * Returns unlisten function
   */
  setupDragDrop?(onDrop: (result: FileReadResult) => void): Promise<() => void>;

  /**
   * Show save file dialog and save content (Tauri only)
   * @param defaultName - suggested filename
   * @param content - content to save
   * @returns true if saved, false if cancelled
   */
  saveFileWithDialog?(defaultName: string, content: string): Promise<boolean>;

  /**
   * Check if a file exists at the given path (Tauri only)
   */
  fileExists?(path: string): Promise<boolean>;
}
