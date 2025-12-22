<script lang="ts">
  import { settingsStore } from '../stores/settings';
  import LanguageSelect from './LanguageSelect.svelte';

  interface Props {
    onclose: () => void;
  }

  let { onclose }: Props = $props();

  let threshold = $state($settingsStore.confidenceThreshold);
  let defaultLang = $state($settingsStore.defaultLanguage);

  function save() {
    settingsStore.update({
      confidenceThreshold: threshold,
      defaultLanguage: defaultLang
    });
    onclose();
  }

  function reset() {
    settingsStore.reset();
    threshold = 0.7;
    defaultLang = 'sr';
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
        <label class="label" for="threshold">
          Confidence Threshold: {(threshold * 100).toFixed(0)}%
        </label>
        <div class="control">
          <input
            id="threshold"
            class="slider is-fullwidth"
            type="range"
            min="0"
            max="1"
            step="0.05"
            bind:value={threshold}
          />
        </div>
        <p class="help">Show warning when encoding confidence is below this value</p>
      </div>

      <div class="field">
        <label class="label" for="defaultLang">Default Output Language</label>
        <div class="control">
          <LanguageSelect value={defaultLang} onchange={(lang) => defaultLang = lang} />
        </div>
        <p class="help">Language suffix added to converted files (e.g., movie.sr.srt)</p>
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

  .slider {
    width: 100%;
    cursor: pointer;
  }
</style>
