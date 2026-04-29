/**
 * After the block renders, find any .mp4 links and replace with <video>.
 * AEM / Universal Editor often outputs heroes as anchors; browsers won't play those natively.
 */
function mp4LinkToVideo(videoLink) {
  const raw = (videoLink.getAttribute('href') || '').trim();
  if (!/\.mp4(\?|#|$)/i.test(raw)) return;

  const video = document.createElement('video');
  video.src = videoLink.href;
  video.autoplay = true;
  video.loop = true;
  video.muted = true;
  video.defaultMuted = true;
  video.setAttribute('playsinline', '');
  video.setAttribute('webkit-playsinline', '');
  video.setAttribute('preload', 'metadata');
  video.setAttribute('aria-label', videoLink.textContent.trim() || 'Hero video');

  const row = videoLink.closest('p');
  if (row) {
    row.replaceWith(video);
  } else {
    videoLink.replaceWith(video);
  }
  video.play().catch(() => {});
}

/** Default handler name must stay `init` — loadBlock passes the block root element. */
export default function init(block) {
  const root = block.classList.contains('hero-banner')
    ? block
    : block.querySelector('.hero-banner');
  if (!root) return;

  root.querySelectorAll('a[href*=".mp4"]').forEach(mp4LinkToVideo);
}
