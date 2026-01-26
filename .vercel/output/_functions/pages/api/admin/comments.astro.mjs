import { d as db, C as Comments } from '../../../chunks/_astro_db_B6fpZxRe.mjs';
import { eq } from '@astrojs/db/dist/runtime/virtual.js';
export { renderers } from '../../../renderers.mjs';

const prerender = false;
const GET = async ({ request }) => {
  try {
    const url = new URL(request.url);
    const status = url.searchParams.get("status");
    const limit = parseInt(url.searchParams.get("limit") || "50");
    const offset = parseInt(url.searchParams.get("offset") || "0");
    const allComments = await db.select().from(Comments);
    let filteredComments = allComments;
    if (status === "pending") {
      filteredComments = allComments.filter((comment) => comment.status === "pending");
    } else if (status === "approved") {
      filteredComments = allComments.filter((comment) => comment.status === "approved");
    } else if (status === "rejected") {
      filteredComments = allComments.filter((comment) => comment.status === "rejected");
    }
    filteredComments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    const comments = filteredComments.slice(offset, offset + limit);
    const pendingCount = allComments.filter((comment) => comment.status === "pending");
    const approvedCount = allComments.filter((comment) => comment.status === "approved");
    const rejectedCount = allComments.filter((comment) => comment.status === "rejected");
    return new Response(JSON.stringify({
      success: true,
      data: comments,
      counts: {
        pending: pendingCount.length,
        approved: approvedCount.length,
        rejected: rejectedCount.length,
        total: allComments.length
      }
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json"
      }
    });
  } catch (error) {
    console.error("Error fetching admin comments:", error);
    return new Response(JSON.stringify({
      success: false,
      error: "Failed to fetch comments"
    }), {
      status: 500,
      headers: {
        "Content-Type": "application/json"
      }
    });
  }
};
const PATCH = async ({ request }) => {
  try {
    const body = await request.json();
    const { id, action } = body;
    if (!id || !action) {
      return new Response(JSON.stringify({
        success: false,
        error: "Comment ID and action are required"
      }), {
        status: 400,
        headers: {
          "Content-Type": "application/json"
        }
      });
    }
    const commentId = parseInt(id);
    const now = (/* @__PURE__ */ new Date()).toISOString();
    if (action === "approve") {
      await db.update(Comments).set({ status: "approved", updatedAt: now }).where(eq(Comments.id, commentId));
      return new Response(JSON.stringify({
        success: true,
        message: "Comment approved successfully"
      }), {
        status: 200,
        headers: {
          "Content-Type": "application/json"
        }
      });
    } else if (action === "reject") {
      await db.update(Comments).set({ status: "rejected", updatedAt: now }).where(eq(Comments.id, commentId));
      return new Response(JSON.stringify({
        success: true,
        message: "Comment rejected (kept for audit)"
      }), {
        status: 200,
        headers: {
          "Content-Type": "application/json"
        }
      });
    } else {
      return new Response(JSON.stringify({
        success: false,
        error: 'Invalid action. Use "approve" or "reject"'
      }), {
        status: 400,
        headers: {
          "Content-Type": "application/json"
        }
      });
    }
  } catch (error) {
    console.error("Error updating comment:", error);
    return new Response(JSON.stringify({
      success: false,
      error: "Failed to update comment"
    }), {
      status: 500,
      headers: {
        "Content-Type": "application/json"
      }
    });
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET,
  PATCH,
  prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
