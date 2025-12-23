<script lang="ts">
  import { settingsStore, type LanguageOption } from '../stores/settings';
  import allEncodings from '../data/encodings.json';
  import allLanguages from '../data/languages.json';

  interface Props {
    onclose: () => void;
  }

  let { onclose }: Props = $props();

  let defaultLang = $state($settingsStore.defaultLanguage);

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
      languages: langs
    });
    onclose();
  }

  function reset() {
    settingsStore.reset();
    defaultLang = 'sr';
    selectedEncodings = new Set($settingsStore.encodings);
    selectedLanguages = new Set($settingsStore.languages.map(l => l.code));
  }
</script>

<div class="modal is-active">
  <div class="modal-background" onclick={onclose}></div>
  <div class="modal-card">
    <header class="modal-card-head">
      <p class="modal-card-title">Settings</p>
      <button class="delete" aria-label="close" onclick={onclose}></button>
    </header>
    <section class="modal-card-body">
      <div class="field">
        <label class="label" for="defaultLang">Default Output Language</label>
        <div class="control">
          <div class="select is-small">
            <select bind:value={defaultLang}>
              {#each availableLanguages as lang}
                <option value={lang.code}>{lang.name} ({lang.code})</option>
              {/each}
            </select>
          </div>
        </div>
        <p class="help">Language suffix added to converted files (e.g., movie.sr.srt)</p>
      </div>

      <hr />

      <div class="field">
        <label class="label">Languages ({selectedLanguages.size} selected)</label>
        <div class="checkbox-list">
          {#each allLanguages as lang}
            {@const isLastSelected = selectedLanguages.has(lang.code) && selectedLanguages.size === 1}
            <label class="checkbox" class:is-disabled={isLastSelected}>
              <input
                type="checkbox"
                checked={selectedLanguages.has(lang.code)}
                disabled={isLastSelected}
                onchange={() => toggleLanguage(lang.code)}
              />
              {lang.name} ({lang.code})
            </label>
          {/each}
        </div>
        <p class="help">At least one language must be selected</p>
      </div>

      <div class="field">
        <label class="label">Encodings ({selectedEncodings.size} selected)</label>
        <div class="checkbox-list">
          {#each allEncodings as enc}
            {@const isLastSelected = selectedEncodings.has(enc.code) && selectedEncodings.size === 1}
            <label class="checkbox" class:is-disabled={isLastSelected}>
              <input
                type="checkbox"
                checked={selectedEncodings.has(enc.code)}
                disabled={isLastSelected}
                onchange={() => toggleEncoding(enc.code)}
              />
              {enc.name} ({enc.code})
            </label>
          {/each}
        </div>
        <p class="help">At least one encoding must be selected</p>
      </div>
    </section>
    <footer class="modal-card-foot">
      <div class="buttons">
        <button class="button is-primary" onclick={save}>Save</button>
        <button class="button" onclick={onclose}>Cancel</button>
      </div>
      <button class="button is-text" onclick={reset}>Reset to Defaults</button>
    </footer>
  </div>
</div>

<style>
  .modal-card-foot {
    justify-content: space-between;
  }

  .checkbox-list {
    max-height: 150px;
    overflow-y: auto;
    border: 1px solid #363636;
    border-radius: 4px;
    padding: 0.5rem;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 0.25rem;
  }

  .checkbox-list .checkbox {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    font-size: 0.875rem;
    white-space: nowrap;
  }

  .checkbox-list .checkbox.is-disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
</style>
