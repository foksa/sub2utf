# Syntax Guide

Detailed reference for all iteration markers and patterns.

---

## User Markers (Input)

### General Comments

```markdown
%% This section needs more detail %%
%% The timeline seems unrealistic %%
```

**Action:** Address this feedback in your response and update the content.

---

### Questions

```markdown
%% ?: Is 15 minutes too short for session timeout? %%
%% ?: Should we support annual billing? %%
```

**Action:** Answer the question with `•%%>response <%%•`, then update content if needed.

---

### Status Tags

```markdown
## Section 1 %% APPROVED %%
## Section 2 %% REVISE %%
## Section 3 %% NO: too complex for v1 %%
## Section 4 %% WIP %%
```

**Action:**
- `APPROVED` - Don't change this section
- `REVISE` - Needs improvements (look for related comments)
- `NO: reason` - Remove this content, explain why in response
- `WIP` - Work in progress, can modify

---

### Information Tags

```markdown
%% INFO: Budget increased to $200/month %%
%% INFO: API v2 released with breaking changes %%
```

**Action:** This is actionable information. Use it to update plans and content.

```markdown
%% NOTE: Team decided this in Dec 10 meeting %%
%% NOTE: We tried Redis but had memory issues %%
```

**Action:** This is historical context. Read it but don't respond. Just acknowledge.

---

### Inline Comments (Token System)

**Single item with asterisk:**
```markdown
The session timeout is ==15 minutes==.

%% * Change to 30 minutes for better UX %%
```

The `*` means: "Comment refers to highlighted text above"

**Multiple items with tokens:**
```markdown
Uses ==PostgreSQL(DB)== with ==Redis(CACHE)== on ==AWS(DEPLOY)==.

%%(DB) SQLite for v1 instead %%
%%(CACHE) Memcached lighter weight %%
%%(DEPLOY) DigitalOcean cheaper %%
```

**How to read:**
- `==PostgreSQL(DB)==` - Text "PostgreSQL" is marked with token `(DB)`
- `%%(DB) SQLite for v1 instead %%` - Feedback about that specific text
- User wants you to change PostgreSQL to SQLite

---

### Token Patterns

```markdown
# Simple numbers:
==text1(1)== ==text2(2)== ==text3(3)==
%%(1) Comment %%
%%(2) Comment %%
%%(3) Comment %%

# Descriptive tokens:
==database(DB)== ==caching(CACHE)== ==deployment(DEPLOY)==
%%(DB) Comment %%
%%(CACHE) Comment %%
%%(DEPLOY) Comment %%

# Multiple same-topic (dash notation):
==PostgreSQL(DB-1)== ==MySQL(DB-2)== ==MongoDB(DB-3)==
%%(DB-1) Comment %%
%%(DB-2) Comment %%
%%(DB-3) Comment %%

# Insertions (no renumbering needed):
==Item1(DB-1)== ==NewItem(DB-a)== ==Item2(DB-2)==
%%(DB-1) Original %%
%%(DB-a) New item! %%
%%(DB-2) Original %%
```

---

### Team Comments (Optional)

```markdown
%% @JS: Can we simplify this? %%
%% @MK: APPROVED %%
%%(DB) @AL: Use SQLite for v1 %%
%% @ALL: Team consensus %%
```

**Action:** These include author attribution. Acknowledge who said what in your responses.

---

## Claude Output (Response)

### Response Syntax

Always use `•%%>response <%%•` for all Claude output:

```markdown
•%%>Your response to their feedback <%%•
```

### Note Types

You can add your own observations using prefixes:

```markdown
•%%> NOTE: Background context or explanation <%%•
•%%> ?: Suggestion for user to consider <%%•
•%%> IMPORTANT: Key point to highlight <%%•
•%%> RISK: Potential issue to be aware of <%%•
•%%> TIP: Best practice or recommendation <%%•
```

---

## Quick Reference Tables

### User Markers

| Pattern | Meaning | Your Action |
|---------|---------|-------------|
| `%% comment %%` | General feedback | Respond with `•%%>response <%%•` |
| `%% ?: question %%` | Question | Answer with `•%%>answer <%%•` |
| `==text(TOKEN)==` | Marked text | Look for `%%(TOKEN)` comment |
| `%%(TOKEN) comment %%` | Inline feedback | Respond about THAT text |
| `%% APPROVED %%` | Approved | Don't change |
| `%% NO: reason %%` | Rejected | Remove content |
| `%% REVISE %%` | Needs work | Improve it |
| `%% INFO: %%` | Actionable info | Use to update |
| `%% NOTE: %%` | Context only | Read, don't respond |
| `%% @INITIALS: %%` | Author tag | Acknowledge author |

### Claude Output

| Pattern | Meaning | When to Use |
|---------|---------|-------------|
| `•%%>response <%%•` | Response to user feedback | ALWAYS when responding |
| `•%%> NOTE: <%%•` | Background context | Important context |
| `•%%> ?: <%%•` | Suggestion for user | Alternative to consider |
| `•%%> RISK: <%%•` | Potential issue | Warn about gotchas |
| `•%%> TIP: <%%•` | Best practice | Recommend approach |
| `•%%> IMPORTANT: <%%•` | Key highlight | Critical information |
