// Drag & drop handlers for gallery reordering inside the edit modal.
import { state } from './state.js';

// --- Drag & Drop Functions for Gallery ---

export function handleDragStart(e) {
  state.draggedItem = e.target;
  state.draggedItem.classList.add('opacity-50');
  e.dataTransfer.effectAllowed = 'move';
}

export function handleDragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';

  const target = e.target.closest('.reorder-item');
  if (target && target !== state.draggedItem) {
    target.classList.add('ring-2', 'ring-blue-500');
  }
}

export function handleDrop(e) {
  e.preventDefault();

  const target = e.target.closest('.reorder-item');
  const container = document.getElementById('reorderList');

  if (target && target !== state.draggedItem && state.draggedItem && container) {
    // Swap in DOM
    const parent = target.parentNode;

    // Get all items to find indexes
    const allItems = Array.from(container.querySelectorAll('.reorder-item'));
    const draggedIndex = allItems.indexOf(state.draggedItem);
    const targetIndex = allItems.indexOf(target);

    if (draggedIndex < targetIndex) {
      parent.insertBefore(state.draggedItem, target.nextSibling);
    } else {
      parent.insertBefore(state.draggedItem, target);
    }

    // Update indices in UI
    const updatedItems = container.querySelectorAll('.reorder-item');
    updatedItems.forEach((item, idx) => {
      item.dataset.index = idx.toString();
      const numberBadge = item.querySelector('.bg-black\\/60');
      if (numberBadge) numberBadge.textContent = (idx + 1).toString();
    });
  }

  target?.classList.remove('ring-2', 'ring-blue-500');
}

export function handleDragEnd(e) {
  state.draggedItem?.classList.remove('opacity-50');

  // Remove all ring highlights
  const allItems = document.querySelectorAll('.reorder-item');
  allItems.forEach((item) => {
    item.classList.remove('ring-2', 'ring-blue-500');
  });

  state.draggedItem = null;
}

