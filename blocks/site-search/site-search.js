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

/**
 * @param {HTMLElement} container
 * @param {Record<string, unknown>[]} items
 * @param {string} query
 */
function renderResults(container, items, query) {
  container.textContent = '';
  const filtered = query ? items.filter((it) => matches(it, query)) : [];

  if (!query) {
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

export default function init(block) {
  const indexUrl = resolveIndexUrl(block);
  const placeholder = readPlaceholder(block);
  const { text: headingText, tag: headingTag } = readHeading(block);

  block.textContent = '';

  const shell = document.createElement('div');
  shell.className = 'site-search-container';

  if (headingText) {
    const h = document.createElement(headingTag);
    h.className = 'site-search-heading';
    h.textContent = headingText;
    shell.append(h);
  }

  const form = document.createElement('form');
  form.className = 'site-search-form';
  form.setAttribute('role', 'search');

  const label = document.createElement('label');
  label.className = 'site-search-label';
  const labelText = headingText || 'Search';
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
  status.className = 'site-search-status';
  status.setAttribute('aria-live', 'polite');

  const results = document.createElement('div');
  results.className = 'site-search-output';

  form.append(label, input);
  shell.append(form, status, results);
  block.append(shell);

  let items = [];
  let debounceTimer = 0;

  if (!indexUrl) {
    status.textContent = 'Search is not configured.';
    return;
  }

  fetch(indexUrl.href)
    .then((r) => {
      if (!r.ok) throw new Error(String(r.status));
      return r.json();
    })
    .then((json) => {
      items = asItems(json);
      status.textContent = `${items.length} pages indexed.`;
      renderResults(results, items, '');
    })
    .catch(() => {
      status.textContent = 'Could not load search index.';
    });

  form.addEventListener('submit', (e) => e.preventDefault());

  input.addEventListener('input', () => {
    window.clearTimeout(debounceTimer);
    debounceTimer = window.setTimeout(() => {
      const q = input.value.trim();
      renderResults(results, items, q);
      const n = q ? items.filter((it) => matches(it, q)).length : 0;
      if (q) status.textContent = `${n} result${n === 1 ? '' : 's'}.`;
      else status.textContent = `${items.length} pages indexed.`;
    }, DEBOUNCE_MS);
  });
}
