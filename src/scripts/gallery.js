// Gallery Component Script
// Handles carousel, lightbox, and admin interactions

// ============ CAROUSEL FUNCTIONALITY WITH INFINITE WRAP ============
const carouselTrack = document.getElementById('carouselTrack');
const carouselContainer = document.getElementById('carouselContainer');
const carouselPrev = document.getElementById('carouselPrev');
const carouselNext = document.getElementById('carouselNext');
const carouselDots = document.querySelectorAll('.carousel-dot');
const originalItems = document.querySelectorAll('.carousel-item');

let currentIndex = 0;
let realIndex = 0;
let autoPlayInterval = null;
let isTransitioning = false;
const totalImages = originalItems.length;

// Clone first and last few images for infinite loop effect
const cloneCount = Math.min(4, totalImages); // Clone up to 4 images on each side

function initInfiniteCarousel() {
  if (!carouselTrack || totalImages === 0) return;
  
  // Clone last images and prepend them
  for (let i = totalImages - cloneCount; i < totalImages; i++) {
    const clone = originalItems[i].cloneNode(true);
    clone.classList.add('clone');
    // Remove the delete button from clones to avoid confusion
    const deleteBtn = clone.querySelector('.delete-gallery-image');
    deleteBtn?.remove();
    carouselTrack.insertBefore(clone, carouselTrack.firstChild);
  }
  
  // Clone first images and append them
  for (let i = 0; i < cloneCount; i++) {
    const clone = originalItems[i].cloneNode(true);
    clone.classList.add('clone');
    // Remove the delete button from clones to avoid confusion
    const deleteBtn = clone.querySelector('.delete-gallery-image');
    deleteBtn?.remove();
    carouselTrack.appendChild(clone);
  }
  
  // Set initial position (account for prepended clones)
  currentIndex = cloneCount;
  realIndex = 0;
  
  // Re-query all items including clones
  const allItems = carouselTrack.querySelectorAll('.carousel-item');
  
  // Setup lightbox for ALL images (originals and clones)
  allItems.forEach((item, idx) => {
    const imgContainer = item.querySelector('.aspect-square');
    if (imgContainer) {
      imgContainer.addEventListener('click', (e) => {
        // Don't open lightbox if clicking on delete button
        if (e.target.closest('.delete-gallery-image')) {
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

function updateCarousel(animate = true) {
  if (!carouselTrack) return;
  
  const allItems = carouselTrack.querySelectorAll('.carousel-item');
  if (allItems.length === 0) return;
  
  const itemWidth = allItems[0].offsetWidth + 24; // width + gap
  const offset = -currentIndex * itemWidth;
  
  if (animate) {
    carouselTrack.style.transition = 'transform 0.5s ease-out';
  } else {
    carouselTrack.style.transition = 'none';
  }
  
  carouselTrack.style.transform = `translateX(${offset}px)`;
  
  // Update dots based on real index
  carouselDots.forEach((dot, idx) => {
    if (idx === realIndex) {
      dot.classList.add('bg-warm-gray-700', 'scale-125');
      dot.classList.remove('bg-warm-gray-300');
    } else {
      dot.classList.remove('bg-warm-gray-700', 'scale-125');
      dot.classList.add('bg-warm-gray-300');
    }
  });
}

function handleTransitionEnd() {
  if (!isTransitioning) return;
  
  const allItems = carouselTrack.querySelectorAll('.carousel-item');
  
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

function goToSlide(direction) {
  if (isTransitioning) return;
  
  isTransitioning = true;
  currentIndex += direction;
  realIndex = ((realIndex + direction) % totalImages + totalImages) % totalImages;
  
  updateCarousel(true);
  resetAutoPlay();
}

function jumpToSlide(index) {
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

function resetAutoPlay() {
  if (autoPlayInterval) {
    clearInterval(autoPlayInterval);
  }
  autoPlayInterval = setInterval(nextSlide, 5000); // Auto-advance every 5 seconds
}

// Event listeners
carouselNext?.addEventListener('click', nextSlide);
carouselPrev?.addEventListener('click', prevSlide);

carouselDots.forEach((dot, idx) => {
  dot.addEventListener('click', () => jumpToSlide(idx));
});

// Touch/swipe support
let touchStartX = 0;
let touchEndX = 0;

carouselTrack?.addEventListener('touchstart', (e) => {
  touchStartX = e.touches[0].clientX;
});

carouselTrack?.addEventListener('touchmove', (e) => {
  touchEndX = e.touches[0].clientX;
});

carouselTrack?.addEventListener('touchend', () => {
  const swipeDistance = touchStartX - touchEndX;
  if (Math.abs(swipeDistance) > 50) { // Minimum swipe distance
    if (swipeDistance > 0) {
      nextSlide();
    } else {
      prevSlide();
    }
  }
});

// Keyboard navigation
document.addEventListener('keydown', (e) => {
  const lightbox = document.getElementById('lightbox');
  const isLightboxOpen = lightbox && !lightbox.classList.contains('hidden');
  
  if (!isLightboxOpen) {
    if (e.key === 'ArrowLeft') prevSlide();
    if (e.key === 'ArrowRight') nextSlide();
  }
});

// Initialize carousel with infinite wrap
initInfiniteCarousel();
resetAutoPlay();

// Pause autoplay on hover
carouselTrack?.addEventListener('mouseenter', () => {
  if (autoPlayInterval) clearInterval(autoPlayInterval);
});

carouselTrack?.addEventListener('mouseleave', resetAutoPlay);

// Recalculate on window resize
window.addEventListener('resize', () => {
  updateCarousel(false);
});

// ============ LIGHTBOX FUNCTIONALITY ============
const lightbox = document.getElementById('lightbox');
const lightboxImage = document.getElementById('lightboxImage');
const lightboxCaption = document.getElementById('lightboxCaption');
const closeLightbox = document.getElementById('closeLightbox');
const prevImage = document.getElementById('prevImage');
const nextImageBtn = document.getElementById('nextImage');

let lightboxIndex = 0;

function openLightbox(index) {
  lightboxIndex = index;
  const item = originalItems[index];
  const img = item.querySelector('img');
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
  
  lightbox?.classList.remove('hidden');
  lightbox?.classList.add('flex');
  document.body.style.overflow = 'hidden';
}

function closeLightboxFn() {
  lightbox?.classList.add('hidden');
  lightbox?.classList.remove('flex');
  document.body.style.overflow = '';
}

function showNextLightboxImage() {
  lightboxIndex = (lightboxIndex + 1) % totalImages;
  const item = originalItems[lightboxIndex];
  const img = item.querySelector('img');
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
  const item = originalItems[lightboxIndex];
  const img = item.querySelector('img');
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

// Close on escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !lightbox?.classList.contains('hidden')) {
    closeLightboxFn();
  }
  if (!lightbox?.classList.contains('hidden')) {
    if (e.key === 'ArrowRight') showNextLightboxImage();
    if (e.key === 'ArrowLeft') showPrevLightboxImage();
  }
});

// Close when clicking outside the image
lightbox?.addEventListener('click', (e) => {
  if (e.target === lightbox) {
    closeLightboxFn();
  }
});

// ============ ADMIN UPLOAD FUNCTIONALITY ============
const uploadBtn = document.getElementById('uploadImageBtn');
const imageInput = document.getElementById('galleryImageInput');
const captionModal = document.getElementById('captionModal');
const captionInput = document.getElementById('captionInput');
const confirmCaptionBtn = document.getElementById('confirmCaptionBtn');
const cancelCaptionBtn = document.getElementById('cancelCaptionBtn');

let selectedFile = null;

if (uploadBtn) {
  uploadBtn.addEventListener('click', (e) => {
    console.log('Upload button clicked');
    e.preventDefault();
    e.stopPropagation();
    imageInput?.click();
  });
}

imageInput?.addEventListener('change', async (e) => {
  const target = e.target;
  const file = target.files?.[0];
  if (!file) return;
  
  // Store the selected file and show caption modal
  selectedFile = file;
  captionInput.value = '';
  captionModal?.classList.remove('hidden');
  captionInput?.focus();
});

// Cancel caption modal
cancelCaptionBtn?.addEventListener('click', () => {
  selectedFile = null;
  imageInput.value = '';
  captionModal?.classList.add('hidden');
});

// Confirm and upload with caption
confirmCaptionBtn?.addEventListener('click', async () => {
  if (!selectedFile) return;
  
  const caption = captionInput.value.trim();
  captionModal?.classList.add('hidden');

  // Show loading indicator
  const originalText = uploadBtn.textContent;
  uploadBtn.textContent = 'Uploading...';
  uploadBtn.setAttribute('disabled', 'true');

  try {
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('folder', 'memorial/gallery');

    const response = await fetch('/api/upload-image', {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();

    if (result.success) {
      // Add image to database with caption
      const dbResponse = await fetch('/api/gallery/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imagePath: result.url,
          caption: caption || '',
          displayOrder: 999,
        }),
      });

      if (dbResponse.ok) {
        alert('Image uploaded successfully! Refreshing page...');
        window.location.reload();
      } else {
        alert('Image uploaded but failed to add to database');
      }
    } else {
      alert('Upload failed: ' + result.error);
    }
  } catch (error) {
    console.error('Upload error:', error);
    alert('Failed to upload image');
  } finally {
    uploadBtn.textContent = originalText || 'Upload New Image';
    uploadBtn.removeAttribute('disabled');
    imageInput.value = '';
    selectedFile = null;
  }
});

// ============ ADMIN DELETE FUNCTIONALITY ============
const deleteButtons = document.querySelectorAll('.delete-gallery-image');

deleteButtons.forEach(btn => {
  btn.addEventListener('click', async (e) => {
    e.stopPropagation();
    
    if (!confirm('Are you sure you want to delete this image?')) {
      return;
    }
    
    const imageUrl = btn.dataset.imageUrl;
    if (!imageUrl) return;
    
    try {
      // Delete from Cloudinary (if it's a Cloudinary URL)
      if (imageUrl.includes('cloudinary.com')) {
        const deleteResponse = await fetch('/api/delete-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageUrl }),
        });
        
        const deleteResult = await deleteResponse.json();
        if (!deleteResult.success) {
          console.warn('Failed to delete from Cloudinary:', deleteResult.error);
        }
      }
      
      // Remove from database
      const dbResponse = await fetch('/api/gallery/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imagePath: imageUrl }),
      });
      
      if (dbResponse.ok) {
        alert('Image deleted successfully! Refreshing page...');
        window.location.reload();
      } else {
        alert('Failed to delete image from database');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete image');
    }
  });
});
