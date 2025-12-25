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
    pending: { icon: '⏳', class: 'muted' },
    detecting: { icon: '🔍', class: 'info' },
    ready: { icon: '✓', class: 'success' },
    processing: { icon: '⚙️', class: 'info' },
    done: { icon: '✅', class: 'success' },
    skipped: { icon: '⏭️', class: 'warning' },
    error: { icon: '❌', class: 'danger' }
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
      class="remove-btn"
      onclick={() => onremove(entry.id)}
      title="Remove file"
    >×</button>
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
          <span class="warning" title={mismatchTooltip}>⚠️</span>
        {/if}
      {:else}
        <span class="muted">detecting...</span>
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
      <span class="status-text">{entry.status}</span>
      {#if entry.error}
        <span class="danger" title={entry.error}>⚠</span>
      {/if}
    </div>
  </div>
  {#if entry.error}
    <div class="error-message">
      {entry.error}
    </div>
  {/if}
</div>

<style>
  .file-item {
    padding: 0.75rem;
    border-bottom: 1px solid var(--pico-muted-border-color);
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

  .remove-btn {
    background: none;
    border: none;
    font-size: 1.25rem;
    cursor: pointer;
    padding: 0 0.5rem;
    color: var(--pico-muted-color);
    width: auto;
    margin: 0;
  }

  .remove-btn:hover {
    color: var(--pico-del-color);
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
    color: var(--pico-muted-color);
    font-size: 0.875rem;
  }

  .status-text {
    font-size: 0.875rem;
    text-transform: capitalize;
  }

  .muted { color: var(--pico-muted-color); }
  .info { color: var(--pico-primary); }
  .success { color: var(--pico-ins-color); }
  .warning { color: var(--pico-mark-background-color); }
  .danger { color: var(--pico-del-color); }

  .error-message {
    margin-top: 0.5rem;
    padding: 0.5rem 0.75rem;
    padding-left: 1.5rem;
    font-size: 0.875rem;
    color: var(--pico-del-color);
    background: color-mix(in srgb, var(--pico-del-color) 10%, transparent);
    border-radius: var(--pico-border-radius);
  }
</style>
