import { beforeAll, describe, expect, test } from 'bun:test';
import crypto from 'node:crypto';

// session.ts reads its secret from import.meta.env, which Bun backs with
// process.env. Set it before importing so the module picks it up.
process.env.SESSION_SECRET = 'test-secret-for-session-tests';

const { createSessionToken, verifySessionToken, safeCompare, SESSION_COOKIE } =
  await import('../src/lib/session');

describe('session tokens', () => {
  let token: string;

  beforeAll(() => {
    token = createSessionToken()!;
  });

  test('mints a token when a secret is configured', () => {
    expect(token).toBeTruthy();
    expect(token.startsWith('admin.')).toBe(true);
    expect(token.split('.')).toHaveLength(3);
  });

  test('accepts a token it just minted', () => {
    expect(verifySessionToken(token)).toBe(true);
  });

  test('rejects an absent token', () => {
    expect(verifySessionToken(undefined)).toBe(false);
    expect(verifySessionToken('')).toBe(false);
  });

  // The whole point of signing: the old cookie was the literal string "true".
  test('rejects a hand-forged token', () => {
    const expiry = Date.now() + 60_000;
    expect(verifySessionToken(`admin.${expiry}.forged-signature`)).toBe(false);
  });

  test('rejects a token whose expiry has been extended by the client', () => {
    const [, expiresAt, signature] = token.split('.');
    const extended = `admin.${Number(expiresAt) + 60_000}.${signature}`;

    expect(verifySessionToken(extended)).toBe(false);
  });

  test('rejects an expired token', () => {
    const expired = `admin.${Date.now() - 1000}`;
    const signature = crypto
      .createHmac('sha256', 'test-secret-for-session-tests')
      .update(expired)
      .digest('base64url');

    expect(verifySessionToken(`${expired}.${signature}`)).toBe(false);
  });

  test('rejects a token with the wrong prefix', () => {
    const [, expiresAt, signature] = token.split('.');
    expect(verifySessionToken(`user.${expiresAt}.${signature}`)).toBe(false);
  });

  test('rejects malformed shapes', () => {
    expect(verifySessionToken('admin')).toBe(false);
    expect(verifySessionToken('admin.notanumber.sig')).toBe(false);
    expect(verifySessionToken('a.b.c.d')).toBe(false);
  });

  test('names the cookie explicitly so callers cannot drift', () => {
    expect(SESSION_COOKIE).toBe('admin_session');
  });
});

describe('safeCompare', () => {
  test('matches identical strings', () => {
    expect(safeCompare('hunter2', 'hunter2')).toBe(true);
  });

  test('rejects different strings', () => {
    expect(safeCompare('hunter2', 'hunter3')).toBe(false);
  });

  test('rejects strings of differing length without throwing', () => {
    expect(safeCompare('short', 'a-much-longer-password')).toBe(false);
  });

  test('handles empty input', () => {
    expect(safeCompare('', '')).toBe(true);
    expect(safeCompare('', 'x')).toBe(false);
  });
});
