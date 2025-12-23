<script lang="ts">
  import type { FileEntry } from '../stores/files';
  import EncodingSelect from './EncodingSelect.svelte';
  import LanguageSelect from './LanguageSelect.svelte';
  import languageEncodings from '../data/language-encodings.json';

  interface Props {
    entry: FileEntry;
    onremove: (id: string) => void;
    onencoding: (id: string, encoding: string) => void;
    onlanguage: (id: string, language: string) => void;
  }

  let { entry, onremove, onencoding, onlanguage }: Props = $props();

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

  // Check if encoding matches expected encodings for the selected language
  let expectedEncodings = $derived(
    (languageEncodings as Record<string, string[]>)[entry.language]?.filter(e => e !== 'UTF-8') || []
  );

  let encodingMismatch = $derived(
    entry.encoding &&
    entry.encoding !== 'UTF-8' &&
    expectedEncodings.length > 0 &&
    !expectedEncodings.includes(entry.encoding)
  );

  let mismatchTooltip = $derived(
    `Unusual encoding for this language. Expected: ${expectedEncodings.join(', ')}`
  );
</script>

<div class="file-item">
  <div class="file-header">
    <span class={statusInfo.class}>{statusInfo.icon}</span>
    <span class="filename" title={entry.name}>{entry.name}</span>
    <button
      class="delete is-small"
      onclick={() => onremove(entry.id)}
      title="Remove file"
    ></button>
  </div>
  <div class="file-controls">
    <div class="control-group">
      <span class="control-label">Encoding:</span>
      {#if entry.encoding}
        <EncodingSelect
          value={entry.encoding}
          onchange={(enc) => onencoding(entry.id, enc)}
        />
        {#if encodingMismatch}
          <span class="has-text-warning" title={mismatchTooltip}>⚠️</span>
        {/if}
      {:else}
        <span class="has-text-grey">detecting...</span>
      {/if}
    </div>
    <div class="control-group">
      <span class="control-label">Language:</span>
      <LanguageSelect
        value={entry.language}
        onchange={(lang) => onlanguage(entry.id, lang)}
      />
    </div>
    <div class="control-group">
      <span class="status-text is-capitalized">{entry.status}</span>
      {#if entry.error}
        <span class="has-text-danger" title={entry.error}>⚠</span>
      {/if}
    </div>
  </div>
</div>

<style>
  .file-item {
    padding: 0.75rem;
    border-bottom: 1px solid var(--bulma-border);
  }

  .file-item:last-child {
    border-bottom: none;
  }

  .file-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
  }

  .filename {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-weight: 500;
  }

  .file-controls {
    display: flex;
    align-items: center;
    gap: 1.5rem;
    padding-left: 1.5rem;
  }

  .control-group {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .control-label {
    color: var(--bulma-text-weak);
    font-size: 0.875rem;
  }

  .status-text {
    font-size: 0.875rem;
  }
</style>
