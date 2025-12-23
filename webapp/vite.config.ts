import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import wasm from 'vite-plugin-wasm'
import topLevelAwait from 'vite-plugin-top-level-await'
import purgecss from 'vite-plugin-purgecss'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    wasm(),
    topLevelAwait(),
    svelte(),
    purgecss({
      content: ['./src/**/*.svelte', './src/**/*.ts', './index.html'],
      safelist: {
        // Keep modal active state and dynamic classes
        standard: [/^is-/, /^has-/],
      },
    }),
  ],
})
