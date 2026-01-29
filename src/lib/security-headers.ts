/**
 * Security headers middleware
 * Adds important security headers to all responses
 */

export function addSecurityHeaders(response: Response): Response {
  const headers = new Headers(response.headers);

  // Prevent clickjacking attacks
  headers.set('X-Frame-Options', 'DENY');

  // Prevent MIME type sniffing
  headers.set('X-Content-Type-Options', 'nosniff');

  // Enable XSS protection in older browsers
  headers.set('X-XSS-Protection', '1; mode=block');

  // Referrer policy for privacy
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Permissions policy to restrict browser features
  headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), interest-cohort=()');

  // Content Security Policy (basic - adjust as needed)
  headers.set(
    'Content-Security-Policy',
    "default-src 'self'; " +
      "script-src 'self' 'unsafe-inline' https://cdn.tailwindcss.com https://res.cloudinary.com; " +
      "style-src 'self' 'unsafe-inline'; " +
      "img-src 'self' data: https: blob:; " +
      "font-src 'self' data:; " +
      "connect-src 'self'; " +
      "media-src 'self' https:; " +
      "frame-ancestors 'none';"
  );

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
