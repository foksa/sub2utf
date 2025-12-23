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
    <label class="checkbox" class:is-disabled={isLastSelected} title="{item.name} ({item.code})">
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
    max-height: 150px;
    overflow-y: auto;
    border: 1px solid #363636;
    border-radius: 4px;
    padding: 0.5rem;
    display: grid;
    gap: 0.25rem;
  }

  .checkbox-list .checkbox {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    font-size: 0.875rem;
    min-width: 0;
  }

  .checkbox-list .checkbox-text {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .checkbox-list .checkbox.is-disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
</style>
