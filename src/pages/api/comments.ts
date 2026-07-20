import type { APIRoute } from 'astro';
import { db, Comments, MemorialContent, eq, and, desc } from 'astro:db';
import { successResponse, errorResponse, validationError } from '../../lib/api-response';
import { commentSchema, validateData } from '../../lib/validation';
import { getMemorialBySlug } from '../../lib/memorial-context';
import { checkRateLimit, getClientIdentifier } from '../../lib/rate-limiter';

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

    // Sort and paginate in SQL so we never pull the full comment set into memory
    const approvedComments = await db
      .select()
      .from(Comments)
      .where(and(eq(Comments.status, 'approved'), eq(Comments.memorialId, memorial.id)))
      .orderBy(desc(Comments.createdAt))
      .limit(limit)
      .offset(offset);

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

    // Check auto-approve setting with better error handling
    let status: 'pending' | 'approved' = 'pending';
    try {
      const settings = await db
        .select()
        .from(MemorialContent)
        .where(
          and(
            eq(MemorialContent.memorialId, memorial.id),
            eq(MemorialContent.section, 'comments'),
            eq(MemorialContent.key, 'autoApprove')
          )
        );

      // Only approve automatically if the setting explicitly exists and is set to 'true'
      if (settings.length > 0 && settings[0].value === 'true') {
        status = 'approved';
      }
      // If setting doesn't exist or is 'false', default to 'pending' (safer approach)
    } catch (settingsError) {
      console.error('Error checking auto-approve setting:', settingsError);
      // Default to pending on error - safer approach
    }

    // Insert new comment with proper error handling
    const now = new Date().toISOString();
    try {
      const result = await db.insert(Comments).values({
        memorialId: memorial.id,
        name: name.trim(),
        email: email?.trim() || null,
        relationship: relationship?.trim() || null,
        message: message.trim(),
        imageUrl: imageUrl?.trim() || null,
        status: status,
        createdAt: now,
        updatedAt: now,
      });

      const responseMessage =
        status === 'approved'
          ? 'Comment submitted successfully.'
          : 'Comment submitted successfully. It will be reviewed before appearing on the page.';

      return successResponse({ id: Number(result.lastInsertRowid), status }, responseMessage, 201);
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
