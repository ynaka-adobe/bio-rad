/* eslint-disable */
/* global WebImporter */
/** Parser for hero-banner. Base: hero. Source: https://www.cat.com/en_US.html */
export default function parse(element, { document }) {
  const cells = [];

  // Row 1: hero image
  const img = element.querySelector('figure img, img.lazyload, img[data-src]');
  if (img) {
    // Fix lazy-loaded src
    if (!img.src && img.dataset.src) img.src = img.dataset.src;
    cells.push([img]);
  }

  // Row 2: heading + description + CTA
  const contentCell = [];
  const heading = element.querySelector('h2.teaserHeading, h2, h1');
  if (heading) contentCell.push(heading);

  const description = element.querySelector('p.teaser-blog-content, p:not(.teaser-date):not([style*="display: none"])');
  if (description && description.textContent.trim()) contentCell.push(description);

  const cta = element.querySelector('a.button, a.teaserDefaultButtonText, a[class*="button"]');
  if (cta) {
    // Clean up CTA - remove icons
    cta.querySelectorAll('i, .material-icons').forEach((icon) => icon.remove());
    contentCell.push(cta);
  }

  if (contentCell.length > 0) cells.push(contentCell);

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-banner', cells });
  element.replaceWith(block);
}
