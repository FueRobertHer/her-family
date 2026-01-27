import type { APIRoute } from 'astro';
import { db, GalleryImages, eq } from 'astro:db';
import { requireAuth } from '../../../lib/auth';
import { successResponse, errorResponse, validationError } from '../../../lib/api-response';

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    // Check admin authentication
    const authError = requireAuth(cookies);
    if (authError) return authError;

    const { imagePath } = await request.json();

    if (!imagePath) {
      return validationError('imagePath is required');
    }

    // Delete from database
    await db.delete(GalleryImages).where(eq(GalleryImages.imagePath, imagePath));

    return successResponse(undefined, 'Image deleted successfully');
  } catch (error) {
    console.error('Delete gallery image error:', error);
    const details = error instanceof Error ? error.message : 'Unknown error';
    return errorResponse('Failed to delete image', 500, details);
  }
};
