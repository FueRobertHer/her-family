interface EditorState {
  currentSection: string | null;
  contentData: Record<string, any>;
  memorialData: Record<string, any>;
  memorialDataLoaded: boolean;
  draggedItem: HTMLElement | null;
}

// Shared mutable state for the admin editor modules.
export const state: EditorState = {
  currentSection: null,
  contentData: {},
  memorialData: {},
  memorialDataLoaded: false,
  draggedItem: null, // For gallery reordering
};

export function getActiveMemorialSlug(): string {
  // Rendered onto <main> by the memorial page. Previously this arrived via an
  // inline `window.__MEMORIAL_SLUG__ =` script, which forced 'unsafe-inline'.
  const fromDom = document.querySelector<HTMLElement>('[data-memorial-slug]')?.dataset.memorialSlug;
  if (fromDom) return fromDom;

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
