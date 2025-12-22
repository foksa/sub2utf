/**
 * Files store - manages file entries through the conversion pipeline.
 *
 * File lifecycle: pending → detecting → ready/skipped/error → processing → done/error
 */
import { writable } from 'svelte/store';

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
    }
  };
}

export const filesStore = createFilesStore();
