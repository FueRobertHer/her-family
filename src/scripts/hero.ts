/* eslint-disable no-undef */
// Scroll cue: jump to the first visible content section below the hero.
// Event delegation on document survives view transitions without re-init.
document.addEventListener('click', (e) => {
  const button = (e.target as HTMLElement).closest('[data-hero-scroll-cue]');
  if (!button) return;

  const sections = [
    '#biography',
    '#funeral-info',
    '#gallery',
    '#video',
    '#memories',
    '#donations',
    'footer',
  ];
  let target: Element | null = null;
  for (const selector of sections) {
    const el = document.querySelector(selector);
    // offsetParent is null for display:none sections (hidden from public)
    if (el instanceof HTMLElement && el.offsetParent !== null) {
      target = el;
      break;
    }
  }

  if (target) {
    target.scrollIntoView({ behavior: 'smooth' });
  } else {
    window.scrollBy({ top: window.innerHeight, behavior: 'smooth' });
  }
});
