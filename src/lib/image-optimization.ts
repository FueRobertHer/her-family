/**
 * Cloudinary Image Optimization Helpers
 * Automatically adds optimization parameters to Cloudinary URLs
 */

export interface CloudinaryOptions {
  width?: number;
  height?: number;
  crop?: 'fill' | 'fit' | 'scale' | 'thumb';
  quality?: 'auto' | number;
  format?: 'auto' | 'webp' | 'jpg' | 'png';
  /** Which part of the image to keep when cropping, e.g. 'auto' or 'face'. */
  gravity?: 'auto' | 'face' | 'center';
}

/**
 * Optimizes a Cloudinary URL with transformation parameters
 * Automatically detects resource type and applies appropriate optimizations:
 * - Images: Forces WebP format for better compression
 * - Other types (video/raw): Uses auto format
 * @param url - Original Cloudinary URL (or local URL, which is returned as-is)
 * @param options - Transformation options
 * @returns Optimized URL with Cloudinary transformations
 */
export function optimizeCloudinaryUrl(url: string, options: CloudinaryOptions = {}): string {
  // If not a Cloudinary URL, return as-is
  if (!url || !url.includes('cloudinary.com')) {
    return url;
  }

  // Check if this is an image resource (not video or raw file)
  const isImage = url.includes('/image/upload/');

  const {
    width,
    height,
    crop = 'fill',
    quality = 'auto',
    gravity,
    format = isImage ? 'webp' : 'auto', // Force WebP for images, auto for other types
  } = options;

  // Build transformation string
  const transforms: string[] = [];

  if (width) transforms.push(`w_${width}`);
  if (height) transforms.push(`h_${height}`);
  if (crop && (width || height)) transforms.push(`c_${crop}`);
  if (gravity && (width || height)) transforms.push(`g_${gravity}`);
  transforms.push(`f_${format}`); // Format: webp for images, auto for other types
  transforms.push(`q_${quality}`); // Auto quality

  const transformString = transforms.join(',');

  // Insert transformations into Cloudinary URL
  // Example: https://res.cloudinary.com/cloud/image/upload/v1/path.jpg
  // Becomes: https://res.cloudinary.com/cloud/image/upload/w_800,f_webp,q_auto/v1/path.jpg

  const uploadIndex = url.indexOf('/upload/');
  if (uploadIndex === -1) return url; // Not a standard Cloudinary URL

  const beforeUpload = url.substring(0, uploadIndex + 8); // Include '/upload/'
  const afterUpload = url.substring(uploadIndex + 8);

  return `${beforeUpload}${transformString}/${afterUpload}`;
}

/**
 * Optimizes a Cloudinary PDF URL for faster loading
 * @param url - Original PDF URL
 * @returns Optimized PDF URL with compression
 */
export function optimizeCloudinaryPdf(url: string): string {
  // If not a Cloudinary URL, return as-is
  if (!url || !url.includes('cloudinary.com')) {
    return url;
  }

  // Build transformation string for PDFs
  // fl_lossy - Enable lossy compression for smaller file size
  // fl_progressive - Enable progressive loading (page-by-page)
  // q_auto - Auto quality optimization
  const transformString = 'fl_lossy,fl_progressive,q_auto:good';

  // Insert transformations into Cloudinary URL
  const uploadIndex = url.indexOf('/upload/');
  if (uploadIndex === -1) return url; // Not a standard Cloudinary URL

  const beforeUpload = url.substring(0, uploadIndex + 8); // Include '/upload/'
  const afterUpload = url.substring(uploadIndex + 8);

  return `${beforeUpload}${transformString}/${afterUpload}`;
}

/**
 * Preset configurations for common use cases
 */
export const CloudinaryPresets = {
  hero: { width: 1200, height: 1200, crop: 'fill' as const },
  heroBackground: { width: 1920, height: 1080, crop: 'fill' as const },
  galleryThumb: { width: 600, height: 600, crop: 'fill' as const },
  galleryFull: { width: 1600, height: 1600, crop: 'fit' as const },
  portrait: { width: 400, height: 400, crop: 'fill' as const },
  commentImage: { width: 800, height: 800, crop: 'fit' as const },
  // Link previews: 1.91:1 is what Facebook/iMessage crop to anyway. Gravity
  // 'auto' keeps the subject in frame instead of slicing a portrait in half.
  // JPEG rather than WebP: several preview scrapers still reject WebP.
  socialPreview: {
    width: 1200,
    height: 630,
    crop: 'fill' as const,
    gravity: 'auto' as const,
    format: 'jpg' as const,
  },
};
