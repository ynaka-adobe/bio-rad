/* eslint-disable */
/* global WebImporter */

/**
 * Parser for columns-feature. Base: columns. Source: https://www.bio-rad.com/en-us
 * Columns blocks do NOT require field hints (xwalk exception).
 * Block structure: Row 1 = [image col, text col]
 */
export default function parse(element, { document }) {
  const cells = [];

  // Col 1: image
  const img = element.querySelector('img');

  // Col 2: text content (heading + paragraph + CTA)
  const contentCol = [];
  const heading = element.querySelector('h2');
  if (heading) contentCol.push(heading);

  const paragraphs = element.querySelectorAll('p');
  paragraphs.forEach((p) => {
    if (p.textContent.trim()) contentCol.push(p);
  });

  const cta = element.querySelector('a[href="/p"], a[href*="/en-us/"]');
  if (cta && !contentCol.includes(cta.closest('p'))) contentCol.push(cta);

  const imageCol = img || '';
  if (contentCol.length > 0) cells.push([imageCol, contentCol]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-feature', cells });
  element.replaceWith(block);
}
