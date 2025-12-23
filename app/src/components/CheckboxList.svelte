<script lang="ts">
  interface Item {
    code: string;
    name: string;
  }

  interface Props {
    items: Item[];
    selected: Set<string>;
    ontoggle: (code: string) => void;
    columns?: number;
  }

  let { items, selected, ontoggle, columns = 3 }: Props = $props();
</script>

<div class="checkbox-list" style="grid-template-columns: repeat({columns}, 1fr)">
  {#each items as item}
    {@const isLastSelected = selected.has(item.code) && selected.size === 1}
    <label class="checkbox-item" class:is-disabled={isLastSelected} title="{item.name} ({item.code})">
      <input
        type="checkbox"
        checked={selected.has(item.code)}
        disabled={isLastSelected}
        onchange={() => ontoggle(item.code)}
      />
      <span class="checkbox-text">{item.name} ({item.code})</span>
    </label>
  {/each}
</div>

<style>
  .checkbox-list {
    border: 1px solid var(--pico-muted-border-color);
    border-radius: var(--pico-border-radius);
    padding: 0.5rem;
    display: grid;
    gap: 0.25rem;
  }

  .checkbox-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.875rem;
    min-width: 0;
    cursor: pointer;
  }

  .checkbox-item input[type="checkbox"] {
    margin: 0;
    width: 1.25rem;
    height: 1.25rem;
  }

  .checkbox-text {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .checkbox-item.is-disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
</style>
