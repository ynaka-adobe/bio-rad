export default function decorate(block) {
  const rows = [...block.children];
  if (rows.length < 2) return;

  // Row 1: image
  const imageRow = rows[0];
  // Row 2: text content (eyebrow, title, description, CTA)
  const textRow = rows[1];

  const wrapper = document.createElement('div');
  wrapper.className = 'teaser-inner';

  // Text side
  const textWrap = document.createElement('div');
  textWrap.className = 'teaser-text';
  const textCell = textRow.querySelector(':scope > div');
  if (textCell) {
    while (textCell.firstChild) textWrap.append(textCell.firstChild);
  }
  wrapper.append(textWrap);

  // Image side
  const imageWrap = document.createElement('div');
  imageWrap.className = 'teaser-image';
  const pic = imageRow.querySelector('picture') || imageRow.querySelector('img');
  if (pic) imageWrap.append(pic);
  wrapper.append(imageWrap);

  block.textContent = '';
  block.append(wrapper);
}
