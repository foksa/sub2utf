<script lang="ts">
  import { settingsStore, type LanguageOption } from '../stores/settings';
  import { isTauri } from '../lib/platform';
  import allEncodings from '../data/encodings.json';
  import allLanguages from '../data/languages.json';
  import CheckboxList from './CheckboxList.svelte';

  interface Props {
    onclose: () => void;
  }

  let { onclose }: Props = $props();

  let defaultLang = $state($settingsStore.defaultLanguage);
  let promptForSaveLocation = $state($settingsStore.promptForSaveLocation);
  let activeTab = $state<'languages' | 'encodings'>('languages');

  // Selected encodings and languages (as Sets for easy lookup)
  let selectedEncodings = $state(new Set($settingsStore.encodings));
  let selectedLanguages = $state(new Set($settingsStore.languages.map(l => l.code)));

  // Derive available languages for the default language dropdown
  let availableLanguages = $derived(
    allLanguages.filter(l => selectedLanguages.has(l.code))
  );

  // Auto-fix default language if it's no longer in the selected list
  $effect(() => {
    if (!selectedLanguages.has(defaultLang) && availableLanguages.length > 0) {
      defaultLang = availableLanguages[0].code;
    }
  });

  function toggleEncoding(enc: string) {
    if (selectedEncodings.has(enc)) {
      selectedEncodings.delete(enc);
    } else {
      selectedEncodings.add(enc);
    }
    selectedEncodings = new Set(selectedEncodings); // trigger reactivity
  }

  function toggleLanguage(code: string) {
    if (selectedLanguages.has(code)) {
      selectedLanguages.delete(code);
    } else {
      selectedLanguages.add(code);
    }
    selectedLanguages = new Set(selectedLanguages); // trigger reactivity
  }

  function save() {
    // Convert selected languages back to LanguageOption[]
    const langs: LanguageOption[] = allLanguages
      .filter(l => selectedLanguages.has(l.code))
      .map(l => ({ code: l.code, name: l.name }));

    settingsStore.update({
      defaultLanguage: defaultLang,
      encodings: Array.from(selectedEncodings),
      languages: langs,
      promptForSaveLocation
    });
    onclose();
  }

  function reset() {
    settingsStore.reset();
    defaultLang = 'sr';
    promptForSaveLocation = false;
    selectedEncodings = new Set($settingsStore.encodings);
    selectedLanguages = new Set($settingsStore.languages.map(l => l.code));
  }
</script>

<dialog open>
  <article>
    <header>
      <button aria-label="Close" class="close" onclick={onclose}></button>
      <h3>Settings</h3>
    </header>

    {#if isTauri}
      <label class="toggle-field">
        <input type="checkbox" role="switch" bind:checked={promptForSaveLocation} />
        <span>Ask where to save each file</span>
      </label>
      <hr />
    {/if}

    <div class="field">
      <label for="defaultLang">Default Output Language</label>
      <select id="defaultLang" bind:value={defaultLang}>
        {#each availableLanguages as lang}
          <option value={lang.code}>{lang.name} ({lang.code})</option>
        {/each}
      </select>
      <small>Language suffix added to converted files (e.g., movie.sr.srt)</small>
    </div>

    <div class="tabs">
      <button
        class:active={activeTab === 'languages'}
        onclick={() => activeTab = 'languages'}
      >
        Languages ({selectedLanguages.size})
      </button>
      <button
        class:active={activeTab === 'encodings'}
        onclick={() => activeTab = 'encodings'}
      >
        Encodings ({selectedEncodings.size})
      </button>
    </div>

    <div class="tab-content">
      {#if activeTab === 'languages'}
        <CheckboxList
          items={allLanguages}
          selected={selectedLanguages}
          ontoggle={toggleLanguage}
        />
        <small>At least one language must be selected</small>
      {:else}
        <CheckboxList
          items={allEncodings}
          selected={selectedEncodings}
          ontoggle={toggleEncoding}
          columns={2}
        />
        <small>At least one encoding must be selected</small>
      {/if}
    </div>

    <footer>
      <div class="footer-actions">
        <div class="primary-actions">
          <button class="primary" onclick={save}>Save</button>
          <button class="secondary" onclick={onclose}>Cancel</button>
        </div>
        <button class="outline" onclick={reset}>Reset to Defaults</button>
      </div>
    </footer>
  </article>
</dialog>
<div class="backdrop" onclick={onclose}></div>

<style>
  dialog {
    position: fixed;
    inset: 0;
    width: 100%;
    height: 100%;
    max-width: 900px;
    max-height: 650px;
    margin: auto;
    z-index: 100;
    overflow: hidden;
    border: none;
  }

  dialog article {
    margin: 0;
    min-height: 100%;
    display: flex;
    flex-direction: column;
  }

  .backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 99;
  }

  .field {
    margin-bottom: 0.5rem;
  }

  .field label {
    display: block;
    margin-bottom: 0.25rem;
  }

  .field select {
    margin-bottom: 0;
    padding: 0.5rem 0.75rem;
  }

  .field small {
    display: block;
    margin-top: 0.25rem;
    color: var(--pico-muted-color);
  }

  .toggle-field {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.5rem 0;
    cursor: pointer;
  }

  .toggle-field input[type="checkbox"] {
    margin: 0;
  }

  .tabs {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }

  .tabs button {
    flex: 1;
    margin: 0;
    padding: 0.5rem 0.75rem;
    background: transparent;
    border: 1px solid var(--pico-muted-border-color);
    color: var(--pico-muted-color);
  }

  .tabs button.active {
    background: var(--pico-primary-background);
    border-color: var(--pico-primary);
    color: var(--pico-primary-inverse);
  }

  .tab-content {
    flex: 1;
    overflow-y: auto;
  }

  .tab-content small {
    display: block;
    margin-top: 0.5rem;
    color: var(--pico-muted-color);
  }

  footer {
    padding-top: 1rem;
    margin-top: auto;
  }

  .footer-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
  }

  .primary-actions {
    display: flex;
    gap: 0.5rem;
  }

  .primary-actions button,
  .footer-actions > button {
    width: auto;
    margin: 0;
    padding: 0.5rem 1rem;
  }
</style>
