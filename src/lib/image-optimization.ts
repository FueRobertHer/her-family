/**
 * Cloudinary Image Optimization Helpers
 * Automatically adds optimization parameters to Cloudinary URLs
 */

export interface CloudinaryOptions {
  width?: number;
  height?: number;
  crop?: 'fill' | 'fit' | 'scale' | 'thumb';
  quality?: 'auto' | number;
  format?: 'auto';
}

/**
 * Optimizes a Cloudinary image URL with transformation parameters
 * @param url - Original image URL (Cloudinary or local)
 * @param options - Transformation options
 * @returns Optimized URL with Cloudinary transformations
 */
export function optimizeCloudinaryUrl(
  url: string,
  options: CloudinaryOptions = {}
): string {
  // If not a Cloudinary URL, return as-is
  if (!url || !url.includes('cloudinary.com')) {
    return url;
  }

  const {
    width,
    height,
    crop = 'fill',
    quality = 'auto',
    format = 'auto',
  } = options;

  // Build transformation string
  const transforms: string[] = [];

  if (width) transforms.push(`w_${width}`);
  if (height) transforms.push(`h_${height}`);
  if (crop && (width || height)) transforms.push(`c_${crop}`);
  transforms.push('f_auto'); // Auto format (WebP/AVIF)
  transforms.push(`q_${quality}`); // Auto quality

  const transformString = transforms.join(',');

  // Insert transformations into Cloudinary URL
  // Example: https://res.cloudinary.com/cloud/image/upload/v1/path.jpg
  // Becomes: https://res.cloudinary.com/cloud/image/upload/w_800,f_auto,q_auto/v1/path.jpg
  
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
  hero: { width: 1200, height: 1200, crop: 'fill' },
  heroBackground: { width: 1920, height: 1080, crop: 'fill' },
  galleryThumb: { width: 600, height: 600, crop: 'fill' },
  galleryFull: { width: 1600, height: 1600, crop: 'fit' },
  portrait: { width: 400, height: 400, crop: 'fill' },
  commentImage: { width: 800, height: 800, crop: 'fit' },
};
