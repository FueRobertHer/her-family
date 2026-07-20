// Edit modal: open/close, field rendering, uploads and save.
import { state, getActiveMemorialSlug, loadMemorialData } from './state.js';
import { escapeHtml } from '../lib/escape-html.js';
import { showToast, initNavLinksVisibility } from './helpers.js';
import { updatePageContent, updateServiceOnPage } from './page-updaters.js';
import { handleDragStart, handleDragOver, handleDrop, handleDragEnd } from './gallery-dnd.js';

// --- Main Modal & Upload Functions ---

export async function openEditModal(section) {
  state.currentSection = section;
  const modal = document.getElementById('editModal');
  const modalTitle = document.getElementById('modalTitle');

  if (!state.memorialDataLoaded) {
    if (loadMemorialData()) initNavLinksVisibility();
  }

  const titles = {
    hero: 'Edit Hero Section',
    biography: 'Edit Biography',
    highlights: 'Edit Highlights',
    video: 'Edit Video Section',
    donations: 'Edit Donations',
    funeral: 'Edit Funeral Information',
    specialInstructions: 'Edit Special Instructions',
    flowersInfo: 'Edit Flowers/Donation Information',
    services: 'Edit Service Events',
    reception: 'Edit Reception Information',
    gallery: 'Edit Gallery',
    comments: 'Edit Memories',
    footer: 'Edit Footer',
  };

  if (section.startsWith('service-')) {
    const serviceIndex = parseInt(section.split('-')[1]);
    modalTitle.textContent = `Edit Service Event #${serviceIndex + 1}`;
  } else {
    modalTitle.textContent = titles[section] || 'Edit Content';
  }

  try {
    const response = await fetch(
      `/api/admin/content?memorial=${encodeURIComponent(getActiveMemorialSlug())}`
    );
    const result = await response.json();

    if (result.success) {
      state.contentData = result.data.organizedContent;
      renderModalContent(section);
      modal.classList.remove('hidden');
    } else {
      showToast('Error loading content: ' + result.error, 'error');
    }
  } catch (error) {
    console.error('Error loading content:', error);
    showToast('Error loading content. Please try again.', 'error');
  }
}

export function closeEditModal() {
  const modal = document.getElementById('editModal');
  modal.classList.add('hidden');
  state.currentSection = null;
}

export function renderModalContent(section) {
  // ... (keep existing implementation)
  const modalContent = document.getElementById('modalContent');

  if (section.startsWith('service-')) {
    const serviceIndex = parseInt(section.split('-')[1]);
    const services = state.memorialData.funeralInfo?.services || [];
    const service = services[serviceIndex];

    if (!service) {
      modalContent.innerHTML = '<div class="text-red-600">Service not found</div>';
      return;
    }

    modalContent.innerHTML = `
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Service Type</label>
          <input type="text" id="service-type" value="${service.type}" data-service-index="${serviceIndex}" data-field="type"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-900">
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
          <input type="date" id="service-date" value="${service.date}" data-service-index="${serviceIndex}" data-field="date"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-900">
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Start Time (24-hour format, e.g., 14:00)</label>
          <input type="text" id="service-time" value="${service.time}" data-service-index="${serviceIndex}" data-field="time"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-900">
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">End Date (optional, leave blank if same day)</label>
          <input type="date" id="service-endDate" value="${service.endDate || ''}" data-service-index="${serviceIndex}" data-field="endDate"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-900">
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">End Time (optional, 24-hour format, e.g., 16:00)</label>
          <input type="text" id="service-endTime" value="${service.endTime || ''}" data-service-index="${serviceIndex}" data-field="endTime"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-900">
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Location Name</label>
          <input type="text" id="service-location-name" value="${service.location.name}" data-service-index="${serviceIndex}" data-field="location.name"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-900">
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Address</label>
          <input type="text" id="service-location-address" value="${service.location.address}" data-service-index="${serviceIndex}" data-field="location.address"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-900">
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Phone (optional)</label>
          <input type="text" id="service-location-phone" value="${service.location.phone || ''}" data-service-index="${serviceIndex}" data-field="location.phone"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-900" placeholder="(555) 123-4567">
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Website (optional)</label>
          <input type="url" id="service-location-website" value="${service.location.website || ''}" data-service-index="${serviceIndex}" data-field="location.website"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-900" placeholder="https://example.com">
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Description</label>
          <textarea id="service-description" rows="3" data-service-index="${serviceIndex}" data-field="description"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-900">${service.description || ''}</textarea>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Dress Code (optional)</label>
          <input type="text" id="service-dresscode" value="${service.dresscode || ''}" data-service-index="${serviceIndex}" data-field="dresscode"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-900" placeholder="Business casual">
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Service Agenda (Image or PDF)</label>
          <div class="flex gap-2">
            <input type="text" id="service-agendaUrl" value="${service.agendaUrl || ''}" data-service-index="${serviceIndex}" data-field="agendaUrl"
              class="min-w-0 flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-900"
              placeholder="https://...">
            <button type="button" onclick="uploadAgendaForField('service-agendaUrl')"
              class="shrink-0 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors flex items-center whitespace-nowrap">
              <svg class="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path>
              </svg>
              Upload
            </button>
          </div>
          <input type="file" id="service-agendaUrl-file" accept="image/*,application/pdf" class="hidden" />
          <p class="mt-1 text-xs text-gray-500">You can paste a URL directly or upload an image/PDF file (max 5MB).</p>
        </div>
      </div>
    `;
    return;
  }

  const fields = {
    hero: [
      { key: 'name', label: 'Full Name', type: 'text' },
      { key: 'birthDate', label: 'Birth Date', type: 'date' },
      { key: 'deathDate', label: 'Death Date', type: 'date' },
      { key: 'subtitle', label: 'Subtitle', type: 'text' },
      {
        key: 'mainImage',
        label: 'Portrait Image',
        type: 'image',
        placeholder: '/images/portrait.jpg or Cloudinary URL',
      },
      {
        key: 'backgroundImage',
        label: 'Background Image',
        type: 'image',
        placeholder: 'Optional: Custom background image',
      },
    ],
    biography: [
      { key: 'visible', label: 'Show Biography Section', type: 'checkbox' },
      { key: 'title', label: 'Section Title', type: 'text' },
      {
        key: 'content',
        label: 'Biography Content',
        type: 'textarea',
        rows: 10,
      },
    ],
    highlights: [
      { key: 'visible', label: 'Show Cherished Memories', type: 'checkbox' },
      {
        key: 'highlights',
        label: 'Cherished Memories (one per line)',
        type: 'textarea',
        rows: 8,
        placeholder: 'Enter each memory on a new line',
      },
    ],
    video: [
      { key: 'visible', label: 'Show Video Section', type: 'checkbox' },
      {
        key: 'sectionTitle',
        label: 'Section Title',
        type: 'text',
        placeholder: 'In Their Own Words',
      },
      { key: 'description', label: 'Video Description', type: 'text' },
      {
        key: 'videoUrl',
        label: 'Video URL',
        type: 'video',
        placeholder: '/videos/memorial-video.mp4 or Cloudinary URL',
      },
      {
        key: 'posterImage',
        label: 'Video Poster Image',
        type: 'image',
        placeholder: '/images/video-poster.jpg',
      },
    ],
    donations: [
      { key: 'visible', label: 'Show Donations Section', type: 'checkbox' },
      {
        key: 'sectionTitle',
        label: 'Section Title',
        type: 'text',
        placeholder: 'Honor Their Memory',
      },
      {
        key: 'customMessage',
        label: 'Custom Message',
        type: 'textarea',
        rows: 3,
      },
      {
        key: 'venmoUsername',
        label: 'Venmo Username',
        type: 'text',
        placeholder: '@username',
      },
      {
        key: 'venmoImage',
        label: 'Venmo QR Code/Image',
        type: 'image',
        placeholder: 'Upload QR Code',
      },
      {
        key: 'cashappUsername',
        label: 'Cash App Username',
        type: 'text',
        placeholder: '$username',
      },
      {
        key: 'cashappImage',
        label: 'Cash App QR Code/Image',
        type: 'image',
        placeholder: 'Upload QR Code',
      },
      {
        key: 'zelleEmail',
        label: 'Zelle Email',
        type: 'email',
        placeholder: 'email@example.com',
      },
      {
        key: 'zelleImage',
        label: 'Zelle QR Code/Image',
        type: 'image',
        placeholder: 'Upload QR Code',
      },
    ],
    funeral: [
      { key: 'visible', label: 'Show Funeral Section', type: 'checkbox' },
      {
        key: 'sectionTitle',
        label: 'Section Title',
        type: 'text',
        placeholder: 'Service Information',
      },
      {
        key: 'subtitle',
        label: 'Subtitle Text',
        type: 'text',
        placeholder: 'Please join us as we celebrate their life and honor their memory',
      },
    ],
    specialInstructions: [
      {
        key: 'specialInstructionsVisible',
        label: 'Show Special Instructions',
        type: 'checkbox',
      },
      {
        key: 'specialInstructions',
        label: 'Special Instructions',
        type: 'textarea',
        rows: 5,
        placeholder: 'Please arrive 15 minutes early for seating...',
      },
    ],
    flowersInfo: [
      {
        key: 'flowersInfoVisible',
        label: 'Show Flowers/Donation Info',
        type: 'checkbox',
      },
      {
        key: 'flowersInfo',
        label: 'Flowers/Donation Information',
        type: 'textarea',
        rows: 3,
        placeholder: 'In lieu of flowers, the family requests...',
      },
    ],
    services: [
      {
        key: 'info',
        label: 'Service Management',
        type: 'info',
        message:
          'Service events are complex structured data. To edit services, dates, times, and locations, please update the database directly or contact support.',
      },
    ],
    reception: [
      { key: 'visible', label: 'Show Reception Information', type: 'checkbox' },
      {
        key: 'location',
        label: 'Reception Location',
        type: 'text',
        placeholder: "St. Mary's Parish Hall",
      },
      {
        key: 'time',
        label: 'Reception Time',
        type: 'text',
        placeholder: 'Following the service',
      },
      {
        key: 'description',
        label: 'Reception Description',
        type: 'textarea',
        rows: 3,
        placeholder: 'Light refreshments will be served...',
      },
    ],
    gallery: [
      { key: 'visible', label: 'Show Gallery Section', type: 'checkbox' },
      {
        key: 'sectionTitle',
        label: 'Section Title',
        type: 'text',
        placeholder: 'Treasured Moments',
      },
      { key: 'images', label: 'Reorder Images', type: 'reorder_gallery' },
    ],
    footer: [
      { key: 'visible', label: 'Show Footer', type: 'checkbox' },
      { key: 'quote', label: 'Memorial Quote', type: 'textarea', rows: 2 },
      {
        key: 'credit',
        label: 'Footer Credit Text',
        type: 'text',
        placeholder: 'Created with love by the Family • 2024',
      },
    ],
    comments: [
      { key: 'visible', label: 'Show Memories Section', type: 'checkbox' },
      {
        key: 'autoApprove',
        label: 'Auto-approve New Comments',
        type: 'checkbox',
      },
      {
        key: 'sectionTitle',
        label: 'Section Title',
        type: 'text',
        placeholder: 'Share Your Memories',
      },
      {
        key: 'subtitle',
        label: 'Subtitle Text',
        type: 'text',
        placeholder: 'Leave a message to honor their memory...',
      },
    ],
  };

  const sectionFields = fields[section] || [];

  let dataSection = section;
  if (section === 'specialInstructions' || section === 'flowersInfo') {
    dataSection = 'funeral';
  } else if (section === 'highlights') {
    // Highlights data is stored under biography section, but visibility under highlights
    // We'll need to handle this specially
    dataSection = 'biography';
  }
  const actualSectionData = state.contentData[dataSection] || {};

  // For highlights visibility, check the highlights section
  const highlightsVisibilityData = section === 'highlights' ? state.contentData['highlights'] || {} : {};

  modalContent.innerHTML = sectionFields
    .map((field) => {
      let value = actualSectionData[field.key]?.value || '';

      if (section === 'highlights' && field.key === 'highlights') {
        try {
          const highlightsArray = JSON.parse(actualSectionData[field.key]?.value || '[]');
          value = highlightsArray.join('\n');
        } catch {
          value = '';
        }
      }

      // For highlights visibility, check the highlights section instead of biography
      if (section === 'highlights' && field.key === 'visible') {
        value = highlightsVisibilityData[field.key]?.value || '';
      }

      if (field.type === 'checkbox' && !actualSectionData[field.key]) {
        // For highlights section, check visibility in highlightsVisibilityData
        if (
          section === 'highlights' &&
          field.key === 'visible' &&
          !highlightsVisibilityData[field.key]
        ) {
          value = 'true';
        } else if (section === 'comments' && field.key === 'autoApprove') {
          // Default to false for autoApprove
          value = 'false';
        } else {
          // Default to true for most visibility toggles
          value = 'true';
        }
      }

      const inputId = `modal-${section}-${field.key}`;
      // Special handling for highlights: content goes to 'biography', visibility goes to 'highlights'
      const dataSectionAttr =
        section === 'highlights' && field.key === 'visible' ? 'highlights' : dataSection;

      if (field.type === 'info') {
        return `
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p class="text-sm text-blue-800">${escapeHtml(field.message)}</p>
        </div>
      `;
      } else if (field.type === 'checkbox') {
        return `
        <div class="flex items-center p-4 bg-gray-50 rounded-lg">
          <input
            type="checkbox"
            id="${inputId}"
            ${value === 'true' || value === true ? 'checked' : ''}
            data-section="${dataSectionAttr}"
            data-key="${field.key}"
            class="w-5 h-5 text-indigo-600 border-gray-300 rounded-sm focus:ring-indigo-500"
          />
          <label for="${inputId}" class="ml-3 text-sm font-medium text-gray-700">
            ${escapeHtml(field.label)}
          </label>
        </div>
      `;
      } else if (field.type === 'image') {
        return `
        <div>
          <label for="${inputId}" class="block text-sm font-medium text-gray-700 mb-2">
            ${field.label}
          </label>
          <div class="flex gap-2">
            <input
              type="text"
              id="${inputId}"
              value="${value}"
              data-section="${dataSectionAttr}"
              data-key="${field.key}"
              class="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-900"
              placeholder="${field.placeholder || ''}"
            />
            <button
              type="button"
              onclick="uploadImageForField('${inputId}')"
              class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors flex items-center"
            >
              <svg class="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
              Upload
            </button>
          </div>
          <input type="file" id="${inputId}-file" accept="image/*" class="hidden" />
          <p class="mt-1 text-xs text-gray-500">You can paste a Cloudinary URL or upload a new image</p>
        </div>
      `;
      } else if (field.type === 'video') {
        return `
        <div>
          <label for="${inputId}" class="block text-sm font-medium text-gray-700 mb-2">
            ${field.label}
          </label>
          <div class="flex gap-2">
            <input
              type="text"
              id="${inputId}"
              value="${value}"
              data-section="${dataSectionAttr}"
              data-key="${field.key}"
              class="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-900"
              placeholder="${field.placeholder || ''}"
            />
            <button
              type="button"
              onclick="uploadVideoForField('${inputId}')"
              class="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md transition-colors flex items-center"
            >
              <svg class="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
              </svg>
              Upload Video
            </button>
          </div>
          <input type="file" id="${inputId}-file" accept="video/*" class="hidden" />
          <p class="mt-1 text-xs text-gray-500">You can paste a Cloudinary URL or upload a new video (max 100MB recommended)</p>
        </div>
      `;
      } else if (field.type === 'reorder_gallery') {
        // Build the grid of images
        const images = state.memorialData.images || [];
        const gridHtml = images
          .map(
            (img, idx) => `
        <div class="reorder-item relative bg-white rounded-lg shadow-md overflow-hidden cursor-move hover:shadow-lg transition-shadow" 
             draggable="true" data-index="${idx}" data-image-url="${img.src}">
          <div class="aspect-square overflow-hidden bg-warm-gray-200">
            <img src="${img.src}" alt="${img.alt}" class="w-full h-full object-cover" />
          </div>
          <div class="absolute top-2 left-2 bg-black/60 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
            ${idx + 1}
          </div>
          <div class="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors flex items-center justify-center pointer-events-none">
            <svg class="w-8 h-8 text-white drop-shadow-lg opacity-0 hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
          </div>
        </div>
      `
          )
          .join('');

        return `
        <div class="mt-6 border-t border-gray-200 pt-6">
          <label class="block text-sm font-medium text-gray-700 mb-4">
            ${field.label}
          </label>
          <div id="reorderList" class="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-2">
            ${gridHtml}
          </div>
          <p class="text-xs text-gray-500">Drag and drop images to reorder them. Changes are saved when you click "Save Changes".</p>
        </div>
      `;
      } else if (field.type === 'textarea') {
        return `
        <div>
          <label for="${inputId}" class="block text-sm font-medium text-gray-700 mb-2">
            ${field.label}
          </label>
          <textarea
            id="${inputId}"
            rows="${field.rows || 4}"
            data-section="${dataSectionAttr}"
            data-key="${field.key}"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-900"
            placeholder="${field.placeholder || ''}"
          >${value}</textarea>
        </div>
      `;
      } else {
        return `
        <div>
          <label for="${inputId}" class="block text-sm font-medium text-gray-700 mb-2">
            ${field.label}
          </label>
          <input
            type="${field.type}"
            id="${inputId}"
            value="${value}"
            data-section="${dataSectionAttr}"
            data-key="${field.key}"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-900"
            placeholder="${field.placeholder || ''}"
          />
        </div>
      `;
      }
    })
    .join('');

  // Attach event listeners to new elements for reordering
  const reorderItems = modalContent.querySelectorAll('.reorder-item');
  reorderItems.forEach((item) => {
    item.addEventListener('dragstart', handleDragStart);
    item.addEventListener('dragover', handleDragOver);
    item.addEventListener('drop', handleDrop);
    item.addEventListener('dragend', handleDragEnd);
  });
}

export async function uploadImageForField(inputId) {
  // ... (keep existing implementation)
  const fileInputId = `${inputId}-file`;
  const fileInput = document.getElementById(fileInputId);
  const textInput = document.getElementById(inputId);

  if (!fileInput) return;

  fileInput.click();

  fileInput.onchange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const originalValue = textInput.value;
    textInput.value = 'Uploading...';
    textInput.disabled = true;

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', `memorials/${getActiveMemorialSlug()}/portraits`);

      const response = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        textInput.value = result.url;
        showToast('Image uploaded successfully! Click "Save Changes" to apply it.', 'success');
      } else {
        const errorMsg = result.error + (result.details ? ': ' + result.details : '');
        showToast('Upload failed: ' + errorMsg, 'error');
        textInput.value = originalValue;
      }
    } catch (error) {
      console.error('Upload error:', error);
      showToast('Failed to upload image: ' + error.message, 'error');
      textInput.value = originalValue;
    } finally {
      textInput.disabled = false;
      fileInput.value = '';
    }
  };
}

export async function uploadVideoForField(inputId) {
  // ... (keep existing implementation)
  const fileInputId = `${inputId}-file`;
  const fileInput = document.getElementById(fileInputId);
  const textInput = document.getElementById(inputId);

  if (!fileInput) return;

  fileInput.click();

  fileInput.onchange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const sizeMB = file.size / (1024 * 1024);
    if (sizeMB > 100) {
      if (
        !confirm(
          `This video is ${sizeMB.toFixed(1)}MB. Large videos may take a while to upload. Continue?`
        )
      ) {
        fileInput.value = '';
        return;
      }
    }

    const originalValue = textInput.value;
    textInput.value = `Uploading video (${sizeMB.toFixed(1)}MB)...`;
    textInput.disabled = true;

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', `memorials/${getActiveMemorialSlug()}/videos`);

      const response = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        textInput.value = result.url;
        showToast('Video uploaded successfully! Click "Save Changes" to apply it.', 'success');
      } else {
        alert(
          '❌ Upload failed: ' + result.error + (result.details ? '\n\n' + result.details : '')
        );
        textInput.value = originalValue;
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('❌ Failed to upload video: ' + error.message);
      textInput.value = originalValue;
    } finally {
      textInput.disabled = false;
      fileInput.value = '';
    }
  };
}

export async function saveAllModalContent() {
  // ... (keep existing implementation)
  if (!state.currentSection) return;

  // Handle individual service editing
  if (state.currentSection.startsWith('service-')) {
    // ... (keep existing service saving logic) ...
    const serviceIndex = parseInt(state.currentSection.split('-')[1]);
    const modalContent = document.getElementById('modalContent');
    const inputs = modalContent.querySelectorAll('input, textarea');

    const serviceData = {};
    inputs.forEach((input) => {
      const field = input.dataset.field;
      if (field) {
        const value = input.value.trim();
        if (field.includes('.')) {
          // Handle nested fields (e.g., location.name, location.address, etc.)
          const [parent, child] = field.split('.');
          if (!serviceData[parent]) serviceData[parent] = {};
          // Always include the field, even if empty (allows clearing optional fields)
          serviceData[parent][child] = value;
        } else {
          // Handle top-level fields (e.g., date, time, type, etc.)
          // Always include the field, even if empty (allows clearing optional fields)
          serviceData[field] = value;
        }
      }
    });

    try {
      const response = await fetch('/api/admin/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memorialSlug: getActiveMemorialSlug(),
          section: 'funeral',
          key: `service${serviceIndex}`,
          value: JSON.stringify(serviceData),
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Update the state.memorialData object so the modal will show fresh data next time
        if (state.memorialData.funeralInfo && state.memorialData.funeralInfo.services) {
          state.memorialData.funeralInfo.services[serviceIndex] = serviceData;
        }

        updateServiceOnPage(serviceIndex, serviceData);
        showToast('Service updated successfully!', 'success');
        closeEditModal();
      } else {
        throw new Error(result.error || 'Failed to save service');
      }
    } catch (error) {
      console.error('Error saving service:', error);
      showToast('Error saving service. Please try again.', 'error');
    }
    return;
  }

  const modalContent = document.getElementById('modalContent');
  const inputs = modalContent.querySelectorAll('input:not([type="file"]):not(.hidden), textarea');

  const updates = [];
  const updatesMap = {};

  // Handle standard inputs
  inputs.forEach((input) => {
    const section = input.dataset.section;
    const key = input.dataset.key;

    if (!section || !key) return;

    let value;
    if (input.type === 'checkbox') {
      value = input.checked ? 'true' : 'false';
    } else {
      value = input.value;
    }

    if (section === 'biography' && key === 'highlights') {
      const highlightsArray = value
        .split('\n')
        .filter((h) => h.trim())
        .map((h) => h.trim());
      value = JSON.stringify(highlightsArray);
    }

    updates.push({ section, key, value });

    if (!updatesMap[section]) {
      updatesMap[section] = {};
    }
    // Store the same value format for updatesMap as we store in updates array
    updatesMap[section][key] = value;
  });

  // Handle Gallery Reordering
  if (state.currentSection === 'gallery') {
    const reorderItems = modalContent.querySelectorAll('.reorder-item');
    if (reorderItems.length > 0) {
      const reorderData = Array.from(reorderItems).map((item, idx) => ({
        imagePath: item.dataset.imageUrl,
        displayOrder: idx,
        memorialSlug: getActiveMemorialSlug(),
      }));

      // We'll save the reorder data separately
      try {
        const updatePromises = reorderData.map((item) =>
          fetch('/api/gallery/update-order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(item),
          })
        );
        await Promise.all(updatePromises);
        // Force refresh to see new order since we don't have easy DOM manipulation for the carousel here
        setTimeout(() => window.location.reload(), 1000);
      } catch (e) {
        console.error('Failed to update gallery order:', e);
        showToast('Failed to update gallery order', 'error');
      }
    }
  }

  if (updates.length === 0 && state.currentSection !== 'gallery') {
    showToast('Error: No valid fields to save', 'error');
    return;
  }

  try {
    if (updates.length > 0) {
      const results = await Promise.all(
        updates.map((update) =>
          fetch('/api/admin/content', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...update, memorialSlug: getActiveMemorialSlug() }),
          }).then((r) => r.json())
        )
      );

      const allSuccess = results.every((r) => r.success);

      if (allSuccess) {
        // Get the correct data section for update (handle special cases)
        let updateDataSection = state.currentSection;
        if (state.currentSection === 'specialInstructions' || state.currentSection === 'flowersInfo') {
          updateDataSection = 'funeral';
        } else if (state.currentSection === 'highlights') {
          updateDataSection = 'biography'; // highlights content is stored under biography
        }

        // Update state.memorialData for visibility flags (used by nav links until next page load)
        updates.forEach((update) => {
          if (update.key === 'visible') {
            const isVisible = update.value === 'true';
            switch (state.currentSection) {
              case 'biography':
                state.memorialData.biographyVisible = isVisible;
                break;
              case 'highlights':
                state.memorialData.highlightsVisible = isVisible;
                break;
              case 'video':
                state.memorialData.videoVisible = isVisible;
                break;
              case 'gallery':
                state.memorialData.galleryVisible = isVisible;
                break;
              case 'comments':
                state.memorialData.commentsVisible = isVisible;
                break;
              case 'donations':
                if (!state.memorialData.donations) state.memorialData.donations = {};
                state.memorialData.donations.visible = isVisible;
                break;
              case 'funeral':
                if (!state.memorialData.funeralInfo) state.memorialData.funeralInfo = {};
                state.memorialData.funeralInfo.visible = isVisible;
                break;
            }
          }
        });

        // Pass updates using the correct data section key, but keep state.currentSection for routing
        // For highlights, we need to gather updates from both biography and highlights sections
        let updateData = {};
        if (state.currentSection === 'highlights') {
          // Merge updates from both sections
          updates.forEach((update) => {
            updateData[update.key] = updatesMap[update.section]?.[update.key];
          });
        } else {
          updateData = updatesMap[updateDataSection] || {};
        }

        updatePageContent(state.currentSection, updateData);
        showToast('Changes saved successfully!', 'success');
        closeEditModal();
      } else {
        throw new Error('Some updates failed');
      }
    } else if (state.currentSection === 'gallery') {
      showToast('Changes saved successfully!', 'success');
      closeEditModal();
    }
  } catch (error) {
    console.error('Error saving content:', error);
    showToast('Error saving changes. Please try again.', 'error');
  }
}

export async function uploadAgendaForField(inputId) {
  const fileInputId = `${inputId}-file`;
  const fileInput = document.getElementById(fileInputId);
  const textInput = document.getElementById(inputId);

  if (!fileInput) return;

  fileInput.click();

  fileInput.onchange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Simple validation
    if (file.size > 5 * 1024 * 1024) {
      alert('File is too large (max 5MB)');
      return;
    }

    const originalValue = textInput.value;
    textInput.value = 'Uploading...';

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', `memorials/${getActiveMemorialSlug()}/agendas`); // Separate folder for organization

      const response = await fetch('/api/upload-image', {
        // Re-using your existing upload endpoint
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        textInput.value = result.url;
        showToast('Agenda uploaded successfully!', 'success');
      } else {
        throw new Error(result.error || 'Upload failed');
      }
    } catch (error) {
      console.error(error);
      alert('❌ Upload failed: ' + error.message);
      textInput.value = originalValue;
    } finally {
      fileInput.value = '';
    }
  };
}

