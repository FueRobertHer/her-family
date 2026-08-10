import { beforeEach, describe, expect, test } from 'bun:test';
import {
  checkRateLimit,
  cleanupRateLimits,
  getClientIdentifier,
  getRateLimitStoreSize,
  resetRateLimit,
} from '../src/lib/rate-limiter';

let counter = 0;
function uniqueId(prefix: string) {
  counter += 1;
  return `${prefix}:${counter}`;
}

describe('checkRateLimit', () => {
  beforeEach(() => {
    cleanupRateLimits();
  });

  test('allows requests up to the limit and then blocks', () => {
    const id = uniqueId('login');

    expect(checkRateLimit(id, 3, 60_000).allowed).toBe(true);
    expect(checkRateLimit(id, 3, 60_000).allowed).toBe(true);
    expect(checkRateLimit(id, 3, 60_000).allowed).toBe(true);

    const blocked = checkRateLimit(id, 3, 60_000);
    expect(blocked.allowed).toBe(false);
    expect(blocked.remaining).toBe(0);
  });

  test('counts down the remaining allowance', () => {
    const id = uniqueId('login');

    expect(checkRateLimit(id, 3, 60_000).remaining).toBe(2);
    expect(checkRateLimit(id, 3, 60_000).remaining).toBe(1);
    expect(checkRateLimit(id, 3, 60_000).remaining).toBe(0);
  });

  test('tracks identifiers independently', () => {
    const a = uniqueId('login');
    const b = uniqueId('login');

    checkRateLimit(a, 1, 60_000);
    expect(checkRateLimit(a, 1, 60_000).allowed).toBe(false);
    expect(checkRateLimit(b, 1, 60_000).allowed).toBe(true);
  });

  test('starts a fresh window once the old one expires', async () => {
    const id = uniqueId('login');

    expect(checkRateLimit(id, 1, 20).allowed).toBe(true);
    expect(checkRateLimit(id, 1, 20).allowed).toBe(false);

    await new Promise((resolve) => setTimeout(resolve, 40));

    expect(checkRateLimit(id, 1, 20).allowed).toBe(true);
  });

  test('reports a reset time in the future', () => {
    const { resetTime } = checkRateLimit(uniqueId('login'), 5, 60_000);
    expect(resetTime).toBeGreaterThan(Date.now());
  });
});

describe('resetRateLimit', () => {
  test('clears the allowance after a successful login', () => {
    const id = uniqueId('login');

    checkRateLimit(id, 1, 60_000);
    expect(checkRateLimit(id, 1, 60_000).allowed).toBe(false);

    resetRateLimit(id);
    expect(checkRateLimit(id, 1, 60_000).allowed).toBe(true);
  });
});

describe('cleanupRateLimits', () => {
  test('drops entries whose window has passed', async () => {
    cleanupRateLimits();
    checkRateLimit(uniqueId('sweep'), 5, 10);
    const before = getRateLimitStoreSize();

    await new Promise((resolve) => setTimeout(resolve, 30));
    const cleaned = cleanupRateLimits();

    expect(before).toBeGreaterThan(0);
    expect(cleaned).toBeGreaterThan(0);
  });
});

describe('getClientIdentifier', () => {
  test('uses the platform-derived address', () => {
    expect(getClientIdentifier({ clientAddress: '203.0.113.9' })).toBe('203.0.113.9');
  });

  test('falls back to "unknown" when the adapter has no address', () => {
    expect(getClientIdentifier({})).toBe('unknown');
  });

  test('does not throw when reading clientAddress fails', () => {
    const hostile = {
      get clientAddress(): string {
        throw new Error('not supported on prerendered routes');
      },
    };

    expect(getClientIdentifier(hostile)).toBe('unknown');
  });
});
