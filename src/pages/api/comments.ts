import type { APIRoute } from 'astro';
import { db, Comments, MemorialContent, eq, and } from 'astro:db';

export const prerender = false;

// GET - Fetch all approved comments
export const GET: APIRoute = async ({ request }) => {
  try {
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const offset = parseInt(url.searchParams.get('offset') || '0');

    // Get all comments and filter in JavaScript to avoid WHERE clause issues
    const allComments = await db.select().from(Comments);
    const approvedComments = allComments
      .filter(comment => comment.status === 'approved')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(offset, offset + limit);

    return new Response(JSON.stringify({ 
      success: true, 
      data: approvedComments,
      count: approvedComments.length 
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error fetching comments:', error);
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

// POST - Create a new comment
export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { name, email, relationship, message, imageUrl } = body;

    // Basic validation
    if (!name || !message) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Name and message are required' 
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    // Validate message length
    if (message.length > 1000) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Message must be less than 1000 characters' 
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

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

    return new Response(JSON.stringify({ 
      success: true, 
      message: responseMessage,
      data: { id: Number(result.lastInsertRowid), status }
    }), {
      status: 201,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error creating comment:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Failed to submit comment' 
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
};