# Juicebox pre-flight checks

Run these before any Juicebox number is reported. Each one has produced a wrong number in practice or is
provable by construction.

## Before quoting a count

1. **Is it `1M+`?** Then it is unmeasured, not one million. Narrow it or use LinkedIn Recruiter.
2. **Did a prompt create this search?** Open the filter panel. Criteria do not narrow, so the prompt may
   describe a cohort the count does not represent.
3. **Is it the total match count, not the evaluated count?** The evaluated subset caps at 5,000 and would
   cap every large pool at the same number.
4. **What does Expand pool say?** Record which filter is binding and what dropping it would cost.
5. **Is any location filter doing what you think?** `Location(s)` AND `Past Locations`, and there is no
   location exclusion.
6. **If a degree is tied to an institution, is it Nested?** Regular does not tie them.
7. **Are multiple skills OR'd?** They default to Match Any. Pin the ones that are mandatory.
8. **Are Power Filters on Match Any or Match All?** The toggle changes the meaning entirely.

## Before quoting anything from Insights

9. **Copy the coverage percentage.** Sections state "(covers N%)" and the figure is meaningless without it.
10. **Check the unknown rate.** Gender distribution carries an explicit Unknown bucket; others may not.

## Before spending anything

11. **Have you priced it?** Exporting is one credit per profile. Use
    `preview_candidate_details_cost` first. Searching, counting and Insights are free.

## Before finishing

12. **Did you save the search?** The `search_id` URL is the reproducibility record.
13. **Did you leave someone else's saved search modified?** Escape out of the filter dialog rather than
    saving, and confirm via `get_project` that the saved-search count is unchanged.
