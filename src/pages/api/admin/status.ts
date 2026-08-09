import type { APIRoute } from 'astro';
import { isAuthenticated as checkAuth } from '../../../lib/auth';
import { successResponse } from '../../../lib/api-response';

export const prerender = false;

export const GET: APIRoute = async ({ cookies }) => {
  const isAuthenticated = checkAuth(cookies);

  return successResponse({
    isAuthenticated,
    // Only return minimal info
    status: isAuthenticated ? 'authenticated' : 'unauthenticated',
  });
};

