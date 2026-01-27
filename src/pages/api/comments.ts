import type { APIRoute } from 'astro';
import { db, Comments, MemorialContent, eq, and } from 'astro:db';
import { successResponse, errorResponse, validationError } from '../../lib/api-response';
import { commentSchema, validateData } from '../../lib/validation';

export const prerender = false;

// GET - Fetch all approved comments
export const GET: APIRoute = async ({ request }) => {
  try {
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const offset = parseInt(url.searchParams.get('offset') || '0');

    // Get approved comments using WHERE clause for better performance
    const allApprovedComments = await db.select()
      .from(Comments)
      .where(eq(Comments.status, 'approved'));
    
    // Sort and paginate
    const approvedComments = allApprovedComments
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(offset, offset + limit);

    return successResponse(approvedComments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    return errorResponse('Failed to fetch comments');
  }
};

// POST - Create a new comment
export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    
    // Validate input with Zod
    const validation = validateData(commentSchema, body);
    if (!validation.success) {
      return validationError(validation.error, validation.details?.join(', '));
    }
    
    const { name, email, relationship, message, imageUrl } = validation.data;

    // Check auto-approve setting
    let status = 'pending';
    try {
      const settings = await db.select()
        .from(MemorialContent)
        .where(
          and(
            eq(MemorialContent.section, 'comments'),
            eq(MemorialContent.key, 'autoApprove')
          )
        );
      
      if (settings.length > 0 && settings[0].value === 'true') {
        status = 'approved';
      }
    } catch (e) {
      console.error('Error checking auto-approve setting:', e);
      // Default to pending on error
    }

    // Insert new comment
    const now = new Date().toISOString();
    const result = await db.insert(Comments).values({
      name: name.trim(),
      email: email?.trim() || null,
      relationship: relationship?.trim() || null,
      message: message.trim(),
      imageUrl: imageUrl?.trim() || null,
      status: status,
      createdAt: now,
      updatedAt: now
    });

    const responseMessage = status === 'approved' 
      ? 'Comment submitted successfully.' 
      : 'Comment submitted successfully. It will be reviewed before appearing on the page.';

    return successResponse(
      { id: Number(result.lastInsertRowid), status }, 
      responseMessage,
      201
    );
  } catch (error) {
    console.error('Error creating comment:', error);
    return errorResponse('Failed to submit comment');
  }
};