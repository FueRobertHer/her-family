/**
 * Escapes HTML special characters to prevent XSS when interpolating
 * untrusted text into innerHTML / template strings.
 *
 * Single shared implementation — previously four separate copies lived in
 * admin-editor.js, admin/index.astro, Comments.astro and Toast.astro.
 *
 * @param {unknown} text - Value to escape (coerced to string)
 * @returns {string} Escaped text safe for HTML insertion
 */
export function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };
  return String(text ?? '').replace(/[&<>"'/]/g, (char) => map[char]);
}
