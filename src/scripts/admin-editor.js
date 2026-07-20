// Admin Editor entry point.
// The previous 1,950-line monolith is split by concern into ./admin-editor/*:
//   state.js         shared mutable state + memorial data loading
//   helpers.js       DOM/utility helpers (visibility, slugs, toasts)
//   page-updaters.js applying saved content to the live page
//   gallery-dnd.js   gallery drag & drop reordering
//   modal.js         edit modal rendering, uploads, save
// This file wires window globals (used by inline onclick handlers) and init.

import { state, loadMemorialData } from './admin-editor/state.js';
import {
  toggleEditButtons,
  restoreHiddenSections,
  initNavLinksVisibility,
} from './admin-editor/helpers.js';
import { recheckBiographyTruncation } from './admin-editor/page-updaters.js';
import {
  openEditModal,
  closeEditModal,
  uploadImageForField,
  uploadVideoForField,
  uploadAgendaForField,
  saveAllModalContent,
} from './admin-editor/modal.js';

// --- Event Listeners & Initialization ---

// Attach functions to window for HTML event handlers
window.toggleEditButtons = toggleEditButtons;
window.restoreHiddenSections = restoreHiddenSections;
window.openEditModal = openEditModal;
window.closeEditModal = closeEditModal;
window.uploadImageForField = uploadImageForField;
window.uploadVideoForField = uploadVideoForField;
window.uploadAgendaForField = uploadAgendaForField;
window.saveAllModalContent = saveAllModalContent;
window.recheckBiographyTruncation = recheckBiographyTruncation;

function initAdminEditor() {
  const memorialDataScript = document.getElementById('memorial-data');
  if (!memorialDataScript || memorialDataScript.dataset.initialized === 'true') {
    return;
  }
  memorialDataScript.dataset.initialized = 'true';

  const editModeToggle = document.getElementById('editModeToggle');

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

      localStorage.setItem('editModeEnabled', isEnabled);
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

// Close modal when clicking outside
document.getElementById('editModal')?.addEventListener('click', (e) => {
  if (e.target.id === 'editModal') {
    closeEditModal();
  }
});

