// Client-side JavaScript for comment functionality
import { escapeHtml } from './lib/escape-html.ts';

interface Comment {
  id: number;
  name: string;
  email?: string;
  relationship?: string;
  message: string;
  imageUrl?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

// State
let allComments: Comment[] = [];
let carouselIndex = 0;
let offset = 0;
const limit = 10;
let isLoading = false;
let hasMore = true;
let itemsPerPage = 1; // Responsive: 1 for mobile, 2 tablet, 3 desktop

// DOM elements
const commentsTrack = document.getElementById('commentsTrack') as HTMLElement;
const prevBtn = document.getElementById('prevCommentBtn') as HTMLButtonElement;
const nextBtn = document.getElementById('nextCommentBtn') as HTMLButtonElement;
const initialLoader = document.getElementById('initialLoader');
const memorialSlug = (
  (document.getElementById('memories') as HTMLElement | null)?.dataset.memorialSlug || ''
).trim();

// Determine items per page based on screen width
function updateItemsPerPage() {
  if (window.innerWidth >= 1280) {
    // xl
    itemsPerPage = 3; // Three columns on large screens
  } else if (window.innerWidth >= 768) {
    // md
    itemsPerPage = 2; // Two columns on tablet
  } else {
    itemsPerPage = 1; // One column on mobile
  }
  updateCarousel(false);
}

window.addEventListener('resize', updateItemsPerPage);
// Initial call
updateItemsPerPage();

// Load comments function
async function loadComments() {
  if (isLoading || !hasMore) return;
  isLoading = true;

  try {
    const params = new URLSearchParams({
      limit: String(limit),
      offset: String(offset),
    });
    if (memorialSlug) params.set('memorial', memorialSlug);
    const response = await fetch(`/api/comments?${params.toString()}`);
    const result = await response.json();

    if (result.success) {
      const newComments = result.data;

      if (newComments.length < limit) {
        hasMore = false;
      }

      if (offset === 0 && newComments.length === 0) {
        commentsTrack.innerHTML = `
          <div class="w-full text-center py-12 text-warm-gray-600">
            <p>No memories shared yet. Be the first to share one.</p>
          </div>
        `;
        prevBtn.disabled = true;
        nextBtn.disabled = true;
      } else {
        if (offset === 0) {
          // Remove initial loader
          initialLoader?.remove();
        }

        allComments = [...allComments, ...newComments];
        renderNewComments(newComments);
        offset += newComments.length;

        updateButtons();
      }
    }
  } catch (error) {
    console.error('Error loading comments:', error);
    if (offset === 0) {
      commentsTrack.innerHTML = `
        <div class="w-full text-center py-12 text-red-600">
          <p>Error loading memories. Please refresh to try again.</p>
        </div>
      `;
    }
  } finally {
    isLoading = false;
  }
}

function renderNewComments(comments: Comment[]) {
  const fragment = document.createDocumentFragment();

  comments.forEach((comment) => {
    const slide = document.createElement('div');
    // Responsive width: 1 on mobile, 2 on tablet, 3 on desktop
    slide.className = 'shrink-0 w-full md:w-[calc(50%-12px)] xl:w-[calc(33.333%-16px)]';

    slide.innerHTML = `
      <div class="bg-white rounded-xl p-6 shadow-xs border border-warm-gray-100 h-full flex flex-col">
        <div class="flex items-start justify-between mb-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-warm-gray-100 flex items-center justify-center text-warm-gray-500 font-bold text-lg">
              ${comment.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h4 class="font-semibold text-warm-gray-900">${escapeHtml(comment.name)}</h4>
              ${comment.relationship ? `<p class="text-xs text-warm-gray-500">${escapeHtml(comment.relationship)}</p>` : ''}
            </div>
          </div>
          <time class="text-xs text-warm-gray-400 whitespace-nowrap" datetime="${comment.createdAt}">
            ${formatDate(comment.createdAt)}
          </time>
        </div>
        
        <div class="grow space-y-4">
           ${
             comment.imageUrl
               ? `
            <div class="relative group cursor-pointer overflow-hidden rounded-lg mb-3" data-lightbox-trigger data-lightbox-url="${escapeHtml(comment.imageUrl)}" data-lightbox-title="Photo from ${escapeHtml(comment.name)}">
              <img
                src="${escapeHtml(comment.imageUrl)}"
                alt="Memory photo"
                class="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                data-fallback="photo"
              />
              <div class="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                <svg class="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
              </div>
            </div>
          `
               : ''
           }
          <p class="text-warm-gray-700 leading-relaxed text-sm whitespace-pre-wrap line-clamp-6">${escapeHtml(comment.message)}</p>
        </div>
      </div>
    `;
    fragment.appendChild(slide);
  });

  commentsTrack.appendChild(fragment);
}

// Delegated lightbox opener. Data flows through data-* attributes (correctly
// HTML-attribute-escaped) instead of an inline onclick, which would run
// attacker-controlled comment text in a JS-string context after the HTML
// parser decoded the entities.
commentsTrack.addEventListener('click', (e) => {
  const trigger = (e.target as HTMLElement).closest<HTMLElement>('[data-lightbox-trigger]');
  if (!trigger) return;
  window.openCommentLightbox(trigger.dataset.lightboxUrl || '', trigger.dataset.lightboxTitle || '');
});

function updateCarousel(animate = true) {
  if (!commentsTrack) return;

  const allItems = commentsTrack.children;
  if (allItems.length === 0) return;

  const itemWidth = (allItems[0] as HTMLElement).offsetWidth + 24; // width + gap
  const position = -carouselIndex * itemWidth;

  if (animate) {
    commentsTrack.style.transition = 'transform 0.5s ease-out';
  } else {
    commentsTrack.style.transition = 'none';
  }

  commentsTrack.style.transform = `translateX(${position}px)`;
  updateButtons();
}

function updateButtons() {
  prevBtn.disabled = carouselIndex === 0;

  // Disable next if we are at the end and no more items to load
  // We can go next if:
  // 1. We have loaded items ahead (allComments.length > carouselIndex + itemsPerPage)
  // 2. OR we have more items to fetch on server

  const maxIndex = Math.max(0, allComments.length - itemsPerPage);
  const canGoNext = carouselIndex < maxIndex || hasMore;

  nextBtn.disabled = !canGoNext;
}

function nextSlide() {
  const maxIndex = Math.max(0, allComments.length - itemsPerPage);

  if (carouselIndex < maxIndex) {
    // Just slide
    carouselIndex++;
    updateCarousel(true);

    // Check if we need to load more (preload when close to end)
    if (hasMore && !isLoading && allComments.length - carouselIndex <= itemsPerPage * 2) {
      loadComments();
    }
  } else if (hasMore && !isLoading) {
    // At end, need to load more first
    loadComments().then(() => {
      if (allComments.length > maxIndex) {
        // If we actually got new items
        carouselIndex++;
        updateCarousel(true);
      }
    });
  }
}

function prevSlide() {
  if (carouselIndex > 0) {
    carouselIndex--;
    updateCarousel(true);
  }
}

prevBtn?.addEventListener('click', prevSlide);
nextBtn?.addEventListener('click', nextSlide);

// Initial load
loadComments();

// Form handling (unchanged logic, just re-attaching listeners)
const form = document.getElementById('commentForm') as HTMLFormElement;
const submitBtn = document.getElementById('submitBtn') as HTMLButtonElement;
const formMessage = document.getElementById('formMessage') as HTMLDivElement;
const messageTextarea = document.getElementById('message') as HTMLTextAreaElement;
const charCount = document.getElementById('charCount') as HTMLSpanElement;

// Character counter
messageTextarea?.addEventListener('input', () => {
  const count = messageTextarea.value.length;
  charCount.textContent = `${count}/1000`;
  if (count > 900) charCount.classList.add('text-red-500');
  else charCount.classList.remove('text-red-500');
});

function showMessage(message: string, isError = false) {
  formMessage.textContent = message;
  formMessage.className = `text-sm p-3 rounded-lg ${isError ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`;
  formMessage.classList.remove('hidden');
  setTimeout(() => formMessage.classList.add('hidden'), 5000);
}

// Image selection
const selectImageBtn = document.getElementById('selectImageBtn');
const commentImageInput = document.getElementById('commentImage') as HTMLInputElement;
const imageFileName = document.getElementById('imageFileName');
const clearImageBtn = document.getElementById('clearImageBtn');

selectImageBtn?.addEventListener('click', () => commentImageInput?.click());

commentImageInput?.addEventListener('change', (e) => {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (file) {
    if (imageFileName) imageFileName.textContent = file.name;
    if (clearImageBtn) clearImageBtn.classList.remove('hidden');
  }
});

clearImageBtn?.addEventListener('click', () => {
  if (commentImageInput) commentImageInput.value = '';
  if (imageFileName) imageFileName.textContent = '';
  if (clearImageBtn) clearImageBtn.classList.add('hidden');
});

form?.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (submitBtn.disabled) return;

  const formData = new FormData(form);
  const imageFile = commentImageInput?.files?.[0];

  const data: {
    name: string;
    email?: string;
    relationship?: string;
    message: string;
    imageUrl?: string;
    memorialSlug?: string;
  } = {
    name: formData.get('name')?.toString().trim() || '',
    email: formData.get('email')?.toString().trim(),
    relationship: formData.get('relationship')?.toString().trim(),
    message: formData.get('message')?.toString().trim() || '',
  };

  if (!data.name || !data.message) {
    showMessage('Please fill in all required fields.', true);
    return;
  }

  if (imageFile && imageFile.size > 5 * 1024 * 1024) {
    showMessage('Image size must be less than 5MB.', true);
    return;
  }

  submitBtn.disabled = true;
  const originalBtnText = submitBtn.textContent;
  submitBtn.textContent = 'Submitting...';

  try {
    if (imageFile) {
      submitBtn.textContent = 'Uploading Image...';
      const imageFormData = new FormData();
      imageFormData.append('file', imageFile);
      imageFormData.append('folder', `memorials/${memorialSlug || 'default'}/comments`);

      const uploadResponse = await fetch('/api/upload-image', {
        method: 'POST',
        body: imageFormData,
      });
      const uploadResult = await uploadResponse.json();

      if (uploadResult.success) {
        data.imageUrl = uploadResult.url;
      } else {
        throw new Error('Failed to upload image');
      }
    }

    submitBtn.textContent = 'Saving Memory...';
    if (memorialSlug) {
      data.memorialSlug = memorialSlug;
    }

    const response = await fetch('/api/comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (result.success) {
      showMessage('Thank you for sharing your memory!');
      form.reset();
      charCount.textContent = '0/1000';
      if (imageFileName) imageFileName.textContent = '';
      if (clearImageBtn) clearImageBtn.classList.add('hidden');

      // Reload comments to show new one (simple way: reset everything)
      // Or prepend? For simplicity in carousel, reload is safer.
      allComments = [];
      offset = 0;
      hasMore = true;
      carouselIndex = 0;
      commentsTrack.innerHTML = ''; // Clear track
      loadComments();
    } else {
      throw new Error(result.error || 'Failed to submit comment');
    }
  } catch (error) {
    console.error('Submit error:', error);
    showMessage('Failed to submit comment. Please try again.', true);
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = originalBtnText;
  }
});

// Utility functions
function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

// Comment Lightbox
const commentLightbox = document.getElementById('commentLightbox');
const commentLightboxImage = document.getElementById('commentLightboxImage') as HTMLImageElement;
const commentLightboxCaption = document.getElementById('commentLightboxCaption');
const closeCommentLightbox = document.getElementById('closeCommentLightbox');

// Expose openCommentLightbox globally (typed in src/env.d.ts)
window.openCommentLightbox = (url: string, caption?: string) => {
  if (commentLightboxImage) commentLightboxImage.src = url;
  if (commentLightboxCaption) commentLightboxCaption.textContent = caption || '';
  if (commentLightbox) {
    commentLightbox.classList.remove('hidden');
    commentLightbox.classList.add('flex');
    document.body.style.overflow = 'hidden';
  }
};

function closeCommentLightboxFn() {
  if (commentLightbox) {
    commentLightbox.classList.add('hidden');
    commentLightbox.classList.remove('flex');
    document.body.style.overflow = '';
  }
}

closeCommentLightbox?.addEventListener('click', closeCommentLightboxFn);
commentLightbox?.addEventListener('click', (e) => {
  if (e.target === commentLightbox) closeCommentLightboxFn();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && commentLightbox && !commentLightbox.classList.contains('hidden')) {
    closeCommentLightboxFn();
  }
});
