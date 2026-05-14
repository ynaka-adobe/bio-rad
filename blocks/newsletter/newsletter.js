export default function decorate(block) {
  const rows = [...block.children];
  rows.forEach((row) => {
    row.classList.add('newsletter-row');
    [...row.children].forEach((col, idx) => {
      col.classList.add('newsletter-col', `newsletter-col-${idx + 1}`);
      const pic = col.querySelector('picture');
      if (pic) {
        col.classList.add('newsletter-img-col');
      }
    });
  });

  const textCol = block.querySelector('.newsletter-col:not(.newsletter-img-col)');
  if (textCol) {
    const heading = textCol.querySelector('h1, h2, h3, h4, h5, h6');
    if (heading) heading.classList.add('newsletter-heading');

    const paragraphs = textCol.querySelectorAll('p');
    paragraphs.forEach((p) => {
      if (!p.querySelector('a') && !p.closest('.button-container')) {
        p.classList.add('newsletter-description');
      }
    });
  }
}
