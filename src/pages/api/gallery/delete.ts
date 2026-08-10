import type { APIRoute } from 'astro';
import { requireAuth } from '../../../lib/auth';
import { successResponse, errorResponse, validationError } from '../../../lib/api-response';
import { getMemorialBySlug } from '../../../lib/memorial-context';
import { GalleryService } from '../../../lib/services/gallery.service.ts';

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    // Check admin authentication
    const authError = requireAuth(cookies);
    if (authError) return authError;

    const body = await request.json();
    const { imagePath } = body;
    const memorialSlug = typeof body.memorialSlug === 'string' ? body.memorialSlug.trim() : '';

    if (!imagePath) {
      return validationError('imagePath is required');
    }
    if (!memorialSlug) {
      return validationError('memorialSlug is required');
    }

    const memorial = await getMemorialBySlug(memorialSlug, { includeHidden: true });
    if (!memorial) {
      return errorResponse('Memorial not found', 404);
    }

    // Delete from database via Service
    await GalleryService.deleteImage(memorial.id, imagePath);

    return successResponse(undefined, 'Image deleted successfully');
  } catch (error) {
    console.error('Delete gallery image error:', error);
    const details = error instanceof Error ? error.message : 'Unknown error';
    return errorResponse('Failed to delete image', 500, details);
  }
};
