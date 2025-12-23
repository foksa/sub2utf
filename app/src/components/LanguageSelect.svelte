<script lang="ts">
  import { settingsStore } from '../stores/settings';

  interface Props {
    value: string;
    onchange: (lang: string) => void;
  }

  let { value, onchange }: Props = $props();

  function handleChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    onchange(select.value);
  }
</script>

<div class="select is-small">
  <select {value} onchange={handleChange}>
    {#each $settingsStore.languages as lang}
      <option value={lang.code}>{lang.name} ({lang.code})</option>
    {/each}
  </select>
</div>
