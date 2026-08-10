import type { APIRoute } from 'astro';
import { requireAuth } from '../../../lib/auth';
import { successResponse, errorResponse, validationError } from '../../../lib/api-response';
import { memorialContentBatchSchema, validateData } from '../../../lib/validation';
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
// Admin-only: the sole consumer is the inline editor, and an unauthenticated
// read here would expose the content of hidden memorials.
export const GET: APIRoute = async ({ request, cookies }) => {
  try {
    const authError = requireAuth(cookies);
    if (authError) return authError;

    const memorialSlug = new URL(request.url).searchParams.get('memorial')?.trim();
    if (!memorialSlug) {
      return validationError('memorial query parameter is required');
    }

    const memorial = await getMemorialBySlug(memorialSlug, { includeHidden: true });
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
//
// Accepts either a single {section, key, value} or {updates: [...]}. The editor
// sends the whole section at once: one request, one memorial lookup, and one
// write per changed field instead of a dozen independent round trips that
// could half-succeed.
export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    // Check admin authentication
    const authError = requireAuth(cookies);
    if (authError) return authError;

    const body = await request.json();

    // Normalize the single-update form into the batch form.
    const candidate = Array.isArray(body?.updates)
      ? body
      : { memorialSlug: body?.memorialSlug, updates: [body] };

    const validation = validateData(memorialContentBatchSchema, candidate);
    if (!validation.success) {
      return validationError(validation.error, validation.details?.join(', '));
    }

    const { memorialSlug, updates } = validation.data;

    const memorial = await getMemorialBySlug(memorialSlug, { includeHidden: true });
    if (!memorial) {
      return errorResponse('Memorial not found', 404);
    }

    await ContentService.upsertManyContent(memorial.id, updates);

    return successResponse({ updated: updates.length }, 'Content updated successfully');
  } catch (error) {
    console.error('Error updating content:', error);
    const details = error instanceof Error ? error.message : 'Unknown error';
    return errorResponse('Failed to update content', 500, details);
  }
};
