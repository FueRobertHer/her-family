import type { APIRoute } from 'astro';
import { checkRateLimit, resetRateLimit, getClientIdentifier } from '../../../lib/rate-limiter';
import { setSessionCookie, safeCompare } from '../../../lib/session';
import { errorResponse, successResponse, validationError } from '../../../lib/api-response';

export const prerender = false;

export const POST: APIRoute = async (context) => {
  const { request, cookies } = context;

  try {
    // Rate limiting - 5 attempts per 15 minutes per client
    const clientId = getClientIdentifier(context);
    const rateLimit = checkRateLimit(`login:${clientId}`, 5, 15 * 60 * 1000);

    if (!rateLimit.allowed) {
      const minutesUntilReset = Math.ceil((rateLimit.resetTime - Date.now()) / 60000);
      return new Response(
        JSON.stringify({
          success: false,
          error: `Too many login attempts. Please try again in ${minutesUntilReset} minute${minutesUntilReset > 1 ? 's' : ''}.`,
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': String(Math.ceil((rateLimit.resetTime - Date.now()) / 1000)),
          },
        }
      );
    }

    const adminPassword = import.meta.env.ADMIN_PASSWORD;
    if (!adminPassword) {
      console.error('ADMIN_PASSWORD environment variable is not set');
      return errorResponse('Server is not configured for admin login', 500);
    }

    const contentType = request.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      return validationError('Content-Type must be application/json');
    }

    const text = await request.text();
    if (!text) {
      return validationError('Request body is empty');
    }

    let password: unknown;
    try {
      ({ password } = JSON.parse(text));
    } catch {
      return validationError('Invalid JSON in request body');
    }

    if (typeof password !== 'string' || !password) {
      return validationError('Password is required');
    }

    if (!safeCompare(password, adminPassword)) {
      return errorResponse('Invalid password', 401);
    }

    // Reset rate limit on successful login
    resetRateLimit(`login:${clientId}`);

    if (!setSessionCookie(cookies)) {
      return errorResponse('Server is not configured for admin login', 500);
    }

    return successResponse(undefined, 'Login successful');
  } catch (error) {
    console.error('Login error:', error);
    return errorResponse('Login failed. Please try again.');
  }
};
