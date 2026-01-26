import type { APIRoute } from 'astro';
import { db, Comments, eq } from 'astro:db';

export const prerender = false;

// GET - Fetch all comments (including pending ones) for admin
export const GET: APIRoute = async ({ request }) => {
  try {
    const url = new URL(request.url);
    const status = url.searchParams.get('status'); // 'pending', 'approved', 'rejected', 'all'
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const offset = parseInt(url.searchParams.get('offset') || '0');

    // Get all comments first, then filter in JavaScript to avoid WHERE clause issues
    const allComments = await db.select().from(Comments);
    
    // Filter by status
    let filteredComments = allComments;
    if (status === 'pending') {
      filteredComments = allComments.filter(comment => comment.status === 'pending');
    } else if (status === 'approved') {
      filteredComments = allComments.filter(comment => comment.status === 'approved');
    } else if (status === 'rejected') {
      filteredComments = allComments.filter(comment => comment.status === 'rejected');
    }
    // 'all' shows everything

    // Sort by creation date (newest first)
    filteredComments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    // Apply pagination
    const comments = filteredComments.slice(offset, offset + limit);

    // Get counts for dashboard
    const pendingCount = allComments.filter(comment => comment.status === 'pending');
    const approvedCount = allComments.filter(comment => comment.status === 'approved');
    const rejectedCount = allComments.filter(comment => comment.status === 'rejected');

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
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error fetching admin comments:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Failed to fetch comments' 
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
};

// PATCH - Approve or reject a comment
export const PATCH: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { id, action } = body; // action: 'approve' or 'reject'

    if (!id || !action) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Comment ID and action are required' 
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    const commentId = parseInt(id);
    const now = new Date().toISOString();

    if (action === 'approve') {
      await db.update(Comments)
        .set({ status: 'approved', updatedAt: now })
        .where(eq(Comments.id, commentId));

      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Comment approved successfully' 
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } else if (action === 'reject') {
      await db.update(Comments)
        .set({ status: 'rejected', updatedAt: now })
        .where(eq(Comments.id, commentId));

      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Comment rejected (kept for audit)' 
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } else {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Invalid action. Use "approve" or "reject"' 
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }
  } catch (error) {
    console.error('Error updating comment:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Failed to update comment' 
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
};
