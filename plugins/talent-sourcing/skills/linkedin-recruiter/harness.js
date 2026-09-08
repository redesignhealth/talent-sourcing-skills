// LinkedIn Recruiter automation harness.
// Install once per page load via Playwright browser_evaluate, then call the helpers.
// Ember detaches nodes on re-render, so every helper re-finds its targets.

(() => {
  const sleep = ms => new Promise(r => setTimeout(r, ms));

  // Open advanced search if it is not already open.
  window.__adv = async () => {
    if (document.querySelector('section.advanced-search')) return 'already';
    const a = [...document.querySelectorAll('a')].find(x => x.innerText.trim() === 'Advanced search');
    if (!a) return 'no advanced link';
    a.click();
    await sleep(2600);
    return document.querySelector('section.advanced-search') ? 'opened' : 'failed';
  };

  // Open a facet by its <p> label inside advanced search and dump its contents.
  // Returns values (with scoped counts), a per-unit histogram for range facets, and inputs.
  window.__f = async (labelText, waitMs = 1600) => {
    await window.__adv();
    const find = () => [...document.querySelectorAll('section.advanced-search p')]
      .find(x => x.innerText.trim().toLowerCase() === labelText.toLowerCase());
    let p = find();
    if (!p) return {
      error: 'label not found: ' + labelText,
      available: [...document.querySelectorAll('section.advanced-search p')].map(x => x.innerText.trim())
    };
    const btn = p.parentElement.querySelector('button');
    if (btn && btn.getAttribute('aria-expanded') !== 'true') { btn.click(); await sleep(waitMs); }
    p = find();
    const scope = p.parentElement;

    const histogram = [...scope.querySelectorAll('[role="row"]')]
      .map(r => [...r.querySelectorAll('[role="cell"]')].map(c => (c.textContent || '').trim()))
      .filter(r => r.length === 2);
    const values = [...scope.querySelectorAll('[role="option"],li,label')]
      .map(e => (e.innerText || '').replace(/\s+/g, ' ').trim())
      .filter(t => t && t.length < 80);
    const inputs = [...scope.querySelectorAll('input,textarea')]
      .map(e => (e.type || e.tagName) + ':' + (e.getAttribute('aria-label') || e.placeholder || e.id || ''));

    return {
      facet: labelText,
      values: [...new Set(values)],
      histogram: histogram.length ? histogram.map(r => r.join('=')) : null,
      inputs: [...new Set(inputs)],
      text: (scope.innerText || '').replace(/\n{2,}/g, '\n').slice(0, 900)
    };
  };

  // Read the result count and every applied chip. Always call after a mutation.
  window.__count = async (waitMs = 6500) => {
    await sleep(waitMs);
    const m = document.body.innerText.match(/([\d.,]+[KM]?\+?)\s*results?/i);
    const chips = [...document.querySelectorAll('[role="group"]')]
      .map(x => x.getAttribute('aria-label') || '')
      .filter(t => /have,|years\./.test(t))
      .map(t => t.split('.')[0].replace(/&amp;quot;/g, '"'));
    return { count: m && m[0], chips: [...new Set(chips)] };
  };

  window.__search = async () => {
    const s = [...document.querySelectorAll('section.advanced-search button')]
      .find(x => x.innerText.trim() === 'Search');
    if (!s) return { error: 'no search button' };
    s.click();
    return await window.__count();
  };

  // Set a location chip's priority: 'Must have' | 'Can have' | "Doesn't have".
  window.__loc = async (value, priority) => {
    const b = [...document.querySelectorAll('button')]
      .find(x => (x.getAttribute('aria-label') || '') === 'Dropdown menu for updating ' + value);
    if (!b) return 'no chip for ' + value;
    b.click();
    await sleep(900);
    const t = [...document.querySelectorAll('[role="menuitem"],[role="option"],button,li')]
      .find(e => new RegExp('^' + priority.replace(/'/g, '.') + '$').test((e.innerText || '').trim()));
    if (!t) return 'priority not found: ' + priority;
    t.click();
    return await window.__count();
  };

  window.__rm = async (value) => {
    const b = [...document.querySelectorAll('button')]
      .find(x => (x.getAttribute('aria-label') || '') === 'Remove ' + value);
    if (!b) return 'no remove button for ' + value;
    b.click();
    return await window.__count();
  };

  // Read the Compare All breakdown. Switch the view to Compare All in the UI first.
  window.__breakdown = () => {
    const h = [...document.querySelectorAll('h3')].find(x => /SEARCH BREAKDOWN/i.test(x.innerText));
    if (!h) return 'breakdown not open';
    let root = h.parentElement;
    for (let i = 0; i < 6 && root && root.innerText.length < 300; i++) root = root.parentElement;
    return root.innerText.replace(/\n{2,}/g, '\n').slice(0, 4000);
  };

  // Sum a histogram returned by __f, and report coverage against the pool.
  // Guards the two rules that produce wrong numbers: containment and coverage.
  window.__sum = (histogram, poolCount, from, to) => {
    const num = s => {
      const m = String(s).match(/([\d.]+)\s*([KM]?)/);
      if (!m) return 0;
      return parseFloat(m[1]) * (m[2] === 'K' ? 1e3 : m[2] === 'M' ? 1e6 : 1);
    };
    const unit = k => k === 'Less than 1' ? 0 : parseInt(k);
    const rows = histogram.map(r => { const [k, v] = r.split('='); return { k, unit: unit(k), v: num(v) }; });
    const total = rows.reduce((a, r) => a + r.v, 0);
    const pool = num(poolCount);
    const band = (from == null) ? null
      : rows.filter(r => r.unit >= from && r.unit <= to).reduce((a, r) => a + r.v, 0);
    return {
      binTotal: Math.round(total),
      pool: Math.round(pool),
      coverage: pool ? +(total / pool * 100).toFixed(1) + '%' : 'unknown',
      band: band == null ? null : Math.round(band),
      warning: total > pool * 1.02
        ? 'EXCEEDS POOL — facet is multi-valued, do not sum as people'
        : (pool && total < pool * 0.95 ? 'partial coverage — quote shares against binTotal, not pool' : null)
    };
  };

  return 'recruiter harness installed';
})();
