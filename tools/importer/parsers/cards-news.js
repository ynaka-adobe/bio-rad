/* eslint-disable */
/* global WebImporter */

/**
 * Parser for cards-news. Base: cards. Source: https://www.bio-rad.com/en-us
 * Model fields: image (reference), text (richtext)
 * Block structure: Each row = [image cell, text cell] per news/event card
 * Cards: Latest from Bio-Rad news, events, and webinars
 */
export default function parse(element, { document }) {
  const cells = [];

  // Each article is a news/event/webinar card
  const articles = element.querySelectorAll('article');

  articles.forEach((article) => {
    const link = article.querySelector('a[href]');
    if (!link) return;

    // Image cell with field hint
    const img = article.querySelector('img');
    const imgFrag = document.createDocumentFragment();
    imgFrag.appendChild(document.createComment(' field:image '));
    if (img) imgFrag.appendChild(img);

    // Text cell: category + heading + description + date with field hint
    const textFrag = document.createDocumentFragment();
    textFrag.appendChild(document.createComment(' field:text '));

    const category = article.querySelector('em');
    if (category) textFrag.appendChild(category);

    const heading = article.querySelector('h4, h3, h2');
    if (heading) {
      const p = document.createElement('p');
      const a = document.createElement('a');
      a.href = link.href;
      a.textContent = heading.textContent.trim();
      const strong = document.createElement('strong');
      strong.appendChild(a);
      p.appendChild(strong);
      textFrag.appendChild(p);
    }

    const description = article.querySelector('p:not(:has(em)):not(:has(h4))');
    if (description && description.textContent.trim()) textFrag.appendChild(description);

    cells.push([imgFrag, textFrag]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-news', cells });
  element.replaceWith(block);
}
