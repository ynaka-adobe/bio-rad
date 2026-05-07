import { getConfig, getMetadata, loadArea } from '../../scripts/ak.js';
import { loadFragment } from '../fragment/fragment.js';

const FOOTER_PATH = '/fragments/nav/footer';
const EN_LOCALE_PREFIX = '/en';

export default async function init(el) {
  const { locale } = getConfig();
  const footerMeta = getMetadata('footer');
  const path = footerMeta || FOOTER_PATH;
  const plainUrls = locale.prefix === EN_LOCALE_PREFIX
    ? [`${locale.prefix}${path}.plain.html`, `${path}.plain.html`]
    : [`${locale.prefix}${path}.plain.html`];
  try {
    let fragment;
    let html = '';
    for (const url of plainUrls) {
      const plainResp = await fetch(url);
      if (plainResp.ok) {
        html = await plainResp.text();
        break;
      }
    }
    if (html) {
      const doc = new DOMParser().parseFromString(html, 'text/html');
      const pageSections = doc.querySelectorAll(
        ':scope > body > div',
      );
      fragment = document.createElement('div');
      fragment.classList.add('fragment-content');
      fragment.append(...pageSections);
      await loadArea({ area: fragment });
    } else {
      const fragPaths = locale.prefix === EN_LOCALE_PREFIX
        ? [`${locale.prefix}${path}`, path]
        : [`${locale.prefix}${path}`];
      let loadError;
      fragment = undefined;
      for (const p of fragPaths) {
        try {
          fragment = await loadFragment(p);
          loadError = undefined;
          break;
        } catch (e) {
          loadError = e;
        }
      }
      if (fragment === undefined) throw Error(loadError);
    }
    fragment.classList.add('footer-content');

    const sections = [...fragment.querySelectorAll('.section')];
    if (sections[0]) sections[0].classList.add('section-brand');
    if (sections[1]) sections[1].classList.add('section-links');
    if (sections[2]) sections[2].classList.add('section-legal');
    if (sections[3]) sections[3].classList.add('section-copyright');

    el.append(fragment);
  } catch (e) {
    throw Error(e);
  }
}
