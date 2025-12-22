import { writable } from 'svelte/store';

export type FileStatus = 'pending' | 'detecting' | 'ready' | 'processing' | 'done' | 'skipped' | 'error';

export interface FileEntry {
  id: string;
  name: string;
  file: File;
  encoding: string;
  confidence: number;
  status: FileStatus;
  error?: string;
  convertedContent?: string;
}

function createFilesStore() {
  const { subscribe, set, update } = writable<FileEntry[]>([]);

  return {
    subscribe,

    addFiles(files: File[]) {
      update(entries => {
        const newEntries = files.map(file => ({
          id: crypto.randomUUID(),
          name: file.name,
          file,
          encoding: '',
          confidence: 0,
          status: 'pending' as FileStatus
        }));
        return [...entries, ...newEntries];
      });
    },

    updateEntry(id: string, updates: Partial<FileEntry>) {
      update(entries =>
        entries.map(entry =>
          entry.id === id ? { ...entry, ...updates } : entry
        )
      );
    },

    removeEntry(id: string) {
      update(entries => entries.filter(entry => entry.id !== id));
    },

    clear() {
      set([]);
    }
  };
}

export const filesStore = createFilesStore();
