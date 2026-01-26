import { d as db, G as GalleryImages } from '../../../chunks/_astro_db_a7MZ13nD.mjs';
export { renderers } from '../../../renderers.mjs';

const prerender = false;
const POST = async ({ request, cookies }) => {
  try {
    const isAdmin = cookies.get("admin_auth")?.value === "true";
    if (!isAdmin) {
      return new Response(JSON.stringify({
        success: false,
        error: "Unauthorized"
      }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }
    const body = await request.json();
    const { imagePath, displayOrder } = body;
    if (!imagePath || displayOrder === void 0) {
      return new Response(JSON.stringify({
        success: false,
        error: "Missing required fields: imagePath and displayOrder"
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const images = await db.select().from(GalleryImages);
    const image = images.find((img) => img.imagePath === imagePath);
    if (!image) {
      return new Response(JSON.stringify({
        success: false,
        error: "Image not found"
      }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }
    const allImages = await db.select().from(GalleryImages);
    const updatedImages = allImages.map((img) => {
      if (img.imagePath === imagePath) {
        return { ...img, displayOrder };
      }
      return img;
    });
    await db.delete(GalleryImages);
    if (updatedImages.length > 0) {
      await db.insert(GalleryImages).values(updatedImages);
    }
    return new Response(JSON.stringify({
      success: true,
      message: "Display order updated successfully"
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Error updating gallery order:", error);
    return new Response(JSON.stringify({
      success: false,
      error: "Failed to update gallery order"
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
