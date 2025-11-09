import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { UnsplashImageService } from './unsplash-image.service';
import { HttpClient } from '@angular/common/http';

describe('UnsplashImageService', () => {
  let service: UnsplashImageService;
  let httpClient: jasmine.SpyObj<HttpClient>;

  beforeEach(() => {
    const httpSpy = jasmine.createSpyObj('HttpClient', ['get']);

    TestBed.configureTestingModule({
      providers: [
        UnsplashImageService,
        { provide: HttpClient, useValue: httpSpy },
        provideZonelessChangeDetection()
      ]
    });

    service = TestBed.inject(UnsplashImageService);
    httpClient = TestBed.inject(HttpClient) as jasmine.SpyObj<HttpClient>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getUnsplashApi()', () => {
    const testKeyword = 'nature';
    const mockApiResponse = {
      photos: [
        { id: 1, src: { medium: 'https://example.com/photo1.jpg' } },
        { id: 2, src: { medium: 'https://example.com/photo2.jpg' } },
        { id: 3, src: { medium: 'https://example.com/photo3.jpg' } }
      ]
    };

    beforeEach(() => {
      // Mock fetch globally
      spyOn(window, 'fetch').and.returnValue(Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockApiResponse)
      } as Response));
    });

    it('should fetch data from Pexels API with correct parameters', async () => {
      const result = await service.getUnsplashApi(testKeyword);

      expect(window.fetch).toHaveBeenCalledWith(
        `https://api.pexels.com/v1/search?query=${testKeyword}&per_page=5&orientation=landscape`,
        service.options
      );
      expect(result).toEqual(mockApiResponse);
    });

    it('should handle different keywords', async () => {
      const keywords = ['flowers', 'trees', 'mountains', 'ocean', 'sunset'];
      
      for (const keyword of keywords) {
        await service.getUnsplashApi(keyword);
        expect(window.fetch).toHaveBeenCalledWith(
          `https://api.pexels.com/v1/search?query=${keyword}&per_page=5&orientation=landscape`,
          service.options
        );
      }
    });

    it('should handle empty keyword', async () => {
      const emptyKeyword = '';
      
      const result = await service.getUnsplashApi(emptyKeyword);

      expect(window.fetch).toHaveBeenCalledWith(
        `https://api.pexels.com/v1/search?query=${emptyKeyword}&per_page=5&orientation=landscape`,
        service.options
      );
      expect(result).toEqual(mockApiResponse);
    });

    it('should handle keyword with spaces', async () => {
      const keywordWithSpaces = 'beautiful landscape';
      
      const result = await service.getUnsplashApi(keywordWithSpaces);

      expect(window.fetch).toHaveBeenCalledWith(
        `https://api.pexels.com/v1/search?query=${keywordWithSpaces}&per_page=5&orientation=landscape`,
        service.options
      );
      expect(result).toEqual(mockApiResponse);
    });

    it('should handle keyword with special characters', async () => {
      const keywordWithSpecialChars = 'café & garden';
      
      const result = await service.getUnsplashApi(keywordWithSpecialChars);

      expect(window.fetch).toHaveBeenCalledWith(
        `https://api.pexels.com/v1/search?query=${keywordWithSpecialChars}&per_page=5&orientation=landscape`,
        service.options
      );
      expect(result).toEqual(mockApiResponse);
    });

    it('should handle keyword with Unicode characters', async () => {
      const keywordWithUnicode = 'jardin français';
      
      const result = await service.getUnsplashApi(keywordWithUnicode);

      expect(window.fetch).toHaveBeenCalledWith(
        `https://api.pexels.com/v1/search?query=${keywordWithUnicode}&per_page=5&orientation=landscape`,
        service.options
      );
      expect(result).toEqual(mockApiResponse);
    });

    it('should handle network error when response is not ok', async () => {
      const errorResponse = { ok: false, status: 404, statusText: 'Not Found' };
      (window.fetch as jasmine.Spy).and.returnValue(Promise.resolve(errorResponse as Response));
      spyOn(console, 'error');

      const result = await service.getUnsplashApi(testKeyword);

      expect(window.fetch).toHaveBeenCalledWith(
        `https://api.pexels.com/v1/search?query=${testKeyword}&per_page=5&orientation=landscape`,
        service.options
      );
      expect(console.error).toHaveBeenCalled();
      expect(result).toBeUndefined();
    });

    it('should handle fetch promise rejection', async () => {
      const fetchError = new Error('Network error');
      (window.fetch as jasmine.Spy).and.returnValue(Promise.reject(fetchError));
      spyOn(console, 'error');

      const result = await service.getUnsplashApi(testKeyword);

      expect(window.fetch).toHaveBeenCalledWith(
        `https://api.pexels.com/v1/search?query=${testKeyword}&per_page=5&orientation=landscape`,
        service.options
      );
      expect(console.error).toHaveBeenCalledWith(fetchError);
      expect(result).toBeUndefined();
    });

    it('should handle JSON parsing error', async () => {
      (window.fetch as jasmine.Spy).and.returnValue(Promise.resolve({
        ok: true,
        json: () => Promise.reject(new Error('Invalid JSON'))
      } as Response));
      spyOn(console, 'error');

      const result = await service.getUnsplashApi(testKeyword);

      expect(console.error).toHaveBeenCalledWith(jasmine.any(Error));
      expect(result).toBeUndefined();
    });

    it('should handle different response structures', async () => {
      const differentResponse = {
        total_results: 100,
        page: 1,
        per_page: 5,
        photos: [
          { id: 1, src: { medium: 'https://example.com/different1.jpg' } },
          { id: 2, src: { medium: 'https://example.com/different2.jpg' } }
        ]
      };
      
      (window.fetch as jasmine.Spy).and.returnValue(Promise.resolve({
        ok: true,
        json: () => Promise.resolve(differentResponse)
      } as Response));

      const result = await service.getUnsplashApi(testKeyword);

      expect(result).toEqual(differentResponse);
    });

    it('should handle empty response', async () => {
      const emptyResponse = { photos: [] };
      
      (window.fetch as jasmine.Spy).and.returnValue(Promise.resolve({
        ok: true,
        json: () => Promise.resolve(emptyResponse)
      } as Response));

      const result = await service.getUnsplashApi(testKeyword);

      expect(result).toEqual(emptyResponse);
    });

    it('should handle response with null photos', async () => {
      const nullPhotosResponse = { photos: null };
      
      (window.fetch as jasmine.Spy).and.returnValue(Promise.resolve({
        ok: true,
        json: () => Promise.resolve(nullPhotosResponse)
      } as Response));

      const result = await service.getUnsplashApi(testKeyword);

      expect(result).toEqual(nullPhotosResponse);
    });
  });

  describe('mapperUrlImage()', () => {
    it('should extract regular URLs from API data', () => {
      const mockApiData = {
        photos: [
          { id: 1, src: { medium: 'https://example.com/photo1.jpg' } },
          { id: 2, src: { medium: 'https://example.com/photo2.jpg' } },
          { id: 3, src: { medium: 'https://example.com/photo3.jpg' } }
        ]
      };

      const result = service.mapperUrlImage(mockApiData);

      expect(result).toEqual({
        regularUrls: [
          'https://example.com/photo1.jpg',
          'https://example.com/photo2.jpg',
          'https://example.com/photo3.jpg'
        ]
      });
    });

    it('should handle empty photos array', () => {
      const emptyPhotosData = { photos: [] };

      const result = service.mapperUrlImage(emptyPhotosData);

      expect(result).toEqual({
        regularUrls: []
      });
    });

    it('should handle photos with different URL structures', () => {
      const variedPhotosData = {
        photos: [
          { id: 1, src: { medium: 'https://example.com/small.jpg' } },
          { id: 2, src: { medium: 'https://example.com/medium.jpg' } },
          { id: 3, src: { medium: 'https://example.com/large.jpg' } }
        ]
      };

      const result = service.mapperUrlImage(variedPhotosData);

      expect(result).toEqual({
        regularUrls: [
          'https://example.com/small.jpg',
          'https://example.com/medium.jpg',
          'https://example.com/large.jpg'
        ]
      });
    });

    it('should handle photos with null src', () => {
      const nullSrcData = {
        photos: [
          { id: 1, src: { medium: 'https://example.com/photo1.jpg' } },
          { id: 2, src: null },
          { id: 3, src: { medium: 'https://example.com/photo3.jpg' } }
        ]
      };

      expect(() => service.mapperUrlImage(nullSrcData)).toThrow();
    });

    it('should handle photos with undefined src.medium', () => {
      const undefinedMediumData = {
        photos: [
          { id: 1, src: { medium: 'https://example.com/photo1.jpg' } },
          { id: 2, src: { medium: undefined } },
          { id: 3, src: { medium: 'https://example.com/photo3.jpg' } }
        ]
      };

      const result = service.mapperUrlImage(undefinedMediumData);

      expect(result).toEqual({
        regularUrls: [
          'https://example.com/photo1.jpg',
          undefined,
          'https://example.com/photo3.jpg'
        ]
      });
    });

    it('should handle data with no photos property', () => {
      const noPhotosData = { otherProperty: 'value' };

      expect(() => service.mapperUrlImage(noPhotosData)).toThrow();
    });

    it('should handle null data', () => {
      expect(() => service.mapperUrlImage(null)).toThrow();
    });

    it('should handle undefined data', () => {
      expect(() => service.mapperUrlImage(undefined)).toThrow();
    });

    it('should handle photos with different id types', () => {
      const variedIdData = {
        photos: [
          { id: 'string-id', src: { medium: 'https://example.com/photo1.jpg' } },
          { id: 123, src: { medium: 'https://example.com/photo2.jpg' } },
          { id: null, src: { medium: 'https://example.com/photo3.jpg' } }
        ]
      };

      const result = service.mapperUrlImage(variedIdData);

      expect(result).toEqual({
        regularUrls: [
          'https://example.com/photo1.jpg',
          'https://example.com/photo2.jpg',
          'https://example.com/photo3.jpg'
        ]
      });
    });

    it('should handle photos with additional properties', () => {
      const extendedPhotosData = {
        photos: [
          { 
            id: 1, 
            src: { medium: 'https://example.com/photo1.jpg' },
            alt: 'Beautiful landscape',
            photographer: 'John Doe'
          },
          { 
            id: 2, 
            src: { medium: 'https://example.com/photo2.jpg' },
            alt: 'Nature scene',
            photographer: 'Jane Smith'
          }
        ]
      };

      const result = service.mapperUrlImage(extendedPhotosData);

      expect(result).toEqual({
        regularUrls: [
          'https://example.com/photo1.jpg',
          'https://example.com/photo2.jpg'
        ]
      });
    });

    it('should handle large number of photos', () => {
      const largePhotosData = {
        photos: Array.from({ length: 100 }, (_, i) => ({
          id: i + 1,
          src: { medium: `https://example.com/photo${i + 1}.jpg` }
        }))
      };

      const result = service.mapperUrlImage(largePhotosData);

      expect((result.regularUrls as any[]).length).toBe(100);
      expect(result.regularUrls[0]).toBe('https://example.com/photo1.jpg');
      expect(result.regularUrls[99]).toBe('https://example.com/photo100.jpg');
    });
  });

  describe('Integration tests', () => {
    it('should handle complete flow from API call to URL mapping', async () => {
      const testKeyword = 'garden';
      const mockApiResponse = {
        photos: [
          { id: 1, src: { medium: 'https://example.com/garden1.jpg' } },
          { id: 2, src: { medium: 'https://example.com/garden2.jpg' } }
        ]
      };

      spyOn(window, 'fetch').and.returnValue(Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockApiResponse)
      } as Response));

      // Appel API
      const apiResult = await service.getUnsplashApi(testKeyword);
      
      // Mapping des URLs
      const mappedResult = service.mapperUrlImage(apiResult);

      expect(apiResult).toEqual(mockApiResponse);
      expect(mappedResult).toEqual({
        regularUrls: [
          'https://example.com/garden1.jpg',
          'https://example.com/garden2.jpg'
        ]
      });
    });

    it('should handle error flow from API call to URL mapping', async () => {
      const testKeyword = 'invalid';
      
      spyOn(window, 'fetch').and.returnValue(Promise.resolve({
        ok: false,
        status: 400,
        statusText: 'Bad Request'
      } as Response));
      spyOn(console, 'error');

      // Appel API avec erreur
      const apiResult = await service.getUnsplashApi(testKeyword);
      
      expect(console.error).toHaveBeenCalled();
      expect(apiResult).toBeUndefined();
    });
  });
});