/**
 * HTML sanitization utilities to prevent XSS attacks
 */

/**
 * Escapes HTML special characters to prevent XSS
 * @param text - Text to escape
 * @returns Escaped text safe for HTML insertion
 */
export function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };
  return text.replace(/[&<>"'/]/g, (char) => map[char]);
}

/**
 * Validates email format
 * @param email - Email to validate
 * @returns true if valid email format, false otherwise
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Sanitizes and validates user input text
 * @param text - Text to sanitize
 * @param maxLength - Maximum allowed length (default: 1000)
 * @returns Sanitized text
 * @throws Error if text exceeds maxLength
 */
export function sanitizeText(text: string, maxLength: number = 1000): string {
  const trimmed = text.trim();

  if (trimmed.length > maxLength) {
    throw new Error(`Text exceeds maximum length of ${maxLength} characters`);
  }

  return trimmed;
}

/**
 * Validates that a string contains only alphanumeric characters and allowed special chars
 * @param text - Text to validate
 * @param allowedChars - Additional allowed characters (default: space, dash, underscore)
 * @returns true if valid, false otherwise
 */
export function isAlphanumeric(text: string, allowedChars: string = ' -_'): boolean {
  const pattern = new RegExp(
    `^[a-zA-Z0-9${allowedChars.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}]+$`
  );
  return pattern.test(text);
}

/**
 * Strips all HTML tags from a string
 * @param html - HTML string to strip
 * @returns Plain text with HTML tags removed
 */
export function stripHtmlTags(html: string): string {
  return html.replace(/<[^>]*>/g, '');
}
