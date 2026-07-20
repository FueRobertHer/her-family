import crypto from 'node:crypto';
import type { AstroCookies } from 'astro';

/**
 * Signed admin session tokens.
 *
 * The previous implementation stored the literal string "true" in an
 * `admin_auth` cookie, which anyone could forge by hand. Tokens here are
 * HMAC-SHA256 signed and carry an expiry, so they can only be minted by the
 * server and cannot be extended by the client.
 *
 * Token format: `admin.<expiresAtMs>.<base64url hmac>`
 *
 * The signing secret comes from SESSION_SECRET. If that is not set, a stable
 * secret is derived from ADMIN_PASSWORD so existing deployments keep working
 * without a new env var (rotating the password rotates all sessions).
 */

export const SESSION_COOKIE = 'admin_session';
const SESSION_TTL_SECONDS = 60 * 60 * 24; // 24 hours, matches previous cookie maxAge

function getSecret(): string | null {
  const explicit = import.meta.env.SESSION_SECRET;
  if (explicit) return explicit;

  const adminPassword = import.meta.env.ADMIN_PASSWORD;
  if (adminPassword) {
    return crypto.createHash('sha256').update(`her-family-session:${adminPassword}`).digest('hex');
  }

  return null;
}

function sign(payload: string, secret: string): string {
  return crypto.createHmac('sha256', secret).update(payload).digest('base64url');
}

export function createSessionToken(): string | null {
  const secret = getSecret();
  if (!secret) return null;

  const payload = `admin.${Date.now() + SESSION_TTL_SECONDS * 1000}`;
  return `${payload}.${sign(payload, secret)}`;
}

export function verifySessionToken(token: string | undefined): boolean {
  if (!token) return false;

  const secret = getSecret();
  if (!secret) return false;

  const parts = token.split('.');
  if (parts.length !== 3 || parts[0] !== 'admin') return false;

  const expiresAt = Number(parts[1]);
  if (!Number.isFinite(expiresAt) || Date.now() > expiresAt) return false;

  const expected = Buffer.from(sign(`admin.${parts[1]}`, secret));
  const actual = Buffer.from(parts[2]);
  return actual.length === expected.length && crypto.timingSafeEqual(actual, expected);
}

export function setSessionCookie(cookies: AstroCookies): boolean {
  const token = createSessionToken();
  if (!token) return false;

  cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    maxAge: SESSION_TTL_SECONDS,
    path: '/',
  });
  return true;
}

export function clearSessionCookie(cookies: AstroCookies): void {
  cookies.delete(SESSION_COOKIE, { path: '/' });
}

/**
 * Constant-time string comparison for credential checks.
 * Always runs the HMAC comparison even on length mismatch so response
 * timing doesn't leak the expected length.
 */
export function safeCompare(a: string, b: string): boolean {
  const key = crypto.randomBytes(32);
  const digestA = crypto.createHmac('sha256', key).update(a).digest();
  const digestB = crypto.createHmac('sha256', key).update(b).digest();
  return crypto.timingSafeEqual(digestA, digestB);
}
