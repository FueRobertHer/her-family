import { afterEach, describe, expect, test } from 'bun:test';
import { UploadError, describeUploadError, uploadToMediaLibrary } from '../src/scripts/lib/upload';
import { MAX_UPLOAD_BYTES, MAX_UPLOAD_LABEL, formatBytes } from '../src/lib/upload-limits';

const realFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = realFetch;
});

function stubFetch(response: Response | Error) {
  globalThis.fetch = (async () => {
    if (response instanceof Error) throw response;
    return response;
  }) as unknown as typeof fetch;
}

function file(bytes: number, name = 'agenda.pdf') {
  return new File([new Uint8Array(bytes)], name, { type: 'application/pdf' });
}

describe('upload limits', () => {
  // Vercel rejects bodies over 4.5MB before the function runs, so anything we
  // advertise above that is a promise we cannot keep.
  test('stays under the platform request body cap', () => {
    expect(MAX_UPLOAD_BYTES).toBeLessThan(4.5 * 1000 * 1000);
  });

  test('the advertised label matches the enforced limit', () => {
    expect(MAX_UPLOAD_LABEL).toBe(formatBytes(MAX_UPLOAD_BYTES));
  });
});

describe('uploadToMediaLibrary', () => {
  test('rejects an oversized file without calling the network', async () => {
    let called = false;
    globalThis.fetch = (async () => {
      called = true;
      return Response.json({});
    }) as unknown as typeof fetch;

    await expect(uploadToMediaLibrary(file(MAX_UPLOAD_BYTES + 1), 'f')).rejects.toThrow(/4MB/);
    expect(called).toBe(false);
  });

  test('names the offending file and its size', async () => {
    await expect(
      uploadToMediaLibrary(file(MAX_UPLOAD_BYTES + 1, 'program.pdf'), 'f')
    ).rejects.toThrow(/"program.pdf" is 4MB/);
  });

  test('returns the hosted url on success', async () => {
    stubFetch(Response.json({ success: true, url: 'https://cdn/x.pdf', publicId: 'x' }));

    expect(await uploadToMediaLibrary(file(10), 'f')).toEqual({
      url: 'https://cdn/x.pdf',
      publicId: 'x',
    });
  });

  // The bug this module exists for: a 413 from the platform is an HTML page,
  // and callers used to hand it straight to response.json().
  test('turns a platform 413 into a size message, not a JSON parse error', async () => {
    stubFetch(new Response('<html>Payload Too Large</html>', { status: 413 }));

    await expect(uploadToMediaLibrary(file(10), 'f')).rejects.toThrow(/under 4MB/);
  });

  test('reports a non-JSON error body with its status instead of throwing SyntaxError', async () => {
    stubFetch(new Response('<html>Bad Gateway</html>', { status: 502 }));

    const err = await uploadToMediaLibrary(file(10), 'f').catch((e) => e);
    expect(err.message).toContain('502');
    expect(err.message).not.toContain('JSON');
  });

  // The endpoint puts raw exception text in `details`. Admins need it; a
  // visitor uploading a photo to a memorial page must never be shown it, so it
  // is carried separately rather than baked into the message.
  test('keeps the server diagnostic out of the user-facing message', async () => {
    stubFetch(
      Response.json(
        { error: 'Failed to upload image', details: 'getaddrinfo ENOTFOUND api.cloudinary.com' },
        { status: 500 }
      )
    );

    const err = await uploadToMediaLibrary(file(10), 'f').catch((e) => e);

    expect(err).toBeInstanceOf(UploadError);
    expect(err.message).toBe('Failed to upload image');
    expect(err.message).not.toContain('ENOTFOUND');
    expect(err.detail).toBe('getaddrinfo ENOTFOUND api.cloudinary.com');
  });

  test('describeUploadError adds the diagnostic back for admin surfaces', async () => {
    stubFetch(
      Response.json(
        { error: 'Cloudinary not configured', details: 'Add CLOUDINARY_API_KEY' },
        { status: 500 }
      )
    );

    const err = await uploadToMediaLibrary(file(10), 'f').catch((e) => e);

    expect(describeUploadError(err)).toBe('Cloudinary not configured: Add CLOUDINARY_API_KEY');
  });

  test('describeUploadError leaves a detail-free error alone', () => {
    expect(describeUploadError(new UploadError('Files must be under 4MB.'))).toBe(
      'Files must be under 4MB.'
    );
  });

  test('treats a 200 without a url as a failure', async () => {
    stubFetch(Response.json({ success: true }));

    await expect(uploadToMediaLibrary(file(10), 'f')).rejects.toThrow(/Upload failed/);
  });

  test('reports a network failure in plain language', async () => {
    stubFetch(new TypeError('Failed to fetch'));

    await expect(uploadToMediaLibrary(file(10), 'f')).rejects.toThrow(/Could not reach the server/);
  });
});
