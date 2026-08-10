// Client-side JavaScript for comment functionality.
//
// The first page of memories is rendered by the server (see Comments.astro), so
// this module starts from the cards already in the DOM and only fetches
// additional pages. Card markup comes from the shared renderer in
// src/lib/comment-card.ts so both paths produce identical HTML.
import { activateFocusTrap, releaseFocusTrap } from './lib/focus-trap.ts';
import { renderCommentSlide, renderEmptyState, type CommentCardData } from '../lib/comment-card.ts';

// State
let loadedCount = 0;
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
const memoriesSection = document.getElementById('memories') as HTMLElement | null;
const memorialSlug = (memoriesSection?.dataset.memorialSlug || '').trim();

// Seeded by the server so we resume paging where its first page ended.
const initialCount = Number(commentsTrack?.dataset.initialCount ?? '0') || 0;
const initialHasMore = commentsTrack?.dataset.hasMore === 'true';

loadedCount = initialCount;
offset = initialCount;
hasMore = initialHasMore;

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
      const newComments: CommentCardData[] = result.data;

      if (newComments.length < limit) {
        hasMore = false;
      }

      if (newComments.length === 0 && loadedCount === 0) {
        commentsTrack.innerHTML = renderEmptyState();
        prevBtn.disabled = true;
        nextBtn.disabled = true;
      } else {
        renderNewComments(newComments);
        loadedCount += newComments.length;
        offset += newComments.length;

        updateButtons();
      }
    }
  } catch (error) {
    console.error('Error loading comments:', error);
    if (loadedCount === 0) {
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

function renderNewComments(comments: CommentCardData[]) {
  if (comments.length === 0) return;

  const fragment = document.createDocumentFragment();
  const staging = document.createElement('div');
  staging.innerHTML = comments.map(renderCommentSlide).join('');

  while (staging.firstElementChild) {
    fragment.appendChild(staging.firstElementChild);
  }

  commentsTrack.appendChild(fragment);
}

// Delegated lightbox opener. Data flows through data-* attributes (correctly
// HTML-attribute-escaped) instead of an inline onclick, which would run
// attacker-controlled comment text in a JS-string context after the HTML
// parser decoded the entities.
commentsTrack.addEventListener('click', (e) => {
  const trigger = (e.target as HTMLElement).closest<HTMLElement>('[data-lightbox-trigger]');
  if (!trigger) return;
  window.openCommentLightbox(
    trigger.dataset.lightboxUrl || '',
    trigger.dataset.lightboxTitle || ''
  );
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
  // 1. We have loaded items ahead (loadedCount > carouselIndex + itemsPerPage)
  // 2. OR we have more items to fetch on server

  const maxIndex = Math.max(0, loadedCount - itemsPerPage);
  const canGoNext = carouselIndex < maxIndex || hasMore;

  nextBtn.disabled = !canGoNext;
}

function nextSlide() {
  const maxIndex = Math.max(0, loadedCount - itemsPerPage);

  if (carouselIndex < maxIndex) {
    // Just slide
    carouselIndex++;
    updateCarousel(true);

    // Check if we need to load more (preload when close to end)
    if (hasMore && !isLoading && loadedCount - carouselIndex <= itemsPerPage * 2) {
      loadComments();
    }
  } else if (hasMore && !isLoading) {
    // At end, need to load more first
    loadComments().then(() => {
      if (loadedCount > maxIndex) {
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

// The server rendered the first page, so there is nothing to fetch on load;
// only sync the controls to what is already on screen. A memorial with no
// approved memories still renders its empty state server-side.
if (initialCount === 0) {
  prevBtn.disabled = true;
  nextBtn.disabled = true;
} else {
  updateButtons();
}

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
      loadedCount = 0;
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
    activateFocusTrap(commentLightbox);
  }
};

function closeCommentLightboxFn() {
  if (commentLightbox) {
    releaseFocusTrap(commentLightbox);
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
