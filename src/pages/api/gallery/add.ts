import type { APIRoute } from 'astro';
import { db, GalleryImages } from 'astro:db';
import { requireAuth } from '../../../lib/auth';
import { successResponse, errorResponse, validationError } from '../../../lib/api-response';
import { galleryImageSchema, validateData } from '../../../lib/validation';

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    // Check admin authentication
    const authError = requireAuth(cookies);
    if (authError) return authError;

    const body = await request.json();

    // Validate input with Zod
    const validation = validateData(galleryImageSchema, body);
    if (!validation.success) {
      return validationError(validation.error, validation.details?.join(', '));
    }

    const { imagePath, caption, displayOrder } = validation.data;

    // Insert into database
    await db.insert(GalleryImages).values({
      imagePath,
      caption: caption || '',
      displayOrder: displayOrder || 999,
      isActive: true,
      uploadedAt: new Date().toISOString(),
    });

    return successResponse(undefined, 'Image added successfully');
  } catch (error) {
    console.error('Add gallery image error:', error);
    const details = error instanceof Error ? error.message : 'Unknown error';
    return errorResponse('Failed to add image', 500, details);
  }
};
