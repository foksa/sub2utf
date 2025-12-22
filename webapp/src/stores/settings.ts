import { writable } from 'svelte/store';

export interface Settings {
  confidenceThreshold: number;
  defaultLanguage: string;
}

const defaultSettings: Settings = {
  confidenceThreshold: 0.7,
  defaultLanguage: 'sr'
};

function loadSettings(): Settings {
  if (typeof localStorage === 'undefined') return defaultSettings;

  const saved = localStorage.getItem('sub2utf-settings');
  if (!saved) return defaultSettings;

  try {
    return { ...defaultSettings, ...JSON.parse(saved) };
  } catch {
    return defaultSettings;
  }
}

function createSettingsStore() {
  const { subscribe, set, update } = writable<Settings>(loadSettings());

  return {
    subscribe,

    update(updates: Partial<Settings>) {
      update(settings => {
        const newSettings = { ...settings, ...updates };
        localStorage.setItem('sub2utf-settings', JSON.stringify(newSettings));
        return newSettings;
      });
    },

    reset() {
      localStorage.removeItem('sub2utf-settings');
      set(defaultSettings);
    }
  };
}

export const settingsStore = createSettingsStore();
