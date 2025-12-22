/**
 * Settings store - user preferences persisted to localStorage.
 */
import { writable } from 'svelte/store';

/** User-configurable settings */
export interface Settings {
  /** Show warning when encoding confidence is below this value (0-1) */
  confidenceThreshold: number;
  /** Default language suffix for output files (e.g., 'sr' → movie.sr.srt) */
  defaultLanguage: string;
}

const STORAGE_KEY = 'sub2utf-settings';

const defaultSettings: Settings = {
  confidenceThreshold: 0.7,
  defaultLanguage: 'sr'
};

/** Load settings from localStorage, falling back to defaults */
function loadSettings(): Settings {
  if (typeof localStorage === 'undefined') return defaultSettings;

  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return defaultSettings;

  try {
    return { ...defaultSettings, ...JSON.parse(saved) };
  } catch {
    return defaultSettings;
  }
}

/**
 * Creates the settings store with localStorage persistence.
 */
function createSettingsStore() {
  const { subscribe, set, update } = writable<Settings>(loadSettings());

  return {
    subscribe,

    /** Update settings and persist to localStorage */
    update(updates: Partial<Settings>) {
      update(settings => {
        const newSettings = { ...settings, ...updates };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
        return newSettings;
      });
    },

    /** Reset to default settings and clear localStorage */
    reset() {
      localStorage.removeItem(STORAGE_KEY);
      set(defaultSettings);
    }
  };
}

export const settingsStore = createSettingsStore();
