/* eslint-disable */
/* global WebImporter */

/**
 * Parser for columns-product. Base: columns. Source: https://www.bio-rad.com/en-us
 * Columns blocks do NOT require field hints (xwalk exception).
 * Block structure: Row per featured product = [image col, text col]
 * Targets .paragraph--view-mode--brc-homepage-2-0-more-content articles with NEW PRODUCT badge
 */
export default function parse(element, { document }) {
  const cells = [];

  // The featured products section contains article elements
  const articles = element.querySelectorAll('article');

  articles.forEach((article) => {
    const img = article.querySelector('img');
    const badge = article.querySelector('em');
    const heading = article.querySelector('h2');
    const description = article.querySelector('p:not(:has(a))');
    const cta = article.querySelector('a[href]');

    // Image column
    const imageCol = img || '';

    // Text column: badge + heading + description + CTA
    const contentCol = [];
    if (badge) contentCol.push(badge);
    if (heading) contentCol.push(heading);
    if (description && description.textContent.trim()) contentCol.push(description);
    if (cta) contentCol.push(cta);

    if (contentCol.length > 0) cells.push([imageCol, contentCol]);
  });

  // If no articles found, try extracting directly from element
  if (cells.length === 0) {
    const img = element.querySelector('img');
    const heading = element.querySelector('h2');
    const description = element.querySelector('p');
    const cta = element.querySelector('a[href]');

    const contentCol = [];
    if (heading) contentCol.push(heading);
    if (description) contentCol.push(description);
    if (cta) contentCol.push(cta);

    if (contentCol.length > 0) cells.push([img || '', contentCol]);
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-product', cells });
  element.replaceWith(block);
}
