/* eslint-disable */
/* global WebImporter */
/** Parser for cards-info. Base: cards. Source: https://www.cat.com/en_US.html */
export default function parse(element, { document }) {
  const cells = [];

  // Each teaser tile in the about section becomes a card
  const teasers = element.querySelectorAll('[data-component="teaser"]');

  teasers.forEach((teaser) => {
    const img = teaser.querySelector('figure img, img.lazyload, img[data-src]');
    const heading = teaser.querySelector('h2.teaserHeading, h2');
    const description = teaser.querySelector('p.teaser-blog-content, .teaser__text-wrap p:not(.teaser-date)');
    const cta = teaser.querySelector('a.button, a[class*="button"]');

    // Fix lazy-loaded images
    if (img && !img.src && img.dataset.src) img.src = img.dataset.src;

    const imageCell = img || '';
    const contentCell = [];

    if (heading) contentCell.push(heading);
    if (description && description.textContent.trim()) contentCell.push(description);
    if (cta) {
      cta.querySelectorAll('i, .material-icons').forEach((icon) => icon.remove());
      contentCell.push(cta);
    }

    if (contentCell.length > 0) cells.push([imageCell, contentCell]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-info', cells });
  element.replaceWith(block);
}
