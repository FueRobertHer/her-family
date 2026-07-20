import type { APIRoute } from 'astro';
import { isAuthenticated as checkAuth } from '../../../lib/auth';

export const prerender = false;

export const GET: APIRoute = async ({ cookies }) => {
  const isAuthenticated = checkAuth(cookies);

  return new Response(
    JSON.stringify({
      success: true,
      isAuthenticated,
      // Only return minimal info
      status: isAuthenticated ? 'authenticated' : 'unauthenticated',
    }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
};
