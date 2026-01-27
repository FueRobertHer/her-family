import type { APIRoute } from 'astro';

const ADMIN_PASSWORD = import.meta.env.ADMIN_PASSWORD;

// Validate that the password is set at startup
if (!ADMIN_PASSWORD) {
  throw new Error('ADMIN_PASSWORD environment variable must be set');
}

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
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
