import type { APIRoute } from 'astro';
import { db, GalleryImages, eq } from 'astro:db';

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    // Check admin authentication
    const isAuthenticated = cookies.get('admin_auth')?.value === 'true';
    
    if (!isAuthenticated) {
      return new Response(JSON.stringify({ error: 'Unauthorized - Please log in as admin' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { imagePath } = await request.json();

    if (!imagePath) {
      return new Response(JSON.stringify({ error: 'imagePath is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Delete from database
    await db.delete(GalleryImages).where(eq(GalleryImages.imagePath, imagePath));

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Delete gallery image error:', error);
    return new Response(JSON.stringify({
      error: 'Failed to delete image',
      details: error instanceof Error ? error.message : 'Unknown error',
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
