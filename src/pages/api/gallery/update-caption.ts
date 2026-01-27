import type { APIRoute } from "astro";
import { db, GalleryImages, eq } from "astro:db";
import { requireAuth } from '../../../lib/auth';
import { successResponse, errorResponse, validationError } from '../../../lib/api-response';

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  // Check authentication
  const authError = requireAuth(cookies);
  if (authError) return authError;

  try {
    const body = await request.json();
    const { imagePath, caption } = body;

    if (!imagePath) {
      return validationError('Image path is required');
    }

    // Update the caption in the database
    await db
      .update(GalleryImages)
      .set({ caption: caption || "" })
      .where(eq(GalleryImages.imagePath, imagePath));

    return successResponse(undefined, 'Caption updated successfully');
  } catch (error) {
    console.error("Error updating caption:", error);
    return errorResponse('Failed to update caption');
  }
};
