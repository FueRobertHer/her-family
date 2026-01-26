import { v2 } from 'cloudinary';
export { renderers } from '../../renderers.mjs';

const prerender = false;
v2.config({
  cloud_name: "dhsfx4rxr",
  api_key: "513952712948842",
  api_secret: "BejiOTwJlhsOGwbXS9lqPntUR2A"
});
const POST = async ({ request, cookies }) => {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const folder = formData.get("folder") || "memorial";
    const isAuthenticated = cookies.get("admin_auth")?.value === "true";
    const isCommentUpload = folder === "memorial/comments";
    if (!isAuthenticated && !isCommentUpload) {
      return new Response(JSON.stringify({ error: "Unauthorized - Please log in as admin" }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }
    if (!file) {
      return new Response(JSON.stringify({ error: "No file provided" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const isVideo = file.type.startsWith("video/");
    const maxSize = isVideo ? 100 * 1024 * 1024 : 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return new Response(JSON.stringify({
        error: `File size too large (max ${isVideo ? "100MB" : "5MB"})`
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const cloudName = "dhsfx4rxr";
    const apiKey = "513952712948842";
    const apiSecret = "BejiOTwJlhsOGwbXS9lqPntUR2A";
    if (!cloudName || !apiKey || !apiSecret) ;
    console.log("Uploading to Cloudinary, folder:", folder);
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64File = `data:${file.type};base64,${buffer.toString("base64")}`;
    const result = await v2.uploader.upload(base64File, {
      folder,
      resource_type: "auto",
      transformation: [
        { width: 2e3, height: 2e3, crop: "limit" },
        // Max dimensions
        { quality: "auto" },
        // Auto quality optimization
        { fetch_format: "auto" }
        // Auto format (WebP when supported)
      ]
    });
    console.log("Upload successful:", result.secure_url);
    return new Response(JSON.stringify({
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Upload error:", error);
    return new Response(JSON.stringify({
      error: "Failed to upload image",
      details: error instanceof Error ? error.message : "Unknown error"
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST,
  prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
