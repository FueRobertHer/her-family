// Admin Editor Script
// Handles inline editing, modal management, and content updates

// Global state
let currentSection = null;
let contentData = {};
let memorialData = {};
let memorialDataLoaded = false;
let draggedItem = null; // For gallery reordering
const memorialSlug =
  window.__MEMORIAL_SLUG__ ||
  (() => {
    const match = window.location.pathname.match(/^\/memorials\/([^/]+)/);
    return match ? decodeURIComponent(match[1]) : 'default';
  })();

// --- Helper Functions ---

// Create URL-friendly slug
function createSlug(text) {
  if (!text) return '';
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-'); // Replace multiple hyphens with single hyphen
}

// Generate agenda URL with memorial name and service type
function generateAgendaUrl(serviceIndex, serviceType) {
  const memorialName = memorialData?.name || '';
  const memorialSlug = createSlug(memorialName);
  const serviceSlug = createSlug(serviceType);

  let url = `/agenda/${serviceIndex}`;
  if (memorialSlug) url += `-${memorialSlug}`;
  if (serviceSlug) url += `-${serviceSlug}`;

  return url;
}

// Utility function to escape HTML and prevent XSS
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };
  return String(text).replace(/[&<>"'/]/g, (char) => map[char]);
}

function updateNavLinkVisibility(href, isVisible) {
  const link = document.querySelector(`nav a[href="${href}"]`);
  if (!link) return;

  const isHidden = isVisible === false || isVisible === 'false';

  if (isHidden) {
    link.classList.add('is-hidden-section');
    // If edit mode is OFF (preview mode), hide the link
    if (document.body.classList.contains('hide-edit-buttons')) {
      link.style.display = 'none';
    } else {
      // In edit mode, show it but with opacity to indicate it's hidden public-side
      link.style.display = '';
      link.classList.add('opacity-50');
    }
  } else {
    link.classList.remove('is-hidden-section');
    link.classList.remove('opacity-50');
    link.style.display = '';
  }
}

function toggleEditButtons(show) {
  const body = document.body;
  const sections = document.querySelectorAll('[class*="border-dashed"]');
  const hiddenLinks = document.querySelectorAll('.is-hidden-section');

  if (show) {
    body.classList.remove('hide-edit-buttons');
    // Show hidden sections (opacity and border)
    sections.forEach((section) => {
      section.classList.add('opacity-60', 'opacity-70', 'border-2', 'border-dashed');
      // Add back 'Hidden from public' badge if it was hidden
      const badge = section.querySelector('.hidden-badge');
      if (badge) badge.style.display = 'block';
    });

    // Show hidden links with opacity
    hiddenLinks.forEach((link) => {
      link.style.display = '';
      link.classList.add('opacity-50');
    });
  } else {
    body.classList.add('hide-edit-buttons');
    // Completely hide sections that are marked as hidden
    sections.forEach((section) => {
      // If this section has opacity/dashed border, it means it's hidden from public
      // So in preview mode, we should hide it completely (display: none)
      if (section.classList.contains('opacity-60') || section.classList.contains('opacity-70')) {
        section.classList.add('hidden-in-preview');
        section.style.display = 'none';
      }
    });

    // Hide hidden links completely
    hiddenLinks.forEach((link) => {
      link.style.display = 'none';
    });
  }
}

function restoreHiddenSections() {
  const hiddenSections = document.querySelectorAll('.hidden-in-preview');
  hiddenSections.forEach((section) => {
    section.style.display = ''; // Restore default display
    section.classList.remove('hidden-in-preview');
  });
}

function loadMemorialData() {
  if (memorialDataLoaded) return true;

  try {
    const memorialDataScript = document.getElementById('memorial-data');
    if (memorialDataScript) {
      memorialData = JSON.parse(memorialDataScript.textContent);
      memorialDataLoaded = true;

      // Initialize nav links visibility based on loaded data
      initNavLinksVisibility();

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

function initNavLinksVisibility() {
  if (!memorialData) return;

  // Map of section hrefs to their visibility property in memorialData
  const links = [
    { href: '#biography', visible: memorialData.biographyVisible },
    { href: '#funeral-info', visible: memorialData.funeralInfo?.visible },
    { href: '#gallery', visible: memorialData.galleryVisible },
    { href: '#video', visible: memorialData.videoVisible },
    { href: '#memories', visible: memorialData.commentsVisible },
    { href: '#donations', visible: memorialData.donations?.visible },
  ];

  links.forEach((item) => {
    if (item.visible !== undefined) {
      updateNavLinkVisibility(item.href, item.visible);
    }
  });
}

function showToast(message, type) {
  const toast = document.createElement('div');
  toast.className = `fixed top-20 right-4 z-50 px-6 py-3 rounded-lg shadow-lg text-white ${
    type === 'success' ? 'bg-green-500' : 'bg-red-500'
  }`;
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3000);
}

// --- Section Update Functions ---

function updateHeroSection(updates) {
  const heroSection = document.getElementById('hero-section');
  if (!heroSection) return;

  if (updates.name !== undefined) {
    const nameEl = heroSection.querySelector('[data-hero-name]');
    if (nameEl) nameEl.textContent = updates.name;
    const footerName = document.querySelector('footer h3');
    if (footerName) footerName.textContent = updates.name;
    document.title = `${updates.name} - Memorial Page`;
  }

  if (updates.subtitle !== undefined) {
    const subtitleEl = heroSection.querySelector('[data-hero-subtitle]');
    if (subtitleEl) subtitleEl.textContent = updates.subtitle;
  }

  if (updates.birthDate || updates.deathDate) {
    const birthDate = updates.birthDate || contentData.hero?.birthDate?.value;
    const deathDate = updates.deathDate || contentData.hero?.deathDate?.value;

    const datesEl = heroSection.querySelector('[data-hero-dates]');
    if (datesEl && birthDate && deathDate) {
      const birthYear = new Date(birthDate).getFullYear();
      const deathYear = new Date(deathDate).getFullYear();
      datesEl.innerHTML = `<time datetime="${escapeHtml(birthDate)}">${escapeHtml(birthYear)}</time><span class="w-8 h-px bg-warm-gray-400"></span><time datetime="${escapeHtml(deathDate)}">${escapeHtml(deathYear)}</time>`;

      const footerDates = document.querySelector('footer p.text-warm-gray-400');
      if (footerDates) footerDates.textContent = `${birthYear} - ${deathYear}`;
    }
  }

  if (updates.mainImage !== undefined) {
    const imgEls = heroSection.querySelectorAll('[data-hero-image], img[data-hero-image]');
    imgEls.forEach((img) => {
      img.src = updates.mainImage;
    });

    // Also update background if no specific background image is set
    if (!updates.backgroundImage && !contentData.hero?.backgroundImage?.value) {
      const bgImg = heroSection.querySelector('[data-hero-background]');
      if (bgImg) bgImg.src = updates.mainImage;
    }
  }

  if (updates.backgroundImage !== undefined) {
    const bgImg = heroSection.querySelector('[data-hero-background]');
    if (bgImg) bgImg.src = updates.backgroundImage;
  }
}

function updateBiographySection(updates) {
  const bioSection = document.getElementById('biography-section');
  if (!bioSection) return;

  if (updates.visible !== undefined) {
    toggleSectionVisibility(bioSection, updates.visible);
    updateNavLinkVisibility('#biography', updates.visible);
  }

  if (updates.title !== undefined) {
    const titleEl = bioSection.querySelector('[data-bio-title]');
    if (titleEl) titleEl.textContent = updates.title;
  }

  if (updates.content !== undefined) {
    const contentEl = bioSection.querySelector('[data-bio-content]');
    if (contentEl) {
      const paragraphs = updates.content.split('\n\n').filter((p) => p.trim());
      contentEl.innerHTML = paragraphs.map((p) => `<p class="mb-6">${escapeHtml(p)}</p>`).join('');

      // Re-check if truncation button should be visible after content update
      recheckBiographyTruncation();
    }
  }
}

function recheckBiographyTruncation() {
  const bioContent = document.getElementById('bio-content');
  const bioToggle = document.getElementById('bio-toggle');
  const bioFade = document.getElementById('bio-fade');

  if (!bioContent || !bioToggle || !bioFade) return;

  const collapsedHeight = 400;

  // Reset to collapsed state first
  bioContent.style.maxHeight = collapsedHeight + 'px';

  // Force a reflow to get accurate scrollHeight
  void bioContent.offsetHeight;

  // Check if content needs truncation
  const contentHeight = bioContent.scrollHeight;
  const needsTruncation = contentHeight > collapsedHeight + 50;

  if (needsTruncation) {
    // Show the toggle button and fade
    bioToggle.style.display = 'inline-flex';
    bioFade.style.display = 'block';
    bioFade.style.opacity = '1';
  } else {
    // Content is short, remove max-height, hide button and fade
    bioContent.style.maxHeight = 'none';
    bioToggle.style.display = 'none';
    bioFade.style.display = 'none';
  }

  // Reset button text and icons to initial state
  const bioToggleText = document.getElementById('bio-toggle-text');
  const chevronDown = document.getElementById('bio-chevron-down');
  const chevronUp = document.getElementById('bio-chevron-up');

  if (bioToggleText) bioToggleText.textContent = 'Continue Reading';
  chevronDown?.classList.remove('hidden');
  chevronUp?.classList.add('hidden');
}

function updateHighlightsSection(updates) {
  const bioSection = document.getElementById('biography');
  if (!bioSection) return;

  const highlightsContainer = bioSection.querySelector('[data-bio-highlights]')?.closest('.mt-12');

  if (highlightsContainer && updates.visible !== undefined) {
    toggleSectionVisibility(highlightsContainer, updates.visible);
    highlightsContainer.style.display = 'block';
  }

  if (updates.highlights !== undefined) {
    const highlightsEl = bioSection.querySelector('[data-bio-highlights]');
    if (highlightsEl) {
      let highlightsArray;

      // Check if highlights is a JSON string or newline-separated string
      if (updates.highlights.trim().startsWith('[')) {
        // It's a JSON array string, parse it
        try {
          highlightsArray = JSON.parse(updates.highlights);
        } catch (e) {
          console.error('Failed to parse highlights JSON:', e);
          highlightsArray = [];
        }
      } else {
        // It's a newline-separated string, split it
        highlightsArray = updates.highlights.split('\n').filter((h) => h.trim());
      }

      highlightsEl.innerHTML = highlightsArray
        .map(
          (highlight) => `
        <div class="flex items-start space-x-3">
          <div class="flex-shrink-0 w-2 h-2 bg-warm-gray-400 rounded-full mt-3"></div>
          <p class="text-warm-gray-700">${escapeHtml(highlight.trim())}</p>
        </div>
      `
        )
        .join('');
    }
  }
}

function updateVideoSection(updates) {
  const videoSection = document.getElementById('video-section');
  if (!videoSection) return;

  if (updates.visible !== undefined) {
    toggleSectionVisibility(videoSection, updates.visible);
    updateNavLinkVisibility('#video', updates.visible);
  }

  if (updates.sectionTitle !== undefined) {
    const sectionTitleEl = videoSection.querySelector('[data-video-title]');
    if (sectionTitleEl) sectionTitleEl.textContent = updates.sectionTitle;
  }

  if (updates.description !== undefined) {
    const descEl = videoSection.querySelector('[data-video-description]');
    if (descEl) descEl.textContent = updates.description;
  }

  if (updates.videoUrl !== undefined) {
    const videoSource = videoSection.querySelector('[data-video-source]');
    const videoEl = videoSection.querySelector('[data-video-element]');
    if (videoSource && videoEl) {
      videoSource.src = updates.videoUrl;
      videoEl.load();
    }
  }

  if (updates.posterImage !== undefined) {
    const videoEl = videoSection.querySelector('[data-video-element]');
    if (videoEl) videoEl.poster = updates.posterImage;
  }
}

function updateDonationsSection(updates) {
  const donationsSection = document.getElementById('donations-section');
  if (!donationsSection) return;

  // Note: QR code image changes require a page refresh to fully update the layout
  // The changes ARE saved to the database, but the DOM structure changes too much
  // to update dynamically (button vs link vs div). A page refresh will show the changes.

  if (updates.visible !== undefined) {
    toggleSectionVisibility(donationsSection, updates.visible);
    updateNavLinkVisibility('#donations', updates.visible);
  }

  if (updates.sectionTitle !== undefined) {
    const sectionTitleEl = donationsSection.querySelector('[data-donations-title]');
    if (sectionTitleEl) sectionTitleEl.textContent = updates.sectionTitle;
  }

  if (updates.subtitle !== undefined) {
    const subtitleEl = donationsSection.querySelector('[data-donations-subtitle]');
    if (subtitleEl) subtitleEl.textContent = updates.subtitle;
  }

  if (updates.customMessage !== undefined) {
    const msgEl = donationsSection.querySelector('[data-donation-message]');
    if (msgEl) msgEl.textContent = updates.customMessage;
  }

  // Helper to update payment method visibility and content
  const updatePaymentMethod = (
    key,
    containerSelector,
    valueSelector,
    linkSelector,
    formatValue,
    formatLink
  ) => {
    if (updates[key] !== undefined) {
      const container = donationsSection.querySelector(containerSelector);
      const valueEl = donationsSection.querySelector(valueSelector);
      const linkEl = linkSelector ? donationsSection.querySelector(linkSelector) : null;

      const value = updates[key];

      if (container) {
        if (value) {
          container.classList.remove('hidden');
        } else {
          container.classList.add('hidden');
        }
      }

      if (valueEl) valueEl.textContent = formatValue(value);
      if (linkEl && value) linkEl.href = formatLink(value);
    }
  };

  updatePaymentMethod(
    'venmoUsername',
    '[data-venmo-container]',
    '[data-venmo-username]',
    '[data-venmo-link]',
    (v) => `@${v}`,
    (v) => `https://venmo.com/${v}`
  );

  updatePaymentMethod(
    'cashappUsername',
    '[data-cashapp-container]',
    '[data-cashapp-username]',
    '[data-cashapp-link]',
    (v) => `${v}`,
    (v) => `https://cash.app/${v}`
  );

  updatePaymentMethod(
    'zelleEmail',
    '[data-zelle-container]',
    '[data-zelle-email]',
    null,
    (v) => v,
    (_v) => '#'
  );
}

function updateFuneralSection(updates) {
  const funeralSection = document.getElementById('funeral-section');
  if (!funeralSection) return;

  if (updates.visible !== undefined) {
    toggleSectionVisibility(funeralSection, updates.visible);
  }

  if (updates.sectionTitle !== undefined) {
    const sectionTitleEl = funeralSection.querySelector('[data-funeral-title]');
    if (sectionTitleEl) sectionTitleEl.textContent = updates.sectionTitle;
  }

  if (updates.subtitle !== undefined) {
    const subtitleEl = funeralSection.querySelector('[data-funeral-subtitle]');
    if (subtitleEl) subtitleEl.textContent = updates.subtitle;
  }
}

function updateSpecialInstructionsSection(updates) {
  const sectionEl = document.getElementById('special-instructions-section');
  if (!sectionEl) return;

  if (updates.specialInstructionsVisible !== undefined) {
    toggleSectionVisibility(sectionEl, updates.specialInstructionsVisible);
  }

  if (updates.specialInstructions !== undefined) {
    const instructionsEl = sectionEl.querySelector('[data-funeral-instructions]');
    if (instructionsEl) instructionsEl.textContent = updates.specialInstructions;
  }
}

function updateFlowersInfoSection(updates) {
  const sectionEl = document.getElementById('flowers-info-section');
  if (!sectionEl) return;

  if (updates.flowersInfoVisible !== undefined) {
    toggleSectionVisibility(sectionEl, updates.flowersInfoVisible);
  }

  if (updates.flowersInfo !== undefined) {
    const flowersEl = sectionEl.querySelector('[data-funeral-flowers]');
    if (flowersEl) flowersEl.textContent = updates.flowersInfo;
  }
}

function updateServiceOnPage(serviceIndex, serviceData) {
  const serviceCard = document.querySelector(`[data-service-index="${serviceIndex}"]`);
  if (!serviceCard) {
    console.error(`Service card not found for index ${serviceIndex}`);
    return;
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  if (serviceData.type !== undefined) {
    const typeEl = serviceCard.querySelector(`[data-service-type="${serviceIndex}"]`);
    if (typeEl) typeEl.textContent = serviceData.type;
  }

  if (serviceData.date !== undefined) {
    const dateEl = serviceCard.querySelector(`[data-service-date="${serviceIndex}"]`);
    if (dateEl) {
      let dateText = formatDate(serviceData.date);
      if (serviceData.endDate && serviceData.endDate !== serviceData.date) {
        const endDateEl = dateEl.querySelector(`[data-service-endDate="${serviceIndex}"]`);
        if (endDateEl) {
          endDateEl.textContent = formatDate(serviceData.endDate);
        } else {
          dateText += ` - ${formatDate(serviceData.endDate)}`;
        }
      }
      if (!dateEl.querySelector(`[data-service-endDate="${serviceIndex}"]`)) {
        dateEl.textContent = dateText;
      }
    }
  }

  if (serviceData.time !== undefined) {
    const timeEl = serviceCard.querySelector(`[data-service-time="${serviceIndex}"]`);
    if (timeEl) {
      let timeText = formatTime(serviceData.time);
      if (serviceData.endTime) {
        const endTimeEl = timeEl.querySelector(`[data-service-endTime="${serviceIndex}"]`);
        if (endTimeEl) {
          endTimeEl.textContent = formatTime(serviceData.endTime);
        } else {
          timeText += ` - ${formatTime(serviceData.endTime)}`;
        }
      }
      if (!timeEl.querySelector(`[data-service-endTime="${serviceIndex}"]`)) {
        timeEl.textContent = timeText;
      }
    }
  }

  if (serviceData.location) {
    if (serviceData.location.name !== undefined) {
      const nameEl = serviceCard.querySelector(`[data-service-location-name="${serviceIndex}"]`);
      if (nameEl) nameEl.textContent = serviceData.location.name;
    }

    if (serviceData.location.address !== undefined) {
      const addressEl = serviceCard.querySelector(
        `[data-service-location-address="${serviceIndex}"]`
      );
      if (addressEl) addressEl.textContent = serviceData.location.address;
    }

    if (serviceData.location.phone !== undefined) {
      const phoneEl = serviceCard.querySelector(`[data-service-location-phone="${serviceIndex}"]`);
      if (phoneEl) {
        phoneEl.textContent = serviceData.location.phone;
        phoneEl.href = `tel:${serviceData.location.phone}`;
      }
    }

    if (serviceData.location.website !== undefined) {
      const websiteEl = serviceCard.querySelector(
        `[data-service-location-website="${serviceIndex}"]`
      );
      if (websiteEl) {
        websiteEl.href = serviceData.location.website;
      }
    }
  }

  if (serviceData.description !== undefined) {
    const descEl = serviceCard.querySelector(`[data-service-description="${serviceIndex}"]`);
    if (descEl) descEl.textContent = serviceData.description;
  }

  if (serviceData.dresscode !== undefined) {
    const dresscodeEl = serviceCard.querySelector(`[data-service-dresscode="${serviceIndex}"]`);
    if (dresscodeEl) dresscodeEl.textContent = serviceData.dresscode;
  }

  if (serviceData.agendaUrl !== undefined) {
    // Find or create the agenda link container
    let agendaContainer = serviceCard.querySelector(
      `[data-service-agenda-link="${serviceIndex}"]`
    )?.parentElement;

    if (serviceData.agendaUrl) {
      // If there's an agendaUrl, show/update the link
      const agendaUrl = generateAgendaUrl(serviceIndex, serviceData.type || 'Service');

      if (!agendaContainer) {
        // Create the agenda container if it doesn't exist
        const newContainer = document.createElement('div');
        newContainer.className = 'mt-4 pt-4 border-t border-warm-gray-200';
        newContainer.innerHTML = `
          <a 
            href="${agendaUrl}"
            class="inline-flex items-center text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
            data-service-agenda-link="${serviceIndex}"
          >
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
            View Service Agenda
          </a>
        `;
        serviceCard.appendChild(newContainer);
      } else {
        // Update existing link
        const agendaLink = serviceCard.querySelector(
          `[data-service-agenda-link="${serviceIndex}"]`
        );
        if (agendaLink) {
          agendaLink.href = agendaUrl;
        }
      }
    } else if (agendaContainer) {
      // If agendaUrl is empty/removed, hide the container
      agendaContainer.remove();
    }
  }
}

function updateGallerySection(updates) {
  const gallerySection = document.getElementById('gallery-section');
  if (!gallerySection) return;

  if (updates.visible !== undefined) {
    toggleSectionVisibility(gallerySection, updates.visible);
    updateNavLinkVisibility('#gallery', updates.visible);
  }

  if (updates.sectionTitle !== undefined) {
    const titleEl = gallerySection.querySelector('[data-gallery-title]');
    if (titleEl) titleEl.textContent = updates.sectionTitle;
  }
  showToast('Gallery updated successfully.', 'success');
}

function updateCommentsSection(updates) {
  const commentsSection = document.getElementById('comments-section');
  if (!commentsSection) return;

  if (updates.visible !== undefined) {
    toggleSectionVisibility(commentsSection, updates.visible);
    updateNavLinkVisibility('#memories', updates.visible);
  }

  if (updates.sectionTitle !== undefined) {
    const titleEl = commentsSection.querySelector('[data-comments-title]');
    if (titleEl) titleEl.textContent = updates.sectionTitle;
  }

  if (updates.subtitle !== undefined) {
    const subtitleEl = commentsSection.querySelector('[data-comments-subtitle]');
    if (subtitleEl) subtitleEl.textContent = updates.subtitle;
  }
}

function updateFooterSection(updates) {
  const footerSection = document.querySelector('footer');
  if (!footerSection) return;

  if (updates.visible !== undefined) {
    toggleSectionVisibility(footerSection, updates.visible, true);
  }

  if (updates.quote !== undefined) {
    const quoteEl = document.querySelector('[data-footer-quote]');
    if (quoteEl) quoteEl.textContent = updates.quote;
  }

  if (updates.credit !== undefined) {
    const creditEl = document.querySelector('[data-footer-credit]');
    if (creditEl) creditEl.textContent = updates.credit;
  }
}

function updateReceptionSection(updates) {
  const receptionSection = document.getElementById('reception-section');
  if (!receptionSection) return;

  if (updates.visible !== undefined) {
    toggleSectionVisibility(receptionSection, updates.visible, true);
  }

  if (updates.location !== undefined) {
    const locationEl = receptionSection.querySelector('[data-reception-location]');
    if (locationEl) locationEl.textContent = updates.location;
  }

  if (updates.time !== undefined) {
    const timeEl = receptionSection.querySelector('[data-reception-time]');
    if (timeEl) timeEl.textContent = updates.time;
  }

  if (updates.description !== undefined) {
    const descEl = receptionSection.querySelector('[data-reception-description]');
    if (descEl) {
      descEl.textContent = updates.description;
    } else if (updates.description !== undefined && updates.description !== '') {
      const container = receptionSection.querySelector('[data-reception-content]');
      if (container) {
        const newDesc = document.createElement('p');
        newDesc.className = 'text-warm-gray-300 mt-4 max-w-2xl mx-auto';
        newDesc.setAttribute('data-reception-description', '');
        newDesc.textContent = updates.description;
        container.appendChild(newDesc);
      }
    }
  }
}

function toggleSectionVisibility(element, isVisible, darkTheme = false) {
  if (!element) return;

  const isHidden = isVisible === false || isVisible === 'false';

  if (isHidden) {
    if (darkTheme) {
      element.classList.add('opacity-60', 'border-2', 'border-dashed', 'border-warm-gray-600');
    } else {
      element.classList.add('opacity-70', 'border-2', 'border-dashed', 'border-gray-300');
    }

    if (!element.querySelector('.hidden-badge') && element.style.position !== 'static') {
      const badge = document.createElement('div');
      if (darkTheme) {
        badge.className =
          'hidden-badge absolute top-0 left-0 bg-gray-700 text-gray-300 text-xs px-2 py-1 rounded-br z-20';
      } else {
        badge.className =
          'hidden-badge absolute top-0 left-0 bg-gray-200 text-gray-600 text-xs px-2 py-1 rounded-br z-20';
      }
      badge.textContent = 'Hidden from public';
      element.prepend(badge);
    }
  } else {
    if (darkTheme) {
      element.classList.remove('opacity-60', 'border-2', 'border-dashed', 'border-warm-gray-600');
    } else {
      element.classList.remove('opacity-70', 'border-2', 'border-dashed', 'border-gray-300');
    }
    const badge = element.querySelector('.hidden-badge');
    if (badge) badge.remove();
  }
}

function updatePageContent(section, updates) {
  if (!updates) return;

  switch (section) {
    case 'hero':
      updateHeroSection(updates);
      break;
    case 'biography':
      updateBiographySection(updates);
      break;
    case 'highlights':
      updateHighlightsSection(updates);
      break;
    case 'video':
      updateVideoSection(updates);
      break;
    case 'donations':
      updateDonationsSection(updates);
      break;
    case 'funeral':
      updateFuneralSection(updates);
      break;
    case 'specialInstructions':
      updateSpecialInstructionsSection(updates);
      break;
    case 'flowersInfo':
      updateFlowersInfoSection(updates);
      break;
    case 'services':
      showToast('Services are arrays. Coming soon!', 'success');
      break;
    case 'reception':
      updateReceptionSection(updates);
      break;
    case 'gallery':
      updateGallerySection(updates);
      break;
    case 'comments':
      updateCommentsSection(updates);
      break;
    case 'footer':
      updateFooterSection(updates);
      break;
  }
}

// --- Drag & Drop Functions for Gallery ---

function handleDragStart(e) {
  draggedItem = e.target;
  draggedItem.classList.add('opacity-50');
  e.dataTransfer.effectAllowed = 'move';
}

function handleDragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';

  const target = e.target.closest('.reorder-item');
  if (target && target !== draggedItem) {
    target.classList.add('ring-2', 'ring-blue-500');
  }
}

function handleDrop(e) {
  e.preventDefault();

  const target = e.target.closest('.reorder-item');
  const container = document.getElementById('reorderList');

  if (target && target !== draggedItem && draggedItem && container) {
    // Swap in DOM
    const parent = target.parentNode;

    // Get all items to find indexes
    const allItems = Array.from(container.querySelectorAll('.reorder-item'));
    const draggedIndex = allItems.indexOf(draggedItem);
    const targetIndex = allItems.indexOf(target);

    if (draggedIndex < targetIndex) {
      parent.insertBefore(draggedItem, target.nextSibling);
    } else {
      parent.insertBefore(draggedItem, target);
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

function handleDragEnd(e) {
  draggedItem?.classList.remove('opacity-50');

  // Remove all ring highlights
  const allItems = document.querySelectorAll('.reorder-item');
  allItems.forEach((item) => {
    item.classList.remove('ring-2', 'ring-blue-500');
  });

  draggedItem = null;
}

// --- Main Modal & Upload Functions ---

async function openEditModal(section) {
  currentSection = section;
  const modal = document.getElementById('editModal');
  const modalTitle = document.getElementById('modalTitle');

  if (!memorialDataLoaded) {
    loadMemorialData();
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
    const response = await fetch(`/api/admin/content?memorial=${encodeURIComponent(memorialSlug)}`);
    const result = await response.json();

    if (result.success) {
      contentData = result.data.organizedContent;
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

function closeEditModal() {
  const modal = document.getElementById('editModal');
  modal.classList.add('hidden');
  currentSection = null;
}

function renderModalContent(section) {
  // ... (keep existing implementation)
  const modalContent = document.getElementById('modalContent');

  if (section.startsWith('service-')) {
    const serviceIndex = parseInt(section.split('-')[1]);
    const services = memorialData.funeralInfo?.services || [];
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
              class="flex-shrink-0 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors flex items-center whitespace-nowrap">
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
  const actualSectionData = contentData[dataSection] || {};

  // For highlights visibility, check the highlights section
  const highlightsVisibilityData = section === 'highlights' ? contentData['highlights'] || {} : {};

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
            class="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
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
        const images = memorialData.images || [];
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

async function uploadImageForField(inputId) {
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
      formData.append('folder', `memorials/${memorialSlug}/portraits`);

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

async function uploadVideoForField(inputId) {
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
      formData.append('folder', `memorials/${memorialSlug}/videos`);

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

async function saveAllModalContent() {
  // ... (keep existing implementation)
  if (!currentSection) return;

  // Handle individual service editing
  if (currentSection.startsWith('service-')) {
    // ... (keep existing service saving logic) ...
    const serviceIndex = parseInt(currentSection.split('-')[1]);
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
          memorialSlug,
          section: 'funeral',
          key: `service${serviceIndex}`,
          value: JSON.stringify(serviceData),
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Update the memorialData object so the modal will show fresh data next time
        if (memorialData.funeralInfo && memorialData.funeralInfo.services) {
          memorialData.funeralInfo.services[serviceIndex] = serviceData;
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
  if (currentSection === 'gallery') {
    const reorderItems = modalContent.querySelectorAll('.reorder-item');
    if (reorderItems.length > 0) {
      const reorderData = Array.from(reorderItems).map((item, idx) => ({
        imagePath: item.dataset.imageUrl,
        displayOrder: idx,
        memorialSlug,
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

  if (updates.length === 0 && currentSection !== 'gallery') {
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
            body: JSON.stringify({ ...update, memorialSlug }),
          }).then((r) => r.json())
        )
      );

      const allSuccess = results.every((r) => r.success);

      if (allSuccess) {
        // Get the correct data section for update (handle special cases)
        let updateDataSection = currentSection;
        if (currentSection === 'specialInstructions' || currentSection === 'flowersInfo') {
          updateDataSection = 'funeral';
        } else if (currentSection === 'highlights') {
          updateDataSection = 'biography'; // highlights content is stored under biography
        }

        // Update memorialData for visibility flags (used by nav links until next page load)
        updates.forEach((update) => {
          if (update.key === 'visible') {
            const isVisible = update.value === 'true';
            switch (currentSection) {
              case 'biography':
                memorialData.biographyVisible = isVisible;
                break;
              case 'highlights':
                memorialData.highlightsVisible = isVisible;
                break;
              case 'video':
                memorialData.videoVisible = isVisible;
                break;
              case 'gallery':
                memorialData.galleryVisible = isVisible;
                break;
              case 'comments':
                memorialData.commentsVisible = isVisible;
                break;
              case 'donations':
                if (!memorialData.donations) memorialData.donations = {};
                memorialData.donations.visible = isVisible;
                break;
              case 'funeral':
                if (!memorialData.funeralInfo) memorialData.funeralInfo = {};
                memorialData.funeralInfo.visible = isVisible;
                break;
            }
          }
        });

        // Pass updates using the correct data section key, but keep currentSection for routing
        // For highlights, we need to gather updates from both biography and highlights sections
        let updateData = {};
        if (currentSection === 'highlights') {
          // Merge updates from both sections
          updates.forEach((update) => {
            updateData[update.key] = updatesMap[update.section]?.[update.key];
          });
        } else {
          updateData = updatesMap[updateDataSection] || {};
        }

        updatePageContent(currentSection, updateData);
        showToast('Changes saved successfully!', 'success');
        closeEditModal();
      } else {
        throw new Error('Some updates failed');
      }
    } else if (currentSection === 'gallery') {
      showToast('Changes saved successfully!', 'success');
      closeEditModal();
    }
  } catch (error) {
    console.error('Error saving content:', error);
    showToast('Error saving changes. Please try again.', 'error');
  }
}

async function uploadAgendaForField(inputId) {
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
      formData.append('folder', `memorials/${memorialSlug}/agendas`); // Separate folder for organization

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

// Initialize when window loads
window.addEventListener('load', function () {
  const editModeToggle = document.getElementById('editModeToggle');

  // Try to load immediately
  loadMemorialData();

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

  // --- Admin Toolbar Drag & Minimize Logic ---
  const adminToolbar = document.getElementById('adminToolbar');
  const minimizeBtn = document.getElementById('minimizeToolbarBtn');
  const toolbarControls = document.getElementById('adminToolbarControls');

  if (adminToolbar) {
    let currentX = 0;
    let currentY = 0;
    let initialX = 0;
    let initialY = 0;
    let xOffset = 0;
    let yOffset = 0;
    let rafPending = false;

    // Basic styling for draggable element
    adminToolbar.style.userSelect = 'none';
    adminToolbar.style.webkitUserSelect = 'none';
    adminToolbar.style.cursor = 'move';
    adminToolbar.style.touchAction = 'none';
    adminToolbar.style.transition = 'none';

    // Only add start listeners initially
    adminToolbar.addEventListener('mousedown', dragStart);
    adminToolbar.addEventListener('touchstart', dragStart, { passive: false });

    function getEventCoordinates(e) {
      if (e.type.includes('touch')) {
        return {
          clientX: e.touches[0]?.clientX || e.changedTouches[0]?.clientX || 0,
          clientY: e.touches[0]?.clientY || e.changedTouches[0]?.clientY || 0,
        };
      }
      return { clientX: e.clientX, clientY: e.clientY };
    }

    function dragStart(e) {
      // Check if the event target is an interactive element
      if (e.target.closest('button, input, a, label')) return;
      if (!e.target.closest('#adminToolbar')) return;

      // For touch events, ensure we're not in the controls area
      if (e.type === 'touchstart' && e.target.closest('#adminToolbarControls')) return;

      const coords = getEventCoordinates(e);
      initialX = coords.clientX - xOffset;
      initialY = coords.clientY - yOffset;

      // Enable GPU acceleration only when dragging
      adminToolbar.style.willChange = 'transform';

      // Prevent text selection during drag
      document.body.style.userSelect = 'none';
      document.body.style.webkitUserSelect = 'none';

      // Add move/end listeners only when dragging starts
      document.addEventListener('mousemove', drag, { passive: true });
      document.addEventListener('touchmove', drag, { passive: false });
      document.addEventListener('mouseup', dragEnd);
      document.addEventListener('touchend', dragEnd);

      if (e.type === 'touchstart') {
        e.preventDefault();
      }
    }

    function dragEnd() {
      rafPending = false;

      // Remove move/end listeners when dragging stops
      document.removeEventListener('mousemove', drag);
      document.removeEventListener('touchmove', drag);
      document.removeEventListener('mouseup', dragEnd);
      document.removeEventListener('touchend', dragEnd);

      // Re-enable text selection
      document.body.style.userSelect = '';
      document.body.style.webkitUserSelect = '';

      // Remove GPU hint to free resources
      adminToolbar.style.willChange = 'auto';
    }

    function drag(e) {
      if (e.type === 'touchmove') {
        e.preventDefault();
      }

      const coords = getEventCoordinates(e);
      currentX = coords.clientX - initialX;
      currentY = coords.clientY - initialY;
      xOffset = currentX;
      yOffset = currentY;

      if (!rafPending) {
        rafPending = true;
        requestAnimationFrame(() => {
          adminToolbar.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
          rafPending = false;
        });
      }
    }

    // Minimize logic
    if (minimizeBtn && toolbarControls) {
      let isMinimized = localStorage.getItem('adminToolbarMinimized') === 'true';

      function updateMinimizeState() {
        if (isMinimized) {
          toolbarControls.style.maxWidth = '0px';
          toolbarControls.style.paddingRight = '0px';
          toolbarControls.style.opacity = '0';
          minimizeBtn.innerHTML = `
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
            </svg>
          `; // Right chevron (Expand)
        } else {
          toolbarControls.style.maxWidth = '300px'; // Approximate max width
          toolbarControls.style.paddingRight = '1rem';
          toolbarControls.style.opacity = '1';
          minimizeBtn.innerHTML = `
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
            </svg>
          `; // Left chevron (Collapse)
        }
        localStorage.setItem('adminToolbarMinimized', isMinimized);
      }

      // Initialize state
      updateMinimizeState();

      minimizeBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent drag start
        isMinimized = !isMinimized;
        updateMinimizeState();
      });
    }
  }
});

// Close modal on Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && currentSection) {
    closeEditModal();
  }
});

// Close modal when clicking outside
document.getElementById('editModal')?.addEventListener('click', (e) => {
  if (e.target.id === 'editModal') {
    closeEditModal();
  }
});
