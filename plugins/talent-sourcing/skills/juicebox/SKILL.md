---
name: juicebox
description: Use Juicebox for talent sourcing, market mapping and population sizing — its filters, how criteria differ from filters, the 1M count ceiling, Insights as a free market map, and the traps that silently produce wrong numbers. Use when asked to size or map a talent pool, find candidates by background, or read Juicebox's own pipeline and outreach data.
---

# Juicebox

A large-corpus people-search tool with far richer filters than LinkedIn Recruiter, free market-level
aggregates, and one hard limit that invalidates any large number it reports.

## Before anything

**Use `answer_product_question` first.** It queries the product's canonical guide, costs nothing, and is
faster and more reliable than clicking through the UI. Ask it directly about any filter you are unsure of.

**Preconditions for UI work.** The user must be logged into `app.juicebox.ai` in the Playwright browser
profile. Unlike Recruiter there is **no seat risk and no rate-limit discipline needed** — searching,
counting and Insights are all free, so explore freely. Read the `browser-automation` skill for the
profile, login and verification rules before touching the UI.

**Work inside a project.** Saved searches live under a project and are the reproducibility record.

**Run `checks.md` from this skill directory** before reporting any number. It is the pre-flight list —
each item has either produced a wrong number in practice or is provable by construction.

---

## The three rules that stop wrong numbers

### 1. Counts ceiling at 1M+

Measured on a pair of countries — call them **Big** (population in the hundreds of millions) and
**Small** (population under a million):

| filter | count |
|---|---|
| Big as current location | `1M+` |
| Big as *past* location | `1M+` |
| Small as current location | `100K+` |
| Small as current **and** Big as past | `103`, exact |

**Any count reading `1M+` is unmeasured, not one million.** Narrow the search until it drops below the
ceiling, or use LinkedIn Recruiter, which is the only one of the two that sizes above 1M.

Counts under roughly a thousand are exact. Above that they bucket by order of magnitude.

Related correction worth carrying: Juicebox's corpus is **200M+ profiles with contact data**, not ~1M. A
ceilinged count has been mistaken for a corpus size before.

### 2. Filters narrow. Criteria only rank.

**A Juicebox count is the size of the structured filter set and nothing else.** A natural-language prompt
populates both filters and criteria, but criteria only score and rank within the filter-defined pool — they
never remove anyone.

So **a prompt is not a specification of what was counted.** Always open the filter panel and record the
actual filters before quoting a number. A search whose prompt says "not currently in country X" may
still be full of people in country X, if that clause became a criterion instead of a filter.

Criteria mark each candidate **Good Match**, **Potential Fit** or **Not a Match**, with an overall match
percentage (100% perfect, 75%+ strong, 50%+ average, 25%+ weak). They are ranked most to least important and
**cannot be made mandatory**. The only hard requirements are filters — and **pinned skills**, which is the
documented exception.

For sizing work, start from **`Select manually`** so no criteria are introduced at all.

### 3. Location filters are AND'd, and there is no location exclusion

`Location(s)` AND `Past Locations`. Proven by the table above: Big-as-past alone is `1M+`, while
Small-as-current plus Big-as-past is 103.

**Exclusions exist for Companies, Universities, ATS candidates and already-touched profiles — not for
locations.** DNC Countries is an outreach guard, not a search negation.

So "was in X and is not there now" cannot be expressed directly. Either **enumerate destinations
positively**, or **subtract** the still-there count from the ever-there count. This is the exact inverse of
Recruiter, which negates current location freely but has no past-location filter — for any
moved-country question, use both tools and compare.

---

## Insights: the market map, and the reason to use this tool

The **Insights** tab is an aggregate report over the **total matched pool**, not the evaluated subset, and it
costs nothing. Twenty sections:

Top locations on a map · **AI-written Key Takeaways** · **years of experience with average, P25, median,
P75** · **average tenure with the same percentiles** · experience histogram · skills · **current employers** ·
past employers · job titles · **seniority level** · **department** · **gender distribution** · company
industries · company type · funding stages · company tags · universities · education level · majors ·
languages. Plus **Export Insights**.

**It states its own coverage** — sections read "(covers 12%)". Carry that percentage with any figure you
quote from it.

This replaces running a search per cut. Set the population once, then read Insights.

**Expand pool**, shown above the results, is a built-in sensitivity readout: it lists alternative filter sets
with their counts, telling you which filter is binding. Log it alongside the count.

---

## Filter inventory

Sixteen sections. The ones that matter most are marked.

**General** — min/max experience · required contact info · **Exclude Profiles** already hidden, viewed,
shortlisted or contacted · filter by network.

**ATS** — include, exclude, or only ATS candidates.

**Locations** — Location(s) with a radius, default 25 miles · **Past Locations** · timezone · DNC countries.
Typeahead groups as **CITIES / COUNTRIES / REGIONS** — pick the country entry deliberately, since city
entries carry the radius.

**Job** — job titles with Current Only · time at current role · **minimum average tenure** · past job titles ·
title levels · title roles · experience in a title.

**Company** — companies current/past with **CSV upload** and **up to four company/timing groups joined by
AND/OR** · Excluded Companies · time at current company · **company tags** · industries · HQ locations ·
sizes · founded after · **funding stages** · revenue · **min/max funding raised** · **investors**.

**Skills or Keywords** — hard requirements. Multiple skills default to **Match Any (OR)**; **pinning a skill
makes it mandatory and AND-combined**.

**Power Filters** — Match Any / Match All toggle:
- **Gender Diversity**
- **VC-Backed Founder** · **Early Team / Founding Member** · **Board Member** · **Between Roles** ·
  Startup Experience · Promoted · Fast Career Growth · VP+ at VC/PE-Backed · Top VC-Backed Experience
- Exceptional Ability Visa · Hackathon · Generative AI · Travel Nurse · **Healthcare Implementation
  Engineers** · military · D1 athlete · charter school alumni
- Sales experiences (MEDDPICC, enterprise, quota attainment, President's Club, B2B SaaS)
- Security clearance, US-specific

**Likely to Switch** — six AI signals: average tenure, recent layoffs, company funding, **vesting**,
leadership changes, career stage. Thresholds and sources are not published — directional only.

**Developer Data** — Active / Hireable / High-Signal Contributor · languages · repositories.

**Research** — publications, **patents**, grants, highly cited, first/last author, **min citations, min
published works, min H-index**, research focus, institutions, venues.

**Education** — universities with **CSV upload** · Excluded Universities · **University Locations** ·
degree requirements · fields of study · graduation year min/max.

**Languages** with proficiency · **Credentials** (certifications, issuers, volunteering) · **Boolean & Name**.

### The education trap

**Regular** means the degree can be from any university. **Nested** means the degree must be from one of the
**selected** universities. "A medicine degree from a university in country X" needs **Nested** — on Regular
it returns anyone with a medicine degree anywhere who also touched one of those institutions for
anything at all. Silent inflation.

---

## Building and reusing searches

Entry modes: **Search** (prompt) · **Agent** · **Find similar** · **Job description** · **Boolean** ·
**Select manually**. A prompt is recommended, never required.

**The count updates live in the filter dialog** as filters go in, before saving or running. Iterative
building is free — use it.

**Presets** are reusable organisation-wide lists for Locations, Companies or Universities, built by manual
entry, LinkedIn URLs, AI, or **CSV upload**. This is the right fix for fragmented school or employer names:
build one canonical list, share it, reuse it.

**Find Similar** takes shortlist profiles, exposes the inferred traits for editing, and returns up to 500
matches. **Smart Reports** produce a branded, optionally anonymised PDF from shortlist profiles.

**Result tabs** — *Matches* is the ranked pool · *Review* puts the profile beside the match reasoning for
validation, it is not a separate pool · *Include* is explicit additions · *Network* is people reachable via
the company's own connections.

---

## Driving the UI with Playwright

Read `browser-automation` first. These are the Juicebox-specific rules.

**Try not to open the browser at all.** `answer_product_question` answers how-does-it-work questions from
the canonical guide for free, and the MCP covers your own pipeline data. The UI is only needed for
searching, counting and Insights — which the MCP cannot do.

### Sizing run

1. `browser_navigate` to `https://app.juicebox.ai`. If it lands on a login page, ask the user to log in in
   the window that opened.
2. Open the project, then start a new search from **`Select manually`**. This is the important one: any
   other entry mode populates criteria as well as filters, and criteria do not narrow. Starting manually
   is how you guarantee the count means what you will say it means.
3. Add filters one at a time. **The count updates live in the filter dialog** — read it back with
   `browser_evaluate` after each one. There is no need to run the search to get a number, and no cost to
   iterating.
4. Before quoting the count, **dump the applied filter set to JSON** and keep it. The prompt is not the
   specification; the filter panel is. This is the operational form of rule 2.
5. Read **Expand pool** the same way, so you can say which filter is binding.

### Insights

Open the Insights tab and extract each section with `browser_evaluate`, **including the "(covers N%)"
string** — the section heading and its coverage percentage travel together or neither is usable. Do not
screenshot Insights and read numbers off the image.

### Leave the workspace as you found it

Saved searches are shared. When you have opened someone else's search to inspect its filters, **escape out
of the filter dialog rather than saving**, then confirm with `get_project` that its saved-search count is
unchanged. Save your own searches — the `search_id` URL is the reproducibility record — and
`browser_close` when finished.


## Cost model

Free: running searches, total match counts, **Insights**, and Evaluate more (batches of 500, ceiling 5,000).

Costs credits: revealing an email or phone, **exporting a profile — one export credit each**, adding to a
sequence, and Smart Reports.

So analysis is free and only touching individuals costs. Price a batch with
`preview_candidate_details_cost` before hydrating anything.

---

## The MCP

**There is no public REST API.** The MCP is the programmatic path and it does **not** search the corpus. It
reads your own activity and manages agents.

| tool | use |
|---|---|
| `answer_product_question` | The product guide. Start here for any how-does-it-work question |
| `get_data` | Your projects, shortlists, pipeline stages, outreach runs, replies, mailboxes, teammates |
| `get_project` | A project's metadata plus saved-search and shortlist counts |
| `search_shortlist` | A project's shortlist only — identity fields only, name and LinkedIn URL |
| `get_candidate_details` | Hydrates attributes; **spends an export credit** |
| `resolve` | Turn a project, teammate, sequence or agent name into an id before filtering |
| agent tools | `create_agent` (needs jobTitle, location, yearsOfExperience), `check_agent_status`, `start_sourcing`, `manage_agent` |

`get_data` needs `from`, `select` with `table.field` names, and joins planned from `get_schema`'s one-way
join map. Call `get_schema` first. Max 100 rows; a `truncated` flag means do not total the result.

**Use the MCP for your own funnel** — shortlisted, contacted, replied, interested by project — which is
the conversion evidence sizing work usually lacks.

---

## Reproducibility and reporting

Saved searches have real URLs: `/project/<projectId>/search?search_id=<id>`, reopening with filters,
criteria, prompt and count intact. **Save every search** — this is better than Recruiter, where a new search
cannot be composed as a URL, so prefer Juicebox as the reproducible record where either tool would do.

For every figure record: the filter panel (not the prompt), the total-match count, the Expand pool
alternatives, any Insights coverage percentage, and the `search_id`.

## Data caveats to state

200M+ profiles from public sources. Refresh varies daily to monthly. **No published regional coverage**, so
never assume coverage for a specific country. Bias and gaps unquantified. Evaluation caps at 5,000. AI match
judgments can be wrong or built on missing evidence — the guide's own instruction is to treat Insights as
directional and validate externally.
