import type { AstroCookies } from 'astro';
import { verifySessionToken, SESSION_COOKIE } from './session';

/**
 * Checks if the current request carries a valid signed admin session
 * @param cookies - Astro cookies object
 * @returns true if authenticated, false otherwise
 */
export function isAuthenticated(cookies: AstroCookies): boolean {
  return verifySessionToken(cookies.get(SESSION_COOKIE)?.value);
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
        error: 'Unauthorized',
      }),
      {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
  return null;
}
