/* eslint-disable */
/* global WebImporter */
/** Parser for cards-category. Base: cards. Source: https://www.cat.com/en_US.html */
export default function parse(element, { document }) {
  const cells = [];

  // Each list item becomes a card row: [image, link text]
  const items = element.querySelectorAll('.list__item, li.list-item, .list__list-col a');
  const links = items.length > 0 ? items : element.querySelectorAll('a[href]');

  links.forEach((item) => {
    const img = item.querySelector('img, picture img');
    const linkEl = item.tagName === 'A' ? item : item.querySelector('a');
    if (!linkEl) return;

    // Fix lazy-loaded images
    if (img && !img.src && img.dataset.src) img.src = img.dataset.src;

    const row = [];
    if (img) row.push(img);

    const label = linkEl.textContent.trim();
    if (label) {
      const p = document.createElement('p');
      const a = document.createElement('a');
      a.href = linkEl.href;
      a.textContent = label;
      p.append(a);
      row.push(p);
    }

    if (row.length > 0) cells.push(row);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-category', cells });
  element.replaceWith(block);
}
