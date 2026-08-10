import type { APIRoute } from 'astro';
import { clearSessionCookie } from '../../../lib/session';

export const prerender = false;

/**
 * Ends the admin session.
 *
 * POST rather than the previous `GET /admin?logout=true`: a link that logs you
 * out fires on prefetch and on any crawler that follows it, and a GET request
 * should not change server state. The session cookie is SameSite=strict, so a
 * cross-site form post cannot reach this with a live session.
 */
export const POST: APIRoute = async ({ cookies, redirect }) => {
  clearSessionCookie(cookies);
  return redirect('/admin', 303);
};
