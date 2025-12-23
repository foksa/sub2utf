/**
 * Files store - manages file entries through the conversion pipeline.
 *
 * File lifecycle: pending → detecting → ready/skipped/error → processing → done/error
 */
import { writable } from 'svelte/store';
import { adapter } from '../lib/adapters';

/**
 * Status of a file in the conversion pipeline.
 * - pending: Just added, waiting for encoding detection
 * - detecting: Encoding detection in progress
 * - ready: Encoding detected, waiting for conversion
 * - skipped: File is already UTF-8, no conversion needed
 * - processing: Conversion in progress
 * - done: Successfully converted and saved
 * - error: An error occurred during detection or conversion
 */
export type FileStatus = 'pending' | 'detecting' | 'ready' | 'processing' | 'done' | 'skipped' | 'error';

/** Represents a file being processed */
export interface FileEntry {
  /** Unique identifier for this entry */
  id: string;
  /** Original filename */
  name: string;
  /** Reference to the File object */
  file: File;
  /** Full path to original file (Tauri only) */
  path?: string;
  /** Detected or user-selected encoding */
  encoding: string;
  /** Output language code for this file (e.g., 'sr', 'en') */
  language: string;
  /** Current status in the pipeline */
  status: FileStatus;
  /** Error message if status is 'error' */
  error?: string;
  /** UTF-8 content after conversion */
  convertedContent?: string;
}

/**
 * Creates the files store with methods to manage file entries.
 */
function createFilesStore() {
  const { subscribe, set, update } = writable<FileEntry[]>([]);

  // Keep a synchronous copy for getEntries()
  let currentEntries: FileEntry[] = [];
  subscribe(entries => { currentEntries = entries; });

  return {
    subscribe,

    /** Get current entries synchronously (for use outside reactive contexts) */
    getEntries() {
      return currentEntries;
    },

    /** Add new files to the store with 'pending' status */
    addFiles(files: File[], defaultLanguage: string) {
      update(entries => {
        const newEntries = files.map(file => ({
          id: crypto.randomUUID(),
          name: file.name,
          file,
          encoding: '',
          language: defaultLanguage,
          status: 'pending' as FileStatus
        }));
        return [...entries, ...newEntries];
      });
    },

    /** Update a specific entry by ID */
    updateEntry(id: string, updates: Partial<FileEntry>) {
      update(entries =>
        entries.map(entry =>
          entry.id === id ? { ...entry, ...updates } : entry
        )
      );
    },

    /** Remove an entry by ID */
    removeEntry(id: string) {
      update(entries => entries.filter(entry => entry.id !== id));
    },

    /** Clear all entries */
    clear() {
      set([]);
    },

    /**
     * Add files and detect their encodings.
     * Updates status: pending → detecting → ready/skipped/error
     * @param paths Optional array of full file paths (Tauri only)
     */
    async addFilesWithDetection(files: File[], defaultLanguage: string, paths?: string[]) {
      // First add all files as pending
      const newEntries = files.map((file, index) => ({
        id: crypto.randomUUID(),
        name: file.name,
        file,
        path: paths?.[index],
        encoding: '',
        language: defaultLanguage,
        status: 'pending' as FileStatus
      }));

      update(entries => [...entries, ...newEntries]);

      // Detect encoding for each file
      for (const entry of newEntries) {
        update(entries =>
          entries.map(e => e.id === entry.id ? { ...e, status: 'detecting' as FileStatus } : e)
        );

        try {
          const result = await adapter.detectEncoding(entry.file);

          if (result.encoding.toUpperCase() === 'UTF-8') {
            update(entries =>
              entries.map(e => e.id === entry.id ? { ...e, encoding: result.encoding, status: 'skipped' as FileStatus } : e)
            );
          } else {
            update(entries =>
              entries.map(e => e.id === entry.id ? { ...e, encoding: result.encoding, status: 'ready' as FileStatus } : e)
            );
          }
        } catch (error) {
          update(entries =>
            entries.map(e => e.id === entry.id ? {
              ...e,
              status: 'error' as FileStatus,
              error: error instanceof Error ? error.message : 'Detection failed'
            } : e)
          );
        }
      }
    },

    /**
     * Convert all ready files to UTF-8 and save them.
     * Updates status: ready → processing → done/error
     */
    async convertReady(): Promise<void> {
      const toConvert = currentEntries.filter(e => e.status === 'ready');
      if (toConvert.length === 0) return;

      for (const entry of toConvert) {
        update(entries =>
          entries.map(e => e.id === entry.id ? { ...e, status: 'processing' as FileStatus } : e)
        );

        try {
          const result = await adapter.convertFile(entry.file, entry.encoding);

          if (result.success && result.content) {
            update(entries =>
              entries.map(e => e.id === entry.id ? {
                ...e,
                status: 'done' as FileStatus,
                convertedContent: result.content
              } : e)
            );

            // Generate output filename: movie.srt → movie.sr.srt
            const baseName = entry.name.replace(/\.srt$/i, '');
            const outputName = `${baseName}.${entry.language}.srt`;

            // If we have the original path, save next to it; otherwise just use filename
            if (entry.path) {
              const dir = entry.path.substring(0, entry.path.lastIndexOf('/') + 1);
              await adapter.saveFile(dir + outputName, result.content);
            } else {
              await adapter.saveFile(outputName, result.content);
            }
          } else {
            update(entries =>
              entries.map(e => e.id === entry.id ? {
                ...e,
                status: 'error' as FileStatus,
                error: result.error || 'Conversion failed'
              } : e)
            );
          }
        } catch (error) {
          update(entries =>
            entries.map(e => e.id === entry.id ? {
              ...e,
              status: 'error' as FileStatus,
              error: error instanceof Error ? error.message : 'Conversion failed'
            } : e)
          );
        }
      }
    }
  };
}

export const filesStore = createFilesStore();
