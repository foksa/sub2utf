<script lang="ts">
  import { filesStore } from './stores/files';
  import { webAdapter } from './lib/adapters';
  import DropZone from './components/DropZone.svelte';
  import FileList from './components/FileList.svelte';
  import LanguageSelect from './components/LanguageSelect.svelte';

  let outputLanguage = $state('sr');
  let isConverting = $state(false);

  async function handleFiles(files: File[]) {
    filesStore.addFiles(files);

    // Detect encoding for each file
    for (const file of files) {
      const entries = filesStore.getEntries();
      const entry = entries.find(e => e.file === file);
      if (!entry) continue;

      filesStore.updateEntry(entry.id, { status: 'detecting' });

      try {
        const result = await webAdapter.detectEncoding(file);

        // Skip if already UTF-8
        if (result.encoding.toUpperCase() === 'UTF-8') {
          filesStore.updateEntry(entry.id, {
            encoding: result.encoding,
            confidence: result.confidence,
            status: 'skipped'
          });
        } else {
          filesStore.updateEntry(entry.id, {
            encoding: result.encoding,
            confidence: result.confidence,
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

          // Generate output filename with language suffix
          const baseName = entry.name.replace(/\.srt$/i, '');
          const outputName = `${baseName}.${outputLanguage}.srt`;

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

  let readyCount = $derived(filesStore.getEntries().filter(e => e.status === 'ready').length);
</script>

<section class="section">
  <div class="container">
    <h1 class="title">sub2utf</h1>
    <p class="subtitle">Convert subtitle files to UTF-8 for Plex</p>

    <DropZone onfiles={handleFiles} />

    <div class="mt-5">
      <FileList />
    </div>

    {#if $filesStore.length > 0}
      <div class="mt-4 is-flex is-align-items-center is-justify-content-space-between">
        <div class="is-flex is-align-items-center">
          <span class="mr-2">Output language:</span>
          <LanguageSelect value={outputLanguage} onchange={(lang) => outputLanguage = lang} />
        </div>
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
