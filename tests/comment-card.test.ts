import { describe, expect, test } from 'bun:test';
import {
  formatCommentDate,
  renderCommentCard,
  renderCommentSlide,
  type CommentCardData,
} from '../src/lib/comment-card';

function makeComment(overrides: Partial<CommentCardData> = {}): CommentCardData {
  return {
    id: 1,
    name: 'Alex Rivera',
    relationship: 'Friend',
    message: 'A kind and steady presence.',
    imageUrl: null,
    createdAt: '2024-03-15T12:00:00.000Z',
    ...overrides,
  };
}

describe('renderCommentCard', () => {
  test('renders the submitted name, relationship and message', () => {
    const html = renderCommentCard(makeComment());

    expect(html).toContain('Alex Rivera');
    expect(html).toContain('Friend');
    expect(html).toContain('A kind and steady presence.');
  });

  // Comments are public submissions, so every interpolated field is untrusted.
  test('escapes markup in the name', () => {
    const html = renderCommentCard(makeComment({ name: '<img src=x onerror=alert(1)>' }));

    expect(html).not.toContain('<img src=x');
    expect(html).toContain('&lt;img src=x onerror=alert(1)&gt;');
  });

  test('escapes markup in the message', () => {
    const html = renderCommentCard(makeComment({ message: '</p><script>alert(1)</script>' }));

    expect(html).not.toContain('<script>');
  });

  test('escapes the avatar initial', () => {
    const html = renderCommentCard(makeComment({ name: '<b>Bob' }));

    expect(html).not.toContain('>\n              <\n');
    expect(html).toContain('&lt;');
  });

  test('escapes a hostile image url in both the attribute and the trigger data', () => {
    const html = renderCommentCard(
      makeComment({ imageUrl: 'https://example.com/a.jpg" onload="alert(1)' })
    );

    expect(html).not.toContain('onload="alert(1)"');
    expect(html).toContain('&quot; onload=&quot;alert(1)');
  });

  test('omits the photo block when there is no image', () => {
    expect(renderCommentCard(makeComment())).not.toContain('data-lightbox-trigger');
  });

  test('includes a lightbox trigger when there is an image', () => {
    const html = renderCommentCard(makeComment({ imageUrl: 'https://example.com/a.jpg' }));

    expect(html).toContain('data-lightbox-trigger');
    expect(html).toContain('data-lightbox-url="https:&#x2F;&#x2F;example.com&#x2F;a.jpg"');
  });

  test('drops the relationship line when it is absent', () => {
    expect(renderCommentCard(makeComment({ relationship: null }))).not.toContain(
      'text-xs text-warm-gray-500'
    );
  });
});

describe('renderCommentSlide', () => {
  test('wraps the card in a single slide element', () => {
    const html = renderCommentSlide(makeComment()).trim();

    expect(html.startsWith('<div class="shrink-0')).toBe(true);
  });
});

describe('formatCommentDate', () => {
  test('formats an ISO timestamp', () => {
    expect(formatCommentDate('2024-03-15T12:00:00.000Z')).toBe('Mar 15, 2024');
  });

  test('returns an empty string for an unparseable date rather than "Invalid Date"', () => {
    expect(formatCommentDate('not-a-date')).toBe('');
  });
});
