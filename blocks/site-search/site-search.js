const DEFAULT_INDEX_PATH = '/query-index.json';
const DEBOUNCE_MS = 280;

/** @param {string | undefined} v */
function norm(v) {
  return (v || '').toLowerCase();
}

/**
 * Resolve query index JSON URL from authored link or default.
 * Same-origin only (author-configured URL must not point off-site).
 * @param {HTMLElement} block
 * @returns {URL | null}
 */
function resolveIndexUrl(block) {
  const anchors = [...block.querySelectorAll('a[href]')];
  const match = anchors.find((a) => {
    try {
      const u = new URL(a.getAttribute('href') || '', window.location.origin);
      if (u.origin !== window.location.origin) return false;
      const { pathname } = u;
      return pathname.endsWith('.json');
    } catch {
      return false;
    }
  });
  if (match) {
    try {
      return new URL(match.getAttribute('href') || '', window.location.origin);
    } catch {
      /* ignore */
    }
  }
  try {
    return new URL(DEFAULT_INDEX_PATH, window.location.origin);
  } catch {
    return null;
  }
}

/** @param {string | URL | null | undefined} raw */
function toSameOriginIndexUrl(raw) {
  if (!raw) return null;
  try {
    const u = raw instanceof URL ? raw : new URL(raw, window.location.origin);
    if (u.origin !== window.location.origin) return null;
    return u;
  } catch {
    return null;
  }
}

/** @param {HTMLElement} block */
function readPlaceholder(block) {
  const paras = [...block.querySelectorAll('p')].map((p) => p.textContent.trim()).filter(Boolean);
  if (paras.length) return paras[paras.length - 1];
  return 'Search…';
}

/** @param {HTMLElement} block */
function readHeading(block) {
  const h = block.querySelector('h1, h2, h3, h4, h5, h6');
  if (!h) return { text: '', tag: 'h2' };
  const tag = h.tagName.toLowerCase();
  const safeTag = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tag) ? tag : 'h2';
  return { text: h.textContent.trim(), tag: safeTag };
}

/** @param {unknown} raw */
function asItems(raw) {
  if (Array.isArray(raw)) return raw;
  if (raw && typeof raw === 'object' && Array.isArray(raw.data)) return raw.data;
  return [];
}

/**
 * @param {Record<string, unknown>} item
 * @param {string} q
 */
function matches(item, q) {
  if (!q) return true;
  const nq = norm(q);
  const parts = [
    item.title,
    item.description,
    item.content,
    item.path,
  ]
    .filter((x) => typeof x === 'string')
    .map(norm);
  const { tags } = item;
  if (Array.isArray(tags)) {
    tags.filter((t) => typeof t === 'string').forEach((t) => {
      parts.push(norm(t));
    });
  }
  const hay = parts.join(' ');
  return hay.includes(nq);
}

const SEARCH_BTN_SVG = `<svg xmlns="http://www.w3.org/2000/svg"
  viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"
  stroke-linecap="round" stroke-linejoin="round"><circle cx="11"
  cy="11" r="8"/><line x1="21" y1="21" x2="16.65"
  y2="16.65"/></svg>`;

/**
 * @param {HTMLElement} container
 * @param {Record<string, unknown>[]} items
 * @param {string} query
 * @param {'block' | 'header'} variant
 */
function renderResults(container, items, query, variant) {
  container.textContent = '';
  const filtered = query ? items.filter((it) => matches(it, query)) : [];

  if (!query) {
    if (variant === 'header') return;
    const hint = document.createElement('p');
    hint.className = 'site-search-hint';
    hint.textContent = 'Type to search indexed pages.';
    container.append(hint);
    return;
  }

  if (!filtered.length) {
    const empty = document.createElement('p');
    empty.className = 'site-search-empty';
    empty.textContent = 'No results.';
    container.append(empty);
    return;
  }

  const list = document.createElement('ul');
  list.className = 'site-search-results';
  filtered.slice(0, 50).forEach((item) => {
    const path = typeof item.path === 'string' ? item.path : '';
    const title = typeof item.title === 'string' && item.title ? item.title : path || 'Untitled';
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = path || '#';
    a.textContent = title;
    const desc = typeof item.description === 'string' ? item.description.trim() : '';
    if (desc) {
      const d = document.createElement('span');
      d.className = 'site-search-result-desc';
      d.textContent = desc;
      li.append(a, d);
    } else {
      li.append(a);
    }
    list.append(li);
  });
  container.append(list);
}

/**
 * @param {{
 *   variant?: 'block' | 'header',
 *   placeholder?: string,
 *   label?: string,
 *   indexUrl?: URL | string | null,
 *   heading?: { text: string, tag: string } | null,
 * }} options
 * @param {HTMLElement} root
 */
export function initSiteSearch(root, options = {}) {
  const variant = options.variant || 'block';
  const placeholder = options.placeholder ?? 'Search…';
  const labelText = options.label ?? 'Search';
  const heading = options.heading && options.heading.text ? options.heading : null;

  let indexUrl = toSameOriginIndexUrl(options.indexUrl ?? null);
  if (!indexUrl) {
    indexUrl = resolveIndexUrl(root);
  }

  root.classList.add('site-search');
  if (variant === 'header') root.classList.add('site-search-header');

  root.textContent = '';

  const shell = document.createElement('div');
  shell.className = 'site-search-container';

  if (variant === 'block' && heading) {
    const h = document.createElement(heading.tag);
    h.className = 'site-search-heading';
    h.textContent = heading.text;
    shell.append(h);
  }

  const form = document.createElement('form');
  form.className = 'site-search-form';
  form.setAttribute('role', 'search');

  const label = document.createElement('label');
  label.className = variant === 'header'
    ? 'site-search-label site-search-sr-only'
    : 'site-search-label';
  label.textContent = labelText;
  const inputId = `site-search-${Math.random().toString(36).slice(2, 9)}`;
  label.setAttribute('for', inputId);

  const input = document.createElement('input');
  input.type = 'search';
  input.id = inputId;
  input.className = 'site-search-input';
  input.placeholder = placeholder;
  input.autocomplete = 'off';

  const status = document.createElement('div');
  status.className = variant === 'header'
    ? 'site-search-status site-search-sr-only'
    : 'site-search-status';
  status.setAttribute('aria-live', 'polite');

  const results = document.createElement('div');
  results.className = 'site-search-output';

  form.append(label, input);
  if (variant === 'header') {
    const btn = document.createElement('button');
    btn.type = 'submit';
    btn.className = 'header-search-btn';
    btn.setAttribute('aria-label', 'Search');
    btn.innerHTML = SEARCH_BTN_SVG;
    form.append(btn);
  }
  if (variant === 'header') {
    shell.append(form, results, status);
  } else {
    shell.append(form, status, results);
  }
  root.append(shell);

  let items = [];
  let debounceTimer = 0;

  const updateStatus = (q) => {
    if (variant === 'header') {
      if (!q) {
        status.textContent = '';
        return;
      }
      const n = items.filter((it) => matches(it, q)).length;
      status.textContent = `${n} result${n === 1 ? '' : 's'}`;
      return;
    }
    const n = q ? items.filter((it) => matches(it, q)).length : 0;
    if (q) status.textContent = `${n} result${n === 1 ? '' : 's'}.`;
    else status.textContent = `${items.length} pages indexed.`;
  };

  if (!indexUrl) {
    if (variant === 'block') status.textContent = 'Search is not configured.';
    return;
  }

  fetch(indexUrl.href)
    .then((r) => {
      if (!r.ok) throw new Error(String(r.status));
      return r.json();
    })
    .then((json) => {
      items = asItems(json);
      if (variant === 'block') {
        status.textContent = `${items.length} pages indexed.`;
      }
      renderResults(results, items, '', variant);
    })
    .catch(() => {
      if (variant === 'block') status.textContent = 'Could not load search index.';
    });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const q = input.value.trim();
    if (!q || !results.querySelector('a')) return;
    const first = results.querySelector('a');
    if (first instanceof HTMLAnchorElement) first.click();
  });

  input.addEventListener('input', () => {
    window.clearTimeout(debounceTimer);
    debounceTimer = window.setTimeout(() => {
      const q = input.value.trim();
      renderResults(results, items, q, variant);
      updateStatus(q);
    }, DEBOUNCE_MS);
  });

  input.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    input.value = '';
    renderResults(results, items, '', variant);
    updateStatus('');
  });
}

export default function init(block) {
  const indexUrl = resolveIndexUrl(block);
  const placeholder = readPlaceholder(block);
  const heading = readHeading(block);
  const headingForUi = heading.text ? heading : null;

  block.textContent = '';

  initSiteSearch(block, {
    variant: 'block',
    placeholder,
    label: heading.text || 'Search',
    heading: headingForUi,
    indexUrl: indexUrl ?? undefined,
  });
}
