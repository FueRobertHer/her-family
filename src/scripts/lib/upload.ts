import { MAX_UPLOAD_BYTES, TOO_LARGE_MESSAGE, formatBytes } from '../../lib/upload-limits';

export interface UploadResult {
  url: string;
  publicId?: string;
}

/**
 * An upload failure, split into what anyone may read and what only an admin
 * should.
 *
 * `message` is always safe to show: our own size and network wording, or the
 * server's hand-written `error` string. `detail` is the endpoint's `details`
 * field, which is the raw exception text from Cloudinary. That is exactly what
 * an admin needs and exactly what a visitor on a memorial page should never be
 * shown, so the two are kept apart rather than concatenated at the throw site.
 */
export class UploadError extends Error {
  readonly detail?: string;

  constructor(message: string, detail?: string) {
    super(message);
    this.name = 'UploadError';
    this.detail = detail;
  }
}

/** Admin-facing rendering: the safe message plus the diagnostic, when present. */
export function describeUploadError(error: unknown): string {
  if (error instanceof UploadError) {
    return error.detail ? `${error.message}: ${error.detail}` : error.message;
  }
  return error instanceof Error && error.message ? error.message : 'Upload failed.';
}

/**
 * POSTs a file to /api/upload-image and returns the hosted URL, or throws an
 * Error whose message is safe to show the user as-is.
 *
 * Every caller used to do `await response.json()` with no status check. That
 * works for our own JSON errors but not for anything generated above the
 * handler: Vercel's 413 for an oversized body, or a gateway error, arrives as
 * HTML, so parsing it threw a bare SyntaxError and the user saw
 * "Unexpected token '<'" instead of "your file is too big". PDFs hit this far
 * more often than photos because scanned service programs are large.
 */
export async function uploadToMediaLibrary(file: File, folder: string): Promise<UploadResult> {
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new UploadError(`"${file.name}" is ${formatBytes(file.size)}. ${TOO_LARGE_MESSAGE}`);
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', folder);

  let response: Response;
  try {
    response = await fetch('/api/upload-image', { method: 'POST', body: formData });
  } catch {
    throw new UploadError('Could not reach the server. Check your connection and try again.');
  }

  // Either the platform rejecting the body before our handler runs (an HTML
  // page, which is what used to break JSON.parse) or our own handler's 413.
  // Both mean the same thing, so answer with the same wording and skip parsing.
  if (response.status === 413) {
    throw new UploadError(TOO_LARGE_MESSAGE);
  }

  const raw = await response.text();
  let result: {
    success?: boolean;
    url?: string;
    publicId?: string;
    error?: string;
    details?: string;
  };

  try {
    result = JSON.parse(raw);
  } catch {
    throw new UploadError(
      `Upload failed (HTTP ${response.status}). The server returned an unexpected response.`
    );
  }

  if (!response.ok || !result.success || !result.url) {
    throw new UploadError(
      result.error || `Upload failed (HTTP ${response.status})`,
      result.details
    );
  }

  return { url: result.url, publicId: result.publicId };
}
