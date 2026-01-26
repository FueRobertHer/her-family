import type { APIRoute } from 'astro';
import { db, GalleryImages } from 'astro:db';
import { eq } from 'astro:db';

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    // Check authentication
    const isAdmin = cookies.get('admin_auth')?.value === 'true';
    if (!isAdmin) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Unauthorized' 
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const body = await request.json();
    const { imagePath, displayOrder } = body;

    if (!imagePath || displayOrder === undefined) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Missing required fields: imagePath and displayOrder' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Find the image by imagePath
    const images = await db.select().from(GalleryImages);
    const image = images.find(img => img.imagePath === imagePath);

    if (!image) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Image not found' 
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Update the display order
    // Since Astro DB has issues with WHERE clauses, we'll use the "clear and re-insert" approach
    const allImages = await db.select().from(GalleryImages);
    
    // Update the specific image's displayOrder in memory
    const updatedImages = allImages.map(img => {
      if (img.imagePath === imagePath) {
        return { ...img, displayOrder };
      }
      return img;
    });

    // Clear table
    await db.delete(GalleryImages);

    // Re-insert all images with updated data
    if (updatedImages.length > 0) {
      await db.insert(GalleryImages).values(updatedImages);
    }

    return new Response(JSON.stringify({ 
      success: true,
      message: 'Display order updated successfully'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error updating gallery order:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Failed to update gallery order' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
