import { getConfig, getMetadata } from './ak.js';

/** AEM Universal Editor iframe loads this origin; skip Target so at.js does not fight UE/CSP. */
const isUePreviewHost = (hostname = window.location.hostname) => (
  /\.(?:stage-ue|ue)\.da\.live$/.test(hostname)
);

/**
 * Page-load {@code getOffers} + {@code applyOffers}. Safe to call more than once (e.g. after late DOM).
 */
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
