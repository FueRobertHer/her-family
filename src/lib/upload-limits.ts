/**
 * The one upload size limit, shared by the API route and every uploader in the
 * browser.
 *
 * Vercel Functions reject a request body over 4.5 MB with a 413 before our
 * handler is ever invoked, so that is the real ceiling for /api/upload-image
 * regardless of what we would otherwise allow. Sitting just under it means an
 * oversized file gets a clear message from us instead of an opaque platform
 * error page, and it keeps the number we advertise honest.
 *
 * Anything larger has to be uploaded to Cloudinary directly and pasted in as a
 * URL; every field that accepts an upload also accepts a URL.
 */
export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1).replace(/\.0$/, '')}MB`;
}

/** Derived, so the number we advertise can never drift from the one we enforce. */
export const MAX_UPLOAD_LABEL = formatBytes(MAX_UPLOAD_BYTES);

export const TOO_LARGE_MESSAGE =
  `Files must be under ${MAX_UPLOAD_LABEL}. ` +
  'For something larger, upload it to Cloudinary directly and paste the URL into the field instead.';
