export default async function decorate(block) {
  const rows = [...block.children];
  const quotation = rows[0]?.firstElementChild;
  if (!quotation) return;

  const attribution = rows[1]?.firstElementChild;
  const blockquote = document.createElement('blockquote');

  quotation.className = 'quote-quotation';
  blockquote.append(quotation);

  if (attribution) {
    attribution.className = 'quote-attribution';
    blockquote.append(attribution);
    attribution.querySelectorAll('em').forEach((em) => {
      const cite = document.createElement('cite');
      cite.innerHTML = em.innerHTML;
      em.replaceWith(cite);
    });
  }

  block.replaceChildren(blockquote);
}