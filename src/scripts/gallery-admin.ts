// Gallery Admin Script
// Handles admin interactions: Upload and Delete
import { uploadToMediaLibrary } from './lib/upload.ts';

// ============ ADMIN UPLOAD FUNCTIONALITY ============
const uploadBtn = document.getElementById('uploadImageBtn') as HTMLButtonElement | null;
const imageInput = document.getElementById('galleryImageInput') as HTMLInputElement | null;
const captionModal = document.getElementById('captionModal');
const captionInput = document.getElementById('captionInput') as HTMLInputElement | null;
const confirmCaptionBtn = document.getElementById('confirmCaptionBtn');
const cancelCaptionBtn = document.getElementById('cancelCaptionBtn');

let selectedFile: File | null = null;
const memorialSlug =
  (document.getElementById('gallery')?.getAttribute('data-memorial-slug') || '').trim() ||
  'default';

if (uploadBtn) {
  uploadBtn.addEventListener('click', (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    imageInput?.click();
  });
}

imageInput?.addEventListener('change', async (e: Event) => {
  const target = e.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

  // Store the selected file and show caption modal
  selectedFile = file;
  if (captionInput) captionInput.value = '';
  if (captionModal) captionModal.style.display = 'flex';
  captionInput?.focus();
});

// Cancel caption modal
cancelCaptionBtn?.addEventListener('click', () => {
  selectedFile = null;
  if (imageInput) imageInput.value = '';
  if (captionModal) captionModal.style.display = 'none';
});

// Confirm and upload with caption
confirmCaptionBtn?.addEventListener('click', async () => {
  if (!selectedFile || !uploadBtn) return;

  const caption = captionInput ? captionInput.value.trim() : '';
  if (captionModal) captionModal.style.display = 'none';

  // Show loading indicator
  const originalText = uploadBtn.textContent;
  uploadBtn.textContent = 'Uploading...';
  uploadBtn.setAttribute('disabled', 'true');

  try {
    const { url } = await uploadToMediaLibrary(selectedFile, `memorials/${memorialSlug}/gallery`);

    // Add image to database with caption
    const dbResponse = await fetch('/api/gallery/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        imagePath: url,
        caption: caption || '',
        displayOrder: 999,
        memorialSlug,
      }),
    });

    if (dbResponse.ok) {
      window.showToast('Image uploaded successfully! Refreshing page...', 'success');
      setTimeout(() => window.location.reload(), 1000);
    } else {
      window.showToast('Image uploaded but failed to add to database', 'error');
    }
  } catch (error) {
    console.error('Upload error:', error);
    window.showToast(error instanceof Error ? error.message : 'Failed to upload image', 'error');
  } finally {
    if (uploadBtn) {
      uploadBtn.textContent = originalText || 'Upload New Image';
      uploadBtn.removeAttribute('disabled');
    }
    if (imageInput) imageInput.value = '';
    selectedFile = null;
  }
});

// ============ ADMIN EDIT CAPTION FUNCTIONALITY ============
const editCaptionModal = document.getElementById('editCaptionModal');
const editCaptionInput = document.getElementById('editCaptionInput') as HTMLInputElement | null;
const saveEditCaptionBtn = document.getElementById('saveEditCaptionBtn');
const cancelEditCaptionBtn = document.getElementById('cancelEditCaptionBtn');

let currentEditImageUrl: string | null = null;

// Use event delegation for dynamic buttons
document.addEventListener('click', (e: Event) => {
  const editBtn = (e.target as HTMLElement).closest('.edit-caption-btn') as HTMLElement | null;
  if (editBtn) {
    e.stopPropagation();

    currentEditImageUrl = editBtn.dataset.imageUrl || null;
    const currentCaption = editBtn.dataset.caption || '';

    if (editCaptionInput) editCaptionInput.value = currentCaption;
    if (editCaptionModal) editCaptionModal.style.display = 'flex';
    editCaptionInput?.focus();
  }
});

// Cancel edit caption modal
cancelEditCaptionBtn?.addEventListener('click', () => {
  currentEditImageUrl = null;
  if (editCaptionModal) editCaptionModal.style.display = 'none';
});

// Save edited caption
saveEditCaptionBtn?.addEventListener('click', async () => {
  if (!currentEditImageUrl || !saveEditCaptionBtn) return;

  const caption = editCaptionInput ? editCaptionInput.value.trim() : '';
  if (editCaptionModal) editCaptionModal.style.display = 'none';

  // Show loading indicator
  const originalText = saveEditCaptionBtn.textContent;
  saveEditCaptionBtn.textContent = 'Saving...';
  saveEditCaptionBtn.setAttribute('disabled', 'true');

  try {
    const response = await fetch('/api/gallery/update-caption', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        imagePath: currentEditImageUrl,
        caption: caption,
        memorialSlug,
      }),
    });

    const result = await response.json();

    if (result.success) {
      // Find the carousel item for this image
      const carouselItem = document.querySelector(
        `.carousel-item[data-image-url="${currentEditImageUrl}"]`
      );

      if (carouselItem) {
        const groupDiv = carouselItem.querySelector('.group');
        let captionElement = groupDiv?.querySelector('.caption-text');

        if (caption) {
          if (captionElement) {
            // Update existing caption
            captionElement.textContent = caption;
          } else {
            // Create new caption element
            const newCaption = document.createElement('p');
            newCaption.className = 'mt-2 text-sm text-warm-gray-600 text-center caption-text';
            newCaption.setAttribute('data-image-url', currentEditImageUrl);
            newCaption.textContent = caption;
            groupDiv?.appendChild(newCaption);
          }
        } else {
          // Remove caption if empty
          if (captionElement) {
            captionElement.remove();
          }
        }

        // Update the edit button's data attribute
        const editButton = carouselItem.querySelector('.edit-caption-btn') as HTMLElement;
        if (editButton) {
          editButton.dataset.caption = caption;
        }

        // Update image element's data for lightbox
        const imgElement = carouselItem.querySelector('img');
        if (imgElement) {
          imgElement.setAttribute('data-caption', caption);
        }

        // Also update any cloned items in the carousel (for infinite scroll)
        const clonedItems = document.querySelectorAll(`.carousel-item.clone`);
        clonedItems.forEach((clone) => {
          const cloneImg = clone.querySelector('img');
          if (cloneImg && imgElement && cloneImg.src === imgElement.src) {
            // Found a clone of the same image
            const cloneGroupDiv = clone.querySelector('.group');
            let cloneCaptionElement = cloneGroupDiv?.querySelector('.caption-text');

            if (caption) {
              if (cloneCaptionElement) {
                cloneCaptionElement.textContent = caption;
              } else {
                const newCaption = document.createElement('p');
                newCaption.className = 'mt-2 text-sm text-warm-gray-600 text-center caption-text';
                newCaption.textContent = caption;
                cloneGroupDiv?.appendChild(newCaption);
              }
            } else {
              if (cloneCaptionElement) {
                cloneCaptionElement.remove();
              }
            }
          }
        });
      }

      // Show success message
      window.showToast('Caption updated successfully!', 'success');
    } else {
      window.showToast('Failed to update caption: ' + (result.error || 'Unknown error'), 'error');
    }
  } catch (error) {
    console.error('Error updating caption:', error);
    window.showToast('Failed to update caption', 'error');
  } finally {
    if (saveEditCaptionBtn) {
      saveEditCaptionBtn.textContent = originalText || 'Save';
      saveEditCaptionBtn.removeAttribute('disabled');
    }
    currentEditImageUrl = null;
  }
});

// Allow Enter key to save caption
editCaptionInput?.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    saveEditCaptionBtn?.click();
  }
});

// ============ ADMIN DELETE FUNCTIONALITY ============
// Use event delegation for dynamic buttons
document.addEventListener('click', async (e: Event) => {
  const deleteBtn = (e.target as HTMLElement).closest(
    '.delete-gallery-image'
  ) as HTMLElement | null;
  if (deleteBtn) {
    e.stopPropagation();

    if (!confirm('Are you sure you want to delete this image?')) {
      return;
    }

    const imageUrl = deleteBtn.dataset.imageUrl;
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
        body: JSON.stringify({ imagePath: imageUrl, memorialSlug }),
      });

      if (dbResponse.ok) {
        window.showToast('Image deleted successfully! Refreshing page...', 'success');
        setTimeout(() => window.location.reload(), 1000);
      } else {
        window.showToast('Failed to delete image from database', 'error');
      }
    } catch (error) {
      console.error('Delete error:', error);
      window.showToast('Failed to delete image', 'error');
    }
  }
});
