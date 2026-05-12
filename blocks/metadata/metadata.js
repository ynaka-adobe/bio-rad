/**
 * Page-level metadata table (title, description, image, …).
 * Values are applied to <head> by the delivery pipeline; the block stays in the
 * body for authoring. Hide it so it does not affect layout.
 * @param {HTMLElement} el
 */
export default function init(el) {
  el.hidden = true;
}
