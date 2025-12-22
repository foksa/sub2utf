<script lang="ts">
  import { filesStore } from './stores/files';
  import { webAdapter } from './lib/adapters';
  import DropZone from './components/DropZone.svelte';
  import FileList from './components/FileList.svelte';
  import LanguageSelect from './components/LanguageSelect.svelte';

  let outputLanguage = $state('sr');

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
        filesStore.updateEntry(entry.id, {
          encoding: result.encoding,
          confidence: result.confidence,
          status: 'ready'
        });
      } catch (error) {
        filesStore.updateEntry(entry.id, {
          status: 'error',
          error: error instanceof Error ? error.message : 'Detection failed'
        });
      }
    }
  }
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
      </div>
    {/if}
  </div>
</section>
