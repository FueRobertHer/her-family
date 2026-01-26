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
    const isAuthenticated = cookies.get("admin_auth")?.value === "true";
    if (!isAuthenticated) {
      return new Response(JSON.stringify({ error: "Unauthorized - Please log in as admin" }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }
    const { publicId } = await request.json();
    if (!publicId) {
      return new Response(JSON.stringify({ error: "No publicId provided" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const result = await v2.uploader.destroy(publicId);
    return new Response(JSON.stringify({
      success: result.result === "ok",
      result: result.result
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Delete error:", error);
    return new Response(JSON.stringify({
      error: "Failed to delete image",
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
