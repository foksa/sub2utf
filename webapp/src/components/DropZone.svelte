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

<div
  class="drop-zone box has-text-centered"
  class:is-dragging={isDragging}
  ondragover={handleDragOver}
  ondragleave={handleDragLeave}
  ondrop={handleDrop}
  role="button"
  tabindex="0"
>
  <div class="file is-centered is-boxed is-large">
    <label class="file-label">
      <input
        class="file-input"
        type="file"
        accept=".srt"
        multiple
        onchange={handleFileInput}
      />
      <span class="file-cta">
        <span class="file-icon">
          <i class="fas fa-upload"></i>
        </span>
        <span class="file-label-text">
          Drop .srt files here or click to browse
        </span>
      </span>
    </label>
  </div>
</div>

<style>
  .drop-zone {
    border: 2px dashed #dbdbdb;
    padding: 3rem;
    transition: all 0.2s ease;
    cursor: pointer;
  }

  .drop-zone:hover,
  .drop-zone.is-dragging {
    border-color: #3273dc;
    background-color: #f5f8ff;
  }

  .file-label-text {
    white-space: normal;
  }
</style>
