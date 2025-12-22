<script lang="ts">
  import type { FileEntry } from '../stores/files';
  import EncodingSelect from './EncodingSelect.svelte';

  interface Props {
    entry: FileEntry;
    onremove: (id: string) => void;
    onencoding: (id: string, encoding: string) => void;
  }

  let { entry, onremove, onencoding }: Props = $props();

  const statusIcons: Record<string, { icon: string; class: string }> = {
    pending: { icon: '⏳', class: 'has-text-grey' },
    detecting: { icon: '🔍', class: 'has-text-info' },
    ready: { icon: '✓', class: 'has-text-success' },
    processing: { icon: '⚙️', class: 'has-text-info' },
    done: { icon: '✅', class: 'has-text-success' },
    skipped: { icon: '⏭️', class: 'has-text-warning' },
    error: { icon: '❌', class: 'has-text-danger' }
  };

  let statusInfo = $derived(statusIcons[entry.status] || statusIcons.pending);
</script>

<tr>
  <td>
    <span class={statusInfo.class}>{statusInfo.icon}</span>
  </td>
  <td>{entry.name}</td>
  <td>
    {#if entry.encoding}
      <div class="is-flex is-align-items-center">
        <EncodingSelect
          value={entry.encoding}
          onchange={(enc) => onencoding(entry.id, enc)}
        />
        <span class="ml-2 has-text-grey-light is-size-7" class:has-text-warning={entry.confidence < 0.7}>
          ({(entry.confidence * 100).toFixed(0)}%)
        </span>
      </div>
    {:else}
      <span class="has-text-grey">—</span>
    {/if}
  </td>
  <td>
    <span class="is-capitalized">{entry.status}</span>
    {#if entry.error}
      <span class="has-text-danger ml-2" title={entry.error}>⚠</span>
    {/if}
  </td>
  <td>
    <button
      class="delete is-small"
      onclick={() => onremove(entry.id)}
      title="Remove file"
    ></button>
  </td>
</tr>
