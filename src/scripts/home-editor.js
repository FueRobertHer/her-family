function initHomeEditor() {
  const dataScript = document.getElementById('home-editor-data');
  if (!dataScript) {
    // Home editor is only rendered for authenticated admins.
    return;
  }

  if (dataScript.dataset.initialized === 'true') {
    return;
  }
  dataScript.dataset.initialized = 'true';

  const initial = JSON.parse(dataScript.textContent || '{}');
  const memorialSlug = initial.memorialSlug;

  const openBtn = document.getElementById('openHomeEditor');
  const modal = document.getElementById('homeEditorModal');
  const closeBtn = document.getElementById('closeHomeEditor');
  const cancelBtn = document.getElementById('cancelHomeEditor');
  const saveBtn = document.getElementById('saveHomeEditor');
  const messageEl = document.getElementById('homeEditorMessage');

  const eyebrowInput = document.getElementById('home-eyebrow-input');
  const titleInput = document.getElementById('home-title-input');
  const descriptionInput = document.getElementById('home-description-input');

  const eyebrowEl = document.getElementById('homeEyebrow');
  const titleEl = document.getElementById('homeTitle');
  const descriptionEl = document.getElementById('homeDescription');

  function setModalVisibility(show) {
    if (!modal) return;
    if (show) {
      modal.classList.remove('hidden');
      modal.classList.add('flex');
    } else {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
  }

  function setMessage(text, isError = false) {
    if (!messageEl) return;
    messageEl.textContent = text;
    messageEl.classList.remove('hidden', 'text-red-600', 'text-green-600');
    messageEl.classList.add(isError ? 'text-red-600' : 'text-green-600');
  }

  function hydrateInputs() {
    if (eyebrowInput) eyebrowInput.value = initial.homeEyebrow || '';
    if (titleInput) titleInput.value = initial.homeTitle || '';
    if (descriptionInput) descriptionInput.value = initial.homeDescription || '';
    if (messageEl) messageEl.classList.add('hidden');
  }

  async function saveField(key, value) {
    const response = await fetch('/api/admin/content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        memorialSlug,
        section: 'home',
        key,
        value,
        type: 'text',
      }),
    });

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error || `Failed to save ${key}`);
    }
  }

  async function saveAll() {
    if (!memorialSlug) {
      setMessage('Missing memorial context. Please refresh.', true);
      return;
    }

    const eyebrow = eyebrowInput?.value?.trim() || '';
    const title = titleInput?.value?.trim() || '';
    const description = descriptionInput?.value?.trim() || '';

    saveBtn?.setAttribute('disabled', 'true');
    try {
      await Promise.all([
        saveField('eyebrow', eyebrow),
        saveField('title', title),
        saveField('description', description),
      ]);

      initial.homeEyebrow = eyebrow;
      initial.homeTitle = title;
      initial.homeDescription = description;

      if (eyebrowEl) eyebrowEl.textContent = eyebrow;
      if (titleEl) titleEl.textContent = title;
      if (descriptionEl) descriptionEl.textContent = description;

      setMessage('Home content saved successfully.');
      setTimeout(() => setModalVisibility(false), 600);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to save home content.', true);
    } finally {
      saveBtn?.removeAttribute('disabled');
    }
  }

  openBtn?.addEventListener('click', () => {
    hydrateInputs();
    setModalVisibility(true);
  });
  closeBtn?.addEventListener('click', () => setModalVisibility(false));
  cancelBtn?.addEventListener('click', () => setModalVisibility(false));
  saveBtn?.addEventListener('click', saveAll);
  modal?.addEventListener('click', (event) => {
    if (event.target === modal) setModalVisibility(false);
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initHomeEditor);
} else {
  initHomeEditor();
}

document.addEventListener('astro:page-load', initHomeEditor);
document.addEventListener('astro:after-swap', initHomeEditor);
