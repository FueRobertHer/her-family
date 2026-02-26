import type { APIRoute } from 'astro';
import { db, GalleryImages, eq, and } from 'astro:db';
import { requireAuth } from '../../../lib/auth';
import {
  successResponse,
  errorResponse,
  validationError,
  notFoundError,
} from '../../../lib/api-response';
import { galleryUpdateOrderSchema, validateData } from '../../../lib/validation';
import { getMemorialBySlug } from '../../../lib/memorial-context';

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    // Check authentication
    const authError = requireAuth(cookies);
    if (authError) return authError;

    const body = await request.json();

    // Validate input with Zod
    const validation = validateData(galleryUpdateOrderSchema, body);
    if (!validation.success) {
      return validationError(validation.error, validation.details?.join(', '));
    }

    const { imagePath, displayOrder, memorialSlug } = validation.data;
    const memorial = await getMemorialBySlug(memorialSlug);
    if (!memorial) {
      return notFoundError('Memorial');
    }

    // Update the display order using a proper WHERE clause
    const result = await db
      .update(GalleryImages)
      .set({ displayOrder })
      .where(and(eq(GalleryImages.imagePath, imagePath), eq(GalleryImages.memorialId, memorial.id)));

    // Check if any rows were affected
    if (!result.rowsAffected || result.rowsAffected === 0) {
      return notFoundError('Image');
    }

    return successResponse(undefined, 'Display order updated successfully');
  } catch (error) {
    console.error('Error updating gallery order:', error);
    return errorResponse('Failed to update gallery order');
  }
};
