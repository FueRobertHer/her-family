import type { APIRoute } from 'astro';
import { v2 as cloudinary } from 'cloudinary';

export const prerender = false;

// Configure Cloudinary
cloudinary.config({
  cloud_name: import.meta.env.CLOUDINARY_CLOUD_NAME,
  api_key: import.meta.env.CLOUDINARY_API_KEY,
  api_secret: import.meta.env.CLOUDINARY_API_SECRET,
});

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

    const { publicId } = await request.json();

    if (!publicId) {
      return new Response(JSON.stringify({ error: 'No publicId provided' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Delete from Cloudinary
    const result = await cloudinary.uploader.destroy(publicId);

    return new Response(
      JSON.stringify({
        success: result.result === 'ok',
        result: result.result,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Delete error:', error);
    return new Response(
      JSON.stringify({
        error: 'Failed to delete image',
        details: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
