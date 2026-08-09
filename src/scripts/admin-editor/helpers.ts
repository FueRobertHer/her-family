// Stateless-ish DOM/utility helpers for the admin editor.
import { state } from './state.ts';

// --- Helper Functions ---

// Create URL-friendly slug
export function createSlug(text: string | null | undefined): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-'); // Replace multiple hyphens with single hyphen
}

// Generate agenda URL with memorial name and service type
export function generateAgendaUrl(serviceIndex: string | number, serviceType: string): string {
  const memorialName = (state.memorialData as any)?.name || '';
  const memorialNameSlug = createSlug(memorialName);
  const serviceSlug = createSlug(serviceType);

  let url = `/agenda/${serviceIndex}`;
  if (memorialNameSlug) url += `-${memorialNameSlug}`;
  if (serviceSlug) url += `-${serviceSlug}`;

  return url;
}

export function updateNavLinkVisibility(href: string, isVisible: boolean | string) {
  const link = document.querySelector<HTMLElement>(`nav a[href="${href}"]`);
  if (!link) return;

  const isHidden = isVisible === false || isVisible === 'false';

  if (isHidden) {
    link.classList.add('is-hidden-section');
    // If edit mode is OFF (preview mode), hide the link
    if (document.body.classList.contains('hide-edit-buttons')) {
      link.style.display = 'none';
    } else {
      // In edit mode, show it but with opacity to indicate it's hidden public-side
      link.style.display = '';
      link.classList.add('opacity-50');
    }
  } else {
    link.classList.remove('is-hidden-section');
    link.classList.remove('opacity-50');
    link.style.display = '';
  }
}

export function toggleEditButtons(show?: boolean) {
  const body = document.body;
  const sections = document.querySelectorAll<HTMLElement>('[class*="border-dashed"]');
  const hiddenLinks = document.querySelectorAll<HTMLElement>('.is-hidden-section');

  if (show) {
    body.classList.remove('hide-edit-buttons');
    // Show hidden sections (opacity and border)
    sections.forEach((section) => {
      section.classList.add('opacity-60', 'opacity-70', 'border-2', 'border-dashed');
      // Add back 'Hidden from public' badge if it was hidden
      const badge = section.querySelector<HTMLElement>('.hidden-badge');
      if (badge) badge.style.display = 'block';
    });

    // Show hidden links with opacity
    hiddenLinks.forEach((link) => {
      link.style.display = '';
      link.classList.add('opacity-50');
    });
  } else {
    body.classList.add('hide-edit-buttons');
    // Completely hide sections that are marked as hidden
    sections.forEach((section) => {
      // If this section has opacity/dashed border, it means it's hidden from public
      // So in preview mode, we should hide it completely (display: none)
      if (section.classList.contains('opacity-60') || section.classList.contains('opacity-70')) {
        section.classList.add('hidden-in-preview');
        section.style.display = 'none';
      }
    });

    // Hide hidden links completely
    hiddenLinks.forEach((link) => {
      link.style.display = 'none';
    });
  }
}

export function restoreHiddenSections() {
  const hiddenSections = document.querySelectorAll<HTMLElement>('.hidden-in-preview');
  hiddenSections.forEach((section) => {
    section.style.display = ''; // Restore default display
    section.classList.remove('hidden-in-preview');
  });
}


export function initNavLinksVisibility() {
  if (!state.memorialData) return;

  const md = state.memorialData as any;
  // Map of section hrefs to their visibility property in state.memorialData
  const links = [
    { href: '#biography', visible: md.biographyVisible },
    { href: '#funeral-info', visible: md.funeralInfo?.visible },
    { href: '#gallery', visible: md.galleryVisible },
    { href: '#video', visible: md.videoVisible },
    { href: '#memories', visible: md.commentsVisible },
    { href: '#donations', visible: md.donations?.visible },
  ];

  links.forEach((item) => {
    if (item.visible !== undefined) {
      updateNavLinkVisibility(item.href, item.visible);
    }
  });
}

export function showToast(message: string, type: 'success' | 'error' | 'info' = 'info') {
  const toast = document.createElement('div');
  toast.className = `fixed top-20 right-4 z-50 px-6 py-3 rounded-lg shadow-lg text-white ${
    type === 'success' ? 'bg-green-500' : 'bg-red-500'
  }`;
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3000);
}

