/**
 * Simple in-memory rate limiter for API endpoints.
 *
 * LIMITATION: state lives in the memory of a single serverless instance.
 * On Vercel, concurrent or cold-started invocations each get their own
 * store, so this is best-effort protection only — it slows abuse from a
 * single warm instance but is not a hard guarantee. For a hard limit,
 * back this with a shared store (e.g. Vercel KV / Upstash Redis) behind
 * the same function signatures.
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();
const MAX_STORE_SIZE = 10000; // Prevent unbounded memory growth
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;

let lastCleanup = Date.now();

/**
 * Check if a request should be rate limited
 * @param identifier - Unique identifier (e.g., "login:<ip>")
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

  // Lazy cleanup: piggyback on request traffic instead of a timer.
  // (setInterval is pointless in serverless — instances are frozen between
  // invocations, so a timer would rarely fire and only pins memory.)
  if (now - lastCleanup > CLEANUP_INTERVAL_MS || rateLimitStore.size > MAX_STORE_SIZE) {
    cleanupRateLimits();
    lastCleanup = now;
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
 * Clean up expired entries
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

/**
 * Get a client identifier for rate limiting.
 *
 * Uses Astro's `clientAddress` (derived by the platform from the connection,
 * e.g. Vercel's verified client IP) rather than reading `x-forwarded-for`
 * ourselves — that header is client-controlled, so trusting it would let an
 * attacker mint a fresh rate-limit bucket per request.
 *
 * @param context - Object exposing Astro's clientAddress (APIContext / Astro global)
 * @returns Client IP address or 'unknown'
 */
export function getClientIdentifier(context: { clientAddress?: string }): string {
  try {
    return context.clientAddress || 'unknown';
  } catch {
    // Astro throws if the adapter doesn't support clientAddress (e.g. prerendered pages)
    return 'unknown';
  }
}
