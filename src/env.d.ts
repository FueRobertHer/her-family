/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly ADMIN_PASSWORD?: string;
  readonly SESSION_SECRET?: string;
  readonly CLOUDINARY_CLOUD_NAME?: string;
  readonly CLOUDINARY_API_KEY?: string;
  readonly CLOUDINARY_API_SECRET?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

/**
 * Globals attached to window by client scripts. Declaring them here gives
 * type-checked access instead of the previous ts(2568) "may not exist" hints.
 * They are declared non-optional because the app always defines them before
 * the code that calls them runs (guarded call sites still typeof-check).
 */
interface Window {
  __MEMORIAL_SLUG__?: string;
  lightboxEscapeListenerAdded?: boolean;

  showToast: (message: string, type?: string, duration?: number) => void;

  openLightbox: (id: string, imageUrl?: string, title?: string) => void;
  closeLightbox: (id: string) => void;
  openCommentLightbox: (imageUrl: string, title?: string) => void;
  openPaymentLightbox: (imageUrl: string, title?: string) => void;
  closePaymentLightbox: () => void;

  openEditModal: (section: string) => void;
  closeEditModal: () => void;
  saveAllModalContent: () => void;
  toggleEditButtons: (visible?: boolean) => void;
  restoreHiddenSections: () => void;
  moderateComment: (id: number, action: string) => Promise<void>;
  toggleMemorialVisibility: (id: number, nextStatus: 'active' | 'hidden') => Promise<void>;
  requestMemorialEdit: (id: number) => void;
  requestMemorialDelete: (id: number) => void;
  uploadImageForField: (fieldId: string) => void;
  uploadVideoForField: (fieldId: string) => void;
  uploadAgendaForField: (fieldId: string) => void;
  initBiographyToggle: () => void;
  recheckBiographyTruncation: () => void;
}
