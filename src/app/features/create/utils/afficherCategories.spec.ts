import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { afficherCategories } from './afficherCategories';
import { CathegoriesBlog } from '../types/cathegoriesBlog';

describe('afficherCategories', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()]
    });
  });

  it('should return a string', () => {
    const result = afficherCategories(',');
    expect(typeof result).toBe('string');
  });

  it('should join categories with comma separator', () => {
    const result = afficherCategories(',');
    const expectedValues = Object.values(CathegoriesBlog);
    const expectedResult = expectedValues.join(',');
    expect(result).toBe(expectedResult);
  });

  it('should join categories with semicolon separator', () => {
    const result = afficherCategories(';');
    const expectedValues = Object.values(CathegoriesBlog);
    const expectedResult = expectedValues.join(';');
    expect(result).toBe(expectedResult);
  });

  it('should join categories with space separator', () => {
    const result = afficherCategories(' ');
    const expectedValues = Object.values(CathegoriesBlog);
    const expectedResult = expectedValues.join(' ');
    expect(result).toBe(expectedResult);
  });

  it('should join categories with dash separator', () => {
    const result = afficherCategories('-');
    const expectedValues = Object.values(CathegoriesBlog);
    const expectedResult = expectedValues.join('-');
    expect(result).toBe(expectedResult);
  });

  it('should join categories with pipe separator', () => {
    const result = afficherCategories('|');
    const expectedValues = Object.values(CathegoriesBlog);
    const expectedResult = expectedValues.join('|');
    expect(result).toBe(expectedResult);
  });

  it('should join categories with newline separator', () => {
    const result = afficherCategories('\n');
    const expectedValues = Object.values(CathegoriesBlog);
    const expectedResult = expectedValues.join('\n');
    expect(result).toBe(expectedResult);
  });

  it('should join categories with empty string separator', () => {
    const result = afficherCategories('');
    const expectedValues = Object.values(CathegoriesBlog);
    const expectedResult = expectedValues.join('');
    expect(result).toBe(expectedResult);
  });

  it('should join categories with multiple character separator', () => {
    const result = afficherCategories(' | ');
    const expectedValues = Object.values(CathegoriesBlog);
    const expectedResult = expectedValues.join(' | ');
    expect(result).toBe(expectedResult);
  });

  it('should handle special characters in separator', () => {
    const result = afficherCategories(' -> ');
    const expectedValues = Object.values(CathegoriesBlog);
    const expectedResult = expectedValues.join(' -> ');
    expect(result).toBe(expectedResult);
  });

  it('should work with single category (if enum has only one value)', () => {
    const result = afficherCategories(',');
    const expectedValues = Object.values(CathegoriesBlog);
    
    if (expectedValues.length === 1) {
      expect(result).toBe(expectedValues[0]);
    } else {
      expect(result).toContain(',');
    }
  });

  it('should work with multiple categories', () => {
    const result = afficherCategories(',');
    const expectedValues = Object.values(CathegoriesBlog);
    
    if (expectedValues.length > 1) {
      expect(result).toContain(',');
      expect(result.split(',').length).toBe(expectedValues.length);
    }
  });

  it('should preserve category order', () => {
    const result = afficherCategories(',');
    const expectedValues = Object.values(CathegoriesBlog);
    const resultArray = result.split(',');
    
    expect(resultArray).toEqual(expectedValues);
  });

  it('should handle Unicode characters in separator', () => {
    const result = afficherCategories(' • ');
    const expectedValues = Object.values(CathegoriesBlog);
    const expectedResult = expectedValues.join(' • ');
    expect(result).toBe(expectedResult);
  });

  it('should handle numeric separator (converted to string)', () => {
    const result = afficherCategories('123' as any);
    const expectedValues = Object.values(CathegoriesBlog);
    const expectedResult = expectedValues.join('123');
    expect(result).toBe(expectedResult);
  });

  it('should be consistent with Object.values() behavior', () => {
    const result = afficherCategories(',');
    const expectedValues = Object.values(CathegoriesBlog);
    
    expect(expectedValues.length).toBeGreaterThan(0);
    expect(result).toBe(expectedValues.join(','));
  });

  it('should handle different separator types', () => {
    const separators = [',', ';', ':', '|', ' ', '\n', '\t', '-', '_', '.'];
    
    separators.forEach(separator => {
      const result = afficherCategories(separator);
      const expectedValues = Object.values(CathegoriesBlog);
      const expectedResult = expectedValues.join(separator);
      expect(result).toBe(expectedResult);
    });
  });

  it('should return non-empty string when categories exist', () => {
    const result = afficherCategories(',');
    const expectedValues = Object.values(CathegoriesBlog);
    
    expect(expectedValues.length).toBeGreaterThan(0);
    expect(result.length).toBeGreaterThan(0);
  });

  it('should handle edge case with very long separator', () => {
    const longSeparator = 'a'.repeat(100);
    const result = afficherCategories(longSeparator);
    const expectedValues = Object.values(CathegoriesBlog);
    const expectedResult = expectedValues.join(longSeparator);
    expect(result).toBe(expectedResult);
  });

  it('should handle edge case with regex special characters in separator', () => {
    const regexSeparator = '.*+?^${}[]|\\';
    const result = afficherCategories(regexSeparator);
    const expectedValues = Object.values(CathegoriesBlog);
    const expectedResult = expectedValues.join(regexSeparator);
    expect(result).toBe(expectedResult);
  });
});
