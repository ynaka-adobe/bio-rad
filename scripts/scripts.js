import { getConfig, getMetadata, loadArea, setConfig } from './ak.js';
import { runExperimentation } from './experiment-loader.js';
import {
  applyTargetHeroMboxIfConfigured,
  applyTargetPageLoad,
  ensureTargetAtJs,
  isUePreviewHost,
} from './target.js';

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
  '/en': { lang: 'en' },
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

function enforceCountryExclusion() {
  const metaValue = getMetadata('exclude-from-country');
  if (!metaValue) return;
  const { locale } = getConfig();
  const countryCode = locale.prefix.replace('/', '').toUpperCase();
  if (!countryCode) return;
  const excluded = metaValue.split(',').map((c) => c.trim().toUpperCase());
  if (excluded.includes(countryCode)) {
    window.location.replace(`${locale.prefix}/404`);
  }
}

export async function loadPage() {
  setConfig({ hostnames, locales, linkBlocks, components, decorateArea });
  enforceCountryExclusion();
  await ensureTargetAtJs();
  await runExperimentation(document, experimentationConfig);
  await loadArea();
  await applyTargetPageLoad();
  await applyTargetHeroMboxIfConfigured();
}

const codeBase = new URL(import.meta.url).href.replace(/\/scripts\/scripts\.js$/, '');
if (isUePreviewHost()) {
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
