// Gallery Carousel Script
// Handles carousel and lightbox interactions
import { activateFocusTrap, releaseFocusTrap } from './lib/focus-trap.ts';

// ============ CAROUSEL FUNCTIONALITY WITH INFINITE WRAP ============
const carouselTrack = document.getElementById('carouselTrack');
const carouselPrev = document.getElementById('carouselPrev');
const carouselNext = document.getElementById('carouselNext');
const carouselDots = document.querySelectorAll('.carousel-dot');
const originalItems = document.querySelectorAll('.carousel-item');

let currentIndex = 0;
let realIndex = 0;
let autoPlayInterval: ReturnType<typeof setInterval> | null = null;
let isTransitioning = false;
const totalImages = originalItems.length;

// Clone first and last few images for infinite loop effect
const cloneCount = Math.min(4, totalImages); // Clone up to 4 images on each side

function initInfiniteCarousel() {
  if (!carouselTrack || totalImages === 0) return;

  // Clone last images and prepend them
  for (let i = totalImages - cloneCount; i < totalImages; i++) {
    const clone = originalItems[i].cloneNode(true) as HTMLElement;
    clone.classList.add('clone');
    // Remove the delete button from clones to avoid confusion
    const deleteBtn = clone.querySelector('.delete-gallery-image');
    deleteBtn?.remove();
    carouselTrack.insertBefore(clone, carouselTrack.firstChild);
  }

  // Clone first images and append them
  for (let i = 0; i < cloneCount; i++) {
    const clone = originalItems[i].cloneNode(true) as HTMLElement;
    clone.classList.add('clone');
    // Remove the delete button from clones to avoid confusion
    const deleteBtn = clone.querySelector('.delete-gallery-image');
    deleteBtn?.remove();
    carouselTrack.appendChild(clone);
  }

  // Set initial position (account for prepended clones)
  currentIndex = cloneCount;
  realIndex = 0;

  // Cache all items including clones
  cachedCarouselItems = carouselTrack.querySelectorAll('.carousel-item');
  const allItems = cachedCarouselItems;

  // Setup lightbox for ALL images (originals and clones)
  allItems.forEach((item, idx) => {
    const imgContainer = item.querySelector('.aspect-square');
    if (imgContainer) {
      imgContainer.addEventListener('click', (e) => {
        // Don't open lightbox if clicking on delete button
        if ((e.target as HTMLElement).closest('.delete-gallery-image')) {
          return;
        }

        // Calculate real index for clones
        let realIdx = idx - cloneCount;
        if (realIdx < 0) realIdx = totalImages + realIdx;
        if (realIdx >= totalImages) realIdx = realIdx - totalImages;
        openLightbox(realIdx);
      });
    }
  });

  updateCarousel(false);
}

// Cache carousel items to avoid repeated queries
let cachedCarouselItems: NodeListOf<HTMLElement> | null = null;

function getCachedCarouselItems() {
  if (!cachedCarouselItems) {
    cachedCarouselItems = carouselTrack?.querySelectorAll<HTMLElement>('.carousel-item') || null;
  }
  return cachedCarouselItems;
}

function updateCarousel(animate: boolean = true) {
  if (!carouselTrack) return;

  const allItems = getCachedCarouselItems();
  if (!allItems || allItems.length === 0) return;

  const itemWidth = allItems[0].offsetWidth + 24; // width + gap
  const offset = -currentIndex * itemWidth;

  if (animate) {
    carouselTrack.style.transition = 'transform 0.5s ease-out';
  } else {
    carouselTrack.style.transition = 'none';
  }

  carouselTrack.style.transform = `translateX(${offset}px)`;

  // Update dots based on real index. The coloured mark is a span inside the
  // button so the button itself can stay a 24px touch target.
  carouselDots.forEach((dot, idx) => {
    const mark = dot.querySelector('.carousel-dot-mark') ?? dot;
    const isCurrent = idx === realIndex;

    mark.classList.toggle('bg-warm-gray-700', isCurrent);
    mark.classList.toggle('scale-125', isCurrent);
    mark.classList.toggle('bg-warm-gray-300', !isCurrent);
    dot.setAttribute('aria-current', isCurrent ? 'true' : 'false');
  });
}

function handleTransitionEnd() {
  if (!isTransitioning) return;

  const allItems = getCachedCarouselItems();
  if (!allItems) return;

  // If we're at a clone, jump to the real image without animation
  if (currentIndex >= allItems.length - cloneCount) {
    // We're at the end clones, jump to the start
    currentIndex = cloneCount;
    updateCarousel(false);
  } else if (currentIndex < cloneCount) {
    // We're at the start clones, jump to the end
    currentIndex = allItems.length - cloneCount - 1;
    updateCarousel(false);
  }

  isTransitioning = false;
}

carouselTrack?.addEventListener('transitionend', handleTransitionEnd);

function goToSlide(direction: number) {
  if (isTransitioning) return;

  isTransitioning = true;
  currentIndex += direction;
  realIndex = (((realIndex + direction) % totalImages) + totalImages) % totalImages;

  updateCarousel(true);
  resetAutoPlay();
}

function jumpToSlide(index: number) {
  if (isTransitioning) return;

  isTransitioning = true;
  realIndex = index;
  currentIndex = cloneCount + index;

  updateCarousel(true);
  resetAutoPlay();

  // Reset transitioning flag after animation
  setTimeout(() => {
    isTransitioning = false;
  }, 500);
}

function nextSlide() {
  goToSlide(1);
}

function prevSlide() {
  goToSlide(-1);
}

// WCAG 2.2.2: moving content that starts automatically and lasts more than
// five seconds needs a pause control. `paused` is the user's explicit choice
// and outranks the transient hover/focus pauses below.
const prefersReducedMotion =
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

let userPaused = prefersReducedMotion;

function stopAutoPlay() {
  if (autoPlayInterval) {
    clearInterval(autoPlayInterval);
    autoPlayInterval = null;
  }
}

function resetAutoPlay() {
  stopAutoPlay();
  if (userPaused) return;
  autoPlayInterval = setInterval(nextSlide, 5000); // Auto-advance every 5 seconds
}

function updatePauseButton() {
  const button = document.getElementById('carouselPlayPause');
  if (!button) return;

  const label = userPaused ? 'Play slideshow' : 'Pause slideshow';
  button.setAttribute('aria-label', label);
  button.setAttribute('title', label);
  button.dataset.paused = String(userPaused);
}

document.getElementById('carouselPlayPause')?.addEventListener('click', () => {
  userPaused = !userPaused;
  updatePauseButton();
  resetAutoPlay();
});

updatePauseButton();

// Event listeners
carouselNext?.addEventListener('click', nextSlide);
carouselPrev?.addEventListener('click', prevSlide);

carouselDots.forEach((dot, idx) => {
  dot.addEventListener('click', () => jumpToSlide(idx));
});

// Touch/swipe support
let touchStartX = 0;
let touchEndX = 0;

carouselTrack?.addEventListener(
  'touchstart',
  (e) => {
    touchStartX = e.touches[0].clientX;
  },
  { passive: true }
);

carouselTrack?.addEventListener(
  'touchmove',
  (e) => {
    touchEndX = e.touches[0].clientX;
  },
  { passive: true }
);

carouselTrack?.addEventListener(
  'touchend',
  () => {
    const swipeDistance = touchStartX - touchEndX;
    if (Math.abs(swipeDistance) > 50) {
      // Minimum swipe distance
      if (swipeDistance > 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    }
  },
  { passive: true }
);

// Initialize carousel with infinite wrap
initInfiniteCarousel();
resetAutoPlay();

// Pause autoplay while the pointer is over the carousel, and while anything
// inside it has keyboard focus (a keyboard user gets the same reprieve).
const carouselRegion = carouselTrack?.closest('section') ?? carouselTrack;

carouselRegion?.addEventListener('mouseenter', stopAutoPlay);
carouselRegion?.addEventListener('mouseleave', resetAutoPlay);
carouselRegion?.addEventListener('focusin', stopAutoPlay);
carouselRegion?.addEventListener('focusout', (event) => {
  const next = (event as FocusEvent).relatedTarget as Node | null;
  if (next && carouselRegion.contains(next)) return;
  resetAutoPlay();
});

// Debounced resize handler for performance
let resizeTimeout: ReturnType<typeof setTimeout>;
window.addEventListener(
  'resize',
  () => {
    if (resizeTimeout) clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      updateCarousel(false);
    }, 150);
  },
  { passive: true }
);

// ============ LIGHTBOX FUNCTIONALITY ============
const lightbox = document.getElementById('lightbox');
const lightboxImage = document.getElementById('lightboxImage') as HTMLImageElement | null;
const lightboxCaption = document.getElementById('lightboxCaption');
const closeLightbox = document.getElementById('closeLightbox');
const prevImage = document.getElementById('prevImage');
const nextImageBtn = document.getElementById('nextImage');

let lightboxIndex = 0;

function openLightbox(index: number) {
  lightboxIndex = index;
  const item = originalItems[index] as HTMLElement;
  const img = item.querySelector('img') as HTMLImageElement | null;
  const caption = item.querySelector('p');

  if (lightboxImage && img) {
    // Use full-size optimized image for lightbox, fallback to thumbnail if not available
    const fullUrl = item.dataset.fullUrl || img.src;
    lightboxImage.src = fullUrl;
    lightboxImage.alt = img.alt;
  }

  if (lightboxCaption && caption) {
    lightboxCaption.textContent = caption.textContent;
  } else if (lightboxCaption) {
    lightboxCaption.textContent = '';
  }

  lightbox?.classList.remove('hidden');
  lightbox?.classList.add('flex');
  document.body.style.overflow = 'hidden';
  if (lightbox) activateFocusTrap(lightbox);
}

function closeLightboxFn() {
  if (lightbox) releaseFocusTrap(lightbox);
  lightbox?.classList.add('hidden');
  lightbox?.classList.remove('flex');
  document.body.style.overflow = '';
}

function showNextLightboxImage() {
  lightboxIndex = (lightboxIndex + 1) % totalImages;
  const item = originalItems[lightboxIndex] as HTMLElement;
  const img = item.querySelector('img') as HTMLImageElement | null;
  const caption = item.querySelector('p');

  if (lightboxImage && img) {
    lightboxImage.src = img.src;
    lightboxImage.alt = img.alt;
  }

  if (lightboxCaption && caption) {
    lightboxCaption.textContent = caption.textContent;
  } else if (lightboxCaption) {
    lightboxCaption.textContent = '';
  }
}

function showPrevLightboxImage() {
  lightboxIndex = (lightboxIndex - 1 + totalImages) % totalImages;
  const item = originalItems[lightboxIndex] as HTMLElement;
  const img = item.querySelector('img') as HTMLImageElement | null;
  const caption = item.querySelector('p');

  if (lightboxImage && img) {
    lightboxImage.src = img.src;
    lightboxImage.alt = img.alt;
  }

  if (lightboxCaption && caption) {
    lightboxCaption.textContent = caption.textContent;
  } else if (lightboxCaption) {
    lightboxCaption.textContent = '';
  }
}

closeLightbox?.addEventListener('click', closeLightboxFn);
nextImageBtn?.addEventListener('click', showNextLightboxImage);
prevImage?.addEventListener('click', showPrevLightboxImage);

// Unified keyboard handler for both carousel and lightbox
document.addEventListener('keydown', (e) => {
  const isLightboxOpen = lightbox && !lightbox.classList.contains('hidden');

  if (isLightboxOpen) {
    // Lightbox controls
    if (e.key === 'Escape') closeLightboxFn();
    if (e.key === 'ArrowRight') showNextLightboxImage();
    if (e.key === 'ArrowLeft') showPrevLightboxImage();
  } else {
    // Carousel controls (only when lightbox is closed)
    if (e.key === 'ArrowLeft') prevSlide();
    if (e.key === 'ArrowRight') nextSlide();
  }
});

// Close when clicking outside the image
lightbox?.addEventListener('click', (e) => {
  if (e.target === lightbox) {
    closeLightboxFn();
  }
});
