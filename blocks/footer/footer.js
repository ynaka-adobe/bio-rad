import { getConfig, getMetadata, loadArea } from '../../scripts/ak.js';
import { loadFragment } from '../fragment/fragment.js';

const FOOTER_PATH = '/fragments/nav/footer';

export default async function init(el) {
  const { locale } = getConfig();
  const footerMeta = getMetadata('footer');
  const path = footerMeta || FOOTER_PATH;
  try {
    let fragment;
    const plainResp = await fetch(
      `${locale.prefix}${path}.plain.html`,
    );
    if (plainResp.ok) {
      const html = await plainResp.text();
      const doc = new DOMParser().parseFromString(html, 'text/html');
      const pageSections = doc.querySelectorAll(
        ':scope > body > div',
      );
      fragment = document.createElement('div');
      fragment.classList.add('fragment-content');
      fragment.append(...pageSections);
      await loadArea({ area: fragment });
    } else {
      fragment = await loadFragment(
        `${locale.prefix}${path}`,
      );
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
