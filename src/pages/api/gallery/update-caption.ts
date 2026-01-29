import type { APIRoute } from 'astro';
import { db, GalleryImages, eq } from 'astro:db';
import { requireAuth } from '../../../lib/auth';
import {
  successResponse,
  errorResponse,
  validationError,
  notFoundError,
} from '../../../lib/api-response';
import { validateData } from '../../../lib/validation';
import { z } from 'zod';

export const prerender = false;

// Validation schema for updating caption
const updateCaptionSchema = z.object({
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

    const { imagePath, caption } = validation.data;

    // Update the caption in the database
    const result = await db
      .update(GalleryImages)
      .set({ caption: caption || '' })
      .where(eq(GalleryImages.imagePath, imagePath));

    // Check if any rows were affected
    if (!result.rowsAffected || result.rowsAffected === 0) {
      return notFoundError('Image');
    }

    return successResponse(undefined, 'Caption updated successfully');
  } catch (error) {
    console.error('Error updating caption:', error);
    return errorResponse('Failed to update caption');
  }
};
