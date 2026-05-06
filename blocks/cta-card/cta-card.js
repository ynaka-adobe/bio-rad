export default function decorate(block) {
  const rows = [...block.children];
  if (rows.length < 2) return;

  // Row 1: image
  const imageRow = rows[0];
  const imageCol = imageRow.querySelector('picture') || imageRow.querySelector('img');

  // Row 2: text content (heading, description, CTA)
  const textRow = rows[1];

  // Build the card structure
  const card = document.createElement('div');
  card.className = 'cta-card-inner';

  // Image side
  const imageWrap = document.createElement('div');
  imageWrap.className = 'cta-card-image';
  if (imageCol) imageWrap.append(imageCol);
  card.append(imageWrap);

  // Content side
  const contentWrap = document.createElement('div');
  contentWrap.className = 'cta-card-content';
  while (textRow.firstElementChild) {
    const cell = textRow.firstElementChild;
    while (cell.firstChild) contentWrap.append(cell.firstChild);
    cell.remove();
  }
  card.append(contentWrap);

  // Replace block content
  block.textContent = '';
  block.append(card);
}
