export * from './types';
export { webAdapter, WebAdapter } from './web';
export { tauriAdapter } from './tauri';

import { webAdapter } from './web';
import { tauriAdapter } from './tauri';

const isTauri = '__TAURI__' in window;
export const adapter = isTauri ? tauriAdapter : webAdapter;