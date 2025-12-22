<script lang="ts">
  import { filesStore } from '../stores/files';
  import FileItem from './FileItem.svelte';

  function handleRemove(id: string) {
    filesStore.removeEntry(id);
  }

  function handleEncoding(id: string, encoding: string) {
    filesStore.updateEntry(id, { encoding });
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
          <th>Status</th>
          <th style="width: 40px"></th>
        </tr>
      </thead>
      <tbody>
        {#each $filesStore as entry (entry.id)}
          <FileItem {entry} onremove={handleRemove} onencoding={handleEncoding} />
        {/each}
      </tbody>
    </table>
  </div>
{:else}
  <p class="has-text-grey has-text-centered">No files added yet</p>
{/if}
