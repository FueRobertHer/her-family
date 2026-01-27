import type { APIRoute } from 'astro';
import { db, Comments, eq } from 'astro:db';
import { requireAuth } from '../../../lib/auth';
import { successResponse, errorResponse, validationError } from '../../../lib/api-response';
import { commentActionSchema, validateData } from '../../../lib/validation';

export const prerender = false;

// GET - Fetch all comments (including pending ones) for admin
export const GET: APIRoute = async ({ request, cookies }) => {
  try {
    // Check authentication
    const authError = requireAuth(cookies);
    if (authError) return authError;

    const url = new URL(request.url);
    const status = url.searchParams.get('status'); // 'pending', 'approved', 'rejected', 'all'
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const offset = parseInt(url.searchParams.get('offset') || '0');

    // Fetch comments based on status filter using WHERE clauses for better performance
    let filteredComments;
    if (status === 'pending') {
      filteredComments = await db.select().from(Comments).where(eq(Comments.status, 'pending'));
    } else if (status === 'approved') {
      filteredComments = await db.select().from(Comments).where(eq(Comments.status, 'approved'));
    } else if (status === 'rejected') {
      filteredComments = await db.select().from(Comments).where(eq(Comments.status, 'rejected'));
    } else {
      // 'all' shows everything
      filteredComments = await db.select().from(Comments);
    }

    // Sort by creation date (newest first)
    filteredComments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    // Apply pagination
    const comments = filteredComments.slice(offset, offset + limit);

    // Get counts for dashboard using separate queries
    const [pendingComments, approvedComments, rejectedComments, allComments] = await Promise.all([
      db.select().from(Comments).where(eq(Comments.status, 'pending')),
      db.select().from(Comments).where(eq(Comments.status, 'approved')),
      db.select().from(Comments).where(eq(Comments.status, 'rejected')),
      db.select().from(Comments)
    ]);

    return successResponse({
      comments,
      counts: {
        pending: pendingComments.length,
        approved: approvedComments.length,
        rejected: rejectedComments.length,
        total: allComments.length
      }
    });
  } catch (error) {
    console.error('Error fetching admin comments:', error);
    return errorResponse('Failed to fetch comments');
  }
};

// PATCH - Approve or reject a comment
export const PATCH: APIRoute = async ({ request, cookies }) => {
  try {
    // Check authentication
    const authError = requireAuth(cookies);
    if (authError) return authError;

    const body = await request.json();
    
    // Validate input with Zod
    const validation = validateData(commentActionSchema, {
      id: typeof body.id === 'string' ? parseInt(body.id) : body.id,
      action: body.action
    });
    
    if (!validation.success) {
      return validationError(validation.error, validation.details?.join(', '));
    }
    
    const { id: commentId, action } = validation.data;
    const now = new Date().toISOString();

    if (action === 'approve') {
      await db.update(Comments)
        .set({ status: 'approved', updatedAt: now })
        .where(eq(Comments.id, commentId));

      return successResponse(undefined, 'Comment approved successfully');
    } else if (action === 'reject') {
      await db.update(Comments)
        .set({ status: 'rejected', updatedAt: now })
        .where(eq(Comments.id, commentId));

      return successResponse(undefined, 'Comment rejected (kept for audit)');
    } else {
      return errorResponse('Invalid action. Use "approve" or "reject"', 400);
    }
  } catch (error) {
    console.error('Error updating comment:', error);
    return errorResponse('Failed to update comment');
  }
};
