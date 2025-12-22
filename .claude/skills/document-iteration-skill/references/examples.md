# Few-Shot Examples

These examples show EXACTLY what to output. Pattern-match these.

---

## Example 1: Responding to Token Comment

**INPUT (User's document):**
```markdown
Uses ==PostgreSQL(DB)== for data storage.

%%(DB) Use SQLite instead - simpler for v1 %%
```

**WRONG OUTPUT (Chat-style response):**
```markdown
Sure! I'll change PostgreSQL to SQLite. SQLite is indeed simpler for v1 since it doesn't require a separate server process.
```

**CORRECT OUTPUT (Syntax Engine response):**
```markdown
Uses ==PostgreSQL(DB)== for data storage.

%%(DB) Use SQLite instead - simpler for v1 %%

•%%>Updated to SQLite! Embedded database, no server needed, perfect for v1. <%%•

## Updated Approach

Uses SQLite for data storage.
- Embedded database (no separate server)
- Fast for <10K users
- Easy migration to PostgreSQL later
```

---

## Example 2: Multiple Tokens

**INPUT:**
```markdown
Session timeout is ==30 minutes(TTL)== using ==localStorage(STORE)==.

%%(TTL) Too long - use 15 minutes %%
%%(STORE) NO: not secure, use httpOnly cookies %%
```

**WRONG OUTPUT:**
```markdown
I've updated the timeout to 15 minutes and switched to httpOnly cookies for better security.
```

**CORRECT OUTPUT:**
```markdown
Session timeout is ==30 minutes(TTL)== using ==localStorage(STORE)==.

%%(TTL) Too long - use 15 minutes %%

•%%>Changed to 15 minutes! Better security without hurting UX. <%%•

%%(STORE) NO: not secure, use httpOnly cookies %%

•%%>Switched to httpOnly cookies! Prevents XSS attacks. <%%•

## Updated Approach

Session timeout is 15 minutes using httpOnly cookies.
```

---

## Example 3: General Comment (No Token)

**INPUT:**
```markdown
# API Design

%% Add rate limiting section %%

## Endpoints
...
```

**WRONG OUTPUT:**
```markdown
Good idea! I'll add a rate limiting section to the API design document.
```

**CORRECT OUTPUT:**
```markdown
# API Design

%% Add rate limiting section %%

•%%>Added rate limiting section below! <%%•

## Rate Limiting

- 100 requests/minute for free tier
- 1000 requests/minute for paid tier
- 429 response when exceeded

## Endpoints
...
```

---

## Example 4: Status Tag Handling

**INPUT:**
```markdown
## Pricing %% APPROVED %%

$10/month basic plan.

## Features %% REVISE %%

- Feature A
- Feature B
```

**WRONG OUTPUT:**
```markdown
I see the pricing is approved so I won't change that. I'll revise the features section.
```

**CORRECT OUTPUT:**
```markdown
## Pricing %% APPROVED %%

$10/month basic plan.

## Features %% REVISE %%

•%%>Expanding features with more detail: <%%•

- **Feature A** - Description of what A does
- **Feature B** - Description of what B does
- **Feature C** - New feature added based on common needs
```

---

## Example 5: Complete Workflow

**User gives you:**

```markdown
# Feature: User Authentication

## Approach
Use ==JWT tokens(AUTH)== with ==24-hour expiration(TTL)== stored in ==localStorage(STORE)==.

%%(AUTH) APPROVED %%
%%(TTL) 1 hour better, add refresh tokens %%
%%(STORE) NO: localStorage not secure, use httpOnly cookies %%

%% Also add password reset flow %%
```

**You respond with:**

```markdown
# Feature: User Authentication v2

## Approach
Use ==JWT tokens(AUTH)== with ==1-hour expiration(TTL)== stored in ==httpOnly cookies(STORE)==.

%%(AUTH) APPROVED %%

•%%>JWT tokens confirmed! <%%•

%%(TTL) 1 hour better, add refresh tokens %%

•%%>Updated to 1-hour access tokens + 7-day refresh tokens!
Much more secure. Auto-refresh flow implemented. <%%•

%%(STORE) NO: localStorage not secure, use httpOnly cookies %%

•%%>Fixed! Using httpOnly cookies now. Prevents XSS attacks.
Secure flag enabled for HTTPS only. <%%•

%% Also add password reset flow %%

•%%>Added password reset flow below! <%%•

## Revised Approach %% READY FOR REVIEW %%

**Authentication:**
- JWT access tokens (1-hour expiration)
- Refresh tokens (7-day expiration)
- Auto-refresh when access token expires
- httpOnly cookies (XSS protection)
- Secure flag (HTTPS only)

**Password Reset:**
- Email with reset token (1-hour expiration)
- Token verification endpoint
- New password form
- Auto-login after reset

**Security Improvements:**
- No localStorage (XSS safe)
- Short-lived access tokens
- Refresh token rotation
- Secure cookie flags
```

---

## Example 6: Creating a New Document

**User asks:** "Create a proposal for adding dark mode"

**WRONG OUTPUT (Using user markers for your own notes):**
```markdown
# Dark Mode Proposal

%% NOTE: This is a draft for review %%

## Overview
Add dark mode toggle to settings.

%% Should we use CSS variables or Tailwind? %%

## Implementation
...
```

**CORRECT OUTPUT (Using Claude markers for your notes/questions):**
```markdown
# Dark Mode Proposal

•%%> NOTE: Draft for your review. <%%•

## Overview
Add dark mode toggle to settings.

•%%> ?: CSS variables or Tailwind for theming? <%%•

## Implementation
...
```

**Why this matters:** When creating new documents, you're still Claude - your notes, questions, and context ALWAYS use `•%%> <%%•`. The `%% %%` syntax is ONLY for user feedback that comes later.

---

## What NOT to Do

### Don't add user-style comments yourself:
```markdown
# Migration Plan

Uses Vue 3.

%% ?: Should we use Vite? %%  <- WRONG! You're not the user!
%% NOTE: Vue 3 is newer %%      <- WRONG! Don't add NOTEs yourself!
```

**Only users add `%% comments %%`. You only add `•%%> responses <%%•`.**

**This applies when CREATING new documents too!** It's easy to slip into `%% %%` when authoring, but your markers are ALWAYS `•%%> <%%•`.

---

### Don't mark items as APPROVED yourself:
```markdown
%%(DB) Updated to SQLite %% APPROVED %%  <- WRONG!
## Section 1 %% APPROVED %%               <- WRONG!
```

**Why:** Only the user can mark something as `%% APPROVED %%`, `%% NO: %%`, or `%% REVISE %%`.

---

### Don't respond in plain text:
```markdown
User: %%(DB) Use SQLite %%
You: "Okay, I'll use SQLite"  <- WRONG
```

**Correct:**
```markdown
User: %%(DB) Use SQLite %%
You: •%%>Updated to SQLite! <%%•  <- CORRECT
```

---

### Don't ignore tokens:
```markdown
User has: %%(DB-1) %%(DB-2) %%(DB-3)
You respond to only one  <- WRONG
```

**Correct:** Respond to each token individually.

---

### Don't delete user's comments:
```markdown
User: %%(DB) Use SQLite %%
You: [removes their comment]  <- WRONG
```

**Correct:** Keep their comment and add your response below.

---

### Don't respond to APPROVED sections:
```markdown
## Pricing %% APPROVED %%
You: [changes it anyway]  <- WRONG
```

**Correct:** Leave approved sections untouched.

---

### Don't respond to NOTE tags:
```markdown
%% NOTE: Team decided this Dec 10 %%
You: •%%>Acknowledged <%%•  <- UNNECESSARY
```

**Correct:** Just read NOTE tags silently, no response needed.
