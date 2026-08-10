import { describe, expect, test } from 'bun:test';
import {
  CloudinaryPresets,
  optimizeCloudinaryPdf,
  optimizeCloudinaryUrl,
} from '../src/lib/image-optimization';

const IMAGE_URL = 'https://res.cloudinary.com/demo/image/upload/v1/memorials/portrait.jpg';

describe('optimizeCloudinaryUrl', () => {
  test('inserts transformations after /upload/', () => {
    const result = optimizeCloudinaryUrl(IMAGE_URL, { width: 800 });

    expect(result).toBe(
      'https://res.cloudinary.com/demo/image/upload/w_800,c_fill,f_webp,q_auto/v1/memorials/portrait.jpg'
    );
  });

  test('leaves non-Cloudinary urls untouched', () => {
    expect(optimizeCloudinaryUrl('/images/portrait.jpg', { width: 800 })).toBe(
      '/images/portrait.jpg'
    );
  });

  test('returns falsy input unchanged rather than building a broken url', () => {
    expect(optimizeCloudinaryUrl('')).toBe('');
  });

  test('forces webp for images but auto for other resource types', () => {
    expect(optimizeCloudinaryUrl(IMAGE_URL)).toContain('f_webp');

    const rawUrl = 'https://res.cloudinary.com/demo/raw/upload/v1/agenda.pdf';
    expect(optimizeCloudinaryUrl(rawUrl)).toContain('f_auto');
  });

  test('only applies crop and gravity when a dimension is given', () => {
    const noDimensions = optimizeCloudinaryUrl(IMAGE_URL, { crop: 'fill', gravity: 'auto' });

    expect(noDimensions).not.toContain('c_fill');
    expect(noDimensions).not.toContain('g_auto');
  });

  test('applies gravity when cropping, so a portrait is not sliced in half', () => {
    const result = optimizeCloudinaryUrl(IMAGE_URL, CloudinaryPresets.socialPreview);

    expect(result).toContain('w_1200');
    expect(result).toContain('h_630');
    expect(result).toContain('c_fill');
    expect(result).toContain('g_auto');
  });

  test('uses jpg for social previews, which some scrapers require', () => {
    expect(optimizeCloudinaryUrl(IMAGE_URL, CloudinaryPresets.socialPreview)).toContain('f_jpg');
  });

  test('leaves a Cloudinary url without /upload/ alone', () => {
    const odd = 'https://res.cloudinary.com/demo/image/fetch/v1/portrait.jpg';
    expect(optimizeCloudinaryUrl(odd, { width: 100 })).toBe(odd);
  });
});

describe('optimizeCloudinaryPdf', () => {
  test('adds compression flags', () => {
    const result = optimizeCloudinaryPdf('https://res.cloudinary.com/demo/raw/upload/v1/a.pdf');

    expect(result).toContain('fl_lossy');
    expect(result).toContain('fl_progressive');
    expect(result).toContain('q_auto:good');
  });

  test('passes through non-Cloudinary urls', () => {
    expect(optimizeCloudinaryPdf('/files/a.pdf')).toBe('/files/a.pdf');
  });
});
