import { getConfig, localizeUrl } from '../../scripts/ak.js';
import ENV from '../../scripts/utils/env.js';
import { loadFragment } from '../fragment/fragment.js';

const config = getConfig();

async function removeSchedule(a, e) {
  if (ENV === 'prod') {
    a.remove();
    return;
  }
  if (e) config.log(e);
  config.log(`Could not load: ${a.href}`);
}

async function loadLocalizedEvent(event) {
  const url = new URL(event.fragment);
  const localized = localizeUrl({ config, url });
  const path = localized?.pathname || url.pathname;

  try {
    const fragment = await loadFragment(path);
    return fragment;
  } catch {
    config.log(`Error fetching ${path} fragment`);
    return null;
  }
}

/**
 * Determine what ancestor to replace with the fragment
 *
 * @param {Element}} a the fragment link
 * @returns the element that can be replaced
 */
function getReplaceEl(a) {
  let current = a;
  const ancestor = a.closest('.section');

  // Walk up the DOM from child to ancestor
  // Break when there is more than one child
  while (current && current !== ancestor) {
    const childCount = current.parentElement.children.length;
    if (childCount <= 1) {
      current = current.parentElement;
    } else {
      break;
    }
  }

  return current;
}

async function loadEvent(a, event, defEvent) {
  // If no fragment path on purpose, remove the schedule.
  if (!event.fragment) {
    a.remove();
    return;
  }

  let fragment = await loadLocalizedEvent(event);
  // Try the default event if the original match didn't work.
  if (!fragment && defEvent) fragment = await loadLocalizedEvent(defEvent);
  // If still no fragment, remove the schedule link
  if (!fragment) {
    removeSchedule(a);
    return;
  }
  const elToReplace = getReplaceEl(a);
  const sections = fragment.querySelectorAll(':scope > .section');
  const children = sections.length === 1
    ? fragment.querySelectorAll(':scope > *')
    : [fragment];
  for (const child of children) {
    elToReplace.insertAdjacentElement('afterend', child);
  }
  elToReplace.remove();
}

/**
 * Optional region filter from URL `geo` (case-insensitive).
 * Rows without a `geo` field match every region; otherwise row.geo must equal the param.
 * @param {URLSearchParams} params page query string
 * @returns {string | null} normalized geo or null when param absent / empty
 */
function getGeoFilter(params) {
  const raw = params.get('geo');
  if (raw === null || raw === '') return null;
  return raw.trim().toLowerCase();
}

/**
 * @param {object} evt schedule row from sheet JSON
 * @param {string | null} normalizedGeo from getGeoFilter
 */
function matchesGeo(evt, normalizedGeo) {
  if (!normalizedGeo) return true;
  const rowGeo = typeof evt.geo === 'string' ? evt.geo.trim().toLowerCase() : '';
  if (!rowGeo) return true;
  return rowGeo === normalizedGeo;
}

/**
 * Reference instant used to pick which sheet row matches (between start/end).
 * Precedence: URL `start` (ISO-8601 or Unix seconds) → non-prod `schedule` / localStorage → Date.now().
 * @param {URLSearchParams} [params] defaults to current page query string
 */
function getScheduleReferenceTime(params = new URL(window.location.href).searchParams) {
  const startParam = params.get('start');
  if (startParam !== null && startParam !== '') {
    const trimmed = startParam.trim();
    const fromIso = Date.parse(trimmed);
    if (!Number.isNaN(fromIso)) {
      return fromIso;
    }
    const asUnixSeconds = Number(trimmed);
    if (trimmed !== '' && Number.isFinite(asUnixSeconds)) {
      return Math.trunc(asUnixSeconds) * 1000;
    }
  }

  const now = Date.now();
  if (ENV === 'prod') return now;

  const sim = localStorage.getItem('aem-schedule') || params.get('schedule');
  return sim * 1000 || now;
}

export default async function init(a) {
  const resp = await fetch(a.href);
  if (!resp.ok) {
    await removeSchedule(a);
    return;
  }
  const { data } = await resp.json();
  data.reverse();
  const pageParams = new URL(window.location.href).searchParams;
  const referenceTime = getScheduleReferenceTime(pageParams);
  const geoFilter = getGeoFilter(pageParams);

  const found = data.find((evt) => {
    if (!matchesGeo(evt, geoFilter)) return false;
    try {
      const start = Date.parse(evt.start);
      const end = Date.parse(evt.end);
      return referenceTime > start && referenceTime < end;
    } catch {
      config.log(`Could not get scheduled event: ${evt.name}`);
      return false;
    }
  });

  // Get a default event in case the main event doesn't load (respects geo when set)
  const defEvent = data.find((evt) => !(evt.start && evt.end) && matchesGeo(evt, geoFilter));

  // Use either the found event or the default
  const event = found || defEvent;
  if (!event) {
    await removeSchedule(a);
    return;
  }

  await loadEvent(a, event, defEvent);
}
