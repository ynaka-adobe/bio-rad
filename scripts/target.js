import { getConfig, getMetadata } from './ak.js';

/** AEM Universal Editor iframe; skip Target so at.js does not fight UE/CSP. */
export function isUePreviewHost(hostname = window.location.hostname) {
  return /\.(?:stage-ue|ue)\.da\.live$/.test(hostname);
}

/** Homepage only — Target hero/page-load activities are not used on inner pages. */
export function isHomePage(pathname = window.location.pathname) {
  const path = pathname.replace(/\/$/, '') || '/';
  return path === '/' || path === '/index';
}

/**
 * Load at.js early so other code can rely on window.adobe.target, but do not apply
 * page-load offers until after blocks run — e.g. target-offer creates `.target-offer__slot`
 * in its init; VEC selectors often point at that hook.
 */
export async function ensureTargetAtJs() {
  if (isUePreviewHost()) return;
  const targetMeta = getMetadata('target');
  if (!targetMeta) return;

  const serverDomain = getMetadata('target-server-domain')?.trim();
  window.targetGlobalSettings = {
    secureOnly: true,
    overrideMboxEdgeServer: false,
    ...(serverDomain ? { serverDomain } : {}),
  };

  try {
    await import('../deps/at/at.js');
  } catch (e) {
    getConfig().log(e, document.body);
  }
}

export async function applyTargetPageLoad() {
  if (isUePreviewHost()) return;
  const targetMeta = getMetadata('target');
  if (!targetMeta) return;

  const t = window.adobe?.target;
  if (!t?.getOffers) return;

  try {
    const pageLoadRequest = { execute: { pageLoad: {} } };
    const offers = await t.getOffers({
      request: pageLoadRequest,
    });

    if (typeof t.applyOffers === 'function') {
      await t.applyOffers({
        request: pageLoadRequest,
        response: offers,
      });
    } else {
      offers?.execute?.pageLoad?.options?.forEach((opt) => {
        const payload = opt?.content?.[0];
        if (!payload) return;
        const { cssSelector, content } = payload;
        if (!cssSelector || content == null) return;
        const el = document.querySelector(cssSelector);
        if (el) el.outerHTML = content;
      });
    }
  } catch (e) {
    getConfig().log(e, document.body);
  }
}

/**
 * Legacy mbox flow (getOffer + applyOffer). Runs after blocks render.
 * Opt-in via meta target-mbox-hero and optional target-mbox-hero-selector.
 * @see https://experienceleague.adobe.com/en/docs/target-dev/developer/client-side/at-js-implementation/functions-overview/adobe-target-applyoffer
 */
export async function applyTargetHeroMboxIfConfigured() {
  if (isUePreviewHost()) return;
  const mbox = getMetadata('target-mbox-hero')?.trim();
  if (!mbox) return;

  const selectorList = (getMetadata('target-mbox-hero-selector')?.trim()
    || '.hero.block .hero-inner')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  const t = window.adobe?.target;
  if (!t?.getOffer || !t?.applyOffer) return;

  const resolveSelector = () => {
    for (let i = 0; i < selectorList.length; i += 1) {
      const el = document.querySelector(selectorList[i]);
      if (el) return { el, selector: selectorList[i] };
    }
    return null;
  };

  await new Promise((resolve) => {
    t.getOffer({
      mbox,
      success(offers) {
        const match = resolveSelector();
        if (!match) {
          resolve();
          return;
        }
        t.applyOffer({ mbox, selector: match.selector, offer: offers });
        resolve();
      },
      error: resolve,
    });
  });
}
