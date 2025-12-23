<script lang="ts">
  interface Props {
    onfiles: (files: File[]) => void;
  }

  let { onfiles }: Props = $props();

  let isDragging = $state(false);

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

    // Reset input so same file can be selected again
    input.value = '';
  }
</script>

<label
  class="drop-zone"
  class:is-dragging={isDragging}
  ondragover={handleDragOver}
  ondragleave={handleDragLeave}
  ondrop={handleDrop}
>
  <input
    class="file-input"
    type="file"
    accept=".srt"
    multiple
    onchange={handleFileInput}
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
