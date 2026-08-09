import type { APIRoute } from 'astro';
import { requireAuth } from '../../../lib/auth';
import {
  successResponse,
  errorResponse,
  validationError,
  notFoundError,
} from '../../../lib/api-response';
import { validateData } from '../../../lib/validation';
import { z } from 'zod';
import { getMemorialBySlug } from '../../../lib/memorial-context';
import { GalleryService } from '../../../lib/services/gallery.service.ts';

export const prerender = false;

// Validation schema for updating caption
const updateCaptionSchema = z.object({
  memorialSlug: z.string().trim().min(1, 'Memorial slug is required'),
  imagePath: z.string().trim().min(1, 'Image path is required'),
  caption: z
    .string()
    .trim()
    .max(200, 'Caption must be less than 200 characters')
    .optional()
    .or(z.literal('')),
});

export const POST: APIRoute = async ({ request, cookies }) => {
  // Check authentication
  const authError = requireAuth(cookies);
  if (authError) return authError;

  try {
    const body = await request.json();

    // Validate input with Zod
    const validation = validateData(updateCaptionSchema, body);
    if (!validation.success) {
      return validationError(validation.error, validation.details?.join(', '));
    }

    const { imagePath, caption, memorialSlug } = validation.data;
    const memorial = await getMemorialBySlug(memorialSlug);
    if (!memorial) {
      return notFoundError('Memorial');
    }

    // Update the caption in the database via Service
    const updated = await GalleryService.updateCaption(memorial.id, imagePath, caption || '');

    // Check if any rows were affected
    if (!updated) {
      return notFoundError('Image');
    }

    return successResponse(undefined, 'Caption updated successfully');
  } catch (error) {
    console.error('Error updating caption:', error);
    return errorResponse('Failed to update caption');
  }
};
