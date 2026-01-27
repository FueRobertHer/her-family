/**
 * Simple in-memory rate limiter for API endpoints
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

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
      resetTime: entry.resetTime 
    };
  }

  // Increment count
  entry.count++;
  return { 
    allowed: true, 
    remaining: maxAttempts - entry.count, 
    resetTime: entry.resetTime 
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
 */
export function cleanupRateLimits(): void {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}

// Auto-cleanup every 5 minutes (only if store has entries)
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    if (rateLimitStore.size > 0) {
      cleanupRateLimits();
    }
  }, 5 * 60 * 1000);
}

/**
 * Get client identifier from request (IP address)
 * @param request - The request object
 * @returns Client IP address or 'unknown'
 */
export function getClientIdentifier(request: Request): string {
  // Try to get real IP from common headers
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }
  
  // Fallback
  return 'unknown';
}
