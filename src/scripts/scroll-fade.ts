// Edge-fade affordance for horizontally scrollable rows.
//
// Rows like the memorial section nav hide their scrollbar (.no-scrollbar) for
// looks, which left mobile users with no signal that content continued past
// the right edge. This marks each row with its overflow/scroll state so CSS
// can fade whichever edge still has content behind it.
//
// Elements opt in with `data-scroll-fade`; the CSS lives in global.css.

function updateScrollState(el: HTMLElement) {
  const maxScroll = el.scrollWidth - el.clientWidth;
  const isOverflowing = maxScroll > 1;

  el.dataset.overflowing = String(isOverflowing);

  if (!isOverflowing) {
    delete el.dataset.atStart;
    delete el.dataset.atEnd;
    return;
  }

  el.dataset.atStart = String(el.scrollLeft <= 1);
  el.dataset.atEnd = String(el.scrollLeft >= maxScroll - 1);
}

function initScrollFades() {
  document.querySelectorAll<HTMLElement>('[data-scroll-fade]').forEach((el) => {
    updateScrollState(el);

    if (el.dataset.scrollFadeBound === 'true') return;
    el.dataset.scrollFadeBound = 'true';

    el.addEventListener('scroll', () => updateScrollState(el), { passive: true });

    // Overflow depends on viewport width and on font loading, neither of which
    // fires a scroll event.
    if (typeof ResizeObserver !== 'undefined') {
      new ResizeObserver(() => updateScrollState(el)).observe(el);
    }
  });
}

initScrollFades();
document.addEventListener('astro:page-load', initScrollFades);

export {};
