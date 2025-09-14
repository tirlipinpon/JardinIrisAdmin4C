import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { PexelsApiService, PexelsImage, PexelsResponse } from './pexels-api.service';

describe('PexelsApiService', () => {
  let service: PexelsApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        PexelsApiService,
        provideZonelessChangeDetection()
      ]
    });

    service = TestBed.inject(PexelsApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('searchImages()', () => {
    const mockPexelsImage: PexelsImage = {
      id: 123456,
      width: 1920,
      height: 1080,
      url: 'https://www.pexels.com/photo/test-123456/',
      photographer: 'Test Photographer',
      photographer_url: 'https://www.pexels.com/@test-photographer/',
      photographer_id: 789,
      avg_color: '#123456',
      src: {
        original: 'https://images.pexels.com/photos/123456/pexels-photo-123456.jpeg',
        large2x: 'https://images.pexels.com/photos/123456/pexels-photo-123456.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
        large: 'https://images.pexels.com/photos/123456/pexels-photo-123456.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
        medium: 'https://images.pexels.com/photos/123456/pexels-photo-123456.jpeg?auto=compress&cs=tinysrgb&h=350',
        small: 'https://images.pexels.com/photos/123456/pexels-photo-123456.jpeg?auto=compress&cs=tinysrgb&h=130',
        portrait: 'https://images.pexels.com/photos/123456/pexels-photo-123456.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=800',
        landscape: 'https://images.pexels.com/photos/123456/pexels-photo-123456.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200',
        tiny: 'https://images.pexels.com/photos/123456/pexels-photo-123456.jpeg?auto=compress&cs=tinysrgb&h=50'
      },
      liked: false,
      alt: 'Test image description'
    };

    const mockPexelsResponse: PexelsResponse = {
      page: 1,
      per_page: 10,
      photos: [mockPexelsImage],
      total_results: 1000,
      next_page: 'https://api.pexels.com/v1/search/?page=2&per_page=10&query=nature'
    };

    beforeEach(() => {
      spyOn(window, 'fetch').and.returnValue(Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockPexelsResponse)
      } as Response));
      spyOn(console, 'warn');
      spyOn(console, 'error');
    });

    it('should search images with default perPage value', (done) => {
      const query = 'nature';

      service.searchImages(query).subscribe(result => {
        expect(window.fetch).toHaveBeenCalledWith(
          `${service['baseUrl']}/search?query=${encodeURIComponent(query)}&per_page=10&locale=en-US`,
          {
            headers: {
              'Authorization': service['apiKey']
            }
          }
        );
        expect(result).toEqual([mockPexelsImage]);
        done();
      });
    });

    it('should search images with custom perPage value', (done) => {
      const query = 'garden';
      const perPage = 5;

      service.searchImages(query, perPage).subscribe(result => {
        expect(window.fetch).toHaveBeenCalledWith(
          `${service['baseUrl']}/search?query=${encodeURIComponent(query)}&per_page=${perPage}&locale=en-US`,
          {
            headers: {
              'Authorization': service['apiKey']
            }
          }
        );
        expect(result).toEqual([mockPexelsImage]);
        done();
      });
    });

    it('should handle different query types', (done) => {
      const queries = ['flowers', 'landscape', 'urban garden'];

      let completedTests = 0;
      queries.forEach(query => {
        service.searchImages(query).subscribe(result => {
          expect(window.fetch).toHaveBeenCalledWith(
            `${service['baseUrl']}/search?query=${encodeURIComponent(query)}&per_page=10&locale=en-US`,
            {
              headers: {
                'Authorization': service['apiKey']
              }
            }
          );
          expect(result).toEqual([mockPexelsImage]);
          completedTests++;
          if (completedTests === queries.length) {
            done();
          }
        });
      });
    });

    it('should handle query with special characters', (done) => {
      const query = 'café & restaurant design!';

      service.searchImages(query).subscribe(result => {
        expect(window.fetch).toHaveBeenCalledWith(
          `${service['baseUrl']}/search?query=${encodeURIComponent(query)}&per_page=10&locale=en-US`,
          {
            headers: {
              'Authorization': service['apiKey']
            }
          }
        );
        expect(result).toEqual([mockPexelsImage]);
        done();
      });
    });

    it('should handle empty query', (done) => {
      const query = '';

      service.searchImages(query).subscribe(result => {
        expect(window.fetch).toHaveBeenCalledWith(
          `${service['baseUrl']}/search?query=${encodeURIComponent(query)}&per_page=10&locale=en-US`,
          {
            headers: {
              'Authorization': service['apiKey']
            }
          }
        );
        expect(result).toEqual([mockPexelsImage]);
        done();
      });
    });

    it('should handle response with empty photos array', (done) => {
      const emptyResponse: PexelsResponse = {
        page: 1,
        per_page: 10,
        photos: [],
        total_results: 0
      };

      (window.fetch as jasmine.Spy).and.returnValue(Promise.resolve({
        ok: true,
        json: () => Promise.resolve(emptyResponse)
      } as Response));

      service.searchImages('nonexistent').subscribe(result => {
        expect(result).toEqual([]);
        done();
      });
    });

    it('should handle API error when response is not ok', (done) => {
      const errorResponse = { ok: false, status: 401, statusText: 'Unauthorized' };
      (window.fetch as jasmine.Spy).and.returnValue(Promise.resolve(errorResponse as Response));

      service.searchImages('test').subscribe(result => {
        expect(console.error).toHaveBeenCalledWith(
          'PEXELS_API: Erreur lors de la recherche d\'images',
          jasmine.any(Error)
        );
        expect(result).toEqual([]);
        done();
      });
    });

    it('should handle fetch promise rejection', (done) => {
      const fetchError = new Error('Network error');
      (window.fetch as jasmine.Spy).and.returnValue(Promise.reject(fetchError));

      service.searchImages('test').subscribe(result => {
        expect(console.error).toHaveBeenCalledWith(
          'PEXELS_API: Erreur lors de la recherche d\'images',
          fetchError
        );
        expect(result).toEqual([]);
        done();
      });
    });

    it('should handle JSON parsing error', (done) => {
      (window.fetch as jasmine.Spy).and.returnValue(Promise.resolve({
        ok: true,
        json: () => Promise.reject(new Error('Invalid JSON'))
      } as Response));

      service.searchImages('test').subscribe(result => {
        expect(console.error).toHaveBeenCalledWith(
          'PEXELS_API: Erreur lors de la recherche d\'images',
          jasmine.any(Error)
        );
        expect(result).toEqual([]);
        done();
      });
    });

    it('should handle very long query strings', (done) => {
      const longQuery = 'a'.repeat(1000);

      service.searchImages(longQuery).subscribe(result => {
        expect(window.fetch).toHaveBeenCalledWith(
          `${service['baseUrl']}/search?query=${encodeURIComponent(longQuery)}&per_page=10&locale=en-US`,
          {
            headers: {
              'Authorization': service['apiKey']
            }
          }
        );
        expect(result).toEqual([mockPexelsImage]);
        done();
      });
    });

    it('should handle response with multiple photos', (done) => {
      const multiplePhotosResponse: PexelsResponse = {
        page: 1,
        per_page: 10,
        photos: [mockPexelsImage, { ...mockPexelsImage, id: 789, url: 'https://www.pexels.com/photo/test-789/' }],
        total_results: 1000
      };

      (window.fetch as jasmine.Spy).and.returnValue(Promise.resolve({
        ok: true,
        json: () => Promise.resolve(multiplePhotosResponse)
      } as Response));

      service.searchImages('test').subscribe(result => {
        expect((result as any[]).length).toBe(2);
        expect(result[0]).toEqual(mockPexelsImage);
        expect(result[1].id).toBe(789);
        done();
      });
    });
  });
});