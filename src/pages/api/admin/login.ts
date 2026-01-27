import type { APIRoute } from 'astro';
import { checkRateLimit, resetRateLimit, getClientIdentifier } from '../../../lib/rate-limiter';

const ADMIN_PASSWORD = import.meta.env.ADMIN_PASSWORD;

// Validate that the password is set at startup
if (!ADMIN_PASSWORD) {
  throw new Error('ADMIN_PASSWORD environment variable must be set');
}

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    // Rate limiting - 5 attempts per 15 minutes per IP
    const clientId = getClientIdentifier(request);
    const rateLimit = checkRateLimit(clientId, 5, 15 * 60 * 1000);
    
    if (!rateLimit.allowed) {
      const minutesUntilReset = Math.ceil((rateLimit.resetTime - Date.now()) / 60000);
      return new Response(JSON.stringify({ 
        success: false, 
        error: `Too many login attempts. Please try again in ${minutesUntilReset} minute${minutesUntilReset > 1 ? 's' : ''}.` 
      }), {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': String(Math.ceil((rateLimit.resetTime - Date.now()) / 1000))
        },
      });
    }
    
    // Check if request has a body
    const contentType = request.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Content-Type must be application/json' 
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    const text = await request.text();
    if (!text) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Request body is empty' 
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    const body = JSON.parse(text);
    const { password } = body;

    if (!password) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Password is required' 
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    if (password === ADMIN_PASSWORD) {
      // Reset rate limit on successful login
      resetRateLimit(clientId);
      
      // Set cookie with secure settings
      cookies.set('admin_auth', 'true', {
        httpOnly: true, // Prevent JavaScript access (XSS protection)
        secure: true, // Always require HTTPS
        sameSite: 'strict', // CSRF protection
        maxAge: 60 * 60 * 24, // 24 hours
        path: '/' // Ensure cookie is available site-wide
      });

      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Login successful' 
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } else {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Invalid password' 
      }), {
        status: 401,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }
  } catch (error) {
    console.error('Login error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Login failed. Please try again.' 
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
};
