import type { APIRoute } from 'astro';
import { requireAuth } from '../../../lib/auth';
import {
  successResponse,
  errorResponse,
  validationError,
  notFoundError,
} from '../../../lib/api-response';
import { galleryUpdateOrderSchema, validateData } from '../../../lib/validation';
import { getMemorialBySlug } from '../../../lib/memorial-context';
import { GalleryService } from '../../../lib/services/gallery.service.ts';

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
    const memorial = await getMemorialBySlug(memorialSlug, { includeHidden: true });
    if (!memorial) {
      return notFoundError('Memorial');
    }

    // Update the display order via Service
    const updated = await GalleryService.updateOrder(memorial.id, imagePath, displayOrder);

    // Check if any rows were affected
    if (!updated) {
      return notFoundError('Image');
    }

    return successResponse(undefined, 'Display order updated successfully');
  } catch (error) {
    console.error('Error updating gallery order:', error);
    return errorResponse('Failed to update gallery order');
  }
};
