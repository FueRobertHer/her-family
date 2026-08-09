/**
 * Shared, pre-configured Cloudinary client.
 *
 * Centralizes the `cloudinary.config()` call that was previously duplicated
 * across upload-image.ts and delete-image.ts. Importing this module
 * guarantees the SDK is configured exactly once.
 */
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: import.meta.env.CLOUDINARY_CLOUD_NAME,
  api_key: import.meta.env.CLOUDINARY_API_KEY,
  api_secret: import.meta.env.CLOUDINARY_API_SECRET,
});

export { cloudinary };

/**
 * Returns true when all three Cloudinary env vars are set.
 * Use this before attempting uploads/deletes to give a clear error early.
 */
export function isCloudinaryConfigured(): boolean {
  return !!(
    import.meta.env.CLOUDINARY_CLOUD_NAME &&
    import.meta.env.CLOUDINARY_API_KEY &&
    import.meta.env.CLOUDINARY_API_SECRET
  );
}
