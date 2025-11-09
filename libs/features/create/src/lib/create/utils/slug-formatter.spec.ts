import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import {
    extractFilenameFromUrl,
    extractSeoSlugFromFilename,
    formatSlugForAlt,
    generateAltFromImageUrl,
    isInternalImageWithSeoSlug
} from './slug-formatter';

describe('SlugFormatter', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()]
    });
  });

  describe('extractFilenameFromUrl', () => {
    it('should extract filename from valid URL', () => {
      const url = 'https://storage.supabase.co/object/public/jardin-iris-images-post/123/123_chapitre_1_jardin-vertical-bruxelles.webp';
      const result = extractFilenameFromUrl(url);
      expect(result).toBe('123_chapitre_1_jardin-vertical-bruxelles.webp');
    });

    it('should handle URL without protocol', () => {
      const url = 'storage.supabase.co/object/public/jardin-iris-images-post/123/123_chapitre_1_jardin-vertical-bruxelles.webp';
      const result = extractFilenameFromUrl(url);
      expect(result).toBe('123_chapitre_1_jardin-vertical-bruxelles.webp');
    });

    it('should return empty string for invalid URL', () => {
      const result = extractFilenameFromUrl('');
      expect(result).toBe('');
    });

    it('should handle URL with query parameters', () => {
      const url = 'https://example.com/path/file.webp?param=value';
      const result = extractFilenameFromUrl(url);
      expect(result).toBe('file.webp');
    });
  });

  describe('extractSeoSlugFromFilename', () => {
    it('should extract SEO slug from valid filename', () => {
      const filename = '123_chapitre_1_jardin-vertical-bruxelles.webp';
      const result = extractSeoSlugFromFilename(filename);
      expect(result).toBe('jardin-vertical-bruxelles');
    });

    it('should extract SEO slug from different chapter', () => {
      const filename = '456_chapitre_3_amenagement-paysager-ecologique.webp';
      const result = extractSeoSlugFromFilename(filename);
      expect(result).toBe('amenagement-paysager-ecologique');
    });

    it('should return empty string for invalid filename', () => {
      const filename = 'invalid-filename.webp';
      const result = extractSeoSlugFromFilename(filename);
      expect(result).toBe('');
    });

    it('should handle filename without extension', () => {
      const filename = '123_chapitre_1_jardin-vertical-bruxelles';
      const result = extractSeoSlugFromFilename(filename);
      expect(result).toBe('123_chapitre_1_jardin-vertical-bruxelles');
    });
  });

  describe('formatSlugForAlt', () => {
    it('should format slug for alt attribute', () => {
      const slug = 'jardin-vertical-bruxelles';
      const result = formatSlugForAlt(slug);
      expect(result).toBe('Jardin Vertical Bruxelles');
    });

    it('should handle single word slug', () => {
      const slug = 'jardin';
      const result = formatSlugForAlt(slug);
      expect(result).toBe('Jardin');
    });

    it('should handle empty slug', () => {
      const result = formatSlugForAlt('');
      expect(result).toBe('');
    });

    it('should handle slug with numbers', () => {
      const slug = 'jardin-2024-bruxelles';
      const result = formatSlugForAlt(slug);
      expect(result).toBe('Jardin 2024 Bruxelles');
    });
  });

  describe('generateAltFromImageUrl', () => {
    it('should generate alt from internal image URL', () => {
      const url = 'https://storage.supabase.co/object/public/jardin-iris-images-post/123/123_chapitre_1_jardin-vertical-bruxelles.webp';
      const result = generateAltFromImageUrl(url);
      expect(result).toBe('Jardin Vertical Bruxelles');
    });

    it('should use fallback keyword when no SEO slug', () => {
      const url = 'https://images.pexels.com/photos/123456/pexels-photo-123456.jpeg';
      const result = generateAltFromImageUrl(url, 'jardin');
      expect(result).toBe('jardin');
    });

    it('should use default fallback when no keyword provided', () => {
      const url = 'https://images.pexels.com/photos/123456/pexels-photo-123456.jpeg';
      const result = generateAltFromImageUrl(url);
      expect(result).toBe('Image');
    });

    it('should handle empty URL', () => {
      const result = generateAltFromImageUrl('', 'fallback');
      expect(result).toBe('fallback');
    });
  });

  describe('isInternalImageWithSeoSlug', () => {
    it('should return true for internal image with SEO slug', () => {
      const url = 'https://storage.supabase.co/object/public/jardin-iris-images-post/123/123_chapitre_1_jardin-vertical-bruxelles.webp';
      const result = isInternalImageWithSeoSlug(url);
      expect(result).toBe(true);
    });

    it('should return false for Pexels image', () => {
      const url = 'https://images.pexels.com/photos/123456/pexels-photo-123456.jpeg';
      const result = isInternalImageWithSeoSlug(url);
      expect(result).toBe(false);
    });

    it('should return false for placeholder image', () => {
      const url = 'https://via.placeholder.com/800x400/4caf50/white?text=Image+Non+Disponible';
      const result = isInternalImageWithSeoSlug(url);
      expect(result).toBe(false);
    });

    it('should return false for empty URL', () => {
      const result = isInternalImageWithSeoSlug('');
      expect(result).toBe(false);
    });
  });
});
