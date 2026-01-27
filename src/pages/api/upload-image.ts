import type { APIRoute } from "astro";
import { v2 as cloudinary } from "cloudinary";

export const prerender = false;

// Configure Cloudinary
cloudinary.config({
  cloud_name: import.meta.env.CLOUDINARY_CLOUD_NAME,
  api_key: import.meta.env.CLOUDINARY_API_KEY,
  api_secret: import.meta.env.CLOUDINARY_API_SECRET,
});

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const folder = (formData.get("folder") as string) || "memorial";

    // Check authentication unless it's a comment upload
    const isAuthenticated = cookies.get("admin_auth")?.value === "true";
    const isCommentUpload = folder === "memorial/comments";

    if (!isAuthenticated && !isCommentUpload) {
      return new Response(
        JSON.stringify({ error: "Unauthorized - Please log in as admin" }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    if (!file) {
      return new Response(JSON.stringify({ error: "No file provided" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Validate file size (max 5MB for images, 100MB for videos)
    const isVideo = file.type.startsWith("video/");
    const isPdf = file.type === "application/pdf";
    const maxSize = isVideo ? 100 * 1024 * 1024 : 5 * 1024 * 1024;

    if (file.size > maxSize) {
      return new Response(
        JSON.stringify({
          error: `File size too large (max ${isVideo ? "100MB" : "5MB"})`,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // Check if Cloudinary is configured
    const cloudName = import.meta.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = import.meta.env.CLOUDINARY_API_KEY;
    const apiSecret = import.meta.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      return new Response(
        JSON.stringify({
          error: "Cloudinary not configured",
          details:
            "Please add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET to your .env file",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    console.log("Uploading to Cloudinary, folder:", folder);

    // Convert file to base64
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64File = `data:${file.type};base64,${buffer.toString("base64")}`;

    // Upload to Cloudinary with proper types
    interface CloudinaryUploadOptions {
      folder: string;
      resource_type: "raw" | "video" | "image" | "auto";
      type?: string;
      access_mode?: string;
      use_filename?: boolean;
      unique_filename?: boolean;
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
      resource_type: "auto",
    };

    // For PDFs, ensure they're accessible and can be embedded
    if (isPdf) {
      uploadOptions.resource_type = "raw"; // Use 'raw' for PDFs
      uploadOptions.type = "upload";
      uploadOptions.access_mode = "public"; // Ensure public access
      uploadOptions.use_filename = true; // Preserve original filename
      uploadOptions.unique_filename = true; // But make it unique
    } else if (!isVideo) {
      // Only apply image transformations if it's not a PDF or Video
      uploadOptions.transformation = [
        { width: 2000, height: 2000, crop: "limit" }, // Max dimensions
        { quality: "auto" }, // Auto quality optimization
        { fetch_format: "auto" }, // Auto format (WebP when supported)
      ];
    }

    const result = await cloudinary.uploader.upload(base64File, uploadOptions);

    console.log("Upload successful:", result.secure_url);

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
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Upload error:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to upload image",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
};
