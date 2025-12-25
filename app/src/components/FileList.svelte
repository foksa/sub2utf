<script lang="ts">
  import { filesStore } from '../stores/files';
  import FileItem from './FileItem.svelte';

  /**
   * Remove a file entry from the list.
   * @param id - Entry ID to remove
   */
  function handleRemove(id: string): void {
    filesStore.removeEntry(id);
  }

  /**
   * Handle encoding change for a file entry.
   * Resets status to 'ready' if file was already converted.
   * @param id - Entry ID to update
   * @param encoding - New encoding value
   */
  function handleEncoding(id: string, encoding: string): void {
    const entry = $filesStore.find(e => e.id === id);
    // Reset to ready if file was already converted, so user can convert again
    const status = entry?.status === 'done' ? 'ready' : entry?.status;
    filesStore.updateEntry(id, { encoding, status });
  }

  /**
   * Handle language change for a file entry.
   * Resets status to 'ready' if file was already converted.
   * @param id - Entry ID to update
   * @param language - New language code
   */
  function handleLanguage(id: string, language: string): void {
    const entry = $filesStore.find(e => e.id === id);
    // Reset to ready if file was already converted, so user can convert again
    const status = entry?.status === 'done' ? 'ready' : entry?.status;
    filesStore.updateEntry(id, { language, status });
  }
</script>

{#if $filesStore.length > 0}
  <div class="file-list">
    {#each $filesStore as entry (entry.id)}
      <FileItem {entry} onremove={handleRemove} onencoding={handleEncoding} onlanguage={handleLanguage} />
    {/each}
  </div>
{:else}
  <p class="empty-text">No files added yet</p>
{/if}

<style>
  .file-list {
    border: 1px solid var(--pico-muted-border-color);
    border-radius: var(--pico-border-radius);
  }

  .empty-text {
    text-align: center;
    color: var(--pico-muted-color);
  }
</style>
