import type { APIRoute } from 'astro';

export const prerender = false;

export const GET: APIRoute = async ({ cookies }) => {
  const authCookie = cookies.get('admin_auth');
  const isAuthenticated = authCookie?.value === 'true';

  return new Response(JSON.stringify({ 
    success: true,
    isAuthenticated,
    // Only return minimal info
    status: isAuthenticated ? 'authenticated' : 'unauthenticated'
  }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  });
};
