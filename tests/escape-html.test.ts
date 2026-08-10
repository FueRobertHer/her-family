import { describe, expect, test } from 'bun:test';
import { escapeHtml } from '../src/lib/escape-html';

describe('escapeHtml', () => {
  test('neutralizes the characters that break out of markup', () => {
    expect(escapeHtml('<script>alert(1)</script>')).toBe(
      '&lt;script&gt;alert(1)&lt;&#x2F;script&gt;'
    );
  });

  test('escapes both quote styles so attribute contexts stay intact', () => {
    expect(escapeHtml(`" onerror="alert(1)`)).toBe('&quot; onerror=&quot;alert(1)');
    expect(escapeHtml("' onerror='alert(1)")).toBe('&#x27; onerror=&#x27;alert(1)');
  });

  test('escapes ampersands first so entities are not double-decoded', () => {
    expect(escapeHtml('&lt;')).toBe('&amp;lt;');
  });

  test('coerces nullish input to an empty string', () => {
    expect(escapeHtml(null)).toBe('');
    expect(escapeHtml(undefined)).toBe('');
    expect(escapeHtml(0)).toBe('0');
  });
});
