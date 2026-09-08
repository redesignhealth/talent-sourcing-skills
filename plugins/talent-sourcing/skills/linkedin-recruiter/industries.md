# LinkedIn's V2 industry taxonomy

Where the commonly-wanted branches actually sit, and which parents catch people out.

Source: LinkedIn Recruiter Help, "Filter candidates by industry in Recruiter and Talent Insights"
(`linkedin.com/help/recruiter/answer/a1425422`), captured 19 Aug 2026. LinkedIn is migrating to a **V2
taxonomy aligned to NAICS**; the legacy V1 names are gone.

Read this when you are choosing industry filters. The `SKILL.md` summary carries the hierarchy rule and
the three misfiled branches; this file is the branch map.

---

## The hierarchy rule

Industries are three levels, and **what you select changes what you get**:

| you select | you get |
|---|---|
| nothing | all candidates |
| **L1 only** | everything mapped to that L1 **and its *related* L2s and below** |
| L1 + L2 | that L1 **and** that L2 and below |
| **L2 only** | that L2 and below |
| **L3 only** | that L3 and below |

An L1 selection is a wide net. For a denominator you can defend, select the specific L2s you mean — and
measure the gap rather than assuming it, by running the L1 against your L2 set and comparing. On one
technology pool the difference was 3% (340K vs 330K), small enough that the level was not the binding
problem there. It will not always be.

**Members with no industry set do not appear in industry-filtered results at all.** Every
industry-filtered count is therefore a subset of the unfiltered one for two independent reasons — the
filter, and missing data — and the count alone cannot separate them.

---

## Healthcare

```
Hospitals and Health Care                     [L1]
Pharmaceutical Manufacturing                  [L3]  Manufacturing > Chemical Manufacturing
Medical Equipment Manufacturing               [L2]  Manufacturing
```

The L1 covers Hospitals, Medical Practices, Community Services, Individual and Family Services, and
Nursing Homes and Residential Care Facilities.

**The trap:** "Health, Wellness & Fitness" was a single V1 industry. In V2, **Wellness and Fitness
Services is an L3 under Entertainment Providers > Recreational Facilities** — it returns gyms and spas.
Carrying the V1 habit across inflates every healthcare count with fitness businesses. This has happened
and was only caught afterwards.

## Public health — a separate tree

```
Public Health                                 [L3]  Government Administration > Health and Human Services
```

**This is not inside the Hospitals and Health Care tree.** Ministry- and agency-type bodies plausibly sit
here instead, so a healthcare search that omits it misses public-sector health staff entirely. Where it
matters, run with and without it — the delta tells you how that population actually self-classifies rather
than how you assume it does.

## Technology

```
Software Development                          [L2]  Technology, Information and Media
Data Infrastructure and Analytics             [L2]  same
Internet Marketplace Platforms                [L2]  same
Information Services                          [L2]  same
IT Services and IT Consulting                 [L2]  Professional Services
```

Prefer L2 here. The L1 `Technology, Information and Media` also contains Broadcast Media,
Movies/Videos/Sound, and Book and Periodical Publishing — media noise in a technology count.

`Computer and Network Security` needs no separate entry: it is **L3 under IT Services and IT Consulting**.
And note that IT consulting sits under **Professional Services**, not under the technology L1 — the split
that catches people out most often.

## Consulting

```
Business Consulting and Services              [L2]  Professional Services
  Strategic Management Services               [L3]  strategy-house work
  Operations Consulting                       [L3]
Accounting                                    [L2]  large-firm audit arms
```

## Research institutions

```
Research Services                             [L2]  Professional Services
  Biotechnology Research                      [L3]
  Nanotechnology Research                     [L3]
  Think Tanks                                 [L3]
Higher Education                              [L2]  Education
```

## Adjacent branches worth knowing

```
Insurance                                     [L2]  Financial Services
  Insurance Carriers / Agencies and Brokerages / Claims Adjusting, Actuarial Services   [L3]
Retail Health and Personal Care Products      [L2]  Retail                  pharmacy chains
Oil and Gas                                   [L2]  Oil, Gas, and Mining
Venture Capital and Private Equity Principals [L3]  Financial Services > Capital Markets
```

Two uses beyond inclusion. `Oil and Gas` matters wherever it is the default destination for technical
talent, so it belongs in the denominator even when it is not the target. And the VC/PE L3 is often most
useful as an **exclusion** — in any founder search, some hits are people who joined an investor rather
than started something.

---

## Caveats worth carrying

- **The rollout is gradual.** LinkedIn says Recruiter's options "may not include all of the industries in
  the full V2 list", and your seat may not have the change yet. If a label here does not autocomplete,
  record that rather than substituting something that looks similar.
- **Industry is self-selected by the member**, and describes their company *or the type of work they do*.
  It is not a reliable employer classification — a software engineer at a hospital may have picked either.
- **V1 counts are not comparable to V2 counts.** Anything quoted from before the transition needs
  re-running.
