import type { APIRoute } from 'astro';
import { v2 as cloudinary } from 'cloudinary';
import { isAuthenticated as checkAuth } from '../../lib/auth';
import { checkRateLimit, getClientIdentifier } from '../../lib/rate-limiter';
import { getMemorialBySlug } from '../../lib/memorial-context';

export const prerender = false;

// Configure Cloudinary
cloudinary.config({
  cloud_name: import.meta.env.CLOUDINARY_CLOUD_NAME,
  api_key: import.meta.env.CLOUDINARY_API_KEY,
  api_secret: import.meta.env.CLOUDINARY_API_SECRET,
});

// Unauthenticated (comment) uploads: images only, small, rate limited.
const COMMENT_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
const COMMENT_UPLOADS_PER_HOUR = 10;

function jsonError(error: string, status: number, details?: string): Response {
  return new Response(JSON.stringify(details ? { error, details } : { error }), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export const POST: APIRoute = async (context) => {
  const { request, cookies } = context;

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const folder = (formData.get('folder') as string) || 'memorials/default/uploads';

    const isAdmin = checkAuth(cookies);
    const commentFolderMatch = folder.match(/^memorials\/([^/]+)\/comments$/);

    if (!isAdmin && !commentFolderMatch) {
      return jsonError('Unauthorized - Please log in as admin', 401);
    }

    if (!file) {
      return jsonError('No file provided', 400);
    }

    if (!isAdmin && commentFolderMatch) {
      // Public comment upload: throttle per client and only accept small images
      // for memorials that actually exist, so this can't be used as free
      // arbitrary file hosting against our Cloudinary quota.
      const clientId = getClientIdentifier(context);
      const rateLimit = checkRateLimit(`upload:${clientId}`, COMMENT_UPLOADS_PER_HOUR, 60 * 60 * 1000);
      if (!rateLimit.allowed) {
        return jsonError('Too many uploads. Please try again later.', 429);
      }

      if (!COMMENT_IMAGE_TYPES.has(file.type)) {
        return jsonError('Only JPEG, PNG, WebP, or GIF images are allowed', 400);
      }

      const memorial = await getMemorialBySlug(commentFolderMatch[1]);
      if (!memorial || memorial.status !== 'active') {
        return jsonError('Memorial not found', 404);
      }
    }

    // Validate file size (max 5MB for images, 100MB for videos — videos are admin-only)
    const isVideo = isAdmin && file.type.startsWith('video/');
    const isPdf = file.type === 'application/pdf';
    const maxSize = isVideo ? 100 * 1024 * 1024 : 5 * 1024 * 1024;

    if (file.size > maxSize) {
      return jsonError(`File size too large (max ${isVideo ? '100MB' : '5MB'})`, 400);
    }

    // Check if Cloudinary is configured
    const cloudName = import.meta.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = import.meta.env.CLOUDINARY_API_KEY;
    const apiSecret = import.meta.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      return jsonError(
        'Cloudinary not configured',
        500,
        'Please add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET to your .env file'
      );
    }

    // Convert file to base64
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64File = `data:${file.type};base64,${buffer.toString('base64')}`;

    // Upload to Cloudinary with proper types
    interface CloudinaryUploadOptions {
      folder: string;
      resource_type: 'raw' | 'video' | 'image' | 'auto';
      type?: string;
      access_mode?: string;
      use_filename?: boolean;
      unique_filename?: boolean;
      allowed_formats?: string[];
      transformation?: Array<{
        width?: number;
        height?: number;
        crop?: string;
        quality?: string;
        fetch_format?: string;
      }>;
    }

    const uploadOptions: CloudinaryUploadOptions = {
      folder: folder,
      // Public comment uploads are validated as images above; only admins get auto detection.
      resource_type: isAdmin ? 'auto' : 'image',
    };

    if (!isAdmin) {
      // Don't trust the client-declared file.type: have Cloudinary reject
      // anything whose actual decoded content isn't one of these raster formats.
      uploadOptions.allowed_formats = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
    }

    // For PDFs, ensure they're accessible and can be embedded
    if (isPdf) {
      uploadOptions.resource_type = 'raw'; // Use 'raw' for PDFs
      uploadOptions.type = 'upload';
      uploadOptions.access_mode = 'public'; // Ensure public access
      uploadOptions.use_filename = true; // Preserve original filename
      uploadOptions.unique_filename = true; // But make it unique
    } else if (!isVideo) {
      // Only apply image transformations if it's not a PDF or Video
      uploadOptions.transformation = [
        { width: 2000, height: 2000, crop: 'limit' }, // Max dimensions
        { quality: 'auto' }, // Auto quality optimization
        { fetch_format: 'auto' }, // Auto format (WebP when supported)
      ];
    }

    const result = await cloudinary.uploader.upload(base64File, uploadOptions);

    return new Response(
      JSON.stringify({
        success: true,
        url: result.secure_url,
        publicId: result.public_id,
        width: result.width,
        height: result.height,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Upload error:', error);
    return jsonError('Failed to upload image', 500, error instanceof Error ? error.message : 'Unknown error');
  }
};
