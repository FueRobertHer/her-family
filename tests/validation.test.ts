import { describe, expect, test } from 'bun:test';
import {
  commentSchema,
  galleryImageSchema,
  memorialContentBatchSchema,
  validateData,
} from '../src/lib/validation';

describe('commentSchema', () => {
  const valid = { name: 'Sam', message: 'We will miss you.' };

  test('accepts a minimal submission', () => {
    const result = validateData(commentSchema, valid);
    expect(result.success).toBe(true);
  });

  test('rejects a blank name', () => {
    const result = validateData(commentSchema, { ...valid, name: '   ' });
    expect(result.success).toBe(false);
  });

  test('rejects a message over the 1000 character limit', () => {
    const result = validateData(commentSchema, { ...valid, message: 'x'.repeat(1001) });
    expect(result.success).toBe(false);
  });

  test('accepts an empty optional email but rejects a malformed one', () => {
    expect(validateData(commentSchema, { ...valid, email: '' }).success).toBe(true);
    expect(validateData(commentSchema, { ...valid, email: 'not-an-email' }).success).toBe(false);
  });

  test('trims surrounding whitespace', () => {
    const result = validateData(commentSchema, { name: '  Sam  ', message: '  Hello  ' });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe('Sam');
      expect(result.data.message).toBe('Hello');
    }
  });
});

describe('galleryImageSchema', () => {
  test('accepts absolute paths and https urls', () => {
    expect(validateData(galleryImageSchema, { imagePath: '/images/a.jpg' }).success).toBe(true);
    expect(
      validateData(galleryImageSchema, { imagePath: 'https://res.cloudinary.com/a.jpg' }).success
    ).toBe(true);
  });

  test('rejects a relative path that would not resolve', () => {
    expect(validateData(galleryImageSchema, { imagePath: 'images/a.jpg' }).success).toBe(false);
  });
});

describe('memorialContentBatchSchema', () => {
  const update = { section: 'hero', key: 'name', value: 'Full Name', type: 'text' as const };

  test('accepts a batch of updates', () => {
    const result = validateData(memorialContentBatchSchema, {
      memorialSlug: 'founder-memorial',
      updates: [update, { ...update, key: 'subtitle' }],
    });

    expect(result.success).toBe(true);
  });

  test('requires a memorial slug', () => {
    const result = validateData(memorialContentBatchSchema, { updates: [update] });
    expect(result.success).toBe(false);
  });

  test('rejects an empty batch', () => {
    const result = validateData(memorialContentBatchSchema, {
      memorialSlug: 'founder-memorial',
      updates: [],
    });

    expect(result.success).toBe(false);
  });

  test('caps the batch size so one request cannot write unbounded rows', () => {
    const result = validateData(memorialContentBatchSchema, {
      memorialSlug: 'founder-memorial',
      updates: Array.from({ length: 51 }, () => update),
    });

    expect(result.success).toBe(false);
  });

  test('defaults the content type to text', () => {
    const result = validateData(memorialContentBatchSchema, {
      memorialSlug: 'founder-memorial',
      updates: [{ section: 'hero', key: 'name', value: 'Full Name' }],
    });

    expect(result.success).toBe(true);
    if (result.success) expect(result.data.updates[0].type).toBe('text');
  });
});

describe('validateData', () => {
  test('surfaces the failing field in the message', () => {
    const result = validateData(commentSchema, { name: '', message: '' });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain('name');
      expect(result.details?.length).toBeGreaterThan(1);
    }
  });
});
