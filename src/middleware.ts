import { defineMiddleware } from 'astro:middleware';

// Content Security Policy for all dynamic pages.
//
// NOTE: 'unsafe-inline' for scripts is currently required — the app uses
// inline event handlers (onclick=...) and is:inline scripts throughout the
// admin editing UI. Removing it means migrating every inline handler to
// addEventListener, which is tracked as a follow-up. Styles also need
// 'unsafe-inline' for Astro's scoped <style> tags and inline style attributes.
const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://res.cloudinary.com",
  "font-src 'self' data:",
  "connect-src 'self' https://res.cloudinary.com",
  "media-src 'self' https://res.cloudinary.com",
  // Agenda page embeds PDFs via the Google Docs viewer, with a direct
  // Cloudinary URL fallback.
  "frame-src https://docs.google.com https://res.cloudinary.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join('; ');

export const onRequest = defineMiddleware(async (context, next) => {
  const pathname = context.url.pathname;

  // Block scanner/bot paths immediately with 404
  const blockedPatterns = [
    /\/wp-/,
    /\.php$/,
    /\/wordpress\//,
    /\/phpmyadmin\//i,
    /\/pma\//,
    /\/myadmin\//,
    /\/administrator\//,
    /\.(asp|aspx|cgi|jsp|pl|py|rb|exe|dll|so|bat|cmd|sh)$/,
    /\.(sql|bak|backup|old|tmp|log|conf|ini|config)$/,
    /^\/\.env/,
    /^\/\.git\//,
    /^\/(cgi-bin|vendor|node_modules|backup|backups|db|database|sql|logs)\//,
  ];

  if (blockedPatterns.some((pattern) => pattern.test(pathname))) {
    return new Response(null, { status: 404 });
  }

  // Get the response
  const response = await next();

  // Security headers for all dynamic pages.
  // (Static assets are handled by Vercel's CDN with automatic caching.)
  // X-XSS-Protection is intentionally omitted: it is deprecated and the
  // legacy auditor it toggled introduced vulnerabilities of its own.
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), interest-cohort=()'
  );
  response.headers.set('Content-Security-Policy', CONTENT_SECURITY_POLICY);

  return response;
});
