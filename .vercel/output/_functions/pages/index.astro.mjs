/* empty css                                 */
import { e as createComponent, g as addAttribute, l as renderHead, n as renderSlot, k as renderScript, r as renderTemplate, h as createAstro, m as maybeRenderHead, o as renderComponent, u as unescapeHTML } from '../chunks/astro/server_CLGJxpjn.mjs';
import 'piccolore';
import 'clsx';
/* empty css                                 */
import { d as db, M as MemorialContent, G as GalleryImages } from '../chunks/_astro_db_B6fpZxRe.mjs';
export { renderers } from '../renderers.mjs';

const $$Astro$8 = createAstro();
const $$Layout = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$8, $$props, $$slots);
  Astro2.self = $$Layout;
  const { title, description = "A memorial page to honor and remember a beloved life" } = Astro2.props;
  return renderTemplate`<html lang="en" class="scroll-smooth" data-astro-cid-sckkx6r4> <head><meta charset="UTF-8"><meta name="description"${addAttribute(description, "content")}><meta name="viewport" content="width=device-width, initial-scale=1.0"><link rel="icon" type="image/svg+xml" href="/favicon.svg"><title>${title}</title><!-- Google Fonts --><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:wght@400;500;600;700&display=swap" rel="stylesheet">${renderHead()}</head> <body class="bg-warm-gray-50 text-warm-gray-900 antialiased" data-astro-cid-sckkx6r4> ${renderSlot($$result, $$slots["default"])} <!-- Smooth scroll behavior --> ${renderScript($$result, "/Users/fher/atlassian/repo/her-family/src/layouts/Layout.astro?astro&type=script&index=0&lang.ts")} </body> </html>`;
}, "/Users/fher/atlassian/repo/her-family/src/layouts/Layout.astro", void 0);

const $$Astro$7 = createAstro();
const $$Hero = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$7, $$props, $$slots);
  Astro2.self = $$Hero;
  const { name, birthDate, deathDate, mainImage, backgroundImage, subtitle } = Astro2.props;
  const bgImage = backgroundImage || mainImage;
  return renderTemplate`${maybeRenderHead()}<section class="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 to-purple-100"> <!-- Background Image with Overlay --> <div class="absolute inset-0 z-0"> <img${addAttribute(bgImage, "src")} alt="Background" class="w-full h-full object-cover opacity-90 mix-blend-overlay" data-hero-background> <div class="absolute inset-0 bg-gradient-to-t from-warm-gray-900/10 to-transparent"></div> </div> <!-- Content --> <div class="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto"> <!-- Portrait --> <div class="mb-10"> <div class="w-56 h-56 sm:w-72 sm:h-72 mx-auto rounded-full overflow-hidden border-4 border-white shadow-2xl"> <img${addAttribute(mainImage, "src")}${addAttribute(`Portrait of ${name}`, "alt")} class="w-full h-full object-cover" data-hero-image> </div> </div> <!-- Name and Dates --> <h1 class="font-display text-5xl sm:text-6xl lg:text-7xl font-bold text-warm-gray-900 mb-5 drop-shadow-[0_0_15px_rgba(255,255,255,0.8)]" data-hero-name> ${name} </h1> <div class="flex items-center justify-center space-x-4 text-xl sm:text-2xl text-warm-gray-900 font-semibold mb- drop-shadow-[0_0_15px_rgba(255,255,255,0.9)]" data-hero-dates> <time${addAttribute(birthDate, "datetime")}>${new Date(birthDate).getFullYear()}</time> <span class="w-8 h-0.5 bg-warm-gray-900 rounded-full"></span> <time${addAttribute(deathDate, "datetime")}>${new Date(deathDate).getFullYear()}</time> </div> ${subtitle && renderTemplate`<p class="text-2xl sm:text-3xl text-warm-gray-800 italic max-w-2xl mx-auto mb-8 drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]" data-hero-subtitle> ${subtitle} </p>`} </div> <!-- Scroll Indicator - positioned relative to the entire hero section --> <div class="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 animate-bounce"> <button onclick="document.querySelector('#biography').scrollIntoView({ behavior: 'smooth' })" class="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors duration-300 backdrop-blur-sm" aria-label="Scroll to content"> <svg class="w-6 h-6 text-warm-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path> </svg> </button> </div> </section>`;
}, "/Users/fher/atlassian/repo/her-family/src/components/Hero.astro", void 0);

const $$Astro$6 = createAstro();
const $$Biography = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$6, $$props, $$slots);
  Astro2.self = $$Biography;
  const { content, title = "Remembering a Beautiful Life", highlights = [], isAdmin = false } = Astro2.props;
  return renderTemplate`${maybeRenderHead()}<section id="biography" class="py-16 sm:py-24 bg-white"> <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8"> <div class="text-center mb-12"> <h2 class="font-display text-3xl sm:text-4xl font-bold text-warm-gray-900 mb-4" data-bio-title> ${title} </h2> <div class="w-24 h-1 bg-warm-gray-300 mx-auto"></div> </div> <div class="prose prose-lg prose-warm-gray max-w-none"> <div class="text-warm-gray-700 leading-relaxed text-lg" data-bio-content> ${content.split("\n\n").map((paragraph) => renderTemplate`<p class="mb-6">${paragraph}</p>`)} </div> </div> ${highlights.length > 0 && renderTemplate`<div class="mt-12 bg-warm-gray-50 rounded-lg p-8 relative"> <h3 class="font-display text-2xl font-semibold text-warm-gray-900 mb-6 text-center">
Cherished Memories
</h3> <div class="grid md:grid-cols-2 gap-6" data-bio-highlights> ${highlights.map((highlight) => renderTemplate`<div class="flex items-start space-x-3"> <div class="flex-shrink-0 w-2 h-2 bg-warm-gray-400 rounded-full mt-3"></div> <p class="text-warm-gray-700">${highlight}</p> </div>`)} </div> ${isAdmin && renderTemplate`<button onclick="openEditModal('highlights')" class="absolute top-4 right-4 bg-white hover:bg-warm-gray-100 text-indigo-600 px-3 py-2 rounded-lg shadow-md text-sm font-medium transition-all edit-button">
✏️ Edit
</button>`} </div>`} </div> </section>`;
}, "/Users/fher/atlassian/repo/her-family/src/components/Biography.astro", void 0);

const $$Astro$5 = createAstro();
const $$FuneralInfo = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$5, $$props, $$slots);
  Astro2.self = $$FuneralInfo;
  const {
    title = "Service Information",
    services,
    specialInstructions,
    flowersInfo,
    receptionInfo,
    subtitle = "Please join us as we celebrate their life and honor their memory",
    isAdmin = false,
    specialInstructionsVisible = true,
    flowersInfoVisible = true,
    receptionVisible = true
  } = Astro2.props;
  function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  }
  function formatTime(timeString) {
    return (/* @__PURE__ */ new Date(`2000-01-01T${timeString}`)).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true
    });
  }
  return renderTemplate`${maybeRenderHead()}<section id="funeral-info" class="py-16 sm:py-24 bg-white"> <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8"> <div class="text-center mb-12"> <h2 class="font-display text-3xl sm:text-4xl font-bold text-warm-gray-900 mb-4" data-funeral-title> ${title} </h2> <div class="w-24 h-1 bg-warm-gray-300 mx-auto mb-6"></div> <p class="text-lg text-warm-gray-600 max-w-2xl mx-auto" data-funeral-subtitle> ${subtitle} </p> </div> <!-- Services Grid --> <div class="grid md:grid-cols-2 gap-8 mb-12"> ${services.map((service, index) => renderTemplate`<div class="bg-warm-gray-50 rounded-xl p-8 shadow-sm border border-warm-gray-100 relative group"${addAttribute(index, "data-service-index")}> ${isAdmin && renderTemplate`<button${addAttribute(`openEditModal('service-${index}')`, "onclick")} class="absolute top-4 right-4 bg-white hover:bg-warm-gray-100 text-indigo-600 px-3 py-2 rounded-lg shadow-md text-sm font-medium transition-all opacity-0 group-hover:opacity-100 edit-button">
✏️ Edit
</button>`} <div class="flex items-start justify-between mb-4"> <h3 class="font-display text-xl font-semibold text-warm-gray-900"${addAttribute(index, "data-service-type")}> ${service.type} </h3> <div class="flex-shrink-0 w-12 h-12 bg-warm-gray-200 rounded-lg flex items-center justify-center"> <svg class="w-6 h-6 text-warm-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path> </svg> </div> </div> <!-- Date and Time --> <div class="space-y-3 mb-6"> <div class="flex items-center text-warm-gray-700"> <svg class="w-5 h-5 mr-3 text-warm-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path> </svg> <span class="font-medium"${addAttribute(index, "data-service-date")}> ${formatDate(service.date)} ${service.endDate && service.endDate !== service.date && renderTemplate`<span> - <span${addAttribute(index, "data-service-endDate")}>${formatDate(service.endDate)}</span></span>`} </span> </div> <div class="flex items-center text-warm-gray-700"> <svg class="w-5 h-5 mr-3 text-warm-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path> </svg> <span class="font-medium"${addAttribute(index, "data-service-time")}> ${formatTime(service.time)} ${service.endTime && renderTemplate`<span> - <span${addAttribute(index, "data-service-endTime")}>${formatTime(service.endTime)}</span></span>`} </span> </div> </div> <!-- Location --> <div class="border-t border-warm-gray-200 pt-4"> <h4 class="font-semibold text-warm-gray-900 mb-2"${addAttribute(index, "data-service-location-name")}>${service.location.name}</h4> <div class="text-warm-gray-600 space-y-1"> <p${addAttribute(index, "data-service-location-address")}>${service.location.address}</p> ${service.location.phone && renderTemplate`<p class="flex items-center"> <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path> </svg> <a${addAttribute(`tel:${service.location.phone}`, "href")} class="hover:text-warm-gray-900 transition-colors"${addAttribute(index, "data-service-location-phone")}> ${service.location.phone} </a> </p>`} ${service.location.website && renderTemplate`<p class="flex items-center"> <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path> </svg> <a${addAttribute(service.location.website, "href")} target="_blank" rel="noopener noreferrer" class="hover:text-warm-gray-900 transition-colors"${addAttribute(index, "data-service-location-website")}>
Visit Website
</a> </p>`} </div> </div> ${service.description && renderTemplate`<div class="mt-4 pt-4 border-t border-warm-gray-200"> <p class="text-warm-gray-600 text-sm"${addAttribute(index, "data-service-description")}>${service.description}</p> </div>`} ${service.dresscode && renderTemplate`<div class="mt-4 bg-warm-gray-100 rounded-lg p-3"> <p class="text-sm text-warm-gray-700"> <span class="font-medium">Dress Code:</span> <span${addAttribute(index, "data-service-dresscode")}>${service.dresscode}</span> </p> </div>`} </div>`)} </div> <!-- Additional Information --> <div class="grid md:grid-cols-2 gap-8 mb-12"> ${specialInstructions && (specialInstructionsVisible || isAdmin) && renderTemplate`<div id="special-instructions-section"${addAttribute(`bg-blue-50 border border-blue-200 rounded-lg p-6 relative group ${!specialInstructionsVisible && isAdmin ? "opacity-60 border-dashed" : ""}`, "class")}> ${isAdmin && renderTemplate`<div class="absolute top-4 right-4 flex gap-2"> ${!specialInstructionsVisible && renderTemplate`<span class="hidden-badge text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">Hidden</span>`} <button onclick="openEditModal('specialInstructions')" class="bg-white hover:bg-blue-100 text-blue-600 px-3 py-2 rounded-lg shadow-md text-sm font-medium transition-all opacity-0 group-hover:opacity-100 edit-button">
✏️ Edit
</button> </div>`} <h4 class="font-semibold text-blue-900 mb-3 flex items-center"> <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path> </svg>
Special Instructions
</h4> <p class="text-blue-800 text-sm leading-relaxed" data-funeral-instructions>${specialInstructions}</p> </div>`} ${flowersInfo && (flowersInfoVisible || isAdmin) && renderTemplate`<div id="flowers-info-section"${addAttribute(`bg-green-50 border border-green-200 rounded-lg p-6 relative group ${!flowersInfoVisible && isAdmin ? "opacity-60 border-dashed" : ""}`, "class")}> ${isAdmin && renderTemplate`<div class="absolute top-4 right-4 flex gap-2"> ${!flowersInfoVisible && renderTemplate`<span class="hidden-badge text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">Hidden</span>`} <button onclick="openEditModal('flowersInfo')" class="bg-white hover:bg-green-100 text-green-600 px-3 py-2 rounded-lg shadow-md text-sm font-medium transition-all opacity-0 group-hover:opacity-100 edit-button">
✏️ Edit
</button> </div>`} <h4 class="font-semibold text-green-900 mb-3 flex items-center"> <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path> </svg>
Flowers & Donations
</h4> <p class="text-green-800 text-sm leading-relaxed" data-funeral-flowers>${flowersInfo}</p> </div>`} </div> <!-- Reception Information --> ${receptionInfo && (receptionVisible || isAdmin) && renderTemplate`<div id="reception-section"${addAttribute(`bg-warm-gray-800 text-white rounded-xl p-8 mb-8 relative ${!receptionVisible && isAdmin ? "opacity-60 border-2 border-dashed border-warm-gray-600" : ""}`, "class")}> ${isAdmin && renderTemplate`<div class="absolute top-4 right-4 flex gap-2"> ${!receptionVisible && renderTemplate`<span class="hidden-badge text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded self-center">Hidden</span>`} <button onclick="openEditModal('reception')" class="bg-white/20 hover:bg-white/30 text-white px-3 py-2 rounded-lg shadow-md text-sm font-medium transition-all edit-button">
✏️ Edit
</button> </div>`} <div class="text-center"> <h3 class="font-display text-2xl font-semibold mb-4">
Reception Following Burial
</h3> <div class="space-y-2" data-reception-content> <p class="text-lg" data-reception-location>${receptionInfo.location}</p> <p class="text-warm-gray-300" data-reception-time>${receptionInfo.time}</p> ${receptionInfo.description && renderTemplate`<p class="text-warm-gray-300 mt-4 max-w-2xl mx-auto" data-reception-description> ${receptionInfo.description} </p>`} </div> </div> </div>`} </div> </section>`;
}, "/Users/fher/atlassian/repo/her-family/src/components/FuneralInfo.astro", void 0);

const $$Astro$4 = createAstro();
const $$Gallery = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$4, $$props, $$slots);
  Astro2.self = $$Gallery;
  const { images, isAdmin = false, title = "Treasured Moments" } = Astro2.props;
  return renderTemplate`${maybeRenderHead()}<section id="gallery" class="py-16 sm:py-24 bg-warm-gray-50"> <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"> <div class="text-center mb-12"> <h2 class="font-display text-3xl sm:text-4xl font-bold text-warm-gray-900 mb-4" data-gallery-title> ${title} </h2> <div class="w-24 h-1 bg-warm-gray-300 mx-auto"></div> </div> <!-- Admin Upload Button --> ${isAdmin && renderTemplate`<div class="mb-6 text-center flex gap-4 justify-center"> <button id="uploadImageBtn" class="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-md transition-colors edit-button"> <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path> </svg>
Upload New Image
</button> <input type="file" id="galleryImageInput" accept="image/*" class="hidden"> </div>`} <!-- Carousel Container --> <div class="relative"> <!-- Previous Arrow --> <button id="carouselPrev" class="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white text-warm-gray-800 p-3 rounded-full shadow-lg transition-all hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed" aria-label="Previous image"> <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path> </svg> </button> <!-- Next Arrow --> <button id="carouselNext" class="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white text-warm-gray-800 p-3 rounded-full shadow-lg transition-all hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed" aria-label="Next image"> <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path> </svg> </button> <!-- Carousel Track --> <div id="carouselContainer" class="overflow-hidden px-12"> <div id="carouselTrack" class="flex transition-transform duration-500 ease-out gap-6"> ${images.map((image, index) => renderTemplate`<div class="carousel-item flex-shrink-0 w-full sm:w-1/2 lg:w-1/3 xl:w-1/4"${addAttribute(index, "data-index")}${addAttribute(image.src, "data-image-url")}> <div class="group relative"> <div class="aspect-square overflow-hidden rounded-lg bg-warm-gray-200 shadow-md transition-all duration-300 hover:shadow-xl cursor-pointer"> <img${addAttribute(image.src, "src")}${addAttribute(image.alt, "alt")} class="w-full h-full object-cover transition-transform duration-300 hover:scale-110" loading="lazy"> </div> ${image.caption && renderTemplate`<p class="mt-2 text-sm text-warm-gray-600 text-center">${image.caption}</p>`} ${isAdmin && renderTemplate`<button class="delete-gallery-image edit-button absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"${addAttribute(image.src, "data-image-url")} aria-label="Delete image"> <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path> </svg> </button>`} </div> </div>`)} </div> </div> <!-- Dots Indicator --> <div id="carouselDots" class="flex justify-center gap-2 mt-6"> ${images.map((_, index) => renderTemplate`<button class="carousel-dot w-2 h-2 rounded-full bg-warm-gray-300 hover:bg-warm-gray-500 transition-colors"${addAttribute(index, "data-index")}${addAttribute(`Go to image ${index + 1}`, "aria-label")}></button>`)} </div> </div> </div> <!-- Lightbox Modal --> <div id="lightbox" class="fixed inset-0 bg-black bg-opacity-95 z-[100] hidden items-center justify-center p-4"> <button id="closeLightbox" class="absolute top-4 right-4 text-white hover:text-warm-gray-300 transition-colors p-2 z-[101] bg-black/50 rounded-full hover:bg-black/70" aria-label="Close lightbox"> <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path> </svg> </button> <div class="relative max-w-5xl max-h-[90vh] flex flex-col items-center"> <img id="lightboxImage" src="" alt="" class="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"> <div id="lightboxCaption" class="text-white text-center mt-4 text-lg font-medium drop-shadow-md"></div> <!-- Navigation Arrows --> <button id="prevImage" class="absolute -left-12 top-1/2 transform -translate-y-1/2 text-white hover:text-warm-gray-300 transition-colors p-2 hidden sm:block" aria-label="Previous image"> <svg class="w-10 h-10 drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path> </svg> </button> <button id="nextImage" class="absolute -right-12 top-1/2 transform -translate-y-1/2 text-white hover:text-warm-gray-300 transition-colors p-2 hidden sm:block" aria-label="Next image"> <svg class="w-10 h-10 drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path> </svg> </button> </div> </div> <!-- Caption Modal for Image Upload --> ${isAdmin && renderTemplate`<div id="captionModal" class="hidden fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"> <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6"> <h3 class="text-xl font-semibold text-gray-900 mb-4">Add Image Caption</h3> <p class="text-sm text-gray-600 mb-4">Enter a caption for the image (optional)</p> <input type="text" id="captionInput" placeholder="Enter caption..." class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-900 mb-4"> <div class="flex gap-3 justify-end"> <button id="cancelCaptionBtn" class="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md transition-colors">
Cancel
</button> <button id="confirmCaptionBtn" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors">
Upload
</button> </div> </div> </div>`} </section> ${renderScript($$result, "/Users/fher/atlassian/repo/her-family/src/components/Gallery.astro?astro&type=script&index=0&lang.ts")}`;
}, "/Users/fher/atlassian/repo/her-family/src/components/Gallery.astro", void 0);

const $$Astro$3 = createAstro();
const $$VideoPlayer = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$3, $$props, $$slots);
  Astro2.self = $$VideoPlayer;
  const { videoUrl, posterImage, title, description } = Astro2.props;
  return renderTemplate`${maybeRenderHead()}<section id="video" class="py-16 sm:py-24 bg-white"> <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8"> <div class="text-center mb-12"> <h2 class="font-display text-3xl sm:text-4xl font-bold text-warm-gray-900 mb-4" data-video-title> ${title || "In Their Own Words"} </h2> <div class="w-24 h-1 bg-warm-gray-300 mx-auto"></div> ${description && renderTemplate`<p class="mt-6 text-lg text-warm-gray-600 max-w-2xl mx-auto" data-video-description> ${description} </p>`} </div> <!-- Video Container --> <div class="relative bg-warm-gray-900 rounded-lg overflow-hidden shadow-2xl"> <div class="aspect-video"> <video class="w-full h-full object-cover" controls preload="metadata"${addAttribute(posterImage, "poster")}${addAttribute(title || "Memorial video", "aria-label")} data-video-element> <source${addAttribute(videoUrl, "src")} type="video/mp4" data-video-source> <source${addAttribute(videoUrl.replace(".mp4", ".webm"), "src")} type="video/webm"> <p class="text-white p-8 text-center">
Your browser doesn't support video playback.
<a${addAttribute(videoUrl, "href")} class="underline hover:no-underline" download>
Download the video instead.
</a> </p> </video> </div> <!-- Custom Play Button Overlay (optional) --> <div class="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 video-overlay transition-opacity duration-300"> <button class="play-button bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full p-6 transition-all duration-300 hover:scale-110 shadow-lg"> <svg class="w-12 h-12 text-warm-gray-900 ml-1" fill="currentColor" viewBox="0 0 24 24"> <path d="M8 5v14l11-7z"></path> </svg> </button> </div> </div> <!-- Video Controls Info --> <div class="mt-6 text-center text-sm text-warm-gray-500"> <p>Click play to watch • Use controls to adjust volume and playback</p> </div> </div> </section> ${renderScript($$result, "/Users/fher/atlassian/repo/her-family/src/components/VideoPlayer.astro?astro&type=script&index=0&lang.ts")}`;
}, "/Users/fher/atlassian/repo/her-family/src/components/VideoPlayer.astro", void 0);

var __freeze$1 = Object.freeze;
var __defProp$1 = Object.defineProperty;
var __template$1 = (cooked, raw) => __freeze$1(__defProp$1(cooked, "raw", { value: __freeze$1(cooked.slice()) }));
var _a$1;
const $$Astro$2 = createAstro();
const $$Donations = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$2, $$props, $$slots);
  Astro2.self = $$Donations;
  const {
    title = "Honor Their Memory",
    venmoUsername,
    venmoImage,
    cashappUsername,
    cashappImage,
    zelleEmail,
    zelleImage,
    customMessage = "Your generous donations help honor their memory and support their family during this difficult time.",
    subtitle = "Support the family during this difficult time"
  } = Astro2.props;
  return renderTemplate(_a$1 || (_a$1 = __template$1(["", '<section id="donations" class="py-16 sm:py-24 bg-warm-gray-50"> <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8"> <div class="text-center mb-12"> <h2 class="font-display text-3xl sm:text-4xl font-bold text-warm-gray-900 mb-4" data-donations-title> ', ' </h2> <div class="w-24 h-1 bg-warm-gray-300 mx-auto mb-6"></div> <p class="text-warm-gray-500 max-w-2xl mx-auto" data-donation-message> ', ' </p> </div> <!-- Donation Options --> <div class="bg-white rounded-xl shadow-lg p-8 sm:p-12"> <div class="flex flex-wrap justify-center gap-6 mb-8"> <div', " data-venmo-container> ", " </div> <div", " data-cashapp-container> ", " </div> <div", " data-zelle-container> ", ` </div> </div> <div class="mt-8 text-center text-sm text-warm-gray-500"> <p>All donations are deeply appreciated and help support the family during this time.</p> </div> </div> </div> <!-- Lightbox --> <div id="paymentLightbox" class="fixed inset-0 bg-black bg-opacity-90 z-[100] hidden flex items-center justify-center p-4 transition-opacity duration-300 opacity-0 pointer-events-none"> <div class="relative max-w-sm w-full bg-white rounded-xl shadow-2xl p-6 transform transition-transform duration-300 scale-95" id="paymentLightboxContent"> <button onclick="closePaymentLightbox()" class="absolute top-2 right-2 text-gray-500 hover:text-gray-800 transition-colors p-2 rounded-full hover:bg-gray-100" aria-label="Close"> <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path> </svg> </button> <h3 id="paymentLightboxTitle" class="text-xl font-bold text-gray-900 mb-4 text-center">Scan to Pay</h3> <div class="aspect-square w-full bg-gray-100 rounded-lg overflow-hidden mb-4 border border-gray-200"> <img id="paymentLightboxImage" src="" alt="QR Code" class="w-full h-full object-contain"> </div> <p class="text-center text-sm text-gray-500">
Use your camera app or payment app to scan this code.
</p> </div> </div> </section> <script>
  function openPaymentLightbox(imageUrl, title) {
    const lightbox = document.getElementById('paymentLightbox');
    const lightboxContent = document.getElementById('paymentLightboxContent');
    const img = document.getElementById('paymentLightboxImage');
    const titleEl = document.getElementById('paymentLightboxTitle');
    
    if (lightbox && img && titleEl) {
      img.src = imageUrl;
      titleEl.textContent = title;
      
      lightbox.classList.remove('hidden');
      // Small timeout to allow display:block to apply before opacity transition
      setTimeout(() => {
        lightbox.classList.remove('opacity-0', 'pointer-events-none');
        lightboxContent.classList.remove('scale-95');
        lightboxContent.classList.add('scale-100');
      }, 10);
      
      document.body.style.overflow = 'hidden';
    }
  }
  
  function closePaymentLightbox() {
    const lightbox = document.getElementById('paymentLightbox');
    const lightboxContent = document.getElementById('paymentLightboxContent');
    
    if (lightbox) {
      lightbox.classList.add('opacity-0', 'pointer-events-none');
      lightboxContent.classList.remove('scale-100');
      lightboxContent.classList.add('scale-95');
      
      setTimeout(() => {
        lightbox.classList.add('hidden');
        document.body.style.overflow = '';
      }, 3000); // Wait for transition
    }
  }
  
  // Close on outside click
  document.getElementById('paymentLightbox')?.addEventListener('click', (e) => {
    if (e.target.id === 'paymentLightbox') {
      closePaymentLightbox();
    }
  });
  
  // Close on escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !document.getElementById('paymentLightbox')?.classList.contains('hidden')) {
      closePaymentLightbox();
    }
  });
<\/script>`])), maybeRenderHead(), title, customMessage, addAttribute(`donation-option group w-full sm:w-[calc(50%-0.75rem)] ${!venmoUsername ? "hidden" : ""}`, "class"), venmoImage ? renderTemplate`<button type="button"${addAttribute(`openPaymentLightbox('${venmoImage}', 'Venmo QR Code')`, "onclick")} class="flex items-center p-6 border-2 border-warm-gray-200 rounded-lg hover:border-blue-400 hover:shadow-md transition-all duration-300 group-hover:scale-105 w-full text-left" data-venmo-btn> <div class="flex-shrink-0 w-16 h-16 flex items-center justify-center mr-4"> <svg class="w-full h-full" viewBox="0 0 48 48"> <path fill="#008CFF" d="M35,42H13c-3.866,0-7-3.134-7-7V13c0-3.866,3.134-7,7-7h22c3.866,0,7,3.134,7,7v22C42,38.866,38.866,42,35,42z"></path> <path fill="#fff" d="M26.1,36.3h-9.7l-3.9-23.2l8.5-0.8l2.1,16.5c1.9-3.1,4.3-8,4.3-11.4c0-1.8-0.3-3.1-0.8-4.1l8.3-1.8c0.9,1.5,1.3,3,1.3,4.9C35.4,22.6,30.3,30.5,26.1,36.3z"></path> </svg> </div> <div class="flex-1"> <h3 class="font-semibold text-warm-gray-900 mb-1">Venmo</h3> <p class="text-warm-gray-600 truncate" data-venmo-username>@${venmoUsername}</p> <p class="text-xs text-blue-500 mt-1">Click to view QR Code</p> </div> </button>` : renderTemplate`<a${addAttribute(venmoUsername ? `https://venmo.com/${venmoUsername}` : "#", "href")} target="_blank" rel="noopener noreferrer" class="flex items-center p-6 border-2 border-warm-gray-200 rounded-lg hover:border-blue-400 hover:shadow-md transition-all duration-300 group-hover:scale-105" data-venmo-link> <div class="flex-shrink-0 w-16 h-16 flex items-center justify-center mr-4"> <svg class="w-full h-full" viewBox="0 0 48 48"> <path fill="#008CFF" d="M35,42H13c-3.866,0-7-3.134-7-7V13c0-3.866,3.134-7,7-7h22c3.866,0,7,3.134,7,7v22C42,38.866,38.866,42,35,42z"></path> <path fill="#fff" d="M26.1,36.3h-9.7l-3.9-23.2l8.5-0.8l2.1,16.5c1.9-3.1,4.3-8,4.3-11.4c0-1.8-0.3-3.1-0.8-4.1l8.3-1.8c0.9,1.5,1.3,3,1.3,4.9C35.4,22.6,30.3,30.5,26.1,36.3z"></path> </svg> </div> <div class="flex-1"> <h3 class="font-semibold text-warm-gray-900 mb-1">Venmo</h3> <p class="text-warm-gray-600" data-venmo-username>@${venmoUsername || "username"}</p> </div> <svg class="w-5 h-5 text-warm-gray-400 group-hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path> </svg> </a>`, addAttribute(`donation-option group w-full sm:w-[calc(50%-0.75rem)] ${!cashappUsername ? "hidden" : ""}`, "class"), cashappImage ? renderTemplate`<button type="button"${addAttribute(`openPaymentLightbox('${cashappImage}', 'Cash App QR Code')`, "onclick")} class="flex items-center p-6 border-2 border-warm-gray-200 rounded-lg hover:border-green-500 hover:shadow-md transition-all duration-300 group-hover:scale-105 w-full text-left" data-cashapp-btn> <div class="flex-shrink-0 w-16 h-16 bg-white rounded-lg flex items-center justify-center mr-4 p-2"> <svg class="w-full h-full" fill="#00D632" viewBox="0 0 24 24"> <path d="M23.59 3.475a5.1 5.1 0 0 0-3.05-3.05c-1.31-.42-2.5-.42-4.92-.42H8.36c-2.4 0-3.61 0-4.9.4a5.1 5.1 0 0 0-3.05 3.06C0 4.765 0 5.965 0 8.365v7.27c0 2.41 0 3.6.4 4.9a5.1 5.1 0 0 0 3.05 3.05c1.3.41 2.5.41 4.9.41h7.28c2.41 0 3.61 0 4.9-.4a5.1 5.1 0 0 0 3.06-3.06c.41-1.3.41-2.5.41-4.9v-7.25c0-2.41 0-3.61-.41-4.91zm-6.17 4.63-.93.93a.5.5 0 0 1-.67.01 5 5 0 0 0-3.22-1.18c-.97 0-1.94.32-1.94 1.21 0 .9 1.04 1.2 2.24 1.65 2.1.7 3.84 1.58 3.84 3.64 0 2.24-1.74 3.78-4.58 3.95l-.26 1.2a.49.49 0 0 1-.48.39H9.63l-.09-.01a.5.5 0 0 1-.38-.59l.28-1.27a6.54 6.54 0 0 1-2.88-1.57v-.01a.48.48 0 0 1 0-.68l1-.97a.49.49 0 0 1 .67 0c.91.86 2.13 1.34 3.39 1.32 1.3 0 2.17-.55 2.17-1.42 0-.87-.88-1.1-2.54-1.72-1.76-.63-3.43-1.52-3.43-3.6 0-2.42 2.01-3.6 4.39-3.71l.25-1.23a.48.48 0 0 1 .48-.38h1.78l.1.01c.26.06.43.31.37.57l-.27 1.37c.9.3 1.75.77 2.48 1.39l.02.02c.19.2.19.5 0 .68z"></path> </svg> </div> <div class="flex-1"> <h3 class="font-semibold text-warm-gray-900 mb-1">Cash App</h3> <p class="text-warm-gray-600 truncate" data-cashapp-username>${cashappUsername}</p> <p class="text-xs text-green-500 mt-1">Click to view QR Code</p> </div> </button>` : renderTemplate`<a${addAttribute(cashappUsername ? `https://cash.app/${cashappUsername}` : "#", "href")} target="_blank" rel="noopener noreferrer" class="flex items-center p-6 border-2 border-warm-gray-200 rounded-lg hover:border-green-500 hover:shadow-md transition-all duration-300 group-hover:scale-105" data-cashapp-link> <div class="flex-shrink-0 w-16 h-16 bg-white rounded-lg flex items-center justify-center mr-4 p-2"> <svg class="w-full h-full" fill="#00D632" viewBox="0 0 24 24"> <path d="M23.59 3.475a5.1 5.1 0 0 0-3.05-3.05c-1.31-.42-2.5-.42-4.92-.42H8.36c-2.4 0-3.61 0-4.9.4a5.1 5.1 0 0 0-3.05 3.06C0 4.765 0 5.965 0 8.365v7.27c0 2.41 0 3.6.4 4.9a5.1 5.1 0 0 0 3.05 3.05c1.3.41 2.5.41 4.9.41h7.28c2.41 0 3.61 0 4.9-.4a5.1 5.1 0 0 0 3.06-3.06c.41-1.3.41-2.5.41-4.9v-7.25c0-2.41 0-3.61-.41-4.91zm-6.17 4.63-.93.93a.5.5 0 0 1-.67.01 5 5 0 0 0-3.22-1.18c-.97 0-1.94.32-1.94 1.21 0 .9 1.04 1.2 2.24 1.65 2.1.7 3.84 1.58 3.84 3.64 0 2.24-1.74 3.78-4.58 3.95l-.26 1.2a.49.49 0 0 1-.48.39H9.63l-.09-.01a.5.5 0 0 1-.38-.59l.28-1.27a6.54 6.54 0 0 1-2.88-1.57v-.01a.48.48 0 0 1 0-.68l1-.97a.49.49 0 0 1 .67 0c.91.86 2.13 1.34 3.39 1.32 1.3 0 2.17-.55 2.17-1.42 0-.87-.88-1.1-2.54-1.72-1.76-.63-3.43-1.52-3.43-3.6 0-2.42 2.01-3.6 4.39-3.71l.25-1.23a.48.48 0 0 1 .48-.38h1.78l.1.01c.26.06.43.31.37.57l-.27 1.37c.9.3 1.75.77 2.48 1.39l.02.02c.19.2.19.5 0 .68z"></path> </svg> </div> <div class="flex-1"> <h3 class="font-semibold text-warm-gray-900 mb-1">Cash App</h3> <p class="text-warm-gray-600" data-cashapp-username>${cashappUsername || "$username"}</p> </div> <svg class="w-5 h-5 text-warm-gray-400 group-hover:text-green-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path> </svg> </a>`, addAttribute(`donation-option group w-full sm:w-[calc(50%-0.75rem)] ${!zelleEmail ? "hidden" : ""}`, "class"), zelleImage ? renderTemplate`<button type="button"${addAttribute(`openPaymentLightbox('${zelleImage}', 'Zelle QR Code')`, "onclick")} class="flex items-center p-6 border-2 border-warm-gray-200 rounded-lg hover:border-purple-500 hover:shadow-md transition-all duration-300 group-hover:scale-105 w-full text-left" data-zelle-btn> <div class="flex-shrink-0 w-16 h-16 flex items-center justify-center mr-4"> <svg class="w-full h-full" viewBox="0 0 48 48"> <path fill="#a0f" d="M35,42H13c-3.866,0-7-3.134-7-7V13c0-3.866,3.134-7,7-7h22c3.866,0,7,3.134,7,7v22C42,38.866,38.866,42,35,42z"></path> <path fill="#fff" d="M17.5,18.5h14c0.552,0,1-0.448,1-1V15c0-0.552-0.448-1-1-1h-14c-0.552,0-1,0.448-1,1v2.5C16.5,18.052,16.948,18.5,17.5,18.5z"></path> <path fill="#fff" d="M17,34.5h14.5c0.552,0,1-0.448,1-1V31c0-0.552-0.448-1-1-1H17c-0.552,0-1,0.448-1,1v2.5C16,34.052,16.448,34.5,17,34.5z"></path> <path fill="#fff" d="M22.25,11v6c0,0.276,0.224,0.5,0.5,0.5h3.5c0.276,0,0.5-0.224,0.5-0.5v-6c0-0.276-0.224-0.5-0.5-0.5h-3.5C22.474,10.5,22.25,10.724,22.25,11z"></path> <path fill="#fff" d="M22.25,32v6c0,0.276,0.224,0.5,0.5,0.5h3.5c0.276,0,0.5-0.224,0.5-0.5v-6c0-0.276-0.224-0.5-0.5-0.5h-3.5C22.474,31.5,22.25,31.724,22.25,32z"></path> <path fill="#fff" d="M16.578,30.938H22l10.294-12.839c0.178-0.222,0.019-0.552-0.266-0.552H26.5L16.275,30.298C16.065,30.553,16.247,30.938,16.578,30.938z"></path> </svg> </div> <div class="flex-1"> <h3 class="font-semibold text-warm-gray-900 mb-1">Zelle</h3> <p class="text-warm-gray-600 truncate" data-zelle-email>${zelleEmail}</p> <p class="text-xs text-purple-500 mt-1">Click to view QR Code</p> </div> </button>` : renderTemplate`<div class="flex items-center p-6 border-2 border-warm-gray-200 rounded-lg"> <div class="flex-shrink-0 w-16 h-16 flex items-center justify-center mr-4"> <svg class="w-full h-full" viewBox="0 0 48 48"> <path fill="#a0f" d="M35,42H13c-3.866,0-7-3.134-7-7V13c0-3.866,3.134-7,7-7h22c3.866,0,7,3.134,7,7v22C42,38.866,38.866,42,35,42z"></path> <path fill="#fff" d="M17.5,18.5h14c0.552,0,1-0.448,1-1V15c0-0.552-0.448-1-1-1h-14c-0.552,0-1,0.448-1,1v2.5C16.5,18.052,16.948,18.5,17.5,18.5z"></path> <path fill="#fff" d="M17,34.5h14.5c0.552,0,1-0.448,1-1V31c0-0.552-0.448-1-1-1H17c-0.552,0-1,0.448-1,1v2.5C16,34.052,16.448,34.5,17,34.5z"></path> <path fill="#fff" d="M22.25,11v6c0,0.276,0.224,0.5,0.5,0.5h3.5c0.276,0,0.5-0.224,0.5-0.5v-6c0-0.276-0.224-0.5-0.5-0.5h-3.5C22.474,10.5,22.25,10.724,22.25,11z"></path> <path fill="#fff" d="M22.25,32v6c0,0.276,0.224,0.5,0.5,0.5h3.5c0.276,0,0.5-0.224,0.5-0.5v-6c0-0.276-0.224-0.5-0.5-0.5h-3.5C22.474,31.5,22.25,31.724,22.25,32z"></path> <path fill="#fff" d="M16.578,30.938H22l10.294-12.839c0.178-0.222,0.019-0.552-0.266-0.552H26.5L16.275,30.298C16.065,30.553,16.247,30.938,16.578,30.938z"></path> </svg> </div> <div class="flex-1"> <h3 class="font-semibold text-warm-gray-900 mb-1">Zelle</h3> <p class="text-warm-gray-600" data-zelle-email>${zelleEmail || "email@example.com"}</p> <p class="text-sm text-warm-gray-500 mt-1">Send via your banking app</p> </div> </div>`);
}, "/Users/fher/atlassian/repo/her-family/src/components/Donations.astro", void 0);

const $$Astro$1 = createAstro();
const $$Comments = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$1, $$props, $$slots);
  Astro2.self = $$Comments;
  const {
    title = "Memories & Condolences",
    subtitle = "Share your favorite memories and messages of love."
  } = Astro2.props;
  return renderTemplate`${maybeRenderHead()}<section id="memories" class="py-16 sm:py-24 bg-white relative overflow-hidden"> <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10"> <div class="text-center mb-16"> <h2 class="font-display text-3xl sm:text-4xl font-bold text-warm-gray-900 mb-4" data-comments-title> ${title} </h2> <div class="w-24 h-1 bg-warm-gray-300 mx-auto mb-6"></div> <p class="text-lg text-warm-gray-600 max-w-2xl mx-auto" data-comments-subtitle> ${subtitle} </p> </div> <div class="flex flex-col gap-16"> <!-- Comment Form --> <div class="w-full max-w-2xl mx-auto bg-warm-gray-50 rounded-xl p-8 shadow-sm border border-warm-gray-100"> <h3 class="text-xl font-semibold text-warm-gray-900 mb-6 text-center">Share a Memory</h3> <form id="commentForm" class="space-y-4"> <div class="grid grid-cols-1 md:grid-cols-2 gap-4"> <div> <label for="name" class="block text-sm font-medium text-warm-gray-700 mb-1">Your Name *</label> <input type="text" id="name" name="name" required class="w-full px-4 py-2 rounded-lg border-warm-gray-300 focus:ring-warm-gray-500 focus:border-warm-gray-500 bg-white" placeholder="Enter your name"> </div> <div> <label for="relationship" class="block text-sm font-medium text-warm-gray-700 mb-1">Relationship (optional)</label> <input type="text" id="relationship" name="relationship" class="w-full px-4 py-2 rounded-lg border-warm-gray-300 focus:ring-warm-gray-500 focus:border-warm-gray-500 bg-white" placeholder="e.g., Friend, Colleague"> </div> </div> <div> <label for="email" class="block text-sm font-medium text-warm-gray-700 mb-1">Email (optional)</label> <input type="email" id="email" name="email" class="w-full px-4 py-2 rounded-lg border-warm-gray-300 focus:ring-warm-gray-500 focus:border-warm-gray-500 bg-white" placeholder="For return contact only"> </div> <div> <label for="message" class="block text-sm font-medium text-warm-gray-700 mb-1">Your Memory *</label> <textarea id="message" name="message" rows="4" required maxlength="1000" class="w-full px-4 py-2 rounded-lg border-warm-gray-300 focus:ring-warm-gray-500 focus:border-warm-gray-500 bg-white resize-none" placeholder="Share a story or message..."></textarea> <div class="flex justify-end mt-1"> <span id="charCount" class="text-xs text-warm-gray-500">0/1000</span> </div> </div> <div> <label class="block text-sm font-medium text-warm-gray-700 mb-1">Add a Photo (optional)</label> <div class="flex items-center gap-4"> <button type="button" id="selectImageBtn" class="px-4 py-2 bg-white border border-warm-gray-300 rounded-lg text-sm text-warm-gray-700 hover:bg-warm-gray-50 transition-colors flex items-center gap-2"> <svg class="w-5 h-5 text-warm-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path> </svg>
Choose Photo
</button> <span id="imageFileName" class="text-sm text-warm-gray-500 truncate max-w-[150px]"></span> <button type="button" id="clearImageBtn" class="hidden text-warm-gray-400 hover:text-red-500"> <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path> </svg> </button> </div> <input type="file" id="commentImage" name="image" accept="image/*" class="hidden"> <p class="text-xs text-warm-gray-500 mt-1">Max 5MB. JPEG, PNG, WebP supported.</p> </div> <div id="formMessage" class="hidden text-sm p-3 rounded-lg"></div> <button type="submit" id="submitBtn" class="w-full bg-warm-gray-800 text-white px-6 py-3 rounded-lg hover:bg-warm-gray-700 transition-colors font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5 duration-200">
Share
</button> </form> </div> <!-- Comments Carousel --> <div class="w-full relative"> <div class="flex justify-between items-center mb-6"> <h3 class="text-xl font-semibold text-warm-gray-900">Recent Memories</h3> <!-- Navigation Buttons --> <div class="flex gap-2"> <button id="prevCommentBtn" class="p-2 rounded-full bg-white border border-warm-gray-200 text-warm-gray-600 hover:bg-warm-gray-50 hover:text-warm-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm" aria-label="Previous memories" disabled> <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path> </svg> </button> <button id="nextCommentBtn" class="p-2 rounded-full bg-white border border-warm-gray-200 text-warm-gray-600 hover:bg-warm-gray-50 hover:text-warm-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm" aria-label="Next memories"> <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path> </svg> </button> </div> </div> <div id="commentsCarouselContainer" class="overflow-hidden pb-4"> <div id="commentsTrack" class="flex transition-transform duration-500 ease-out gap-6"> <!-- Loading State Initial --> <div class="w-full flex justify-center py-12" id="initialLoader"> <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-warm-gray-600"></div> </div> <!-- Comments will be injected here --> </div> </div> </div> </div> </div> <!-- Comment Image Lightbox --> <div id="commentLightbox" class="fixed inset-0 bg-black bg-opacity-95 z-[100] hidden items-center justify-center p-4"> <button id="closeCommentLightbox" class="absolute top-4 right-4 text-white hover:text-warm-gray-300 transition-colors p-2 z-[101] bg-black/50 rounded-full hover:bg-black/70" aria-label="Close lightbox"> <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path> </svg> </button> <div class="relative max-w-5xl max-h-[90vh] flex flex-col items-center justify-center w-full h-full"> <img id="commentLightboxImage" src="" alt="Memory" class="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"> <div id="commentLightboxCaption" class="text-white text-center mt-4 text-lg font-medium drop-shadow-md px-4"></div> </div> </div> </section> ${renderScript($$result, "/Users/fher/atlassian/repo/her-family/src/components/Comments.astro?astro&type=script&index=0&lang.ts")}`;
}, "/Users/fher/atlassian/repo/her-family/src/components/Comments.astro", void 0);

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(cooked.slice()) }));
var _a;
const $$Astro = createAstro();
const prerender = false;
const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Index;
  const cookies = Astro2.cookies;
  const isAdmin = cookies.get("admin_auth")?.value === "true";
  let memorialData = {};
  try {
    const content = await db.select().from(MemorialContent);
    const allGalleryImages = await db.select().from(GalleryImages);
    const galleryImages = allGalleryImages.filter((img) => img.isActive);
    const organizedContent = content.reduce((acc, item) => {
      if (!acc[item.section]) {
        acc[item.section] = {};
      }
      acc[item.section][item.key] = item.value;
      return acc;
    }, {});
    console.log("Server-side organizedContent:", JSON.stringify(organizedContent, null, 2));
    const processedImages = galleryImages.sort((a, b) => a.displayOrder - b.displayOrder).map((img) => ({
      src: img.imagePath,
      // Support both local (/images/...) and Cloudinary URLs
      alt: img.caption || "Memorial photo",
      caption: img.caption
    }));
    const getContent = (section, key, defaultVal) => {
      const val = organizedContent[section]?.[key];
      return val !== void 0 ? val : defaultVal;
    };
    memorialData = {
      name: getContent("hero", "name", "Memorial Name"),
      birthDate: getContent("hero", "birthDate", "1900-01-01"),
      deathDate: getContent("hero", "deathDate", "2024-01-01"),
      mainImage: getContent("hero", "mainImage", "/images/portrait.jpg"),
      backgroundImage: getContent("hero", "backgroundImage", ""),
      subtitle: getContent("hero", "subtitle", "In loving memory"),
      biography: getContent("biography", "content", "Biography content will appear here."),
      biographyTitle: getContent("biography", "title", "Remembering a Beautiful Life"),
      biographyVisible: organizedContent.biography?.visible !== "false",
      highlights: organizedContent.biography?.highlights ? JSON.parse(organizedContent.biography.highlights) : ["Life highlights will appear here"],
      highlightsVisible: organizedContent.highlights?.visible !== "false",
      images: processedImages.length > 0 ? processedImages : [
        { src: "/images/placeholder.jpg", alt: "Memorial photo", caption: "Add photos in admin" }
      ],
      galleryVisible: organizedContent.gallery?.visible !== "false",
      galleryTitle: getContent("gallery", "sectionTitle", "Treasured Moments"),
      videoUrl: getContent("video", "videoUrl", "/videos/memorial-video.mp4"),
      posterImage: getContent("video", "posterImage", "/images/video-poster.jpg"),
      videoSectionTitle: getContent("video", "sectionTitle", "In Their Own Words"),
      videoDescription: getContent("video", "description", "A tribute video"),
      videoVisible: organizedContent.video?.visible !== "false",
      donations: {
        sectionTitle: getContent("donations", "sectionTitle", "Honor Their Memory"),
        venmoUsername: getContent("donations", "venmoUsername", ""),
        venmoImage: getContent("donations", "venmoImage", ""),
        cashappUsername: getContent("donations", "cashappUsername", ""),
        cashappImage: getContent("donations", "cashappImage", ""),
        zelleEmail: getContent("donations", "zelleEmail", ""),
        zelleImage: getContent("donations", "zelleImage", ""),
        subtitle: getContent("donations", "subtitle", "Support the family during this difficult time"),
        customMessage: getContent("donations", "customMessage", "Thank you for your support."),
        visible: organizedContent.donations?.visible !== "false"
      },
      commentsTitle: getContent("comments", "sectionTitle", "Share Your Memories"),
      commentsSubtitle: getContent("comments", "subtitle", "Leave a message to honor their memory and share how they touched your life"),
      commentsVisible: organizedContent.comments?.visible !== "false",
      commentsAutoApprove: organizedContent.comments?.autoApprove === "true",
      footerVisible: organizedContent.footer?.visible !== "false",
      funeralInfo: {
        // Load services from database if they exist, otherwise use defaults
        sectionTitle: getContent("funeral", "sectionTitle", "Service Information"),
        visible: organizedContent.funeral?.visible !== "false",
        specialInstructionsVisible: organizedContent.funeral?.specialInstructionsVisible !== "false",
        flowersInfoVisible: organizedContent.funeral?.flowersInfoVisible !== "false",
        services: (() => {
          const defaultServices = [
            {
              type: "Funeral Service",
              date: "2024-01-15",
              time: "14:00",
              location: {
                name: "Funeral Home",
                address: "123 Memorial Drive, Springfield, IL 62701",
                phone: "(217) 555-0123",
                website: "https://peacefulrest.com"
              },
              description: "Family and friends are invited to pay their respects and share memories.",
              dresscode: "Formal attire preferred"
            },
            {
              type: "Burial",
              date: "2024-01-16",
              time: "11:00",
              location: {
                name: "Cemetery",
                address: "456 Church Street, Springfield, IL 62701",
                phone: "(217) 555-0456",
                website: "https://stmaryscathedral.org"
              },
              description: "A celebration of life with readings, music, and remembrances.",
              dresscode: "Formal attire preferred"
            }
          ];
          const loadedServices = [];
          for (let i = 0; i < 10; i++) {
            const serviceKey = `service${i}`;
            if (organizedContent.funeral?.[serviceKey]) {
              try {
                const serviceData = JSON.parse(organizedContent.funeral[serviceKey]);
                loadedServices.push(serviceData);
              } catch (e) {
                console.error(`Error parsing service ${i}:`, e);
              }
            }
          }
          return loadedServices.length > 0 ? loadedServices : defaultServices;
        })(),
        receptionInfo: {
          location: "Home of the Family",
          time: "Following the burial (approximately 12:30 PM)",
          description: "Light refreshments will be served. All are welcome to join us for fellowship and to continue sharing memories."
        },
        receptionVisible: organizedContent.reception?.visible !== "false",
        subtitle: getContent("funeral", "subtitle", "Please join us as we celebrate their life and honor their memory"),
        specialInstructions: getContent("funeral", "specialInstructions", "Please arrive 15 minutes early for seating. The funeral service will be livestreamed for those unable to attend in person. A link will be provided to family members."),
        flowersInfo: getContent("funeral", "flowersInfo", "In lieu of flowers, the family requests donations be made to a charity of your choice.")
      }
    };
  } catch (error) {
    console.error("Error loading memorial content:", error);
    memorialData = {
      name: "Memorial Page",
      birthDate: "1900-01-01",
      deathDate: "2024-01-01",
      mainImage: "/images/portrait.jpg",
      backgroundImage: "",
      subtitle: "Please initialize content in admin",
      biography: "Please set up memorial content in the admin panel.",
      biographyTitle: "Memorial",
      highlights: ["Please add content in admin"],
      images: [{ src: "/images/placeholder.jpg", alt: "Placeholder", caption: "Add images in admin" }],
      videoUrl: "/videos/memorial-video.mp4",
      posterImage: "/images/video-poster.jpg",
      videoSectionTitle: "In Their Own Words",
      videoDescription: "Video description",
      donations: {
        venmoUsername: "",
        venmoImage: "",
        cashappUsername: "",
        cashappImage: "",
        zelleEmail: "",
        zelleImage: "",
        subtitle: "Support the family during this difficult time",
        customMessage: "Thank you for your support."
      },
      funeralInfo: {
        services: [],
        receptionInfo: null,
        subtitle: "Please set up funeral information in admin",
        specialInstructions: "Please set up funeral information in admin",
        flowersInfo: "Please configure in admin"
      }
    };
  }
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": `${memorialData.name} - Memorial Page`, "description": `A memorial page celebrating the life of ${memorialData.name}, ${memorialData.subtitle}` }, { "default": async ($$result2) => renderTemplate(_a || (_a = __template(['<script id="memorial-data" type="application/json">', "<\/script>", "<main><!-- Admin Toolbar (only visible when logged in) -->", '<!-- Hero Section --><div id="hero-section" class="relative">', "", '</div><!-- Navigation --><nav class="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-warm-gray-200"><div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8"><div class="flex justify-center space-x-4 py-4 flex-wrap"><a href="#biography" class="text-warm-gray-600 hover:text-warm-gray-900 font-medium transition-colors">Life Story</a><a href="#funeral-info" class="text-warm-gray-600 hover:text-warm-gray-900 font-medium transition-colors">Services</a><a href="#gallery" class="text-warm-gray-600 hover:text-warm-gray-900 font-medium transition-colors">Gallery</a><a href="#video" class="text-warm-gray-600 hover:text-warm-gray-900 font-medium transition-colors">Video</a><a href="#memories" class="text-warm-gray-600 hover:text-warm-gray-900 font-medium transition-colors">Memories</a><a href="#donations" class="text-warm-gray-600 hover:text-warm-gray-900 font-medium transition-colors">Support</a></div></div></nav><!-- Biography Section -->', "<!-- Funeral Information Section -->", "<!-- Gallery Section -->", "<!-- Video Section -->", "<!-- Comments Section -->", "<!-- Donations Section -->", "<!-- Footer -->", "</main>", "", ""])), unescapeHTML(JSON.stringify(memorialData)), maybeRenderHead(), isAdmin && renderTemplate`<div class="fixed top-0 left-0 z-50 m-4"><div class="bg-indigo-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center space-x-4"><span class="text-sm font-medium">✏️ Edit Mode</span><!-- Toggle Switch --><label class="relative inline-flex items-center cursor-pointer"><input type="checkbox" id="editModeToggle" class="sr-only peer" checked><div class="w-11 h-6 bg-indigo-800 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-white rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div><span class="ml-2 text-xs font-medium" id="editModeLabel">ON</span></label><div class="h-6 w-px bg-white/30"></div><a href="/admin" class="text-xs bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded transition-colors">
Admin Panel
</a></div></div>`, renderComponent($$result2, "Hero", $$Hero, { "name": memorialData.name, "birthDate": memorialData.birthDate, "deathDate": memorialData.deathDate, "mainImage": memorialData.mainImage, "backgroundImage": memorialData.backgroundImage, "subtitle": memorialData.subtitle }), isAdmin && renderTemplate`<button onclick="openEditModal('hero')" class="absolute top-4 right-4 bg-white/90 hover:bg-white text-indigo-600 px-3 py-2 rounded-lg shadow-md text-sm font-medium transition-all edit-button">
✏️ Edit Hero
</button>`, (memorialData.biographyVisible || isAdmin) && renderTemplate`<div id="biography-section"${addAttribute(`relative ${!memorialData.biographyVisible && isAdmin ? "opacity-70 border-2 border-dashed border-gray-300" : ""}`, "class")}>${isAdmin && !memorialData.biographyVisible && renderTemplate`<div class="absolute top-0 left-0 bg-gray-200 text-gray-600 text-xs px-2 py-1 rounded-br z-20">Hidden from public</div>`}${renderComponent($$result2, "Biography", $$Biography, { "title": memorialData.biographyTitle, "content": memorialData.biography, "highlights": memorialData.highlights, "isAdmin": isAdmin })}${isAdmin && renderTemplate`<button onclick="openEditModal('biography')" class="absolute top-8 right-8 bg-white/90 hover:bg-white text-indigo-600 px-3 py-2 rounded-lg shadow-md text-sm font-medium transition-all edit-button">
✏️ Edit Biography
</button>`}</div>`, (memorialData.funeralInfo.visible || isAdmin) && renderTemplate`<div id="funeral-section"${addAttribute(`relative ${!memorialData.funeralInfo.visible && isAdmin ? "opacity-70 border-2 border-dashed border-gray-300" : ""}`, "class")}>${isAdmin && !memorialData.funeralInfo.visible && renderTemplate`<div class="absolute top-0 left-0 bg-gray-200 text-gray-600 text-xs px-2 py-1 rounded-br z-20">Hidden from public</div>`}${renderComponent($$result2, "FuneralInfo", $$FuneralInfo, { "title": memorialData.funeralInfo.sectionTitle, "services": memorialData.funeralInfo.services, "receptionInfo": memorialData.funeralInfo.receptionInfo, "subtitle": memorialData.funeralInfo.subtitle, "specialInstructions": memorialData.funeralInfo.specialInstructions, "flowersInfo": memorialData.funeralInfo.flowersInfo, "isAdmin": isAdmin, "specialInstructionsVisible": memorialData.funeralInfo.specialInstructionsVisible, "flowersInfoVisible": memorialData.funeralInfo.flowersInfoVisible, "receptionVisible": memorialData.receptionVisible })}${isAdmin && renderTemplate`<button onclick="openEditModal('funeral')" class="absolute top-8 right-8 bg-white/90 hover:bg-white text-indigo-600 px-3 py-2 rounded-lg shadow-md text-sm font-medium transition-all edit-button">
✏️ Edit Funeral Info
</button>`}</div>`, (memorialData.galleryVisible || isAdmin) && renderTemplate`<div id="gallery-section"${addAttribute(`relative ${!memorialData.galleryVisible && isAdmin ? "opacity-70 border-2 border-dashed border-gray-300" : ""}`, "class")}>${isAdmin && !memorialData.galleryVisible && renderTemplate`<div class="absolute top-0 left-0 bg-gray-200 text-gray-600 text-xs px-2 py-1 rounded-br z-20">Hidden from public</div>`}${renderComponent($$result2, "Gallery", $$Gallery, { "images": memorialData.images, "isAdmin": isAdmin, "title": memorialData.galleryTitle })}${isAdmin && renderTemplate`<button onclick="openEditModal('gallery')" class="absolute top-8 right-8 bg-white/90 hover:bg-white text-indigo-600 px-3 py-2 rounded-lg shadow-md text-sm font-medium transition-all edit-button">
✏️ Edit Gallery
</button>`}</div>`, (memorialData.videoVisible || isAdmin) && renderTemplate`<div id="video-section"${addAttribute(`relative ${!memorialData.videoVisible && isAdmin ? "opacity-70 border-2 border-dashed border-gray-300" : ""}`, "class")}>${isAdmin && !memorialData.videoVisible && renderTemplate`<div class="absolute top-0 left-0 bg-gray-200 text-gray-600 text-xs px-2 py-1 rounded-br z-20">Hidden from public</div>`}${renderComponent($$result2, "VideoPlayer", $$VideoPlayer, { "videoUrl": memorialData.videoUrl, "posterImage": memorialData.posterImage, "title": memorialData.videoSectionTitle, "description": memorialData.videoDescription })}${isAdmin && renderTemplate`<button onclick="openEditModal('video')" class="absolute top-8 right-8 bg-white/90 hover:bg-white text-indigo-600 px-3 py-2 rounded-lg shadow-md text-sm font-medium transition-all edit-button">
✏️ Edit Video
</button>`}</div>`, (memorialData.commentsVisible || isAdmin) && renderTemplate`<div id="comments-section"${addAttribute(`relative ${!memorialData.commentsVisible && isAdmin ? "opacity-70 border-2 border-dashed border-gray-300" : ""}`, "class")}>${isAdmin && !memorialData.commentsVisible && renderTemplate`<div class="absolute top-0 left-0 bg-gray-200 text-gray-600 text-xs px-2 py-1 rounded-br z-20">Hidden from public</div>`}${renderComponent($$result2, "Comments", $$Comments, { "title": memorialData.commentsTitle, "subtitle": memorialData.commentsSubtitle })}${isAdmin && renderTemplate`<button onclick="openEditModal('comments')" class="absolute top-8 right-8 bg-white/90 hover:bg-white text-indigo-600 px-3 py-2 rounded-lg shadow-md text-sm font-medium transition-all edit-button">
✏️ Edit Memories
</button>`}</div>`, (memorialData.donations.visible || isAdmin) && renderTemplate`<div id="donations-section"${addAttribute(`relative ${!memorialData.donations.visible && isAdmin ? "opacity-70 border-2 border-dashed border-gray-300" : ""}`, "class")}>${isAdmin && !memorialData.donations.visible && renderTemplate`<div class="absolute top-0 left-0 bg-gray-200 text-gray-600 text-xs px-2 py-1 rounded-br z-20">Hidden from public</div>`}${renderComponent($$result2, "Donations", $$Donations, { "title": memorialData.donations.sectionTitle, "venmoUsername": memorialData.donations.venmoUsername, "venmoImage": memorialData.donations.venmoImage, "cashappUsername": memorialData.donations.cashappUsername, "cashappImage": memorialData.donations.cashappImage, "zelleEmail": memorialData.donations.zelleEmail, "zelleImage": memorialData.donations.zelleImage, "subtitle": memorialData.donations.subtitle, "customMessage": memorialData.donations.customMessage })}${isAdmin && renderTemplate`<button onclick="openEditModal('donations')" class="absolute top-8 right-8 bg-white/90 hover:bg-white text-indigo-600 px-3 py-2 rounded-lg shadow-md text-sm font-medium transition-all edit-button">
✏️ Edit Donations
</button>`}</div>`, (memorialData.footerVisible || isAdmin) && renderTemplate`<footer${addAttribute(`bg-warm-gray-800 text-warm-gray-300 py-12 relative ${!memorialData.footerVisible && isAdmin ? "opacity-70 border-t-2 border-dashed border-gray-500" : ""}`, "class")}>${isAdmin && !memorialData.footerVisible && renderTemplate`<div class="absolute top-0 left-0 bg-gray-200 text-gray-600 text-xs px-2 py-1 rounded-br z-20">Hidden from public</div>`}<div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center"><div class="mb-6"><h3 class="font-display text-2xl font-semibold text-white mb-2" data-footer-name>${memorialData.name}</h3><p class="text-warm-gray-400" data-footer-dates>${new Date(memorialData.birthDate).getFullYear()} - ${new Date(memorialData.deathDate).getFullYear()}</p></div><p class="text-warm-gray-400 max-w-2xl mx-auto" data-footer-quote>
"Those we love don't go away, they walk beside us every day. Unseen, unheard, but always near, still loved, still missed, and very dear."
</p><div class="mt-8 pt-8 border-t border-warm-gray-700"><p class="text-sm text-warm-gray-500" data-footer-credit>
Created with love by the Family • 2024
</p></div></div>${isAdmin && renderTemplate`<button onclick="openEditModal('footer')" class="absolute top-4 right-4 bg-white/90 hover:bg-white text-indigo-600 px-3 py-2 rounded-lg shadow-md text-sm font-medium transition-all edit-button">
✏️ Edit Footer
</button>`}</footer>`, isAdmin && renderTemplate`<div id="editModal" class="hidden fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"><div class="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"><div class="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center"><h2 id="modalTitle" class="text-xl font-semibold text-gray-900">Edit Content</h2><button onclick="closeEditModal()" class="text-gray-400 hover:text-gray-600 text-2xl leading-none">
&times;
</button></div><div id="modalContent" class="p-6 space-y-4"><!-- Content will be dynamically loaded here --></div><div class="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end space-x-3"><button onclick="closeEditModal()" class="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
Cancel
</button><button onclick="saveAllModalContent()" class="px-4 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700">
Save Changes
</button></div></div></div>`, renderScript($$result2, "/Users/fher/atlassian/repo/her-family/src/pages/index.astro?astro&type=script&index=0&lang.ts")) })}`;
}, "/Users/fher/atlassian/repo/her-family/src/pages/index.astro", void 0);

const $$file = "/Users/fher/atlassian/repo/her-family/src/pages/index.astro";
const $$url = "";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
