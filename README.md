# talent-sourcing-skills

A Claude Code plugin for sizing and mapping talent pools with **LinkedIn Recruiter** and **Juicebox**.

Each skill carries the same three things for its tool: the full filter inventory, which counts are free,
and the validation rules that stop the tool reporting a number that is silently wrong. All of it was
established by driving the tools directly, not by reading their documentation.

## Install

```
/plugin marketplace add redesignhealth/talent-sourcing-skills
/plugin install talent-sourcing@talent-sourcing-skills
```

Then restart Claude Code. The skills trigger on their own — ask to size a talent pool, map a market, or
run a Recruiter or Juicebox search, and the right one loads. `/plugin details talent-sourcing` lists what
came with it.

To try it from a local clone instead:

```
/plugin marketplace add ./talent-sourcing-skills
```

## What's in it

| Skill | Covers |
|---|---|
| `browser-automation` | How to drive a logged-in web app through Playwright: the profile and login model, the snapshot-act-verify loop, reading bulk data cheaply, and the re-render traps. The other two assume it. |
| `linkedin-recruiter` | All 35 Recruiter filters, the facet-reads-are-free principle, the containment and exclusivity rules that catch bad counts, and a browser harness (`harness.js`) that reads several facets per round trip. |
| `juicebox` | The 16 filter sections, the 1M count ceiling, why criteria never narrow a pool, Insights as a free market map, and a pre-flight checklist (`checks.md`) to run before quoting any number. |

## The Playwright dependency

The plugin ships its own Playwright MCP server, configured with a **persistent browser profile** at
`~/.cache/talent-sourcing/chrome-profile`.

This is the part that makes it work rather than merely install. Playwright MCP's `--user-data-dir`
defaults to a temporary directory, so the stock configuration throws the profile away on every start and
you re-login to LinkedIn and Juicebox every session, MFA included. A fixed directory keeps you logged in.

Two consequences:

- **The first run on each tool lands on a login page.** Log in yourself in the window that opens; it
  sticks from then on. Nobody is asked for credentials and none are stored in this repo.
- **The server is named `sourcing-browser`, not `playwright`.** That is deliberate: if the official
  `playwright` plugin is also enabled, both expose identically-named browser tools and the wrong one gets
  picked — which was observed during testing, and fails silently by landing on a login page. The distinct
  name lets the skills say which server to use. You do not need to disable anything.

## Before your first Recruiter run

Automated access to Recruiter is restricted by LinkedIn's terms and by most organisations' own policy,
and seats can be rate-limited or suspended. Confirm what you are permitted to do before you start.

The skill is built to operate conservatively either way: **attended batches of 15 to 20 searches**, counts
and aggregates only, and no profile-list extraction unless you ask for it explicitly.

Juicebox carries no equivalent risk. Searching, counting and Insights are free; only revealing contact
details and exporting profiles cost credits.

## Layout

```
.claude-plugin/marketplace.json     makes this repo installable directly
plugins/talent-sourcing/
├── .claude-plugin/plugin.json
├── .mcp.json                       the Playwright server and its profile
└── skills/
    ├── browser-automation/SKILL.md
    ├── linkedin-recruiter/{SKILL.md, harness.js}
    └── juicebox/{SKILL.md, checks.md}
```

This is the standard multi-plugin marketplace layout, so folding `plugins/talent-sourcing/` into a
larger marketplace repo later is a directory copy plus one entry in that repo's `marketplace.json`.

## Not done yet

- Neither skill has an eval suite (`claude plugin eval`), so changes are reviewed by reading, not by
  measurement.
- The Recruiter harness covers advanced-search facets, counts and search execution. Result-list
  extraction is deliberately absent, per the seat-risk policy above.
- Coverage percentages quoted in the skills were measured on specific pools and are properties of those
  pools, not constants. Re-measure for yours.
