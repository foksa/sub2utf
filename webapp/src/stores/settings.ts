/**
 * Settings store - user preferences persisted to localStorage.
 */
import { writable } from 'svelte/store';

/** Language option for dropdown */
export interface LanguageOption {
  code: string;
  name: string;
}

/** User-configurable settings */
export interface Settings {
  /** Show warning when encoding confidence is below this value (0-1) */
  confidenceThreshold: number;
  /** Default language suffix for output files (e.g., 'sr' → movie.sr.srt) */
  defaultLanguage: string;
  /** List of encodings available in dropdown (editable by user) */
  encodings: string[];
  /** List of languages available in dropdown (editable by user) */
  languages: LanguageOption[];
}

const STORAGE_KEY = 'sub2utf-settings';

const defaultSettings: Settings = {
  confidenceThreshold: 0.7,
  defaultLanguage: 'sr',
  encodings: [
    'UTF-8',
    'windows-1250',
    'windows-1251',
    'windows-1252',
    'ISO-8859-1',
    'ISO-8859-2',
    'ISO-8859-5',
    'ISO-8859-15',
    'KOI8-R',
    'KOI8-U'
  ],
  languages: [
    { code: 'sr', name: 'Serbian' },
    { code: 'hr', name: 'Croatian' },
    { code: 'bs', name: 'Bosnian' },
    { code: 'sl', name: 'Slovenian' },
    { code: 'mk', name: 'Macedonian' },
    { code: 'bg', name: 'Bulgarian' },
    { code: 'ru', name: 'Russian' },
    { code: 'uk', name: 'Ukrainian' },
    { code: 'pl', name: 'Polish' },
    { code: 'cs', name: 'Czech' },
    { code: 'sk', name: 'Slovak' },
    { code: 'hu', name: 'Hungarian' }
  ]
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
