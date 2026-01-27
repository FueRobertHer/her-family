import type { APIRoute } from 'astro';
import { db, MemorialContent, eq, and } from 'astro:db';

export const prerender = false;

// GET - Fetch all memorial content
export const GET: APIRoute = async () => {
  try {
    const content = await db.select().from(MemorialContent);
    
    // Organize content by section for easier use
    const organizedContent = content.reduce((acc, item) => {
      if (!acc[item.section]) {
        acc[item.section] = {};
      }
      acc[item.section][item.key] = {
        value: item.value,
        type: item.type,
        updatedAt: item.updatedAt
      };
      return acc;
    }, {} as any);

    return new Response(JSON.stringify({ 
      success: true, 
      data: organizedContent,
      raw: content
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error fetching content:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Failed to fetch content' 
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
};

// POST - Update memorial content
export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    // Check admin authentication
    const isAuthenticated = cookies.get('admin_auth')?.value === 'true';
    
    if (!isAuthenticated) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Unauthorized - Please log in as admin' 
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const body = await request.json();
    console.log('Received content update:', body);
    
    const { section, key, value, type = 'text' } = body;

    if (!section || !key || value === undefined) {
      console.error('Missing required fields:', { section, key, value: value === undefined ? 'undefined' : 'provided' });
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Section, key, and value are required',
        received: { section, key, hasValue: value !== undefined }
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Check if content already exists (optimized query)
    const existing = await db
      .select()
      .from(MemorialContent)
      .where(
        and(
          eq(MemorialContent.section, section),
          eq(MemorialContent.key, key)
        )
      )
      .limit(1);

    console.log('Existing content found:', existing.length > 0);

    if (existing.length > 0) {
      // Update existing content using proper SQL update
      await db.update(MemorialContent)
        .set({
          value: String(value),
          type,
          updatedAt: new Date().toISOString()
        })
        .where(
          eq(MemorialContent.id, existing[0].id)
        );
    } else {
      // Insert new content
      await db.insert(MemorialContent).values({
        section,
        key,
        value: String(value),
        type,
        updatedAt: new Date().toISOString()
      });
    }

    console.log('Content updated successfully:', { section, key });

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Content updated successfully' 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error updating content:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Failed to update content',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};