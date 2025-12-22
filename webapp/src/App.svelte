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
  import { webAdapter } from './lib/adapters';
  import DropZone from './components/DropZone.svelte';
  import FileList from './components/FileList.svelte';
  import Settings from './components/Settings.svelte';

  // UI state
  let isConverting = $state(false);
  let showSettings = $state(false);

  // Check for File System Access API (Chrome/Edge only)
  const hasFileSystemAccess = typeof window !== 'undefined' && 'showSaveFilePicker' in window;

  /**
   * Handle files dropped or selected by user.
   * Adds files to store and runs encoding detection.
   */
  async function handleFiles(files: File[]) {
    filesStore.addFiles(files, $settingsStore.defaultLanguage);

    // Detect encoding for each file sequentially
    for (const file of files) {
      const entries = filesStore.getEntries();
      const entry = entries.find(e => e.file === file);
      if (!entry) continue;

      filesStore.updateEntry(entry.id, { status: 'detecting' });

      try {
        const result = await webAdapter.detectEncoding(file);

        // Skip files already in UTF-8
        if (result.encoding.toUpperCase() === 'UTF-8') {
          filesStore.updateEntry(entry.id, {
            encoding: result.encoding,
            status: 'skipped'
          });
        } else {
          filesStore.updateEntry(entry.id, {
            encoding: result.encoding,
            status: 'ready'
          });
        }
      } catch (error) {
        filesStore.updateEntry(entry.id, {
          status: 'error',
          error: error instanceof Error ? error.message : 'Detection failed'
        });
      }
    }
  }

  /**
   * Convert all files with 'ready' status to UTF-8.
   * Saves each file with the selected language suffix.
   */
  async function convertAll() {
    const entries = filesStore.getEntries();
    const toConvert = entries.filter(e => e.status === 'ready');

    if (toConvert.length === 0) return;

    isConverting = true;

    for (const entry of toConvert) {
      filesStore.updateEntry(entry.id, { status: 'processing' });

      try {
        const result = await webAdapter.convertFile(entry.file, entry.encoding);

        if (result.success && result.content) {
          filesStore.updateEntry(entry.id, {
            status: 'done',
            convertedContent: result.content
          });

          // Generate output filename: movie.srt → movie.sr.srt
          const baseName = entry.name.replace(/\.srt$/i, '');
          const outputName = `${baseName}.${entry.language}.srt`;

          await webAdapter.saveFile(outputName, result.content);
        } else {
          filesStore.updateEntry(entry.id, {
            status: 'error',
            error: result.error || 'Conversion failed'
          });
        }
      } catch (error) {
        filesStore.updateEntry(entry.id, {
          status: 'error',
          error: error instanceof Error ? error.message : 'Conversion failed'
        });
      }
    }

    isConverting = false;
  }

  // Count of files ready for conversion (for button label) - use $filesStore for reactivity
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

    {#if !hasFileSystemAccess}
      <div class="notification is-warning is-light">
        <strong>Note:</strong> Your browser doesn't support direct file saving. Files will be downloaded instead.
        For the best experience, use Chrome or Edge.
      </div>
    {/if}

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
