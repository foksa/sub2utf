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

  /**
   * Handle dragover event to enable drop.
   * @param event - Drag event
   */
  function handleDragOver(event: DragEvent): void {
    event.preventDefault();
    isDragging = true;
  }

  /**
   * Handle dragleave event to reset visual state.
   * @param event - Drag event
   */
  function handleDragLeave(event: DragEvent): void {
    event.preventDefault();
    isDragging = false;
  }

  /**
   * Handle file drop event (web fallback only).
   * @param event - Drop event containing files
   */
  function handleDrop(event: DragEvent): void {
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

  /**
   * Handle file input change event (web fallback).
   * @param event - Input change event
   */
  function handleFileInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files || [])
      .filter(file => file.name.endsWith('.srt'));

    if (files.length > 0) {
      onfiles(files);
    }

    input.value = '';
  }

  /**
   * Handle click to open file picker.
   * Uses native dialog in Tauri, falls back to input in web.
   * @param event - Mouse click event
   */
  async function handleClick(event: MouseEvent): Promise<void> {
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
  <span class="icon">📁</span>
  <p>Drop .srt files here or click to browse</p>
</label>

<style>
  .drop-zone {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    border: 2px dashed var(--pico-muted-border-color);
    border-radius: var(--pico-border-radius);
    padding: 3rem;
    cursor: pointer;
    transition: all 0.2s ease;
    background: transparent;
  }

  .drop-zone:hover,
  .drop-zone.is-dragging {
    border-color: var(--pico-primary);
    background-color: var(--pico-primary-focus);
  }

  .drop-zone p {
    margin: 0;
    color: var(--pico-muted-color);
  }

  .icon {
    font-size: 2rem;
    margin-bottom: 0.5rem;
  }

  .file-input {
    display: none;
  }
</style>
