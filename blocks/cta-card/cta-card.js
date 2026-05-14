export default function decorate(block) {
  const rows = [...block.children];
  if (rows.length < 2) return;

  // Row 1: image
  const imageRow = rows[0];
  // Row 2: text content (heading, description, CTA)
  const textRow = rows[1];

  const card = document.createElement('div');
  card.className = 'cta-card-inner';

  // Image side
  const imageWrap = document.createElement('div');
  imageWrap.className = 'cta-card-image';
  const pic = imageRow.querySelector('picture')
    || imageRow.querySelector('img');
  if (pic) imageWrap.append(pic);
  card.append(imageWrap);

  // Content side
  const contentWrap = document.createElement('div');
  contentWrap.className = 'cta-card-content';
  const textCell = textRow.querySelector(':scope > div');
  if (textCell) {
    while (textCell.firstChild) contentWrap.append(textCell.firstChild);
  }
  card.append(contentWrap);

  block.textContent = '';
  block.append(card);
}
