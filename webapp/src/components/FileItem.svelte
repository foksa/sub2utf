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
        {#if encodingMismatch}
          <span
            class="ml-1 has-text-warning"
            title={mismatchTooltip}
          >⚠️</span>
        {/if}
      </div>
    {:else}
      <span class="has-text-grey">—</span>
    {/if}
  </td>
  <td>
    <LanguageSelect
      value={entry.language}
      onchange={(lang) => onlanguage(entry.id, lang)}
    />
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
