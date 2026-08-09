import type { APIRoute } from 'astro';
import { requireAuth } from '../../../lib/auth';
import { successResponse, errorResponse, validationError } from '../../../lib/api-response';
import { galleryImageSchema, validateData } from '../../../lib/validation';
import { getMemorialBySlug } from '../../../lib/memorial-context';
import { GalleryService } from '../../../lib/services/gallery.service.ts';

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    // Check admin authentication
    const authError = requireAuth(cookies);
    if (authError) return authError;

    const body = await request.json();
    const memorialSlug = typeof body.memorialSlug === 'string' ? body.memorialSlug.trim() : '';
    if (!memorialSlug) {
      return validationError('memorialSlug is required');
    }

    const memorial = await getMemorialBySlug(memorialSlug);
    if (!memorial) {
      return errorResponse('Memorial not found', 404);
    }

    // Validate input with Zod
    const validation = validateData(galleryImageSchema, body);
    if (!validation.success) {
      return validationError(validation.error, validation.details?.join(', '));
    }

    const { imagePath, caption, displayOrder } = validation.data;

    // Insert into database via Service
    await GalleryService.addImage(memorial.id, imagePath, caption || '', displayOrder || 999);

    return successResponse(undefined, 'Image added successfully');
  } catch (error) {
    console.error('Add gallery image error:', error);
    const details = error instanceof Error ? error.message : 'Unknown error';
    return errorResponse('Failed to add image', 500, details);
  }
};
