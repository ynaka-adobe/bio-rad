import { getConfig, getMetadata, loadArea, setConfig } from './ak.js';
import { runExperimentation } from './experiment-loader.js';

/** Suffixes for internal link decoration (see decorateLink in ak.js). */
const hostnames = ['aem.page', 'aem.live', 'ynaka-adobe.aem.page', 'ynaka-adobe.aem.live'];

const experimentationConfig = {
  prodHost: 'www.bio-rad.com',
  audiences: {
    mobile: () => window.innerWidth < 600,
    desktop: () => window.innerWidth >= 600,
  },
  decorateFunction: async (el) => {
    await loadArea({ area: el });
  },
};

const locales = {
  '': { lang: 'en' },
  '/de': { lang: 'de' },
  '/es': { lang: 'es' },
  '/fr': { lang: 'fr' },
  '/hi': { lang: 'hi' },
  '/ja': { lang: 'ja' },
  '/zh': { lang: 'zh' },
};

const linkBlocks = [
  { fragment: '/fragments/' },
  { schedule: '/schedules/' },
  { youtube: 'https://www.youtube' },
];

// Blocks with self-managed styles
const components = ['fragment', 'schedule'];

// How to decorate an area before loading it
const decorateArea = ({ area = document }) => {
  const eagerLoad = (parent, selector) => {
    const img = parent.querySelector(selector);
    if (!img) return;
    img.removeAttribute('loading');
    img.fetchPriority = 'high';
  };

  eagerLoad(area, 'img');
};

async function loadTarget() {
  const targetMeta = getMetadata('target');
  if (!targetMeta) return;

  /** Optional override; if unset, at.js uses the edge host from your built vendor-at.js. */
  const serverDomain = getMetadata('target-server-domain')?.trim();
  window.targetGlobalSettings = {
    secureOnly: true,
    overrideMboxEdgeServer: false,
    ...(serverDomain ? { serverDomain } : {}),
  };

  try {
    await import('../deps/at/at.js');
    const offers = await window.adobe.target.getOffers({
      request: { execute: { pageLoad: {} } },
    });
    offers?.execute?.pageLoad?.options?.forEach((opt) => {
      const payload = opt?.content?.[0];
      if (!payload) return;
      const { cssSelector, content } = payload;
      if (!cssSelector || content == null) return;
      const el = document.querySelector(cssSelector);
      if (el) el.outerHTML = content;
    });
  } catch (e) {
    getConfig().log(e, document.body);
  }
}

export async function loadPage() {
  setConfig({ hostnames, locales, linkBlocks, components, decorateArea });
  await loadTarget();
  await runExperimentation(document, experimentationConfig);
  await loadArea();
}

const codeBase = new URL(import.meta.url).href.replace(/\/scripts\/scripts\.js$/, '');
if (/\.(?:stage-ue|ue)\.da\.live$/.test(window.location.hostname)) {
  await import(`${codeBase}/ue/scripts/ue.js`).then(({ default: ue }) => ue());
}

await loadPage();

(function da() {
  const { searchParams } = new URL(window.location.href);
  const hasPreview = searchParams.has('dapreview');
  if (hasPreview) import('../tools/da/da.js').then((mod) => mod.default(loadPage));
  const hasQE = searchParams.has('quick-edit');
  if (hasQE) import('../tools/quick-edit/quick-edit.js').then((mod) => mod.default());
}());
