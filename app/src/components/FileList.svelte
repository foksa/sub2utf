<script lang="ts">
  import { filesStore } from '../stores/files';
  import FileItem from './FileItem.svelte';

  function handleRemove(id: string) {
    filesStore.removeEntry(id);
  }

  function handleEncoding(id: string, encoding: string) {
    const entry = $filesStore.find(e => e.id === id);
    // Reset to ready if file was already converted, so user can convert again
    const status = entry?.status === 'done' ? 'ready' : entry?.status;
    filesStore.updateEntry(id, { encoding, status });
  }

  function handleLanguage(id: string, language: string) {
    const entry = $filesStore.find(e => e.id === id);
    // Reset to ready if file was already converted, so user can convert again
    const status = entry?.status === 'done' ? 'ready' : entry?.status;
    filesStore.updateEntry(id, { language, status });
  }
</script>

{#if $filesStore.length > 0}
  <div class="table-container">
    <table class="table is-fullwidth is-hoverable">
      <thead>
        <tr>
          <th style="width: 40px"></th>
          <th>File</th>
          <th>Encoding</th>
          <th>Language</th>
          <th>Status</th>
          <th style="width: 40px"></th>
        </tr>
      </thead>
      <tbody>
        {#each $filesStore as entry (entry.id)}
          <FileItem {entry} onremove={handleRemove} onencoding={handleEncoding} onlanguage={handleLanguage} />
        {/each}
      </tbody>
    </table>
  </div>
{:else}
  <p class="has-text-grey has-text-centered">No files added yet</p>
{/if}
