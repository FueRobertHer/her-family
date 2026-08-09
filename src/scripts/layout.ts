/* eslint-disable no-undef */
// Handle smooth scrolling for anchor links
document.addEventListener('click', function (e: Event) {
  const anchor = (e.target as HTMLElement).closest('a[href^="#"]');
  if (anchor) {
    e.preventDefault();
    const href = (anchor as HTMLAnchorElement).getAttribute('href');
    const target = href ? document.querySelector(href) : null;
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  }
});

// Handle lazy-loaded image fade-in
document.addEventListener('DOMContentLoaded', function () {
  const lazyImages = document.querySelectorAll('img[loading="lazy"]');

  lazyImages.forEach((img: Element) => {
    const image = img as HTMLImageElement;

    // If already loaded (cached), show immediately
    if (image.complete) {
      image.classList.add('loaded');
    } else {
      // Add loaded class when image loads
      image.addEventListener('load', function () {
        image.classList.add('loaded');
      });
    }
  });
});
