// Admin Editor entry point.
// The previous 1,950-line monolith is split by concern into ./admin-editor/*:
//   state.js         shared mutable state + memorial data loading
//   helpers.js       DOM/utility helpers (visibility, slugs, toasts)
//   gallery-dnd.js   gallery drag & drop reordering
//   modal.js         edit modal rendering, uploads, save
// Field definitions come from src/lib/sections.ts, shared with the server.
// This file wires up initialization and the delegated click handling that
// replaced the editor's inline onclick attributes.

import { state, loadMemorialData } from './admin-editor/state.ts';
import {
  toggleEditButtons,
  restoreHiddenSections,
  initNavLinksVisibility,
} from './admin-editor/helpers.ts';
import {
  openEditModal,
  closeEditModal,
  uploadImageForField,
  uploadVideoForField,
  uploadAgendaForField,
  saveAllModalContent,
  showPendingFlash,
} from './admin-editor/modal.ts';

// --- Event Listeners & Initialization ---

function initAdminEditor() {
  const memorialDataScript = document.getElementById('memorial-data');
  if (!memorialDataScript || memorialDataScript.dataset.initialized === 'true') {
    return;
  }
  memorialDataScript.dataset.initialized = 'true';

  // A save reloads the page; surface its confirmation once we are back.
  showPendingFlash();

  const editModeToggle = document.getElementById('editModeToggle') as HTMLInputElement | null;

  state.memorialData = {};
  state.memorialDataLoaded = false;

  // Try to load immediately
  if (loadMemorialData()) initNavLinksVisibility();

  const savedEditMode = localStorage.getItem('editModeEnabled');

  if (savedEditMode === 'false') {
    document.body.classList.add('hide-edit-buttons');
    setTimeout(() => toggleEditButtons(false), 100);

    if (editModeToggle) editModeToggle.checked = false;
  }

  if (editModeToggle) {
    editModeToggle.addEventListener('change', function () {
      const isEnabled = this.checked;

      if (isEnabled) {
        restoreHiddenSections();
        toggleEditButtons(true);
      } else {
        toggleEditButtons(false);
      }

      localStorage.setItem('editModeEnabled', String(isEnabled));
    });
  }

  // Admin toolbar drag/minimize behavior is now shared via src/scripts/admin-toolbar.js
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAdminEditor);
} else {
  initAdminEditor();
}

document.addEventListener('astro:page-load', initAdminEditor);
document.addEventListener('astro:after-swap', initAdminEditor);

// Close modal on Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && state.currentSection) {
    closeEditModal();
  }
});

// All editor buttons are wired here through delegation. Inline onclick
// attributes would require 'unsafe-inline' in script-src for the whole site,
// and delegation also survives view transitions without re-binding.
document.addEventListener('click', (event) => {
  const target = event.target as HTMLElement;

  const editTrigger = target.closest<HTMLElement>('[data-edit-section]');
  if (editTrigger?.dataset.editSection) {
    openEditModal(editTrigger.dataset.editSection);
    return;
  }

  const uploadTrigger = target.closest<HTMLElement>('[data-upload-target]');
  if (uploadTrigger?.dataset.uploadTarget) {
    const fieldId = uploadTrigger.dataset.uploadTarget;
    switch (uploadTrigger.dataset.uploadKind) {
      case 'video':
        uploadVideoForField(fieldId);
        break;
      case 'agenda':
        uploadAgendaForField(fieldId);
        break;
      default:
        uploadImageForField(fieldId);
    }
    return;
  }

  if (target.closest('[data-modal-save="editModal"]')) {
    saveAllModalContent();
    return;
  }

  if (target.closest('[data-modal-close="editModal"]')) {
    closeEditModal();
    return;
  }

  // Click on the backdrop itself dismisses the modal.
  if (target.id === 'editModal') {
    closeEditModal();
  }
});
