import type { APIRoute } from 'astro';
import { MediaService } from '../../lib/services/media.service.ts';
import { requireAuth } from '../../lib/auth';
import { successResponse, errorResponse, validationError } from '../../lib/api-response';

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    // Check admin authentication
    const authError = requireAuth(cookies);
    if (authError) return authError;

    const { publicId } = await request.json();

    if (!publicId) {
      return validationError('No publicId provided');
    }

    // Delete from Cloudinary
    const isDeleted = await MediaService.deleteMedia(publicId);

    return successResponse({
      success: isDeleted,
      result: isDeleted ? 'ok' : 'failed',
    });
  } catch (error) {
    console.error('Delete error:', error);
    return errorResponse(
      'Failed to delete image',
      500,
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
};
