import { errorResponse, validationError } from './api-response';
import { MemorialService } from './services/memorial.service.ts';

export interface MemorialRecord {
  id: number;
  slug: string;
  name: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export async function getMemorialBySlug(slug: string): Promise<MemorialRecord | null> {
  if (!slug) return null;
  const memorial = await MemorialService.getMemorialBySlug(slug, true);
  return (memorial as MemorialRecord | undefined) ?? null;
}

/**
 * Validates a memorial slug and returns the memorial record, or a ready-to-return
 * error Response (400 if slug missing, 404 if not found).
 *
 * Usage:
 * ```ts
 * const result = await requireMemorial(slug);
 * if (result instanceof Response) return result;
 * const memorial = result.memorial;
 * ```
 */
export async function requireMemorial(
  slug: string | undefined | null
): Promise<{ memorial: MemorialRecord } | Response> {
  const trimmed = typeof slug === 'string' ? slug.trim() : '';
  if (!trimmed) {
    return validationError('memorial slug is required');
  }

  const memorial = await getMemorialBySlug(trimmed);
  if (!memorial) {
    return errorResponse('Memorial not found', 404);
  }

  return { memorial };
}
