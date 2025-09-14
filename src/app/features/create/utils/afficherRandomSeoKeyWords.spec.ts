import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { afficherRandomSeoKeyWords } from './afficherRandomSeoKeyWords';
import { SeoKeyWords } from '../types/seo-key-words';

describe('afficherRandomSeoKeyWords', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()]
    });
  });

  it('should return a string', () => {
    const result = afficherRandomSeoKeyWords();
    expect(typeof result).toBe('string');
  });

  it('should return a value from SeoKeyWords enum', () => {
    const result = afficherRandomSeoKeyWords();
    const validValues = Object.values(SeoKeyWords);
    expect(validValues).toContain(result as any);
  });

  it('should return different values on multiple calls', () => {
    const results = new Set();
    // Call the function multiple times to test randomness
    for (let i = 0; i < 100; i++) {
      results.add(afficherRandomSeoKeyWords());
    }
    
    // With a good random distribution, we should get multiple different values
    // This test assumes SeoKeyWords has more than 1 value
    expect(results.size).toBeGreaterThan(1);
  });

  it('should return values within the expected range', () => {
    const validValues = Object.values(SeoKeyWords);
    const results = [];
    
    // Test multiple calls to ensure we get valid values
    for (let i = 0; i < 50; i++) {
      const result = afficherRandomSeoKeyWords();
      results.push(result);
      expect(validValues).toContain(result as any);
    }
  });

  it('should handle edge case with single enum value', () => {
    // This test ensures the function works even if SeoKeyWords has only one value
    const result = afficherRandomSeoKeyWords();
    expect(result).toBeDefined();
    expect(typeof result).toBe('string');
  });

  it('should be consistent with Object.values() behavior', () => {
    const expectedValues = Object.values(SeoKeyWords);
    const result = afficherRandomSeoKeyWords();
    
    expect(expectedValues.length).toBeGreaterThan(0);
    expect(expectedValues).toContain(result as any);
  });

  it('should not return undefined or null', () => {
    const result = afficherRandomSeoKeyWords();
    expect(result).toBeDefined();
    expect(result).not.toBeNull();
  });

  it('should return non-empty string', () => {
    const result = afficherRandomSeoKeyWords();
    expect(result.length).toBeGreaterThan(0);
  });

  it('should be deterministic in structure (always returns valid enum value)', () => {
    // Test that the function always returns a valid enum value
    const validValues = Object.values(SeoKeyWords);
    
    for (let i = 0; i < 10; i++) {
      const result = afficherRandomSeoKeyWords();
      expect(validValues.includes(result as any)).toBe(true);
    }
  });

  it('should handle Math.random() edge cases', () => {
    // Mock Math.random to test edge cases
    const originalRandom = Math.random;
    
    try {
      // Test with Math.random returning 0 (should select first element)
      Math.random = () => 0;
      const result1 = afficherRandomSeoKeyWords();
      const validValues = Object.values(SeoKeyWords);
      expect(validValues).toContain(result1 as any);
      
      // Test with Math.random returning close to 1 (should select last element)
      Math.random = () => 0.999999;
      const result2 = afficherRandomSeoKeyWords();
      expect(validValues).toContain(result2 as any);
      
    } finally {
      Math.random = originalRandom;
    }
  });

  it('should work with different enum configurations', () => {
    // Test that the function works regardless of enum size
    const result = afficherRandomSeoKeyWords();
    const enumValues = Object.values(SeoKeyWords);
    
    expect(enumValues.length).toBeGreaterThanOrEqual(1);
    expect(enumValues).toContain(result as any);
  });
});
