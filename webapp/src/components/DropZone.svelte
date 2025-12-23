<script lang="ts">
  import { onMount, onDestroy } from 'svelte';

  interface Props {
    onfiles: (files: File[], paths?: string[]) => void;
  }

  let { onfiles }: Props = $props();

  let isDragging = $state(false);
  let unlistenTauri: (() => void) | null = null;

  // Check if running in Tauri
  const isTauri = typeof window !== 'undefined' && '__TAURI__' in window;

  onMount(async () => {
    if (isTauri) {
      // Listen for Tauri file drop events to get file paths
      const { getCurrentWebview } = await import('@tauri-apps/api/webview');
      const webview = getCurrentWebview();
      unlistenTauri = await webview.onDragDropEvent(async (event) => {
        if (event.payload.type !== 'drop') return;

        const paths = event.payload.paths.filter((p: string) => p.endsWith('.srt'));
        if (paths.length === 0) return;

        // Create File objects from paths using Tauri's fs plugin
        const files: File[] = [];
        for (const path of paths) {
          try {
            const { readFile } = await import('@tauri-apps/plugin-fs');
            const contents = await readFile(path);
            const name = path.split('/').pop() || path;
            files.push(new File([contents], name));
          } catch (e) {
            console.error('Failed to read file:', path, e);
          }
        }

        if (files.length > 0) {
          onfiles(files, paths);
        }
      });
    }
  });

  onDestroy(() => {
    if (unlistenTauri) {
      unlistenTauri();
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

    // In Tauri, the tauri://drag-drop event handles this
    if (isTauri) return;

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
      // File input doesn't provide paths, so no paths parameter
      onfiles(files);
    }

    // Reset input so same file can be selected again
    input.value = '';
  }

  async function handleClick(event: MouseEvent) {
    if (!isTauri) return; // Let the label's default behavior trigger file input

    event.preventDefault();

    // Use Tauri's native file dialog
    const { open } = await import('@tauri-apps/plugin-dialog');
    const { readFile } = await import('@tauri-apps/plugin-fs');

    const selected = await open({
      multiple: true,
      filters: [{ name: 'Subtitles', extensions: ['srt'] }],
    });

    if (!selected) return;

    const paths = Array.isArray(selected) ? selected : [selected];
    const files: File[] = [];

    for (const path of paths) {
      try {
        const contents = await readFile(path);
        const name = path.split('/').pop() || path;
        files.push(new File([contents], name));
      } catch (e) {
        console.error('Failed to read file:', path, e);
      }
    }

    if (files.length > 0) {
      onfiles(files, paths);
    }
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
    disabled={isTauri}
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
