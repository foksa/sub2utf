<script lang="ts">
  import { webAdapter } from './lib/adapters';

  let encodingResult = '';

  async function testEncoding(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    const result = await webAdapter.detectEncoding(file);
    encodingResult = `Encoding: ${result.encoding}, Confidence: ${(result.confidence * 100).toFixed(1)}%`;
    console.log('Encoding detection result:', result);
  }
</script>

<section class="section">
  <div class="container">
    <h1 class="title">sub2utf</h1>
    <p class="subtitle">Convert subtitle files to UTF-8 for Plex</p>

    <div class="field">
      <label class="label">Test Encoding Detection</label>
      <div class="control">
        <input class="input" type="file" accept=".srt" onchange={testEncoding} />
      </div>
    </div>

    {#if encodingResult}
      <div class="notification is-info">
        {encodingResult}
      </div>
    {/if}
  </div>
</section>
