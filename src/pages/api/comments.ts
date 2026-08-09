import type { APIRoute } from 'astro';
import { successResponse, errorResponse, validationError } from '../../lib/api-response';
import { commentSchema, validateData } from '../../lib/validation';
import { getMemorialBySlug } from '../../lib/memorial-context';
import { checkRateLimit, getClientIdentifier } from '../../lib/rate-limiter';
import { CommentService } from '../../lib/services/comment.service.ts';

// Public endpoint: cap comment submissions per client to curb spam flooding
// the moderation queue. Best-effort (see rate-limiter serverless caveat).
const COMMENTS_PER_HOUR = 15;

export const prerender = false;

// GET - Fetch all approved comments
export const GET: APIRoute = async ({ request }) => {
  try {
    const url = new URL(request.url);
    const memorialSlug = url.searchParams.get('memorial')?.trim();
    const limit = Math.min(Math.max(parseInt(url.searchParams.get('limit') || '50') || 50, 1), 100);
    const offset = Math.max(parseInt(url.searchParams.get('offset') || '0') || 0, 0);

    if (!memorialSlug) {
      return validationError('memorial query parameter is required');
    }

    const memorial = await getMemorialBySlug(memorialSlug);
    if (!memorial) {
      return errorResponse('Memorial not found', 404);
    }

    // Sort and paginate in SQL via the service
    const approvedComments = await CommentService.getApprovedComments(memorial.id, limit, offset);

    return successResponse(approvedComments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    return errorResponse('Failed to fetch comments');
  }
};

// POST - Create a new comment
export const POST: APIRoute = async (context) => {
  const { request } = context;
  try {
    const clientId = getClientIdentifier(context);
    const rateLimit = checkRateLimit(`comment:${clientId}`, COMMENTS_PER_HOUR, 60 * 60 * 1000);
    if (!rateLimit.allowed) {
      return errorResponse('Too many comments submitted. Please try again later.', 429);
    }

    const body = await request.json();
    const memorialSlug = typeof body.memorialSlug === 'string' ? body.memorialSlug.trim() : '';

    if (!memorialSlug) {
      return validationError('memorialSlug is required');
    }

    const memorial = await getMemorialBySlug(memorialSlug);
    if (!memorial) {
      return errorResponse('Memorial not found', 404);
    }

    // Validate input with Zod
    const validation = validateData(commentSchema, body);
    if (!validation.success) {
      return validationError(validation.error, validation.details?.join(', '));
    }

    const { name, email, relationship, message, imageUrl } = validation.data;

    // Check auto-approve setting
    const isAutoApprove = await CommentService.getAutoApproveSetting(memorial.id);
    const status = isAutoApprove ? 'approved' : 'pending';

    // Insert new comment with proper error handling
    try {
      const commentId = await CommentService.createComment({
        memorialId: memorial.id,
        name: name.trim(),
        email: email?.trim() || null,
        relationship: relationship?.trim() || null,
        message: message.trim(),
        imageUrl: imageUrl?.trim() || null,
        status: status,
      });

      const responseMessage =
        status === 'approved'
          ? 'Comment submitted successfully.'
          : 'Comment submitted successfully. It will be reviewed before appearing on the page.';

      return successResponse({ id: commentId, status }, responseMessage, 201);
    } catch (dbError) {
      console.error('Database error creating comment:', dbError);
      return errorResponse('Failed to save comment. Please try again.', 500);
    }
  } catch (error) {
    console.error('Error creating comment:', error);
    if (error instanceof SyntaxError) {
      return validationError('Invalid JSON in request body');
    }
    return errorResponse('Failed to submit comment');
  }
};
