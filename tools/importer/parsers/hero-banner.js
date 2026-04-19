/* eslint-disable */
/* global WebImporter */

/**
 * Parser for hero-banner. Base: hero. Source: https://www.bio-rad.com/en-us
 * Model fields: image (reference), imageAlt (text, collapsed), text (richtext)
 * Block structure: Row 1 = background image, Row 2 = text content (h1 + paragraph + CTA)
 */
export default function parse(element, { document }) {
  // Extract background image from hero banner
  const bgImage = element.querySelector('figure img, picture img, img');

  // Extract text content: h1, paragraph, CTA
  const heading = element.querySelector('h1');
  const description = element.querySelector('.banner-h1-text p, p');
  const ctaLink = element.querySelector('a[href]:not([href="javascript:void(0)"])');

  const cells = [];

  // Row 1: Background image with field hint
  if (bgImage) {
    const imgFrag = document.createDocumentFragment();
    imgFrag.appendChild(document.createComment(' field:image '));
    imgFrag.appendChild(bgImage);
    cells.push([imgFrag]);
  }

  // Row 2: Text content (heading + description + CTA) with field hint
  const textFrag = document.createDocumentFragment();
  textFrag.appendChild(document.createComment(' field:text '));
  if (heading) textFrag.appendChild(heading);
  if (description) textFrag.appendChild(description);
  if (ctaLink) textFrag.appendChild(ctaLink);
  cells.push([textFrag]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-banner', cells });
  element.replaceWith(block);
}
