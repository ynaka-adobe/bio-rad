/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: Cat.com cleanup.
 * Selectors from captured DOM of https://www.cat.com/en_US.html
 */
const H = { before: 'beforeTransform', after: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === H.before) {
    // Remove cookie/consent dialogs, floating notifications, chat widgets
    WebImporter.DOMUtils.remove(element, [
      '#onetrust-consent-sdk',
      '[class*="cookie"]',
      '.tfn.floating-system-notification',
      '.skip-to-content',
      '.skip-search-crawl',
      'iframe',
    ]);
    // Remove hidden inputs used by AEM components
    element.querySelectorAll('input[type="hidden"]').forEach((el) => el.remove());
  }
  if (hookName === H.after) {
    // Remove non-authorable content: header, footer, nav, dealer locator
    WebImporter.DOMUtils.remove(element, [
      'header',
      'footer',
      '[role="contentinfo"]',
      'nav',
      '.dealerLocator',
      '.dealers',
      '.bottom-nav',
      'noscript',
      'link',
    ]);
    // Clean tracking attributes
    element.querySelectorAll('*').forEach((el) => {
      el.removeAttribute('data-track');
      el.removeAttribute('data-analytics');
      el.removeAttribute('onclick');
    });
  }
}
