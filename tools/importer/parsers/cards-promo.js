/* eslint-disable */
/* global WebImporter */

/**
 * Parser for cards-promo. Base: cards. Source: https://www.bio-rad.com/en-us
 * Model fields: image (reference), text (richtext)
 * Block structure: Each row = [image cell, text cell] per promotion card
 * Cards: Product promotions with deals and offers
 */
export default function parse(element, { document }) {
  const cells = [];

  // Each article is a promotion card
  const articles = element.querySelectorAll('article');

  articles.forEach((article) => {
    const link = article.querySelector('a[href]');
    if (!link) return;

    // Image cell with field hint
    const img = article.querySelector('img');
    const imgFrag = document.createDocumentFragment();
    imgFrag.appendChild(document.createComment(' field:image '));
    if (img) imgFrag.appendChild(img);

    // Text cell: heading + description + CTA with field hint
    const textFrag = document.createDocumentFragment();
    textFrag.appendChild(document.createComment(' field:text '));

    const heading = article.querySelector('h3, h2');
    if (heading) {
      const p = document.createElement('p');
      const strong = document.createElement('strong');
      strong.textContent = heading.textContent.trim();
      p.appendChild(strong);
      textFrag.appendChild(p);
    }

    const description = article.querySelector('.promo-period-home, p');
    if (description && description.textContent.trim()) {
      const p = document.createElement('p');
      p.textContent = description.textContent.trim();
      textFrag.appendChild(p);
    }

    // CTA link
    if (link.href) {
      const p = document.createElement('p');
      const a = document.createElement('a');
      a.href = link.href;
      a.textContent = link.textContent.trim() || 'Learn More';
      p.appendChild(a);
      textFrag.appendChild(p);
    }

    cells.push([imgFrag, textFrag]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-promo', cells });
  element.replaceWith(block);
}
