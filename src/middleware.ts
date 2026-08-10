import { defineMiddleware } from 'astro:middleware';
import type { APIContext } from 'astro';
import { SESSION_COOKIE } from './lib/session';

// Content Security Policy for all dynamic pages.
//
// script-src is 'self' only: every inline handler and inline <script> has been
// migrated to a bundled module with delegated listeners, and
// build.assetsInlineLimit in astro.config.mjs stops Astro from inlining small
// script chunks back into the HTML. If a script ever silently stops running,
// check the browser console for a CSP violation before anything else.
//
// Styles still need 'unsafe-inline': Astro's scoped <style> tags and the
// style="..." attributes throughout the markup have no hash-free alternative.
//
// Development relaxes script-src for Astro's dev toolbar (an inline script)
// and the @vercel/analytics debug script, neither of which exists in a
// production build. The production policy below is the one that ships.
const isDev = import.meta.env.DEV;

const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  isDev ? "script-src 'self' 'unsafe-inline' https://va.vercel-scripts.com" : "script-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://res.cloudinary.com",
  "font-src 'self' data:",
  isDev
    ? "connect-src 'self' https://res.cloudinary.com https://vitals.vercel-insights.com"
    : "connect-src 'self' https://res.cloudinary.com",
  "media-src 'self' https://res.cloudinary.com",
  // Agenda page embeds PDFs via the Google Docs viewer, with a direct
  // Cloudinary URL fallback.
  'frame-src https://docs.google.com https://res.cloudinary.com',
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join('; ');

/**
 * Public memorial pages are identical for every signed-out visitor and change
 * only when an admin edits them, but every route is server-rendered with no
 * caching, so each visitor cost a full render and a round of queries.
 *
 * Anonymous GETs of public pages become briefly cacheable at the CDN; anything
 * carrying an admin session (which renders edit controls into the same HTML),
 * any API route, and anything that sets a cookie stays private and uncached.
 *
 * The window is deliberately short: after an edit, a visitor may see the
 * previous version for up to a minute, and up to CACHE_STALE_SECONDS while the
 * CDN revalidates in the background.
 */
const CACHE_FRESH_SECONDS = 60;
const CACHE_STALE_SECONDS = 300;

const PRIVATE_PATH_PREFIXES = ['/api/', '/admin'];

function applyCachePolicy(context: APIContext, response: Response) {
  const pathname = context.url.pathname;
  const isPrivatePath = PRIVATE_PATH_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(prefix)
  );
  const hasSession = Boolean(context.cookies.get(SESSION_COOKIE)?.value);

  // A cache keyed on Cookie still needs telling that the variant differs.
  response.headers.set('Vary', 'Cookie');

  const cacheable =
    context.request.method === 'GET' &&
    !isPrivatePath &&
    !hasSession &&
    response.status === 200 &&
    !response.headers.has('Set-Cookie');

  if (cacheable) {
    response.headers.set(
      'Cache-Control',
      `public, max-age=0, s-maxage=${CACHE_FRESH_SECONDS}, stale-while-revalidate=${CACHE_STALE_SECONDS}`
    );
  } else {
    response.headers.set('Cache-Control', 'private, no-store');
  }
}

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
  applyCachePolicy(context, response);

  return response;
});
