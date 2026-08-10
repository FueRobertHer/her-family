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
 *
 * This list used to be much longer: most entries existed only so inline
 * onclick="..." attributes could reach module functions. Those handlers are
 * now delegated listeners bound inside the modules themselves, so only
 * genuinely cross-module globals remain.
 */
interface Window {
  /** Defined by Toast.astro, called from most client scripts. */
  showToast: (message: string, type?: string, duration?: number) => void;

  /** Defined and used by src/scripts/comments.ts. */
  openCommentLightbox: (imageUrl: string, title?: string) => void;
}
