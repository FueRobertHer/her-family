import type { APIRoute } from 'astro';
import { z } from 'zod';
import { requireAuth } from '../../../lib/auth';
import { errorResponse, successResponse, validationError } from '../../../lib/api-response';
import { validateData } from '../../../lib/validation';
import { MemorialService } from '../../../lib/services/memorial.service.ts';

export const prerender = false;

const createMemorialSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(120, 'Name is too long'),
  slug: z
    .string()
    .trim()
    .max(120, 'Slug is too long')
    .optional()
    .or(z.literal('')),
});

const updateMemorialSchema = z.object({
  id: z.number().int().positive('Invalid memorial id'),
  status: z.enum(['active', 'hidden']).optional(),
  name: z.string().trim().min(1).max(120).optional(),
  slug: z.string().trim().min(1).max(120).optional(),
});

const deleteMemorialSchema = z.object({
  id: z.number().int().positive('Invalid memorial id'),
  confirmationName: z.string().trim().min(1, 'Confirmation name is required'),
});

function createSlug(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

// GET - list all memorials for admin management
export const GET: APIRoute = async ({ cookies }) => {
  const authError = requireAuth(cookies);
  if (authError) return authError;

  try {
    const memorials = await MemorialService.getAllMemorialsAdmin();
    return successResponse(memorials);
  } catch (error) {
    console.error('Error loading memorials:', error);
    return errorResponse('Failed to load memorials');
  }
};

// POST - create a new memorial
export const POST: APIRoute = async ({ request, cookies }) => {
  const authError = requireAuth(cookies);
  if (authError) return authError;

  try {
    const body = await request.json();
    const validation = validateData(createMemorialSchema, body);
    if (!validation.success) {
      return validationError(validation.error, validation.details?.join(', '));
    }

    const { name, slug } = validation.data;
    const baseSlug = createSlug(slug || name);

    if (!baseSlug) {
      return validationError('Unable to generate a valid slug');
    }

    const existing = await MemorialService.getMemorialBySlug(baseSlug, true);
    if (existing) {
      return validationError('A memorial with this slug already exists');
    }

    const memorialId = await MemorialService.createMemorial(name, baseSlug);

    return successResponse(
      {
        id: memorialId,
        slug: baseSlug,
        name,
        status: 'active',
      },
      'Memorial created successfully',
      201
    );
  } catch (error) {
    console.error('Error creating memorial:', error);
    return errorResponse('Failed to create memorial');
  }
};

// PATCH - update memorial metadata/visibility
export const PATCH: APIRoute = async ({ request, cookies }) => {
  const authError = requireAuth(cookies);
  if (authError) return authError;

  try {
    const body = await request.json();
    const validation = validateData(updateMemorialSchema, body);
    if (!validation.success) {
      return validationError(validation.error, validation.details?.join(', '));
    }

    const { id, status, name, slug } = validation.data;
    if (!status && !name && !slug) {
      return validationError('Nothing to update');
    }

    const existing = await MemorialService.getMemorialById(id);
    if (!existing) {
      return errorResponse('Memorial not found', 404);
    }

    let nextSlug = existing.slug;
    if (slug) {
      nextSlug = createSlug(slug);
      if (!nextSlug) {
        return validationError('Unable to generate a valid slug');
      }

      if (nextSlug !== existing.slug) {
        const slugMatch = await MemorialService.getMemorialBySlug(nextSlug, true);
        if (slugMatch) {
          return validationError('A memorial with this slug already exists');
        }
      }
    }

    await MemorialService.updateMemorial(id, status ?? existing.status, name ?? existing.name, nextSlug);

    return successResponse(
      {
        id,
        slug: nextSlug,
      },
      'Memorial updated successfully'
    );
  } catch (error) {
    console.error('Error updating memorial:', error);
    return errorResponse('Failed to update memorial');
  }
};

// DELETE - permanently remove a memorial with typed confirmation
export const DELETE: APIRoute = async ({ request, cookies }) => {
  const authError = requireAuth(cookies);
  if (authError) return authError;

  try {
    const body = await request.json();
    const validation = validateData(deleteMemorialSchema, body);
    if (!validation.success) {
      return validationError(validation.error, validation.details?.join(', '));
    }

    const { id, confirmationName } = validation.data;
    const existing = await MemorialService.getMemorialById(id);
    if (!existing) {
      return errorResponse('Memorial not found', 404);
    }

    if (confirmationName !== existing.name) {
      return validationError('Confirmation name does not match memorial name');
    }

    const allMemorials = await MemorialService.getAllMemorialsAdmin();
    if (allMemorials.length <= 1) {
      return validationError('Cannot delete the last memorial');
    }

    await MemorialService.deleteMemorial(id);

    return successResponse(undefined, 'Memorial deleted successfully');
  } catch (error) {
    console.error('Error deleting memorial:', error);
    return errorResponse('Failed to delete memorial');
  }
};
