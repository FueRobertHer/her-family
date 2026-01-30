import { defineMiddleware } from 'astro:middleware';

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

  if (blockedPatterns.some(pattern => pattern.test(pathname))) {
    return new Response(null, { status: 404 });
  }

  // Get the response
  const response = await next();

  // Add security headers to all dynamic pages
  // (Static assets are handled by Vercel's CDN with automatic caching)
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  return response;
});
