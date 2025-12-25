export * from './types';
export { webAdapter, WebAdapter } from './web';
export { tauriAdapter } from './tauri';

import type { FileAdapter } from './types';
import { webAdapter } from './web';
import { tauriAdapter } from './tauri';
import { isTauri } from '../platform';

/**
 * Platform-appropriate file adapter.
 * Uses tauriAdapter for desktop, webAdapter for browser.
 */
export const adapter: FileAdapter = isTauri ? tauriAdapter : webAdapter;