import { d as db, M as MemorialContent } from '../../../chunks/_astro_db_B6fpZxRe.mjs';
import { eq } from '@astrojs/db/dist/runtime/virtual.js';
export { renderers } from '../../../renderers.mjs';

const prerender = false;
const GET = async () => {
  try {
    const content = await db.select().from(MemorialContent);
    const organizedContent = content.reduce((acc, item) => {
      if (!acc[item.section]) {
        acc[item.section] = {};
      }
      acc[item.section][item.key] = {
        value: item.value,
        type: item.type,
        updatedAt: item.updatedAt
      };
      return acc;
    }, {});
    return new Response(JSON.stringify({
      success: true,
      data: organizedContent,
      raw: content
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json"
      }
    });
  } catch (error) {
    console.error("Error fetching content:", error);
    return new Response(JSON.stringify({
      success: false,
      error: "Failed to fetch content"
    }), {
      status: 500,
      headers: {
        "Content-Type": "application/json"
      }
    });
  }
};
const POST = async ({ request, cookies }) => {
  try {
    const isAuthenticated = cookies.get("admin_auth")?.value === "true";
    if (!isAuthenticated) {
      return new Response(JSON.stringify({
        success: false,
        error: "Unauthorized - Please log in as admin"
      }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }
    const body = await request.json();
    console.log("Received content update:", body);
    const { section, key, value, type = "text" } = body;
    if (!section || !key || value === void 0) {
      console.error("Missing required fields:", { section, key, value: value === void 0 ? "undefined" : "provided" });
      return new Response(JSON.stringify({
        success: false,
        error: "Section, key, and value are required",
        received: { section, key, hasValue: value !== void 0 }
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const existingContent = await db.select().from(MemorialContent);
    const existing = existingContent.find((c) => c.section === section && c.key === key);
    console.log("Existing content found:", existing !== void 0);
    if (existing) {
      await db.update(MemorialContent).set({
        value: String(value),
        type,
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      }).where(
        eq(MemorialContent.id, existing.id)
      );
    } else {
      await db.insert(MemorialContent).values({
        section,
        key,
        value: String(value),
        type,
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      });
    }
    console.log("Content updated successfully:", { section, key });
    return new Response(JSON.stringify({
      success: true,
      message: "Content updated successfully"
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Error updating content:", error);
    return new Response(JSON.stringify({
      success: false,
      error: "Failed to update content",
      details: error instanceof Error ? error.message : "Unknown error"
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET,
  POST,
  prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
