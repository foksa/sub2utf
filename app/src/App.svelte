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
  import { isTauri } from './lib/platform';
  import DropZone from './components/DropZone.svelte';
  import FileList from './components/FileList.svelte';
  import Settings from './components/Settings.svelte';

  // UI state
  let isConverting = $state(false);
  let showSettings = $state(false);

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

<main class="container">
  <header class="header">
    <div>
      <h1>sub2utf</h1>
      <p class="subtitle">Convert subtitle files to UTF-8 for Plex</p>
    </div>
    <button class="outline settings-btn" onclick={() => showSettings = true} title="Settings">
      ⚙️
    </button>
  </header>

  <DropZone onfiles={handleFiles} />

  <div class="file-section">
    <FileList />
  </div>

  {#if $filesStore.length > 0}
    <div class="actions">
      <button
        class="primary"
        disabled={readyCount === 0 || isConverting}
        aria-busy={isConverting}
        onclick={convertAll}
      >
        Convert {readyCount > 0 ? `(${readyCount})` : 'All'}
      </button>
      <button
        class="secondary"
        onclick={() => filesStore.clear()}
        disabled={isConverting}
      >
        Clear
      </button>
    </div>
  {/if}
</main>

{#if showSettings}
  <Settings onclose={() => showSettings = false} />
{/if}

<style>
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
  }

  .header h1 {
    margin-bottom: 0.25rem;
  }

  .subtitle {
    margin: 0;
    color: var(--pico-muted-color);
  }

  .settings-btn {
    font-size: 1.5rem;
    padding: 0.5rem;
    border: none;
  }

  .file-section {
    margin-top: 1.5rem;
  }

  .actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
    margin-top: 1rem;
  }

  .actions button {
    width: auto;
    padding: 0.5rem 1rem;
  }
</style>
