<script lang="ts">
  import { settingsStore } from '../stores/settings';
  import allEncodings from '../data/encodings.json';

  // Lookup map for encoding names
  const encodingNames = new Map(allEncodings.map(e => [e.code, e.name]));

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
      <option value={enc}>{encodingNames.get(enc) || enc} ({enc})</option>
    {/each}
  </select>
</div>
