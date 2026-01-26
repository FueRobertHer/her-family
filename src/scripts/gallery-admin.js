// Gallery Admin Script
// Handles admin interactions: Upload and Delete

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
