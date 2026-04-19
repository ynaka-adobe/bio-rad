/* eslint-disable */
/* global WebImporter */
/** Parser for columns-feature. Base: columns. Source: https://www.cat.com/en_US.html */
export default function parse(element, { document }) {
  const cells = [];

  // Find the teaser component within the section
  const teaser = element.querySelector('[data-component="teaser"]') || element;

  // Col 1: text content (heading + description + CTA)
  const contentCol = [];
  const heading = teaser.querySelector('h2.teaserHeading, h2, h1');
  if (heading) contentCol.push(heading);

  const description = teaser.querySelector('p.teaser-blog-content, .teaser__text-wrap p:not(.teaser-date)');
  if (description && description.textContent.trim()) contentCol.push(description);

  const cta = teaser.querySelector('a.button, a[class*="button"]');
  if (cta) {
    cta.querySelectorAll('i, .material-icons').forEach((icon) => icon.remove());
    contentCol.push(cta);
  }

  // Col 2: image
  const img = teaser.querySelector('figure img, .teaser__img-wrap img, img.lazyload');
  if (img && !img.src && img.dataset.src) img.src = img.dataset.src;
  const imageCol = img || '';

  if (contentCol.length > 0) cells.push([contentCol, imageCol]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-feature', cells });
  element.replaceWith(block);
}
