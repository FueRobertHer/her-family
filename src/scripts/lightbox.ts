// Shared image lightbox (see src/components/Lightbox.astro).
//
// Triggers and close buttons are wired through data attributes and delegated
// listeners rather than inline onclick handlers, so the page needs no
// 'unsafe-inline' in its script-src. Attribute values are HTML-escaped by
// Astro, which an onclick= JS-string context would not be.
//
//   [data-lightbox-open="<id>"]  opens, reading data-lightbox-url / -title
//   [data-lightbox-close="<id>"] closes

import { activateFocusTrap, releaseFocusTrap } from './lib/focus-trap.ts';

function openLightbox(lightboxId: string, imageUrl = '', title = '') {
  const container = document.getElementById(`${lightboxId}-container`);
  const content = document.getElementById(`${lightboxId}-content`);
  const img = document.getElementById(`${lightboxId}-image`) as HTMLImageElement | null;
  const titleEl = document.getElementById(`${lightboxId}-title`);

  if (!container || !img) return;

  img.src = imageUrl;
  if (titleEl) {
    const heading = titleEl.querySelector('h3');
    if (heading) heading.textContent = title;
    titleEl.style.display = title ? 'block' : 'none';
  }

  container.classList.remove('hidden');
  setTimeout(() => {
    container.classList.remove('opacity-0', 'pointer-events-none');
    content?.classList.remove('scale-95');
    content?.classList.add('scale-100');
  }, 10);

  document.body.style.overflow = 'hidden';
  activateFocusTrap(container);
}

function closeLightbox(lightboxId: string) {
  const container = document.getElementById(`${lightboxId}-container`);
  const content = document.getElementById(`${lightboxId}-content`);

  if (!container) return;

  releaseFocusTrap(container);

  container.classList.add('opacity-0', 'pointer-events-none');
  content?.classList.remove('scale-100');
  content?.classList.add('scale-95');

  setTimeout(() => {
    container.classList.add('hidden');
    document.body.style.overflow = '';
  }, 300);
}

document.addEventListener('click', (event) => {
  const target = event.target as HTMLElement;

  const trigger = target.closest<HTMLElement>('[data-lightbox-open]');
  if (trigger) {
    openLightbox(
      trigger.dataset.lightboxOpen || 'lightbox',
      trigger.dataset.lightboxUrl || '',
      trigger.dataset.lightboxTitle || ''
    );
    return;
  }

  const closer = target.closest<HTMLElement>('[data-lightbox-close]');
  if (closer) {
    closeLightbox(closer.dataset.lightboxClose || 'lightbox');
    return;
  }

  // Click on the backdrop itself (not its children) dismisses.
  const root = target.closest<HTMLElement>('[data-lightbox-root]');
  if (root && target === root) {
    closeLightbox(root.dataset.lightboxRoot || 'lightbox');
  }
});

document.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape') return;

  document
    .querySelectorAll<HTMLElement>('[data-lightbox-root]:not(.hidden)')
    .forEach((root) => closeLightbox(root.dataset.lightboxRoot || 'lightbox'));
});
