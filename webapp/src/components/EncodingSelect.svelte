<script lang="ts">
  interface Props {
    value: string;
    onchange: (encoding: string) => void;
  }

  let { value, onchange }: Props = $props();

  const encodings = [
    'UTF-8',
    'windows-1250',
    'windows-1251',
    'windows-1252',
    'ISO-8859-1',
    'ISO-8859-2',
    'ISO-8859-5',
    'ISO-8859-15',
    'KOI8-R',
    'KOI8-U'
  ];

  function handleChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    onchange(select.value);
  }
</script>

<div class="select is-small">
  <select {value} onchange={handleChange}>
    {#each encodings as enc}
      <option value={enc}>{enc}</option>
    {/each}
  </select>
</div>
