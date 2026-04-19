/* eslint-disable */
/* global WebImporter */
/** Parser for columns-links. Base: columns. Source: https://www.cat.com/en_US.html */
export default function parse(element, { document }) {
  const cells = [];

  // Find the 3 column groups (each is a responsivegrid with title + teaser tiles)
  const columnGroups = element.querySelectorAll(':scope > .aem-Grid > .responsivegrid.hp-personalization-quick-links');
  const groups = columnGroups.length > 0 ? columnGroups : [element];

  const row = [];

  groups.forEach((group) => {
    const col = [];

    // Section heading
    const heading = group.querySelector('[data-component="title"] h2, .title h2, h2');
    if (heading) col.push(heading);

    // Links from teaser tiles
    const teasers = group.querySelectorAll('[data-component="teaser"]');
    if (teasers.length > 0) {
      const ul = document.createElement('ul');
      teasers.forEach((teaser) => {
        const link = teaser.querySelector('a.button, a[class*="button"], a[href]');
        if (link) {
          link.querySelectorAll('i, .material-icons').forEach((icon) => icon.remove());
          const li = document.createElement('li');
          const a = document.createElement('a');
          a.href = link.href;
          a.textContent = link.textContent.trim();
          li.append(a);
          ul.append(li);
        }
      });
      if (ul.children.length > 0) col.push(ul);
    }

    if (col.length > 0) row.push(col);
  });

  if (row.length > 0) cells.push(row);

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-links', cells });
  element.replaceWith(block);
}
