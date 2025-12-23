<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { adapter } from '../lib/adapters';

  interface Props {
    onfiles: (files: File[], paths?: string[]) => void;
  }

  let { onfiles }: Props = $props();

  let isDragging = $state(false);
  let unlistenDragDrop: (() => void) | null = null;

  // Check if adapter supports native file operations
  const hasNativeFileOps = !!adapter.setupDragDrop;

  onMount(async () => {
    // Set up native drag-drop if available (Tauri)
    if (adapter.setupDragDrop) {
      unlistenDragDrop = await adapter.setupDragDrop((result) => {
        onfiles(result.files, result.paths);
      });
    }
  });

  onDestroy(() => {
    if (unlistenDragDrop) {
      unlistenDragDrop();
    }
  });

  function handleDragOver(event: DragEvent) {
    event.preventDefault();
    isDragging = true;
  }

  function handleDragLeave(event: DragEvent) {
    event.preventDefault();
    isDragging = false;
  }

  function handleDrop(event: DragEvent) {
    event.preventDefault();
    isDragging = false;

    // Native adapter handles drag-drop via setupDragDrop
    if (hasNativeFileOps) return;

    // Web fallback: use browser's drag-drop
    const files = Array.from(event.dataTransfer?.files || [])
      .filter(file => file.name.endsWith('.srt'));

    if (files.length > 0) {
      onfiles(files);
    }
  }

  function handleFileInput(event: Event) {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files || [])
      .filter(file => file.name.endsWith('.srt'));

    if (files.length > 0) {
      onfiles(files);
    }

    input.value = '';
  }

  async function handleClick(event: MouseEvent) {
    // Use native file dialog if available (Tauri)
    if (adapter.openFileDialog) {
      event.preventDefault();
      const result = await adapter.openFileDialog();
      if (result && result.files.length > 0) {
        onfiles(result.files, result.paths);
      }
      return;
    }
    // Otherwise let the label's default behavior trigger file input
  }
</script>

<label
  class="drop-zone"
  class:is-dragging={isDragging}
  ondragover={handleDragOver}
  ondragleave={handleDragLeave}
  ondrop={handleDrop}
  onclick={handleClick}
>
  <input
    class="file-input"
    type="file"
    accept=".srt"
    multiple
    onchange={handleFileInput}
    disabled={hasNativeFileOps}
  />
  <span class="icon is-large has-text-grey-light">
    <span style="font-size: 2rem;">📁</span>
  </span>
  <p class="mt-2">Drop .srt files here or click to browse</p>
</label>

<style>
  .drop-zone {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    border: 2px dashed #4a4a4a;
    border-radius: 6px;
    padding: 3rem;
    cursor: pointer;
    transition: all 0.2s ease;
    background: transparent;
  }

  .drop-zone:hover,
  .drop-zone.is-dragging {
    border-color: #3273dc;
    background-color: rgba(50, 115, 220, 0.1);
  }

  .file-input {
    display: none;
  }
</style>
