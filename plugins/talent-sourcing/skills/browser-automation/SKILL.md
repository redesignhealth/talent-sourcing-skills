---
name: browser-automation
description: How to drive a logged-in web app through the Playwright MCP server — the profile and login model, the snapshot-act-verify loop, using browser_evaluate to read bulk data cheaply, and the re-render traps that make a click silently do nothing. Use when operating any browser tool through Playwright, and always alongside the linkedin-recruiter or juicebox skills.
---

# Driving a browser through Playwright

The companion skills (`linkedin-recruiter`, `juicebox`) describe **what to read** from each tool. This one
describes **how to operate the browser** so that what you read is real. Read this first; the tool skills
assume it.

## The login and profile model

This plugin ships its own Playwright MCP server, named **`sourcing-browser`**, running with:

```
--browser chrome --user-data-dir ${HOME}/.cache/talent-sourcing/chrome-profile
```

**Use the `sourcing-browser` tools, not any other browser server.** If the official `playwright` plugin is
also enabled you will see two sets of identically-named browser tools; the other set uses a throwaway
profile and will land you on a login page. Check the tool prefix before the first call, not after.

This matters more than it looks. **Without `--user-data-dir`, Playwright MCP creates a throwaway profile
on every start** and every login is lost. The persistent directory is what lets a Recruiter or Juicebox
session survive between Claude sessions.

Consequences to work with, not around:

1. **This profile is not the user's everyday Chrome.** The first run on any tool lands on a login page.
   Ask the user to log in themselves in the window Playwright opened — do not ask for or type credentials.
2. **One profile, one process.** If a previous run left a browser open, a new one fails to acquire the
   profile lock. Call `browser_close` when finished. If startup fails with a profile-lock error, close the
   stale window rather than killing Chrome.
3. **The browser is headed on purpose.** The user can watch, intervene, and complete an MFA prompt.
   Never switch these tools to `--headless`.
4. **Stay logged in.** Do not clear cookies or storage as a debugging step; it costs the user a re-login
   and an MFA round trip.

## The loop

For every interaction:

1. **`browser_snapshot`** — the accessibility tree, with a `ref` for each element. This is the map.
2. **Act** with `browser_click` / `browser_type` / `browser_select_option`, passing the `ref` **and** the
   human-readable `element` description from that snapshot.
3. **Verify** — snapshot again, or read the specific value back with `browser_evaluate`. An action that
   reported success is not an action that took effect.

**Refs expire.** They are valid only for the snapshot that produced them. After any click, navigation or
re-render, take a fresh snapshot before the next action. Reusing a stale ref is the single most common
cause of "the script ran and nothing happened".

`browser_wait_for` with a text or state condition beats a fixed sleep. Where a tool's skill gives a
measured wait, use it — those numbers came from watching the app, not from guessing.

## Read in bulk with browser_evaluate

Snapshots are large and cost tokens fast. **Anything that is fundamentally a data read — a table, a
histogram, a list of counts — should come back through `browser_evaluate` as structured JSON**, not by
snapshotting the page and reading it visually.

```js
() => [...document.querySelectorAll('[role="row"]')].map(r =>
  [...r.querySelectorAll('[role="cell"]')].map(c => c.innerText.trim()))
```

Two habits follow:

- **Install a harness once per page load, then call it.** Where a tool skill ships a `harness.js`, read the
  file and pass its contents to `browser_evaluate` once, then call its helpers. One round trip per
  several reads instead of one per read.
- **Return the smallest thing that answers the question.** A count, an array of pairs, a coverage
  percentage. Never return `document.body.innerText`.

`browser_take_screenshot` is for showing the user something visual or for confirming a layout you cannot
resolve from the tree. It is not a way to read data — you cannot cite a number you only saw in a picture.

## Traps that produce wrong data rather than errors

**Single-page apps detach nodes on re-render.** A held element reference throws or, worse, points at a
node no longer in the document. Re-find targets inside every helper rather than caching them.

**Setting `.value` does not fire the app's listeners.** Frameworks and typeaheads listen for real input
events. Use `browser_type` (or `browser_fill_form`), then confirm the resulting chip, tag or selection
actually appeared. A silent no-op here looks exactly like success.

**Custom widgets are not native HTML.** Grids, tables and listboxes are frequently ARIA-only — query
`[role="row"]`, `[role="cell"]`, `[role="option"]`, not `<tr>`, `<td>`, `<option>`.

**Virtualized lists only contain what is on screen.** Counting rendered rows undercounts. Use the app's
own total, or scroll and de-duplicate by a stable id — and say which you did.

**Scope every extraction to the container you mean.** Recommendation rails, "people also viewed" modules
and ad slots sit inside the same page and will silently join your results if you query the whole document.

**Unescape before believing.** Text pulled from attributes and chips comes back HTML-escaped
(`&amp;quot;`). Log the unescaped form so a filter recipe stays reproducible.

## What to tell the user

Say what you are about to do before a long run, and how many steps it is. Report the numbers you actually
read back, with the recipe that produced them. If a step failed or a value could not be verified, say so —
an unverified number is worse than a missing one.
