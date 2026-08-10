// Broken-image fallbacks, driven by data-fallback attributes:
//   data-fallback="portrait" -> neutral silhouette placeholder
//   data-fallback="photo"    -> neutral photo placeholder
//   data-fallback="hide"     -> hide the img (e.g. hero background keeps its gradient)
//   data-fallback="hero-bg"  -> hide it and tell the hero to switch to dark text
//
// A capture-phase error listener on document handles both server-rendered
// and client-rendered (comments, admin) images without per-element wiring.

const PLACEHOLDERS: Record<string, string> = {
  portrait: '/images/placeholder-portrait.svg',
  photo: '/images/placeholder-photo.svg',
};

function applyFallback(img: HTMLImageElement) {
  const kind = img.dataset.fallback;
  if (!kind || img.dataset.fallbackApplied) return;
  img.dataset.fallbackApplied = 'true';

  if (kind === 'hide') {
    img.style.display = 'none';
    return;
  }

  // The hero renders light text over a scrim while a photo is present. If the
  // photo never loads, the scrim goes with it and the text must go dark, or it
  // ends up near-white on a pale gradient.
  if (kind === 'hero-bg') {
    img.style.display = 'none';
    img.closest('[data-hero]')?.classList.remove('hero-has-photo');
    return;
  }

  const placeholder = PLACEHOLDERS[kind];
  if (placeholder) {
    img.src = placeholder;
    // Placeholder is opaque; ensure lazy-fade styling doesn't keep it invisible
    img.classList.add('loaded');
  }
}

// Images can fail before this module runs (eager hero images, cached 404s) —
// sweep anything already in a failed state.
function sweepFailedImages() {
  document.querySelectorAll<HTMLImageElement>('img[data-fallback]').forEach((img) => {
    if (img.complete && img.naturalWidth === 0 && img.src) {
      applyFallback(img);
    }
  });
}

// error events don't bubble, but they can be observed in the capture phase.
document.addEventListener(
  'error',
  (event) => {
    const target = event.target;
    if (target instanceof HTMLImageElement) applyFallback(target);
  },
  true
);

sweepFailedImages();
document.addEventListener('astro:page-load', sweepFailedImages);
