import { MAX_UPLOAD_BYTES, TOO_LARGE_MESSAGE, formatBytes } from '../../lib/upload-limits';

export interface UploadResult {
  url: string;
  publicId?: string;
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
    throw new Error(`"${file.name}" is ${formatBytes(file.size)}. ${TOO_LARGE_MESSAGE}`);
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', folder);

  let response: Response;
  try {
    response = await fetch('/api/upload-image', { method: 'POST', body: formData });
  } catch {
    throw new Error('Could not reach the server. Check your connection and try again.');
  }

  // Raised by the platform before our handler runs, with an HTML body.

  // Raised by the platform before our handler runs, with an HTML body.
  if (response.status === 413) {
    throw new Error(TOO_LARGE_MESSAGE);
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
    throw new Error(
      `Upload failed (HTTP ${response.status}). The server returned an unexpected response.`
    );
  }

  if (!response.ok || !result.success || !result.url) {
    const detail = result.details ? `: ${result.details}` : '';
    throw new Error(`${result.error || `Upload failed (HTTP ${response.status})`}${detail}`);
  }

  return { url: result.url, publicId: result.publicId };
}
