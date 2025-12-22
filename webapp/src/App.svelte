<script lang="ts">
  import { filesStore } from './stores/files';
  import DropZone from './components/DropZone.svelte';
  import FileList from './components/FileList.svelte';

  function handleFiles(files: File[]) {
    filesStore.addFiles(files);
    console.log('Files added:', files.map(f => f.name));
  }
</script>

<section class="section">
  <div class="container">
    <h1 class="title">sub2utf</h1>
    <p class="subtitle">Convert subtitle files to UTF-8 for Plex</p>

    <DropZone onfiles={handleFiles} />

    <div class="mt-5">
      <FileList />
    </div>
  </div>
</section>
