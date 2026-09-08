---
name: linkedin-recruiter
description: Drive LinkedIn Recruiter through Playwright to size and profile talent pools — every filter, what it actually does, which counts are free, and the validation rules that stop it producing wrong numbers. Use when asked to size a talent pool, map a market's talent, run Recruiter searches, or pull population data from LinkedIn.
---

# LinkedIn Recruiter

Recruiter can size and profile almost any talent population, but several of its counts are silently
wrong and several of its filters are invisible unless you know where to look. This skill carries what was
established by driving it directly rather than reading its documentation.

## Before anything

**Preconditions.** The user must already be logged into Recruiter in Chrome, and Chrome must be free —
one browser profile means one session, and a running Chrome holds the lock. Ask them to close it rather
than killing the process.

**Confirm authorisation before automating.** Automated access to Recruiter is restricted by LinkedIn's
terms and by most organisations' own policy, and seats can be rate-limited or suspended. Whether a given
run is permitted is the user's call to make — ask, and do not assume it on their behalf.

**Operate conservatively either way.** Work in **attended batches of 15 to 20 searches with pauses**,
reading counts and aggregates only. Do not extract profile lists unless the user has explicitly asked for
it for a specific pool. Say what you are about to run before running a long batch.

**Work inside a Recruiter project.** Searches are then recoverable from history.

**Read the `browser-automation` skill first.** It covers the profile and login model, the
snapshot-act-verify loop, and the re-render traps. Everything below assumes it.

---

## The one principle: reads are free, searches are not

**Opening a facet returns its values with counts already scoped to the current filter set, without
running a search.** This is the whole game.

So the loop is:

1. **Set the population once** — location, industry, experience.
2. **Harvest everything** — open every relevant facet, read Compare All, read the spotlights.
3. **Only then narrow**, and re-harvest.

One search plus facet reads yields roughly twenty distributions: functional mix, company-size mix, degree
mix, tenure curve, graduation curve, language mix, group membership, network proximity, seniority ladder.
Never run a search per band or per employer — that was the mistake this skill exists to prevent.

Install `harness.js` from this skill directory on the page and call its helpers — `__adv()`,
`__f(label)`, `__count()`, `__search()`. `__f` reads four or five facets per round trip. See
**Driving it with Playwright** below for the exact call sequence.

---

## Filter inventory

**35 filters.** Eight or so show in the search rail; 27 more live in **advanced search** at
`/talent/hire/<project>/discover/recruiterSearch/advanced`. The two panels overlap but are not identical —
**Qualifications is rail-only**, and it is just the natural-language box. Seniority was rail-only
when this was first mapped and now appears in the advanced-search panel too — check both rather than
trusting either list to be complete.

### Ranges — these return a count for every single unit

| filter | range |
|---|---|
| **Years of experience** | <1 … 30+. Total career length. The most useful control in the tool |
| Years in current company | <1 … 30+ |
| Years in current position | <1 … 30+. Tenure |
| Year of graduation | 1976 … 2036 |

Opening one gives a full per-year histogram scoped to current filters, plus From/To boxes, two sliders
and `Update`. **Read the histogram instead of running a search per band.**

### Closed lists, all with scoped counts on open

- **Seniority** — Entry, Senior, Manager, Director, VP, CXO, **Owner**, **Partner**, Training, Unpaid.
  `Owner` and `Partner` are a founder signal that does not depend on headline wording.
- **Job functions** — 26 values including Product Management and Entrepreneurship.
- **Company sizes** — Self-employed, 1-10, 11-50, 51-200, 201-500, 501-1000, 1001-5000, 5001-10,000, 10,000+.
  This is how you control founder-title inflation.
- Employment type, Workplace types — both drawn from open-to-work preferences, so they describe
  willingness, not current state.
- **Network relationships** — 1st, 2nd, Group Members, 3rd+. A warm-path measure, scoped to the
  logged-in user's own network.
- Profile languages — the language the profile is *written in*. Some values come back as raw ISO
  codes rather than names (Arabic appears as `ar`), so match on the code, not the label.
- Spoken languages — Any, Elementary, Limited Working, Professional Working, Full Professional, Native or
  Bilingual. **Self-declared profile field, not an assessment.**
- Recently joined — 1 day up to 1-3 months; three months is the limit.
- Military veterans — US only.

### Text and boolean

Job titles, Skills and Assessments, Companies, Keywords all accept **full boolean: parentheses, `OR`,
`NOT`, quoted phrases** — and it composes with every structured filter. Job titles additionally carry a
**Current / Past / Current or Past** axis.

Fields of study, Degrees, Schools attended, All groups are typeaheads; the first three carry scoped
counts on their top suggestions, Schools does not.

First names and Last names are free text. They are the only route to a gender or nationality
approximation — state the method openly and never use it to exclude anyone.

### Locations is a 3 × 3 matrix

**Priority:** Must have · Can have · **Doesn't have**. **Preference:** Current · Open to relocate only ·
Current or open to relocate. Set through the chip dropdown; keyboard `R` requires and `N` negates, though
neither is reliable through automation.

**Open to relocate is candidate-entered, names a destination, and is independent of current location.**
Proven by contradiction: current location = country A *and* open to relocate = country B returns 92K
rather than zero. And it is **not a relocation measure** — setting only open-to-relocate for one country
returned 11M against 12M currently in it, which is not a credible relocation rate, so the filter appears
to include people already there. Never report an open-to-relocate count as inbound interest.

**"Can have" still filters.** A lone Can-have chip behaves as a requirement. Treat every location term as
restrictive regardless of priority.

### The move worth knowing

**Past location is filterable, indirectly.** Recruiter has no past-*location* filter at all,
but past **company** or **schools attended** combined with a **negated current location** measures
"worked there and left" exactly. This replaces bracketed-range workarounds for any population with an
employer or school hook.

**But a school hook imports that institution's international alumni.** Using `Schools attended` as a
proxy for someone's origin fails wherever the institution is majority-international: one measured run
returned 506 people of whom roughly none matched the intended origin, because two of the five schools
draw mostly foreign students. It is a **precision** problem, not a volume problem, so widening the pool
makes it worse. Pick institutions whose intake matches what you are trying to measure, and corroborate
with a second signal such as `Spoken languages` at Native or Bilingual.

### Industries: a three-level taxonomy with three misfiled branches

Industries (which supports `Exclude`) run on a NAICS-aligned **V2** taxonomy; the legacy V1 names are
gone. Two mechanics decide what a selection returns.

**Level sets breadth.**

| you select | you get |
|---|---|
| nothing | all candidates |
| **L1 only** | everything mapped to that L1 **and its related L2s and below** |
| L1 + L2 | that L1 **and** that L2 and below |
| **L2 only** | that L2 and below |
| **L3 only** | that L3 and below |

An L1 is a wide net. For a denominator you can defend, select the specific L2s you mean. Measure the gap
rather than assuming it — on one technology pool L1 against the equivalent L2 set differed by only 3%
(340K vs 330K), which is small enough that the level choice was not the thing to worry about there.

**Members with no industry set are absent from industry-filtered results entirely.** So an
industry-filtered count is a subset of the unfiltered one for two independent reasons — the filter, and
missing data — and the two are not separable from the count alone. Never treat an industry share as a
share of the pool.

**Three branches sit where nobody looks for them:**

- **"Wellness and Fitness Services" is not healthcare.** It sits under Entertainment Providers >
  Recreational Facilities, so including it in a healthcare pool returns gyms and spas. This has silently
  inflated a healthcare count that was only caught afterwards.
- **"Public Health" is not in the Hospitals and Health Care tree.** It is L3 under Government
  Administration > Health and Human Services — where public-sector health staff plausibly classify
  themselves. A healthcare search that omits it misses them completely.
- **"IT Services and IT Consulting" is not under the technology L1.** It sits under Professional
  Services, with Computer and Network Security as an L3 beneath it.

**Expand the tree and read the parent before selecting anything.** The label does not tell you what the
filter returns. **`industries.md` in this skill directory is the branch map** — where the commonly-wanted
healthcare, technology, consulting, research and adjacent branches actually sit, with their levels and
parents. Read it before choosing industry filters rather than guessing at labels.

Three more caveats worth carrying:

- **Industry is self-selected by the member**, and describes their company *or the kind of work they do*.
  It is not a reliable employer classification — a software engineer at a hospital may have picked either.
- **The V2 rollout is gradual.** LinkedIn says Recruiter's options may not yet include the full V2 list.
  If a label does not autocomplete on your seat, record that rather than substituting a similar-looking one.
- **V1 counts are not comparable to V2 counts.** Anything quoted from before the transition needs re-running.

### Also present

Postal code with radius 1/5/10/25/50/100/200 miles · Current companies · Past companies ·
Company followers · Company types · Recruiting activity by your team · In ATS · Tags ·
Projects · Notes · natural-language input.

---

## Search breakdown

`See search breakdown` has five views: Company, Experience, Education, Location and **Compare All**.
Compare All returns seven distributions at once over the whole result set: current company, past company,
total years of experience, years in current position, school, field of study, location. Only the top five
values per dimension, with a `More` control.

**Spotlights** recalculate per result set and are six more free counts. Two matter: **have company
connections** is a firm-wide warm-path measure, and **rediscovered candidates** is who is already in your
own pipeline, which gives the gross-versus-known split without a separate cross-check.

---

## Validation rules — apply all of these, every time

**Containment.** Any facet or breakdown value exceeding the result count is invalid and gets discarded.
Observed: a 29K result set returned `IBM 1.2M+` under PAST COMPANY. The same dimension was correctly
scoped on a different pool, so **this cannot be spotted by inspection**. On a large pool the error is
invisible because a wrong number still sits plausibly under the total.

**Coverage per pool.** Sum a histogram, divide by the result count, and quote shares against the profiles
that carry the field — never against the pool. Coverage is a property of the pool, not the field. Measured
on one 64K pool: years of experience 100%, years in current position 97%, company sizes 82%, years in
current company 67%.

**Exclusivity.** Never sum these — they are multi-valued:

| facet | sum vs pool |
|---|---|
| Job functions | 114% |
| Employment type | 116% |
| Year of graduation | 117% — one row per degree, not per person |

Years of experience sums to 100% and is safe.

**Range upper bound.** A range displayed as `8 – 15 years` returned a count matching the histogram sum for
8 through **14**. Set the upper bound one higher than the band you want, and verify against the histogram.
Observed, not confirmed.

**Location breakdown mixes granularity** — `United States 6.5K+` sits next to `Texas, United States 2.6K+`.
Never sum it.

**Garbage control.** Any filter used for the first time gets a deliberately invalid value, which must
return zero.

**Counts are floored and abbreviated** above about 1,000 — `64K+`, `1.5K+`. Ratios between two abbreviated
figures carry a few percent of error. Prefer pools small enough to return exact integers when precision
matters.

**Filters compose logically, which is a free sanity check.** With total experience capped at 15, every
`years in current company` bin from 15 up correctly read zero.

---

## Driving it with Playwright

Recruiter is an Ember app. Read `browser-automation` for the general rules; these are the
Recruiter-specific ones.

### Opening a session

1. `browser_navigate` to `https://www.linkedin.com/talent/`. If it lands on a login page, ask the user to
   log in in the window that opened — the persistent profile keeps them logged in afterwards.
2. Navigate into the project you are working in, so searches land in its history.
3. Install the harness **once per page load**: read `harness.js` from this skill directory and pass its
   contents to `browser_evaluate`. It defines `__adv`, `__f`, `__count` and `__search` on `window`.
   Any full page navigation clears it — reinstall after one.

### The read loop

```
__adv()                    open advanced search
__f('Years of experience') open one facet, return its values, counts and histogram
__count()                  read the current result count
__search()                 execute (costs a search against the batch budget)
```

`__f` is the workhorse: **it returns a facet's scoped counts without running a search**, so batch four or
five labels per round trip and never spend a search on something a facet already answers.

Set filters with `browser_type` and `browser_click` against fresh snapshot refs, not by assigning
`.value` — see gotcha 2. Read results back with `__f` / `__count` rather than snapshotting the page.

### The gotchas, all of them measured

1. **Re-find elements after every click.** Nodes detach on re-render; a held reference throws.
2. **Every write must be a real Playwright click, never `element.click()` inside a `browser_evaluate`.**
   Ember ignores untrusted synthetic events, so the write reports success and does nothing. This caused
   four consecutive silent failures in one session — job-title boolean, spoken languages, company sizes
   and the schools typeahead all no-oped. Resolve the target's element id inside an evaluate if you must,
   then click it with the browser click tool. **Two exceptions genuinely work from inside an evaluate**,
   because they are real routed elements: **`<a>` facet options** (Seniority levels are anchors carrying
   their scoped counts) and **`Remove <value>` buttons**.
3. **Type through the real input path**, not by assigning `.value` — native assignment does not fire the
   typeahead and the selection silently fails. Ranges are the exception, and even there verify the chip.
4. **Typeahead element ids are regenerated on every panel open** — `typeahead-input-ember5579` becomes
   `typeahead-input-ember16785`. Re-read the id each time; never cache one across a panel close.
5. **Verify state after every mutation.** Read the applied chips and the count. Several writes in testing
   appeared to succeed and had not applied.
6. **Histograms are ARIA-only tables** — query `[role="row"]` and `[role="cell"]`, not `<tr>`/`<td>`.
7. **Boolean chips come back HTML-escaped** (`&amp;quot;`). Unescape before logging.
8. **Waits:** ~1.5s after opening a facet, 6-7s after `Search`. Prefer `browser_wait_for` on the count
   element changing where you can.
9. **The results page renders an "All recommended matches" module whose profiles are not results.** It
   has injected unrelated people into page text. Scope extraction to the result list.
10. **Close the browser when the batch is done.** The profile lock blocks the next run otherwise.

### Selectors

`harness.js` already encodes these; they are here for when you need to go beyond it.

| thing | how |
|---|---|
| Advanced panel | `section.advanced-search` |
| Facet label | `section.advanced-search p` matching the facet name exactly |
| Applied chip | `[role="group"]` with `aria-label` starting `Must have,` / `Can have,` / `Does not have,` |
| Remove a chip | `button[aria-label="Remove <value>"]` |
| Chip priority menu | `button[aria-label="Dropdown menu for updating <value>"]`, then the menu item |
| Histogram | ARIA-only table — `[role="row"]` / `[role="cell"]` |
| Range | two `input[type=number]` plus two `input[type=range]` (`Minimum`, `Maximum`), then `Update` |
| Result count | `/([\d.,]+[KM]?\+?)\s*results?/i` against `body.innerText` |
| Result card | `[data-test-paginated-profile-list-item-container]`, name at `[data-test-row-lockup-full-name]` |

**The result list is virtualized** — roughly 2 of 25 cards are in the DOM at rest. If you have been asked
to extract one, scroll and accumulate keyed on the profile id from the `/talent/profile/<id>` href, and
stop on a settle check rather than a fixed iteration count: a fixed count returned 22 of 25.

## Reproducibility

- Advanced search has its own URL.
- Every executed search reopens at `?searchHistoryId=<id>`; history lives at
  `/talent/search/recruiter-search-history`, paginated.
- A **new** search cannot be composed as a URL. So the reproducibility record is **the written recipe plus
  the `searchHistoryId`** — log both, along with a plain-English description of the intent and the count.

**Restoring from history is lossy, so the recipe is the record and the id is only a convenience.**
Reopening a `searchHistoryId` restored titles, location, seniority and years but silently dropped four
`Schools` chips, taking a 223-result search to 5.5M+. **Always re-read the applied chips and the count
after a restore** and compare both against the logged recipe.

**A project's search state is shared across sessions.** Two tabs on the same account do not hold
independent filter state, so a search run in one overwrites what another configured. Saving to the
project is the only session-independent handoff.

## Reporting

Give each figure its filter recipe, its date, and one stated limitation. Where two sources disagree,
report both with the ratio and say which is authoritative — never average and never pick silently.

## Not established

Everything above was measured. These were not, so do not assert them — check, and say you checked.

- **The range upper-bound rule** (that `8 – 15` behaves as 8–14) has one observation and no attended
  confirmation.
- **Company types** did not render on probe.
- **Whether breakdown or facet values are clickable as filters** is unknown.
- **Whether the natural-language input composes with structured filters**, and what it does to a count.
- **Custom filters** were seen once in the rail and not since.
- **Spoken-language proficiency tiers** would not register through automation.
- **Recruiting activity values** need the sub-dropdown opened and were never enumerated.
