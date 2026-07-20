// Functions that push saved content back into the live page DOM.
import { state } from './state.js';
import { escapeHtml } from '../lib/escape-html.js';
import { updateNavLinkVisibility, showToast, generateAgendaUrl } from './helpers.js';

// --- Section Update Functions ---

export function updateHeroSection(updates) {
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
    const birthDate = updates.birthDate || state.contentData.hero?.birthDate?.value;
    const deathDate = updates.deathDate || state.contentData.hero?.deathDate?.value;

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
    if (!updates.backgroundImage && !state.contentData.hero?.backgroundImage?.value) {
      const bgImg = heroSection.querySelector('[data-hero-background]');
      if (bgImg) bgImg.src = updates.mainImage;
    }
  }

  if (updates.backgroundImage !== undefined) {
    const bgImg = heroSection.querySelector('[data-hero-background]');
    if (bgImg) bgImg.src = updates.backgroundImage;
  }
}

export function updateBiographySection(updates) {
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

export function recheckBiographyTruncation() {
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

export function updateHighlightsSection(updates) {
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
          <div class="shrink-0 w-2 h-2 bg-warm-gray-400 rounded-full mt-3"></div>
          <p class="text-warm-gray-700">${escapeHtml(highlight.trim())}</p>
        </div>
      `
        )
        .join('');
    }
  }
}

export function updateVideoSection(updates) {
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

export function updateDonationsSection(updates) {
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

export function updateFuneralSection(updates) {
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

export function updateSpecialInstructionsSection(updates) {
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

export function updateFlowersInfoSection(updates) {
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

export function updateServiceOnPage(serviceIndex, serviceData) {
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

export function updateGallerySection(updates) {
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

export function updateCommentsSection(updates) {
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

export function updateFooterSection(updates) {
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

export function updateReceptionSection(updates) {
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

export function toggleSectionVisibility(element, isVisible, darkTheme = false) {
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

export function updatePageContent(section, updates) {
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

