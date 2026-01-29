/**
 * Simple in-memory rate limiter for API endpoints
 * with automatic cleanup and memory leak prevention
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();
const MAX_STORE_SIZE = 10000; // Prevent unbounded memory growth

/**
 * Check if a request should be rate limited
 * @param identifier - Unique identifier (e.g., IP address, user ID)
 * @param maxAttempts - Maximum number of attempts allowed in the window
 * @param windowMs - Time window in milliseconds
 * @returns Object with allowed status and remaining attempts
 */
export function checkRateLimit(
  identifier: string,
  maxAttempts: number = 5,
  windowMs: number = 15 * 60 * 1000 // 15 minutes default
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();

  // Prevent unbounded memory growth
  if (rateLimitStore.size > MAX_STORE_SIZE) {
    cleanupRateLimits();
  }

  const entry = rateLimitStore.get(identifier);

  // If no entry or the window has expired, create/reset entry
  if (!entry || now > entry.resetTime) {
    const resetTime = now + windowMs;
    rateLimitStore.set(identifier, { count: 1, resetTime });
    return { allowed: true, remaining: maxAttempts - 1, resetTime };
  }

  // Check if limit exceeded
  if (entry.count >= maxAttempts) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: entry.resetTime,
    };
  }

  // Increment count
  entry.count++;
  return {
    allowed: true,
    remaining: maxAttempts - entry.count,
    resetTime: entry.resetTime,
  };
}

/**
 * Reset rate limit for an identifier (useful after successful action)
 * @param identifier - Unique identifier to reset
 */
export function resetRateLimit(identifier: string): void {
  rateLimitStore.delete(identifier);
}

/**
 * Clean up expired entries (call periodically to prevent memory leak)
 * @returns Number of entries cleaned up
 */
export function cleanupRateLimits(): number {
  const now = Date.now();
  let cleaned = 0;

  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key);
      cleaned++;
    }
  }

  return cleaned;
}

/**
 * Get current store size (useful for monitoring)
 */
export function getRateLimitStoreSize(): number {
  return rateLimitStore.size;
}

// Auto-cleanup every 5 minutes (only in non-edge runtime environments)
if (typeof setInterval !== 'undefined') {
  setInterval(
    () => {
      if (rateLimitStore.size > 0) {
        const cleaned = cleanupRateLimits();
        if (cleaned > 0) {
          console.warn(`Cleaned up ${cleaned} expired rate limit entries`);
        }
      }
    },
    5 * 60 * 1000
  );
}

/**
 * Get client identifier from request (IP address)
 * @param request - The request object
 * @returns Client IP address or 'unknown'
 */
export function getClientIdentifier(request: Request): string {
  // Try to get real IP from common headers (Vercel, Cloudflare, etc.)
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    // Take the first IP in the chain
    return forwarded.split(',')[0].trim();
  }

  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }

  // Cloudflare
  const cfConnectingIp = request.headers.get('cf-connecting-ip');
  if (cfConnectingIp) {
    return cfConnectingIp;
  }

  // Fallback for development or unknown scenarios
  return 'unknown';
}
