function initAdminToolbar(toolbar) {
  if (!toolbar || toolbar.dataset.toolbarInitialized === 'true') return;
  toolbar.dataset.toolbarInitialized = 'true';

  const toolbarId = toolbar.id || 'toolbar';
  const controlsId = toolbar.dataset.toolbarControlsId || '';
  const minimizeId = toolbar.dataset.toolbarMinimizeId || '';
  const draggable = toolbar.dataset.toolbarDraggable === 'true';
  const controls =
    (controlsId && document.getElementById(controlsId)) ||
    toolbar.querySelector('[data-admin-toolbar-controls="true"]');
  const minimizeBtn =
    (minimizeId && document.getElementById(minimizeId)) ||
    toolbar.querySelector('[data-admin-toolbar-minimize="true"]');

  const xKey = `toolbar:${toolbarId}:x`;
  const yKey = `toolbar:${toolbarId}:y`;
  const minKey = `toolbar:${toolbarId}:minimized`;

  let xOffset = Number(localStorage.getItem(xKey) || '0');
  let yOffset = Number(localStorage.getItem(yKey) || '0');
  if (xOffset || yOffset) {
    toolbar.style.transform = `translate3d(${xOffset}px, ${yOffset}px, 0)`;
  }

  if (draggable) {
    let initialX = 0;
    let initialY = 0;
    let rafPending = false;
    let currentX = xOffset;
    let currentY = yOffset;

    toolbar.style.userSelect = 'none';
    toolbar.style.webkitUserSelect = 'none';
    toolbar.style.cursor = 'move';
    toolbar.style.touchAction = 'none';
    toolbar.style.transition = 'none';

    const getCoordinates = (event) => {
      if (event.type.includes('touch')) {
        return {
          clientX: event.touches?.[0]?.clientX || event.changedTouches?.[0]?.clientX || 0,
          clientY: event.touches?.[0]?.clientY || event.changedTouches?.[0]?.clientY || 0,
        };
      }
      return { clientX: event.clientX, clientY: event.clientY };
    };

    const drag = (event) => {
      if (event.type === 'touchmove') event.preventDefault();
      const coords = getCoordinates(event);
      currentX = coords.clientX - initialX;
      currentY = coords.clientY - initialY;
      xOffset = currentX;
      yOffset = currentY;

      if (!rafPending) {
        rafPending = true;
        requestAnimationFrame(() => {
          toolbar.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
          rafPending = false;
        });
      }
    };

    const dragEnd = () => {
      document.removeEventListener('mousemove', drag);
      document.removeEventListener('touchmove', drag);
      document.removeEventListener('mouseup', dragEnd);
      document.removeEventListener('touchend', dragEnd);
      document.body.style.userSelect = '';
      document.body.style.webkitUserSelect = '';
      toolbar.style.willChange = 'auto';
      localStorage.setItem(xKey, String(xOffset));
      localStorage.setItem(yKey, String(yOffset));
    };

    const dragStart = (event) => {
      if (event.target.closest('button, input, a, label')) return;
      if (controls && event.type === 'touchstart' && event.target.closest(`#${controls.id}`)) return;
      const coords = getCoordinates(event);
      initialX = coords.clientX - xOffset;
      initialY = coords.clientY - yOffset;
      toolbar.style.willChange = 'transform';
      document.body.style.userSelect = 'none';
      document.body.style.webkitUserSelect = 'none';
      document.addEventListener('mousemove', drag, { passive: true });
      document.addEventListener('touchmove', drag, { passive: false });
      document.addEventListener('mouseup', dragEnd);
      document.addEventListener('touchend', dragEnd);
      if (event.type === 'touchstart') event.preventDefault();
    };

    toolbar.addEventListener('mousedown', dragStart);
    toolbar.addEventListener('touchstart', dragStart, { passive: false });
  }

  if (minimizeBtn && controls) {
    let isMinimized = localStorage.getItem(minKey) === 'true';
    const setState = () => {
      if (isMinimized) {
        controls.style.maxWidth = '0px';
        controls.style.paddingRight = '0px';
        controls.style.opacity = '0';
        minimizeBtn.innerHTML =
          '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>';
      } else {
        controls.style.maxWidth = '300px';
        controls.style.paddingRight = '1rem';
        controls.style.opacity = '1';
        minimizeBtn.innerHTML =
          '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg>';
      }
      localStorage.setItem(minKey, String(isMinimized));
    };

    setState();
    minimizeBtn.addEventListener('click', (event) => {
      event.stopPropagation();
      isMinimized = !isMinimized;
      setState();
    });
  }
}

function initAllAdminToolbars() {
  const toolbars = document.querySelectorAll('[data-admin-toolbar="true"]');
  toolbars.forEach((toolbar) => initAdminToolbar(toolbar));
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAllAdminToolbars);
} else {
  initAllAdminToolbars();
}

// Re-initialize toolbars after Astro client-side route transitions.
document.addEventListener('astro:page-load', initAllAdminToolbars);
document.addEventListener('astro:after-swap', initAllAdminToolbars);
