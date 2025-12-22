# Implementation Case Study: Plan vs Reality

A retrospective on building sub2utf v0.5, documenting where AI implementation diverged from the plan and lessons learned.

## The Plan

[implementation-plan-final.md](implementation-plan-final.md) specified a structured 7-phase build:

1. Project Setup (Svelte + Bulma + jschardet)
2. Web Adapter (encoding detection, conversion, file saving)
3. Frontend Components (DropZone, FileList, FileItem)
4. Integration (wire up detection, add selectors)
5. Conversion Flow (convert button, save files, error handling)
6. Polish (UI refinement, settings panel, browser compatibility)
7. Deploy (build, deploy, tag release)

Each phase had explicit git checkpoints:
```bash
git commit -m "Add web adapter with jschardet encoding detection"
```

## What Actually Happened

### Missed Git Commits

The plan specified commits after each phase. In practice:
- Multiple phases were implemented in single sessions
- Commits were batched or forgotten entirely
- The checkpoint discipline was lost to "flow state"

**Why:** Claude optimizes for task completion, not process adherence. Once coding starts, the commit instructions become distant context.

### Scope Creep: jschardet → chardetng-wasm

The plan specified jschardet for encoding detection. During testing:

1. User tested with Serbian subtitle file (windows-1250 encoded)
2. jschardet detected `windows-1252` with 95% confidence
3. Converted file had corrupted characters: "prièala" instead of proper Serbian

**Root cause:** jschardet is optimized for general web content, not Balkan language encodings. The statistical models for windows-1250 vs windows-1252 are too similar.

**The pivot:** User asked "can we port Tauri's detection to WASM?" - referring to chardetng (Mozilla's Firefox encoding detector written in Rust). Turns out `chardetng-wasm` already existed on npm.

Result: Replaced jschardet with chardetng-wasm, which correctly detected windows-1250 for Serbian text.

**What this required:**
- Install vite-plugin-wasm and vite-plugin-top-level-await
- Update vite.config.ts for WASM support
- Rewrite adapter to use chardetng's simpler API (no confidence scores)
- Remove confidence threshold from settings (chardetng is deterministic)

### Features Added Beyond Plan

- **Per-file language selection** - Plan had global language setting; user wanted per-file control
- **Language-encoding mismatch warning** - Added warning icon when detected encoding doesn't match expected encodings for selected language
- **Re-conversion on settings change** - Changing encoding/language on a "done" file resets it to "ready"

### Features Partially Implemented

- **Editable encoding/language lists in settings** - Plan specified these as editable. Implementation used checkbox selection from predefined lists, not free-form editing.

### Plan Ambiguities Discovered

- "JSZip for bundling multiple files" - Never implemented, unclear if needed
- "Show summary when complete" - What summary? Count? Modal? Toast?

## Why Plans Don't Execute Themselves

### The Uncomfortable Truth

Plans work better for humans than for AI:
- Humans refer back constantly during implementation
- AI loads context once and runs with it
- Long detailed docs get skimmed, not followed precisely
- AI optimizes for "getting the task done" over "following the process"

### Context Window Psychology

When given a 300-line implementation plan:
1. AI reads and "understands" the full plan
2. User asks to implement Phase 3
3. AI focuses on Phase 3 requirements
4. Peripheral details (git commits, future phases) fade from working attention
5. Implementation proceeds with good intent but selective memory

## Mitigations That Work

### 1. Shorter, Atomic Tasks

Instead of:
> "Follow implementation-plan-final.md"

Try:
> "Implement Phase 3 Step 3.1: DropZone component. After implementation, commit with message 'Add DropZone component'."

One phase. One step. Explicit commit instruction.

### 2. Verification Checkboxes in Plans

Add checkboxes to each step during planning:

```markdown
### Step 6.2: Settings panel

**Verify:**
- [ ] Confidence threshold slider works
- [ ] Encoding list is editable
- [ ] Language list is editable
- [ ] Default language dropdown
- [ ] Settings persist after refresh
```

This forces attention to each item. It's harder to skip "language list editable" when you have to explicitly write "[ ] language list editable - not done".

### 3. Self-Verification Step

After each phase, ask:
> "List what you implemented and compare against the plan. What's missing?"

The act of writing it out catches gaps that implementation momentum would skip.

### 4. End-of-Implementation Review

Before final commit:
> "Create a checklist from the plan and mark each item as done/not done."

This catches drift before it becomes technical debt.

## The jschardet Lesson

### Detection Libraries Comparison

| Library | Approach | Balkan Languages | Confidence |
|---------|----------|------------------|------------|
| jschardet | Statistical (Python port) | Poor | 0-100% |
| chardetng | State machine (Rust/WASM) | Excellent | Deterministic |

### Why chardetng Won

chardetng is Mozilla's production detector used in Firefox. It's specifically designed to handle:
- Central/Eastern European encodings (windows-1250, ISO-8859-2)
- Cyrillic variants (windows-1251, KOI8-R, ISO-8859-5)
- Ambiguous byte sequences in Slavic languages

jschardet's statistical model couldn't reliably distinguish windows-1250 (Central European) from windows-1252 (Western European) for Serbian text.

### Technical Integration

```typescript
// Before: jschardet (probabilistic)
import jschardet from 'jschardet';
const result = jschardet.detect(buffer);
// { encoding: 'windows-1252', confidence: 0.95 }  // WRONG

// After: chardetng-wasm (deterministic)
import { detect } from 'chardetng-wasm';
const encoding = detect(bytes);
// 'windows-1250'  // CORRECT
```

Required Vite config for WASM:
```typescript
import wasm from 'vite-plugin-wasm'
import topLevelAwait from 'vite-plugin-top-level-await'

export default defineConfig({
  plugins: [wasm(), topLevelAwait(), svelte()]
})
```

## Takeaways

1. **Plans are for humans** - Use them to verify AI output, not to control AI behavior
2. **AI code passes the vibe check** - Looks confident and complete, but may silently drop features
3. **Explicit beats implicit** - Verification checkboxes > prose descriptions
4. **Test with real data early** - jschardet issue only appeared with actual Serbian subtitles
5. **Be ready to pivot** - The best solution (chardetng-wasm) wasn't in the original plan
6. **Short feedback loops** - User testing caught encoding issues that unit tests wouldn't

## Appendix: Files Changed in Pivot

The jschardet → chardetng-wasm switch touched:

- `package.json` - Replaced jschardet with chardetng-wasm, added WASM plugins
- `vite.config.ts` - Added wasm() and topLevelAwait() plugins
- `src/lib/adapters/web.ts` - New detection implementation
- `src/lib/adapters/types.ts` - Removed confidence from EncodingInfo
- `src/stores/settings.ts` - Removed confidenceThreshold
- `src/stores/files.ts` - Removed confidence from FileEntry
- `src/components/Settings.svelte` - Removed confidence slider
- `src/components/FileItem.svelte` - Removed confidence display
