// Shared mutable state for the admin editor modules.
export const state = {
  currentSection: null,
  contentData: {},
  memorialData: {},
  memorialDataLoaded: false,
  draggedItem: null, // For gallery reordering
};

export function getActiveMemorialSlug() {
  if (window.__MEMORIAL_SLUG__) {
    return window.__MEMORIAL_SLUG__;
  }
  const match = window.location.pathname.match(/^\/memorials\/([^/]+)/);
  return match ? decodeURIComponent(match[1]) : 'default';
}

export function loadMemorialData() {
  if (state.memorialDataLoaded) return true;

  try {
    const memorialDataScript = document.getElementById('memorial-data');
    if (memorialDataScript) {
      state.memorialData = JSON.parse(memorialDataScript.textContent);
      state.memorialDataLoaded = true;

      // Nav-link visibility sync happens at the call sites (entry init and
      // modal open) to keep this module free of UI dependencies.
      return true;
    } else {
      console.error('Memorial data script not found');
      return false;
    }
  } catch (e) {
    console.error('Failed to parse memorial data:', e);
    return false;
  }
}

