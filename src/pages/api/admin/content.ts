import type { APIRoute } from 'astro';
import { requireAuth } from '../../../lib/auth';
import { successResponse, errorResponse, validationError } from '../../../lib/api-response';
import { memorialContentSchema, validateData } from '../../../lib/validation';
import { getMemorialBySlug } from '../../../lib/memorial-context';
import { ContentService } from '../../../lib/services/content.service.ts';

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
export const GET: APIRoute = async ({ request }) => {
  try {
    const memorialSlug = new URL(request.url).searchParams.get('memorial')?.trim();
    if (!memorialSlug) {
      return validationError('memorial query parameter is required');
    }

    const memorial = await getMemorialBySlug(memorialSlug);
    if (!memorial) {
      return errorResponse('Memorial not found', 404);
    }

    const content = await ContentService.getAllContent(memorial.id);

    // Organize content by section for easier use
    const organizedContent = content.reduce((acc, item) => {
      if (!acc[item.section]) {
        acc[item.section] = {};
      }
      acc[item.section][item.key] = {
        value: item.value,
        type: item.type,
        updatedAt: item.updatedAt,
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

    const memorialSlug = typeof body.memorialSlug === 'string' ? body.memorialSlug.trim() : '';
    if (!memorialSlug) {
      return validationError('memorialSlug is required');
    }

    const memorial = await getMemorialBySlug(memorialSlug);
    if (!memorial) {
      return errorResponse('Memorial not found', 404);
    }

    const { section, key, value, type } = validation.data;

    await ContentService.upsertContent(memorial.id, section, key, value, type);

    return successResponse(undefined, 'Content updated successfully');
  } catch (error) {
    console.error('Error updating content:', error);
    const details = error instanceof Error ? error.message : 'Unknown error';
    return errorResponse('Failed to update content', 500, details);
  }
};
