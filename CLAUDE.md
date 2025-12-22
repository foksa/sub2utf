# Commands

## `init vscode`
Copy VSCode configs for marker highlighting:
```bash
cp -r .claude/skills/document-iteration-skill/assets/editor-configs/vscode/.vscode .
```
Then install TODO Highlight v2 extension.

## `init obsidian <vault>`
1. Copy Obsidian highlighting configs to vault:
   ```bash
   mkdir -p <vault>/.obsidian/plugins <vault>/.obsidian/snippets
   cp -r .claude/skills/document-iteration-skill/assets/editor-configs/obsidian/.obsidian/* <vault>/.obsidian/
   ```
   Replace `<vault>` with your vault folder (e.g., `docs/`, `notes/`).

2. Detect link style:
   - If `<vault>/.obsidian/app.json` exists, read `useMarkdownLinks`:
     - `true` → standard markdown links `[text](file.md)`
     - `false` or missing → wiki-style links `[[filename]]`
   - If `app.json` doesn't exist, ask user which style they prefer.

3. Add to CLAUDE.md (below this Commands section):
   ```markdown
   ## Obsidian Vault: <vault>
   Use [wiki-style links | standard markdown links] for internal links.
   ```

4. Tell user to enable Regex Mark plugin in Obsidian.

## Obsidian Vault: docs/
Use standard markdown links `[text](file.md)` for internal links.