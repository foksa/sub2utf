/**
 * Platform detection utilities
 */

/**
 * Check if running in Tauri (desktop app) vs browser.
 * In Tauri v2, __TAURI_INTERNALS__ is more reliable than __TAURI__.
 */
export const isTauri = typeof window !== 'undefined' &&
  ('__TAURI_INTERNALS__' in window || '__TAURI__' in window);
