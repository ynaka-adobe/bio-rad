/* eslint-disable */
/* global WebImporter */
/** Parser for cards-article. Base: cards. Source: https://www.cat.com/en_US.html */
export default function parse(element, { document }) {
  const cells = [];

  // Each editorial-card__item becomes a card row
  const cards = element.querySelectorAll('.editorial-card__item');

  cards.forEach((card) => {
    const img = card.querySelector('img, img.lazyload');
    const heading = card.querySelector('h2, h3, [id="defaultHeadlineText"]');
    const description = card.querySelector('.inner__right p, .editorial-card__item--text-wrap p');
    const link = card.querySelector('a[href]');

    // Fix lazy-loaded images
    if (img && !img.src && img.dataset.src) img.src = img.dataset.src;

    const imageCell = img ? img : '';
    const contentCell = [];

    if (heading) contentCell.push(heading);
    if (description && description.textContent.trim()) contentCell.push(description);
    if (link) {
      const p = document.createElement('p');
      const a = document.createElement('a');
      a.href = link.href;
      a.textContent = link.textContent.trim() || heading?.textContent.trim() || 'Read more';
      p.append(a);
      contentCell.push(p);
    }

    if (contentCell.length > 0) cells.push([imageCell, contentCell]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-article', cells });
  element.replaceWith(block);
}
