import { d as db, G as GalleryImages } from '../../../chunks/_astro_db_B6fpZxRe.mjs';
export { renderers } from '../../../renderers.mjs';

const prerender = false;
const POST = async ({ request, cookies }) => {
  try {
    const isAuthenticated = cookies.get("admin_auth")?.value === "true";
    if (!isAuthenticated) {
      return new Response(JSON.stringify({ error: "Unauthorized - Please log in as admin" }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }
    const { imagePath, caption, displayOrder } = await request.json();
    if (!imagePath) {
      return new Response(JSON.stringify({ error: "imagePath is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    await db.insert(GalleryImages).values({
      imagePath,
      caption: caption || "",
      displayOrder: displayOrder || 999,
      isActive: true
    });
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Add gallery image error:", error);
    return new Response(JSON.stringify({
      error: "Failed to add image",
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
