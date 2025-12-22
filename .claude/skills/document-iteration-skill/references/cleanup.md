# Cleanup Workflow

How to remove iteration markers when document is finalized.

---

## When to Clean Up

Clean up iteration markers when:
- Document iteration is complete
- Ready to commit to git
- Preparing final version for publishing
- User explicitly requests cleanup

---

## What Gets Removed vs. Kept

**REMOVE these (iteration scaffolding):**
- All `%% ... %%` blocks (user comments, status tags)
- All `•%%> ... <%%•` blocks (your responses and notes)
- The `==` wrappers and `(TOKEN)` from text

**KEEP these (the actual content):**
- **The text INSIDE the highlights:** `==text(TOKEN)==` becomes just `text`
- All document structure (headers, lists, formatting)
- All final decisions and information

---

## Cleanup Process

**When user explicitly says "cleanup" or "finalize":**

### 1. Scan for all markers:
- Search for `%%` patterns (comments and responses)
- Search for `•%%>` patterns (your responses and notes)
- Search for `==...(TOKEN)==` patterns (highlights)
- Search for status tags: `%% WIP %%`, `%% REVISE %%`

### 2. Summarize and check for blockers:
- Count: "Found X comments, Y notes, Z highlight tokens"
- **Check for WIP sections:** If ANY `%% WIP %%` tags exist, WARN:
  - "Warning: Section [name] is marked WIP - still in progress"
  - "Cleanup will remove this status. Continue? (yes/no)"

### 3. Ask for confirmation:
- Show summary of what will be removed
- "Ready to remove all iteration markers? (yes/no)"
- Wait for explicit "yes" before proceeding

### 4. Execute cleanup (after confirmation):
- **Remove** all `%% ... %%` blocks (including multiline)
- **Remove** all `•%%> ... <%%•` blocks
- **Convert** `==text(TOKEN)==` to `text` (keep the text, remove only the markup!)
- **Fix** any double spaces or broken formatting caused by removals
- **Verify** no markers remain

### 5. Show result:
- Confirm cleanup complete
- Show before/after comparison if helpful

---

## Example Transformation

**Before cleanup:**
```markdown
# Authentication Plan

Uses ==JWT tokens(AUTH)== with ==1-hour expiration(TTL)==.

%%(AUTH) APPROVED %%
•%%>Confirmed! <%%•

%%(TTL) Perfect balance %%
•%%>1-hour is secure and user-friendly. <%%•

•%%> NOTE: Refresh tokens last 7 days <%%•

**Implementation:**
- Access token: 1 hour
- Refresh token: 7 days
```

**After cleanup:**
```markdown
# Authentication Plan

Uses JWT tokens with 1-hour expiration.

**Implementation:**
- Access token: 1 hour
- Refresh token: 7 days
```

---

## Cleanup Commands

**User can request cleanup by saying:**
- "cleanup this file"
- "finalize this document"
- "remove iteration markers"
- "ready to publish"

---

## Special Directive: Cleanup Marker

**When you see `%%!CLEANUP!%%` in the document:**

**Scope:** Clean up everything **from the start of the document up to (and including) the marker itself**.

Content below the marker remains untouched with all its iteration markers intact.

### Process:

**1. Scan the cleanup zone** (start of file -> marker position):
- Count `%%` comments and responses
- Count `•%%>` responses and notes
- Count `==...(TOKEN)==` highlights
- Check for `%% WIP %%` sections

**2. Check for WIP blockers:**
- If ANY `%% WIP %%` exists in the cleanup zone, WARN:
  - "Warning: Found WIP section(s) in cleanup zone: [section names]"
  - "These are still in progress. Continue with cleanup? (yes/no)"

**3. Ask for confirmation:**
- "Found %%!CLEANUP!%% at line X"
- "Ready to clean X comments, Y notes, Z tokens from start -> line X? (yes/no)"
- Wait for explicit "yes" before proceeding

**4. Execute cleanup (after yes):**
- Remove all markers in the cleanup zone (start -> marker)
- **Remove the `%%!CLEANUP!%%` marker itself**
- Keep everything below the marker completely untouched
- Verify cleanup complete in the cleaned zone

---

## Examples

### Partial cleanup (clean top section only):

**Before:**
```markdown
# Finalized Section

Content here with no markers needed.

%%!CLEANUP!%%

# Draft Section %% WIP %%

==Still working(TODO)== on this part.
%%(TODO) Need to refine this %%
```

**After:**
```markdown
# Finalized Section

Content here with no markers needed.

# Draft Section %% WIP %%

==Still working(TODO)== on this part.
%%(TODO) Need to refine this %%
```

### Full document cleanup (marker at bottom):

**Before:**
```markdown
# All Sections

Content with ==markers(X)== everywhere.
%%(X) Comments here %%

•%%> NOTE: Some helpful context <%%•

(... end of document ...)

%%!CLEANUP!%%
```

**After:**
```markdown
# All Sections

Content with markers everywhere.

(... end of document ...)
```

---

## Critical Cleanup Rules

**DO:**
- Scan for ALL marker types (`%%`, `•%%>`, `==...(TOKEN)==`)
- Keep text from inside `==highlights==`
- Warn about `%% WIP %%` sections before cleaning
- Ask for confirmation before removing anything
- Fix formatting after removal

**DON'T:**
- Delete text that was inside highlights (only remove the `==` wrappers and `(TOKEN)`)
- Clean up without showing summary first
- Clean up without user confirmation
- Proceed if user says anything other than "yes"
- Clean sections marked `%% WIP %%` without explicit warning

**CRITICAL:** When removing `==PostgreSQL(DB)==`, the result must be `PostgreSQL`, NOT deletion of the word!
