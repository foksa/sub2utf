<!--
  App.svelte - Main application component

  Orchestrates the subtitle conversion workflow:
  1. User drops/selects files via DropZone
  2. Encoding is auto-detected for each file
  3. User can override encoding if needed
  4. User clicks Convert to process all ready files
  5. Converted files are saved with language suffix (e.g., movie.sr.srt)
-->
<script lang="ts">
  import { filesStore } from './stores/files';
  import { settingsStore } from './stores/settings';
  import DropZone from './components/DropZone.svelte';
  import FileList from './components/FileList.svelte';
  import Settings from './components/Settings.svelte';

  // UI state
  let isConverting = $state(false);
  let showSettings = $state(false);

  // Check if running in Tauri (for hiding browser-specific notices)
  const isTauri = typeof window !== 'undefined' && '__TAURI__' in window;

  /** Handle files dropped or selected by user */
  function handleFiles(files: File[], paths?: string[]) {
    filesStore.addFilesWithDetection(files, $settingsStore.defaultLanguage, paths);
  }

  /** Convert all ready files to UTF-8 */
  async function convertAll() {
    isConverting = true;
    await filesStore.convertReady();
    isConverting = false;
  }

  // Count of files ready for conversion (for button label)
  let readyCount = $derived($filesStore.filter(e => e.status === 'ready').length);
</script>

<section class="section">
  <div class="container">
    <div class="is-flex is-justify-content-space-between is-align-items-center mb-4">
      <div>
        <h1 class="title mb-1">sub2utf</h1>
        <p class="subtitle mb-0">Convert subtitle files to UTF-8 for Plex</p>
      </div>
      <button class="button is-ghost" onclick={() => showSettings = true} title="Settings">
        <span style="font-size: 1.5rem;">⚙️</span>
      </button>
    </div>


    <DropZone onfiles={handleFiles} />

    <div class="mt-5">
      <FileList />
    </div>

    {#if $filesStore.length > 0}
      <div class="mt-4 is-flex is-justify-content-flex-end">
        <div class="buttons">
          <button
            class="button is-primary"
            class:is-loading={isConverting}
            disabled={readyCount === 0 || isConverting}
            onclick={convertAll}
          >
            Convert {readyCount > 0 ? `(${readyCount})` : 'All'}
          </button>
          <button
            class="button is-light"
            onclick={() => filesStore.clear()}
            disabled={isConverting}
          >
            Clear
          </button>
        </div>
      </div>
    {/if}
  </div>
</section>

{#if showSettings}
  <Settings onclose={() => showSettings = false} />
{/if}
