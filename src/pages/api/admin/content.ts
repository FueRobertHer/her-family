import type { APIRoute } from 'astro';
import { db, MemorialContent, eq, and } from 'astro:db';
import { requireAuth } from '../../../lib/auth';
import { successResponse, errorResponse, validationError } from '../../../lib/api-response';
import { memorialContentSchema, validateData } from '../../../lib/validation';

export const prerender = false;

interface OrganizedContent {
  [section: string]: {
    [key: string]: {
      value: string;
      type: string;
      updatedAt: string;
    };
  };
}

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
    }, {} as OrganizedContent);

    return successResponse({ organizedContent, raw: content });
  } catch (error) {
    console.error('Error fetching content:', error);
    return errorResponse('Failed to fetch content');
  }
};

// POST - Update memorial content
export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    // Check admin authentication
    const authError = requireAuth(cookies);
    if (authError) return authError;

    const body = await request.json();
    
    // Validate input with Zod
    const validation = validateData(memorialContentSchema, body);
    if (!validation.success) {
      return validationError(validation.error, validation.details?.join(', '));
    }
    
    const { section, key, value, type } = validation.data;

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

    return successResponse(undefined, 'Content updated successfully');
  } catch (error) {
    console.error('Error updating content:', error);
    const details = error instanceof Error ? error.message : 'Unknown error';
    return errorResponse('Failed to update content', 500, details);
  }
};