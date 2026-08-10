// Edit modal: open/close, field rendering, uploads and save.
import { state, getActiveMemorialSlug, loadMemorialData } from './state.ts';
import { escapeHtml } from '../../lib/escape-html.ts';
import { activateFocusTrap, releaseFocusTrap } from '../lib/focus-trap.ts';
import { uploadToMediaLibrary } from '../lib/upload.ts';
import { MAX_UPLOAD_LABEL, formatBytes } from '../../lib/upload-limits.ts';
import { showToast, initNavLinksVisibility } from './helpers.ts';
import { handleDragStart, handleDragOver, handleDrop, handleDragEnd } from './gallery-dnd.ts';
import {
  SECTIONS,
  placeholderFor,
  storageSectionFor,
  type SectionField,
} from '../../lib/sections.ts';

/**
 * After a successful save the page is reloaded so the server re-renders it.
 * The alternative (a hand-written DOM patcher per section) was a second
 * implementation of every component that drifted out of sync. The toast is
 * handed to the next page load so the confirmation survives the reload.
 */
const FLASH_KEY = 'admin-editor-flash';

function reloadWithFlash(message: string) {
  try {
    sessionStorage.setItem(FLASH_KEY, message);
  } catch {
    // Private browsing with storage disabled: the reload still happens.
  }
  window.location.reload();
}

export function showPendingFlash() {
  let message: string | null;
  try {
    message = sessionStorage.getItem(FLASH_KEY);
    if (message) sessionStorage.removeItem(FLASH_KEY);
  } catch {
    return;
  }

  if (!message) return;

  // Prefer the shared Toast component; fall back to the editor's own toast if
  // its script has not initialized yet.
  if (typeof window.showToast === 'function') {
    window.showToast(message, 'success');
  } else {
    showToast(message, 'success');
  }
}

// --- Main Modal & Upload Functions ---

export async function openEditModal(section: string) {
  state.currentSection = section;
  const modal = document.getElementById('editModal');
  const modalTitle = document.getElementById('modalTitle');

  if (!state.memorialDataLoaded) {
    if (loadMemorialData()) initNavLinksVisibility();
  }

  if (section.startsWith('service-')) {
    const serviceIndex = parseInt(section.split('-')[1]);
    if (modalTitle) modalTitle.textContent = `Edit Service Event #${serviceIndex + 1}`;
  } else if (modalTitle) {
    modalTitle.textContent = SECTIONS[section]?.title || 'Edit Content';
  }

  try {
    const response = await fetch(
      `/api/admin/content?memorial=${encodeURIComponent(getActiveMemorialSlug())}`
    );
    const result = await response.json();

    if (result.success) {
      state.contentData = result.data.organizedContent;
      renderModalContent(section);
      if (modal) {
        modal.classList.remove('hidden');
        activateFocusTrap(modal);
      }
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
  if (modal) {
    releaseFocusTrap(modal);
    modal.classList.add('hidden');
  }
  state.currentSection = null;
}

/** Current stored value for a field, in the form the editor displays it. */
function fieldValue(sectionKey: string, field: SectionField): string {
  const storage = storageSectionFor(sectionKey, field);
  const raw = state.contentData[storage]?.[field.key]?.value as string | undefined;

  if (field.serialize === 'lines') {
    try {
      const parsed = JSON.parse(raw || '[]');
      return Array.isArray(parsed) ? parsed.join('\n') : '';
    } catch {
      return '';
    }
  }

  if (raw === undefined && field.type === 'checkbox') {
    return field.defaultValue ?? 'true';
  }

  return raw ?? '';
}

const UPLOAD_ICON =
  '<svg class="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>';

const VIDEO_ICON =
  '<svg class="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>';

/**
 * Renders one field from the shared section schema (src/lib/sections.ts).
 * Every branch escapes the stored value: it is admin-authored, but it still
 * lands in an HTML context.
 */
function renderField(sectionKey: string, field: SectionField): string {
  const value = fieldValue(sectionKey, field);
  const inputId = `modal-${sectionKey}-${field.key}`;
  const placeholder = escapeHtml(placeholderFor(sectionKey, field));
  const label = escapeHtml(field.label);
  const dataAttrs = `data-section="${escapeHtml(storageSectionFor(sectionKey, field))}" data-key="${escapeHtml(field.key)}"${
    field.serialize ? ` data-serialize="${escapeHtml(field.serialize)}"` : ''
  }`;

  switch (field.type) {
    case 'info':
      return `
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p class="text-sm text-blue-800">${escapeHtml(field.message)}</p>
        </div>
      `;

    case 'checkbox':
      return `
        <div class="flex items-center p-4 bg-gray-50 rounded-lg">
          <input
            type="checkbox"
            id="${inputId}"
            ${value === 'true' ? 'checked' : ''}
            ${dataAttrs}
            class="w-5 h-5 text-indigo-600 border-gray-300 rounded-sm focus:ring-indigo-500"
          />
          <label for="${inputId}" class="ml-3 text-sm font-medium text-gray-700">
            ${label}
          </label>
        </div>
      `;

    case 'image':
    case 'video': {
      const isVideo = field.type === 'video';
      return `
        <div>
          <label for="${inputId}" class="block text-sm font-medium text-gray-700 mb-2">
            ${label}
          </label>
          <div class="flex gap-2">
            <input
              type="text"
              id="${inputId}"
              value="${escapeHtml(value)}"
              ${dataAttrs}
              class="min-w-0 flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-900"
              placeholder="${placeholder}"
            />
            <button
              type="button"
              data-upload-target="${inputId}"
              data-upload-kind="${isVideo ? 'video' : 'image'}"
              class="shrink-0 px-4 py-2 ${isVideo ? 'bg-purple-600 hover:bg-purple-700' : 'bg-blue-600 hover:bg-blue-700'} text-white rounded-md transition-colors flex items-center whitespace-nowrap"
            >
              ${isVideo ? VIDEO_ICON + 'Upload Video' : UPLOAD_ICON + 'Upload'}
            </button>
          </div>
          <input type="file" id="${inputId}-file" accept="${isVideo ? 'video/*' : 'image/*'}" class="hidden" />
          <p class="mt-1 text-xs text-gray-500">
            ${
              isVideo
                ? `You can upload a video under ${MAX_UPLOAD_LABEL}, or upload a larger one to Cloudinary and paste its URL here`
                : `You can paste a Cloudinary URL or upload a new image (max ${MAX_UPLOAD_LABEL})`
            }
          </p>
        </div>
      `;
    }

    case 'reorder_gallery': {
      const images = (state.memorialData.images || []) as Array<{ src: string; alt?: string }>;
      const gridHtml = images
        .map(
          (img, idx) => `
        <div class="reorder-item relative bg-white rounded-lg shadow-md overflow-hidden cursor-move hover:shadow-lg transition-shadow"
             draggable="true" data-index="${idx}" data-image-url="${escapeHtml(img.src)}">
          <div class="aspect-square overflow-hidden bg-warm-gray-200">
            <img src="${escapeHtml(img.src)}" alt="${escapeHtml(img.alt || '')}" class="w-full h-full object-cover" />
          </div>
          <div class="absolute top-2 left-2 bg-black/60 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
            ${idx + 1}
          </div>
        </div>
      `
        )
        .join('');

      return `
        <div class="mt-6 border-t border-gray-200 pt-6">
          <label class="block text-sm font-medium text-gray-700 mb-4">${label}</label>
          <div id="reorderList" class="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-2">
            ${gridHtml}
          </div>
          <p class="text-xs text-gray-500">Drag and drop images to reorder them. Changes are saved when you click "Save Changes".</p>
        </div>
      `;
    }

    case 'textarea':
      return `
        <div>
          <label for="${inputId}" class="block text-sm font-medium text-gray-700 mb-2">
            ${label}
          </label>
          <textarea
            id="${inputId}"
            rows="${field.rows || 4}"
            ${dataAttrs}
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-900"
            placeholder="${placeholder}"
          >${escapeHtml(value)}</textarea>
        </div>
      `;

    default:
      return `
        <div>
          <label for="${inputId}" class="block text-sm font-medium text-gray-700 mb-2">
            ${label}
          </label>
          <input
            type="${field.type}"
            id="${inputId}"
            value="${escapeHtml(value)}"
            ${dataAttrs}
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-900"
            placeholder="${placeholder}"
          />
        </div>
      `;
  }
}

export function renderModalContent(section: string) {
  // ... (keep existing implementation)
  const modalContent = document.getElementById('modalContent');
  if (!modalContent) return;

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
            <button type="button" data-upload-target="service-agendaUrl" data-upload-kind="agenda"
              class="shrink-0 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors flex items-center whitespace-nowrap">
              <svg class="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path>
              </svg>
              Upload
            </button>
          </div>
          <input type="file" id="service-agendaUrl-file" accept="image/*,application/pdf" class="hidden" />
          <p class="mt-1 text-xs text-gray-500">You can paste a URL directly or upload an image/PDF file (max ${MAX_UPLOAD_LABEL}).</p>
        </div>
      </div>
    `;
    return;
  }

  const definition = SECTIONS[section];
  if (!definition) {
    modalContent.innerHTML = '<div class="text-red-600">Unknown section</div>';
    return;
  }

  modalContent.innerHTML = definition.fields.map((field) => renderField(section, field)).join('');

  // Attach event listeners to new elements for reordering
  const reorderItems = modalContent.querySelectorAll<HTMLElement>('.reorder-item');
  reorderItems.forEach((item) => {
    item.addEventListener('dragstart', handleDragStart as any);
    item.addEventListener('dragover', handleDragOver as any);
    item.addEventListener('drop', handleDrop as any);
    item.addEventListener('dragend', handleDragEnd as any);
  });
}

/**
 * Wires the hidden file input next to `inputId` so picking a file uploads it
 * and drops the resulting URL into the text field.
 *
 * All three upload buttons (portrait, video, service agenda) share this, so
 * they report failures the same way instead of the previous mix of toasts,
 * alerts, and swallowed error details.
 */
function wireUploadForField(inputId: string, options: { folder: string; noun: string }) {
  const fileInput = document.getElementById(`${inputId}-file`) as HTMLInputElement | null;
  const textInput = document.getElementById(inputId) as HTMLInputElement | null;

  if (!fileInput || !textInput) return;

  fileInput.click();

  fileInput.onchange = async (e: Event) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;

    const originalValue = textInput.value;
    textInput.value = `Uploading ${formatBytes(file.size)}...`;
    textInput.disabled = true;

    try {
      const { url } = await uploadToMediaLibrary(file, options.folder);
      textInput.value = url;
      showToast(
        `${options.noun} uploaded successfully! Click "Save Changes" to apply it.`,
        'success'
      );
    } catch (error) {
      console.error(`${options.noun} upload failed:`, error);
      textInput.value = originalValue;
      showToast(
        error instanceof Error ? error.message : `Failed to upload ${options.noun}.`,
        'error'
      );
    } finally {
      textInput.disabled = false;
      fileInput.value = '';
    }
  };
}

export function uploadImageForField(inputId: string) {
  wireUploadForField(inputId, {
    folder: `memorials/${getActiveMemorialSlug()}/portraits`,
    noun: 'Image',
  });
}

export function uploadVideoForField(inputId: string) {
  wireUploadForField(inputId, {
    folder: `memorials/${getActiveMemorialSlug()}/videos`,
    noun: 'Video',
  });
}

export async function saveAllModalContent() {
  // ... (keep existing implementation)
  if (!state.currentSection) return;

  // Handle individual service editing
  if (state.currentSection.startsWith('service-')) {
    // ... (keep existing service saving logic) ...
    const serviceIndex = parseInt(state.currentSection.split('-')[1]);
    const modalContent = document.getElementById('modalContent');
    if (!modalContent) return;
    const inputs = modalContent.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>(
      'input, textarea'
    );

    const serviceData: Record<string, any> = {};
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
        closeEditModal();
        reloadWithFlash('Service updated successfully!');
      } else {
        throw new Error(result.error || 'Failed to save service');
      }
    } catch (error) {
      console.error('Error saving service:', error);
      window.showToast('Error saving service. Please try again.', 'error');
    }
    return;
  }

  const modalContent = document.getElementById('modalContent');
  if (!modalContent) return;
  const inputs = modalContent.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>(
    'input:not([type="file"]):not(.hidden), textarea'
  );

  // data-section / data-key / data-serialize are written by renderField from
  // the shared schema, so this loop needs no per-section knowledge.
  const updates: Array<{ section: string; key: string; value: string }> = [];

  inputs.forEach((input) => {
    const section = input.dataset.section;
    const key = input.dataset.key;
    if (!section || !key) return;

    let value =
      input.type === 'checkbox'
        ? (input as HTMLInputElement).checked
          ? 'true'
          : 'false'
        : input.value;

    if (input.dataset.serialize === 'lines') {
      value = JSON.stringify(
        value
          .split('\n')
          .map((line) => line.trim())
          .filter(Boolean)
      );
    }

    updates.push({ section, key, value });
  });

  // Gallery reordering posts to its own endpoint.
  const reorderItems = Array.from(modalContent.querySelectorAll<HTMLElement>('.reorder-item'));

  if (updates.length === 0 && reorderItems.length === 0) {
    showToast('Error: No valid fields to save', 'error');
    return;
  }

  try {
    const requests: Array<Promise<{ success?: boolean; error?: string }>> = [];

    // One request for the whole section: the endpoint writes them in a single
    // transaction, so a section can no longer be left half-saved.
    if (updates.length > 0) {
      requests.push(
        fetch('/api/admin/content', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ memorialSlug: getActiveMemorialSlug(), updates }),
        }).then((r) => r.json())
      );
    }

    reorderItems.forEach((item, displayOrder) => {
      requests.push(
        fetch('/api/gallery/update-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imagePath: item.dataset.imageUrl,
            displayOrder,
            memorialSlug: getActiveMemorialSlug(),
          }),
        }).then((r) => r.json())
      );
    });

    const results = await Promise.all(requests);
    if (!results.every((r) => r.success)) {
      throw new Error('Some updates failed');
    }

    closeEditModal();
    reloadWithFlash('Changes saved successfully!');
  } catch (error) {
    console.error('Error saving content:', error);
    showToast('Error saving changes. Please try again.', 'error');
  }
}

export function uploadAgendaForField(inputId: string) {
  wireUploadForField(inputId, {
    folder: `memorials/${getActiveMemorialSlug()}/agendas`,
    noun: 'Agenda',
  });
}
