/* eslint-disable no-undef */
// Biography expand/collapse functionality
export function initBiographyToggle() {
  const bioContent = document.getElementById('bio-content');
  const bioToggle = document.getElementById('bio-toggle');
  const bioToggleText = document.getElementById('bio-toggle-text');
  const bioFade = document.getElementById('bio-fade');
  const chevronDown = document.getElementById('bio-chevron-down');
  const chevronUp = document.getElementById('bio-chevron-up');
  const bioSection = document.getElementById('biography');

  if (!bioContent || !bioToggle || !bioToggleText || !bioFade) return;

  let isExpanded = false;
  const collapsedHeight = 400; // pixels
  let toggleHandler: EventListenerOrEventListenerObject | null = null;

  // Function to check if content needs truncation
  function checkTruncation() {
    if (!bioContent) return false;

    const contentHeight = bioContent.scrollHeight;
    const needsTruncation = contentHeight > collapsedHeight + 50; // Add buffer

    if (needsTruncation) {
      // Show the toggle button
      if (bioToggle) bioToggle.style.display = 'inline-flex';
      if (bioFade) bioFade.style.display = 'block';
    } else {
      // Content is short, remove max-height, hide button and fade
      bioContent.style.maxHeight = 'none';
      if (bioToggle) bioToggle.style.display = 'none';
      if (bioFade) bioFade.style.display = 'none';
    }

    return needsTruncation;
  }

  // Initial check
  const needsTruncation = checkTruncation();

  if (needsTruncation && bioToggle) {
    // Remove old handler if it exists (for re-initialization)
    if (toggleHandler) {
      bioToggle.removeEventListener('click', toggleHandler);
    }

    // Handle toggle click
    toggleHandler = () => {
      if (!bioContent) return;

      isExpanded = !isExpanded;

      if (isExpanded) {
        const contentHeight = bioContent.scrollHeight;
        bioContent.style.maxHeight = contentHeight + 'px';
        if (bioToggleText) bioToggleText.textContent = 'Show Less';
        if (bioFade) bioFade.style.opacity = '0';
        chevronDown?.classList.add('hidden');
        chevronUp?.classList.remove('hidden');
      } else {
        bioContent.style.maxHeight = collapsedHeight + 'px';
        if (bioToggleText) bioToggleText.textContent = 'Continue Reading';
        if (bioFade) bioFade.style.opacity = '1';
        chevronDown?.classList.remove('hidden');
        chevronUp?.classList.add('hidden');

        // Scroll back to biography section smoothly
        if (bioSection) {
          requestAnimationFrame(() => {
            bioSection.scrollIntoView({
              behavior: 'smooth',
              block: 'start',
            });
          });
        }
      }
    };

    bioToggle.addEventListener('click', toggleHandler);
  }
}

// Initialize on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initBiographyToggle);
} else {
  initBiographyToggle();
}
