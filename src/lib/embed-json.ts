/**
 * Serializes data for embedding inside a <script> tag.
 *
 * Plain JSON.stringify does not escape "<", so a stored value containing
 * a closing script tag would terminate the tag early and inject markup
 * into the page. Escaping "<" (plus U+2028/U+2029 line separators, which
 * are legal in JSON but cannot appear raw in inline scripts) makes the
 * payload safe to inline.
 *
 * The special characters (including the backslash used in the escape
 * sequences) are built from char codes so none of them appear literally
 * in this source file.
 */
const BACKSLASH = String.fromCharCode(0x5c);
const LESS_THAN = /</g;
const LINE_SEPARATOR = new RegExp(String.fromCharCode(0x2028), 'g');
const PARAGRAPH_SEPARATOR = new RegExp(String.fromCharCode(0x2029), 'g');

export function embedJson(data: unknown): string {
  return JSON.stringify(data)
    .replace(LESS_THAN, BACKSLASH + 'u003c')
    .replace(LINE_SEPARATOR, BACKSLASH + 'u2028')
    .replace(PARAGRAPH_SEPARATOR, BACKSLASH + 'u2029');
}
