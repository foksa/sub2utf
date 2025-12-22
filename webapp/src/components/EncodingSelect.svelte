<script lang="ts">
  import { settingsStore } from '../stores/settings';

  interface Props {
    value: string;
    onchange: (encoding: string) => void;
  }

  let { value, onchange }: Props = $props();

  function handleChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    onchange(select.value);
  }
</script>

<div class="select is-small">
  <select {value} onchange={handleChange}>
    {#each $settingsStore.encodings as enc}
      <option value={enc}>{enc}</option>
    {/each}
  </select>
</div>
