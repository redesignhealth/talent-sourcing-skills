# CLAUDE.md

Behavioral guidelines to reduce common LLM coding mistakes. Merge with project-specific instructions as needed.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

---

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.

## This repo

A Claude Code plugin marketplace containing one plugin, `talent-sourcing`, with three skills. There is no
application code — markdown, JSON manifests, and one browser-side JS harness.

**The layout is the standard multi-plugin marketplace shape, on purpose.** `plugins/talent-sourcing/` is
self-contained so it can be folded into a larger marketplace repo as a directory copy plus one entry in
that repo's `marketplace.json`. Do not restructure it.

**Verify changes by loading the plugin, not by reading it:**

```bash
claude --plugin-dir ./plugins/talent-sourcing plugin details talent-sourcing
```

That prints the component inventory and token cost, and fails loudly on a malformed manifest. For MCP
changes, run an actual browser call through the server rather than assuming the config parsed.

**The MCP server is named `sourcing-browser`, not `playwright`.** Renaming it back would let the official
`playwright` plugin shadow it, which fails silently — the other server's temp profile has no login, so a
run just lands on a login page. The persistent `--user-data-dir` is the whole reason this plugin ships its
own server.

**Skill content is tool knowledge, not project notes.** Every claim in a SKILL.md should be a measured
property of LinkedIn Recruiter or Juicebox that any user would hit. Keep specifics of whatever sourcing
project prompted a change — company names, country names, role targets — out of them. Where a measurement
needs a concrete example, use neutral labels and keep the numbers.
