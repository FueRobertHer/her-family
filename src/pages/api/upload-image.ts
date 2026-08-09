import type { APIRoute } from 'astro';
import { MediaService } from '../../lib/services/media.service.ts';
import { isAuthenticated as checkAuth } from '../../lib/auth';
import { checkRateLimit, getClientIdentifier } from '../../lib/rate-limiter';
import { getMemorialBySlug } from '../../lib/memorial-context';

export const prerender = false;

// Unauthenticated (comment) uploads: images only, small, rate limited.
const COMMENT_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
const COMMENT_UPLOADS_PER_HOUR = 10;

function jsonError(error: string, status: number, details?: string): Response {
  return new Response(JSON.stringify(details ? { error, details } : { error }), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export const POST: APIRoute = async (context) => {
  const { request, cookies } = context;

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const folder = (formData.get('folder') as string) || 'memorials/default/uploads';

    const isAdmin = checkAuth(cookies);
    const commentFolderMatch = folder.match(/^memorials\/([^/]+)\/comments$/);

    if (!isAdmin && !commentFolderMatch) {
      return jsonError('Unauthorized - Please log in as admin', 401);
    }

    if (!file) {
      return jsonError('No file provided', 400);
    }

    if (!isAdmin && commentFolderMatch) {
      // Public comment upload: throttle per client and only accept small images
      // for memorials that actually exist, so this can't be used as free
      // arbitrary file hosting against our Cloudinary quota.
      const clientId = getClientIdentifier(context);
      const rateLimit = checkRateLimit(`upload:${clientId}`, COMMENT_UPLOADS_PER_HOUR, 60 * 60 * 1000);
      if (!rateLimit.allowed) {
        return jsonError('Too many uploads. Please try again later.', 429);
      }

      if (!COMMENT_IMAGE_TYPES.has(file.type)) {
        return jsonError('Only JPEG, PNG, WebP, or GIF images are allowed', 400);
      }

      const memorial = await getMemorialBySlug(commentFolderMatch[1]);
      if (!memorial || memorial.status !== 'active') {
        return jsonError('Memorial not found', 404);
      }
    }

    // Validate file size (max 5MB for images, 100MB for videos — videos are admin-only)
    const isVideo = isAdmin && file.type.startsWith('video/');
    const maxSize = isVideo ? 100 * 1024 * 1024 : 5 * 1024 * 1024;

    if (file.size > maxSize) {
      return jsonError(`File size too large (max ${isVideo ? '100MB' : '5MB'})`, 400);
    }

    // Check if Cloudinary is configured
    if (!MediaService.isConfigured()) {
      return jsonError(
        'Cloudinary not configured',
        500,
        'Please add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET to your .env file'
      );
    }

    const result = await MediaService.uploadMedia(file, folder, isAdmin);

    return new Response(
      JSON.stringify(result),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Upload error:', error);
    return jsonError('Failed to upload image', 500, error instanceof Error ? error.message : 'Unknown error');
  }
};
