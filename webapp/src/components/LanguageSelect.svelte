<script lang="ts">
  interface Props {
    value: string;
    onchange: (lang: string) => void;
  }

  let { value, onchange }: Props = $props();

  const languages = [
    { code: 'sr', name: 'Serbian' },
    { code: 'hr', name: 'Croatian' },
    { code: 'bs', name: 'Bosnian' },
    { code: 'sl', name: 'Slovenian' },
    { code: 'mk', name: 'Macedonian' },
    { code: 'bg', name: 'Bulgarian' },
    { code: 'ru', name: 'Russian' },
    { code: 'uk', name: 'Ukrainian' },
    { code: 'pl', name: 'Polish' },
    { code: 'cs', name: 'Czech' },
    { code: 'sk', name: 'Slovak' },
    { code: 'hu', name: 'Hungarian' }
  ];

  function handleChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    onchange(select.value);
  }
</script>

<div class="select is-small">
  <select {value} onchange={handleChange}>
    {#each languages as lang}
      <option value={lang.code}>{lang.name} ({lang.code})</option>
    {/each}
  </select>
</div>
