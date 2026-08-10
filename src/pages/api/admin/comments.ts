import type { APIRoute } from 'astro';
import { requireAuth } from '../../../lib/auth';
import { successResponse, errorResponse, validationError } from '../../../lib/api-response';
import { commentActionSchema, validateData } from '../../../lib/validation';
import { getMemorialBySlug } from '../../../lib/memorial-context';
import { CommentService } from '../../../lib/services/comment.service.ts';

export const prerender = false;

// GET - Fetch all comments (including pending ones) for admin
export const GET: APIRoute = async ({ request, cookies }) => {
  try {
    // Check authentication
    const authError = requireAuth(cookies);
    if (authError) return authError;

    const url = new URL(request.url);
    const memorialSlug = url.searchParams.get('memorial')?.trim();
    const status = url.searchParams.get('status'); // 'pending', 'approved', 'rejected', 'all'
    const limit = Math.min(Math.max(parseInt(url.searchParams.get('limit') || '50') || 50, 1), 100);
    const offset = Math.max(parseInt(url.searchParams.get('offset') || '0') || 0, 0);

    let memorialIdFilter: number | null = null;
    if (memorialSlug && memorialSlug !== 'all') {
      const memorial = await getMemorialBySlug(memorialSlug, { includeHidden: true });
      if (!memorial) {
        return errorResponse('Memorial not found', 404);
      }
      memorialIdFilter = memorial.id;
    }

    const { comments, counts } = await CommentService.getAdminComments(
      memorialIdFilter,
      status,
      limit,
      offset
    );

    return successResponse({
      comments,
      counts,
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
    const memorialSlug = typeof body.memorialSlug === 'string' ? body.memorialSlug.trim() : '';
    let memorialIdFilter: number | null = null;
    if (memorialSlug && memorialSlug !== 'all') {
      const memorial = await getMemorialBySlug(memorialSlug, { includeHidden: true });
      if (!memorial) {
        return errorResponse('Memorial not found', 404);
      }
      memorialIdFilter = memorial.id;
    }

    // Validate input with Zod
    const validation = validateData(commentActionSchema, {
      id: typeof body.id === 'string' ? parseInt(body.id) : body.id,
      action: body.action,
    });

    if (!validation.success) {
      return validationError(validation.error, validation.details?.join(', '));
    }

    const { id: commentId, action } = validation.data;
    if (action === 'approve') {
      await CommentService.updateCommentStatus(commentId, memorialIdFilter, 'approved');
      return successResponse(undefined, 'Comment approved successfully');
    } else if (action === 'reject') {
      await CommentService.updateCommentStatus(commentId, memorialIdFilter, 'rejected');
      return successResponse(undefined, 'Comment rejected (kept for audit)');
    } else {
      return errorResponse('Invalid action. Use "approve" or "reject"', 400);
    }
  } catch (error) {
    console.error('Error updating comment:', error);
    return errorResponse('Failed to update comment');
  }
};
