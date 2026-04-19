/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: Bio-Rad cleanup.
 * Removes non-authorable content (header, footer, nav, cookie banners, overlays).
 * Selectors from captured DOM of https://www.bio-rad.com/en-us
 */
const H = { before: 'beforeTransform', after: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === H.before) {
    // Remove cookie/consent banners and overlays (from captured DOM)
    WebImporter.DOMUtils.remove(element, [
      '#onetrust-consent-sdk',
      '#onetrust-banner-sdk',
      '[class*="cookie"]',
      '.country_select',
      '#drift-widget',
    ]);
  }

  if (hookName === H.after) {
    // Remove non-authorable site chrome (from captured DOM)
    WebImporter.DOMUtils.remove(element, [
      // Header and navigation
      'header',
      '#block-biorad-brcheadercomponentblock',
      '.top-bar-unstick',
      '#header-main-nav',
      '#header-login-menu2',
      // Footer
      'footer',
      '#footer-main',
      '.redesign-footer',
      // Other non-authorable
      'iframe',
      'link',
      'noscript',
      'script',
      '.visually-hidden',
      '[role="status"]',
    ]);

    // Clean up tracking attributes
    element.querySelectorAll('*').forEach((el) => {
      el.removeAttribute('data-track');
      el.removeAttribute('onclick');
      el.removeAttribute('data-drupal-selector');
    });
  }
}
