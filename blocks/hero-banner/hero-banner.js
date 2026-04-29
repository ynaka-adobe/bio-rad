/**
 * AEM / Universal Editor often outputs MP4 heroes as anchors, not native video.
 * Browsers won't autoplay a link — replace eligible .mp4 links with muted inline video.
 */
function mp4AnchorsToVideo(root) {
  root.querySelectorAll('a[href]').forEach((a) => {
    const raw = (a.getAttribute('href') || '').trim();
    if (!/\.mp4(\?|#|$)/i.test(raw)) return;

    const video = document.createElement('video');
    video.src = raw;
    video.muted = true;
    video.defaultMuted = true;
    video.setAttribute('playsinline', '');
    video.setAttribute('webkit-playsinline', '');
    video.loop = true;
    video.autoplay = true;
    video.setAttribute('preload', 'metadata');
    video.setAttribute('aria-label', a.textContent.trim() || 'Hero video');

    a.replaceWith(video);
    video.play().catch(() => {});
  });
}

export default function init(el) {
  const root = el?.classList?.contains('hero-banner') ? el : el.querySelector('.hero-banner');
  if (!root) return;
  mp4AnchorsToVideo(root);
}
