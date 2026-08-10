import { describe, expect, test } from 'bun:test';
import { SECTION_DEFAULTS, SECTIONS, placeholderFor, storageSectionFor } from '../src/lib/sections';

describe('SECTIONS', () => {
  test('every section has a modal title and at least one field', () => {
    for (const [key, definition] of Object.entries(SECTIONS)) {
      expect(definition.title, `${key} needs a title`).toBeTruthy();
      expect(definition.fields.length, `${key} needs fields`).toBeGreaterThan(0);
    }
  });

  test('field keys are unique within a section', () => {
    for (const [key, definition] of Object.entries(SECTIONS)) {
      const keys = definition.fields.map((field) => field.key);
      expect(new Set(keys).size, `${key} has duplicate field keys`).toBe(keys.length);
    }
  });

  test('checkbox fields declare a default so a missing row is unambiguous', () => {
    for (const [key, definition] of Object.entries(SECTIONS)) {
      for (const field of definition.fields) {
        if (field.type !== 'checkbox') continue;
        expect(field.defaultValue, `${key}.${field.key} needs a defaultValue`).toBeDefined();
      }
    }
  });

  test('comments do not auto-approve by default', () => {
    const autoApprove = SECTIONS.comments.fields.find((field) => field.key === 'autoApprove');
    expect(autoApprove?.defaultValue).toBe('false');
  });
});

describe('storageSectionFor', () => {
  test('defaults to the section key', () => {
    expect(storageSectionFor('hero')).toBe('hero');
  });

  test('routes the funeral sub-editors into the funeral section', () => {
    expect(storageSectionFor('specialInstructions')).toBe('funeral');
    expect(storageSectionFor('flowersInfo')).toBe('funeral');
  });

  // Highlights are the one split case: the list lives with the biography while
  // its visibility toggle is its own section.
  test('stores highlights content under biography', () => {
    const field = SECTIONS.highlights.fields.find((f) => f.key === 'highlights');
    expect(storageSectionFor('highlights', field)).toBe('biography');
  });

  test('keeps the highlights visibility flag in its own section', () => {
    const field = SECTIONS.highlights.fields.find((f) => f.key === 'visible');
    expect(storageSectionFor('highlights', field)).toBe('highlights');
  });
});

describe('placeholderFor', () => {
  test('prefers an explicit placeholder', () => {
    const field = SECTIONS.hero.fields.find((f) => f.key === 'mainImage')!;
    expect(placeholderFor('hero', field)).toBe('/images/portrait.jpg or Cloudinary URL');
  });

  test('falls back to the text the page actually renders', () => {
    const field = SECTIONS.gallery.fields.find((f) => f.key === 'sectionTitle')!;
    expect(placeholderFor('gallery', field)).toBe(SECTION_DEFAULTS.gallery.sectionTitle);
  });

  test('suggests the donations title the page renders, not a stale alternative', () => {
    const field = SECTIONS.donations.fields.find((f) => f.key === 'sectionTitle')!;
    expect(placeholderFor('donations', field)).toBe(SECTION_DEFAULTS.donations.sectionTitle);
  });

  test('returns an empty string when there is nothing to suggest', () => {
    const field = SECTIONS.footer.fields.find((f) => f.key === 'quote')!;
    expect(placeholderFor('footer', field)).toBe('');
  });
});
