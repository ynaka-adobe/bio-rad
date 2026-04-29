/**
 * Replace this module with Adobe Target client code from your IMS/property deployment.
 * Scripts load this module when `<meta name="target" content="…">` is present.
 *
 * Typical integration: vendor `at.js` from Adobe Target exports or assigns `window.adobe.target`;
 * scripts.js relies on `window.adobe.target.getOffers({ … })`.
 */
if (!window.adobe) window.adobe = {};
if (!window.adobe.target) {
  window.adobe.target = {
    /** No-op stub until Target client is wired. */
    async getOffers() {
      return { execute: {} };
    },
  };
}
