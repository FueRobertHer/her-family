import type { APIRoute } from "astro";
import { db, GalleryImages, eq } from "astro:db";

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  // Check authentication
  const authCookie = cookies.get("admin_auth");
  if (authCookie?.value !== "true") {
    return new Response(
      JSON.stringify({ success: false, error: "Unauthorized" }),
      {
        status: 401,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  try {
    const body = await request.json();
    const { imagePath, caption } = body;

    if (!imagePath) {
      return new Response(
        JSON.stringify({ success: false, error: "Image path is required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // Update the caption in the database
    await db
      .update(GalleryImages)
      .set({ caption: caption || "" })
      .where(eq(GalleryImages.imagePath, imagePath));

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error updating caption:", error);
    return new Response(
      JSON.stringify({ success: false, error: "Failed to update caption" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
};
