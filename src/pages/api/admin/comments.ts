import type { APIRoute } from 'astro';
import { db, Comments, Memorials, eq, and } from 'astro:db';
import { requireAuth } from '../../../lib/auth';
import { successResponse, errorResponse, validationError } from '../../../lib/api-response';
import { commentActionSchema, validateData } from '../../../lib/validation';
import { getMemorialBySlug } from '../../../lib/memorial-context';

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
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const offset = parseInt(url.searchParams.get('offset') || '0');

    let allComments;
    if (!memorialSlug || memorialSlug === 'all') {
      allComments = await db.select().from(Comments);
    } else {
      const memorial = await getMemorialBySlug(memorialSlug);
      if (!memorial) {
        return errorResponse('Memorial not found', 404);
      }
      allComments = await db
        .select()
        .from(Comments)
        .where(eq(Comments.memorialId, memorial.id));
    }

    const memorialRecords = await db.select().from(Memorials);
    const memorialMap = new Map(memorialRecords.map((memorial) => [memorial.id, memorial]));

    // Calculate counts
    const counts = {
      pending: allComments.filter((c) => c.status === 'pending').length,
      approved: allComments.filter((c) => c.status === 'approved').length,
      rejected: allComments.filter((c) => c.status === 'rejected').length,
      total: allComments.length,
    };

    // Filter comments based on status
    let filteredComments = allComments;
    if (status && status !== 'all') {
      filteredComments = allComments.filter((c) => c.status === status);
    }

    // Sort by creation date (newest first)
    filteredComments.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    // Apply pagination
    const comments = filteredComments.slice(offset, offset + limit).map((comment) => {
      const memorial = memorialMap.get(comment.memorialId);
      return {
        ...comment,
        memorialName: memorial?.name || 'Unknown memorial',
        memorialSlug: memorial?.slug || '',
      };
    });

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
      const memorial = await getMemorialBySlug(memorialSlug);
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
    const now = new Date().toISOString();

    if (action === 'approve') {
      const updateQuery = db
        .update(Comments)
        .set({ status: 'approved', updatedAt: now });
      await (memorialIdFilter !== null
        ? updateQuery.where(and(eq(Comments.id, commentId), eq(Comments.memorialId, memorialIdFilter)))
        : updateQuery.where(eq(Comments.id, commentId)));

      return successResponse(undefined, 'Comment approved successfully');
    } else if (action === 'reject') {
      const updateQuery = db
        .update(Comments)
        .set({ status: 'rejected', updatedAt: now });
      await (memorialIdFilter !== null
        ? updateQuery.where(and(eq(Comments.id, commentId), eq(Comments.memorialId, memorialIdFilter)))
        : updateQuery.where(eq(Comments.id, commentId)));

      return successResponse(undefined, 'Comment rejected (kept for audit)');
    } else {
      return errorResponse('Invalid action. Use "approve" or "reject"', 400);
    }
  } catch (error) {
    console.error('Error updating comment:', error);
    return errorResponse('Failed to update comment');
  }
};
