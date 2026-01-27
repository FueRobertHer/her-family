import type { AstroCookies } from 'astro';

/**
 * Checks if the current request is from an authenticated admin user
 * @param cookies - Astro cookies object
 * @returns true if authenticated, false otherwise
 */
export function isAuthenticated(cookies: AstroCookies): boolean {
  return cookies.get('admin_auth')?.value === 'true';
}

/**
 * Middleware-style authentication checker that returns an error response if not authenticated
 * @param cookies - Astro cookies object
 * @returns Response object with 401 error if not authenticated, null if authenticated
 */
export function requireAuth(cookies: AstroCookies): Response | null {
  if (!isAuthenticated(cookies)) {
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Unauthorized' 
      }), 
      {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
  return null;
}
