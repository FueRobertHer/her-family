import { cloudinary, isCloudinaryConfigured } from '../cloudinary';

export class MediaService {
  /**
   * Check if the media service (Cloudinary) is properly configured
   */
  static isConfigured(): boolean {
    return isCloudinaryConfigured();
  }

  /**
   * Upload a file to Cloudinary
   */
  static async uploadMedia(file: File, folder: string, isAdmin: boolean) {
    const isVideo = isAdmin && file.type.startsWith('video/');
    const isPdf = file.type === 'application/pdf';

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

    return {
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
    };
  }

  /**
   * Delete a file from Cloudinary by its public ID
   */
  static async deleteMedia(publicId: string): Promise<boolean> {
    const result = await cloudinary.uploader.destroy(publicId);
    return result.result === 'ok';
  }
}
