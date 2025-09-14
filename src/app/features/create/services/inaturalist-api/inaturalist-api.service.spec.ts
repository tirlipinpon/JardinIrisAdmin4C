import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { InaturalistApiService, ObservationResult } from './inaturalist-api.service';

describe('InaturalistApiService', () => {
  let service: InaturalistApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        InaturalistApiService,
        provideZonelessChangeDetection()
      ]
    });

    service = TestBed.inject(InaturalistApiService);
    httpMock = TestBed.inject(HttpTestingController);
    
    spyOn(console, 'log');
    spyOn(console, 'error');
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getObservations()', () => {
    const mockApiResponse = {
      results: [
        {
          taxon: { name: 'Rosa canina' },
          photos: [
            { url: 'https://example.com/square.jpg' },
            { url: 'https://example.com/square.jpeg' },
            { url: 'https://example.com/square.png' }
          ]
        },
        {
          taxon: { name: 'Quercus robur' },
          photos: [
            { url: 'https://example.com/other.jpg' },
            { url: 'https://example.com/square.jpg' }
          ]
        }
      ]
    };

    const expectedResult: ObservationResult[] = [
      {
        species: 'Rosa canina',
        photos: [
          'https://example.com/large.jpg',
          'https://example.com/large.jpeg',
          'https://example.com/large.png'
        ]
      },
      {
        species: 'Quercus robur',
        photos: [
          'https://example.com/other.jpg',
          'https://example.com/large.jpg'
        ]
      }
    ];

    it('should fetch observations successfully with default limit', (done) => {
      const taxonName = 'Rosa canina';

      service.getObservations(taxonName).subscribe(result => {
        expect(console.log).toHaveBeenCalledWith('Fetching observations for:', taxonName);
        expect(console.log).toHaveBeenCalledWith('Species: Rosa canina, Photos:', jasmine.any(Array));
        expect(console.log).toHaveBeenCalledWith('Species: Quercus robur, Photos:', jasmine.any(Array));
        expect(result).toEqual(expectedResult);
        done();
      });

      const req = httpMock.expectOne((req) => 
        req.url === 'https://api.inaturalist.org/v1/observations'
      );
      expect(req.request.params.get('taxon_name')).toBe(taxonName);
      expect(req.request.params.get('photos')).toBe('true');
      expect(req.request.params.get('per_page')).toBe('1');
      req.flush(mockApiResponse);
    });

    it('should fetch observations successfully with custom limit', (done) => {
      const taxonName = 'Quercus robur';
      const limit = 5;

      service.getObservations(taxonName, limit).subscribe(result => {
        expect(console.log).toHaveBeenCalledWith('Fetching observations for:', taxonName);
        expect(result).toEqual(expectedResult);
        done();
      });

      const req = httpMock.expectOne((req) => 
        req.url === 'https://api.inaturalist.org/v1/observations'
      );
      expect(req.request.params.get('taxon_name')).toBe(taxonName);
      expect(req.request.params.get('photos')).toBe('true');
      expect(req.request.params.get('per_page')).toBe('5');
      req.flush(mockApiResponse);
    });

    it('should handle empty results array', (done) => {
      const taxonName = 'Nonexistent species';
      const emptyResponse = { results: [] };

      service.getObservations(taxonName).subscribe(result => {
        expect(console.log).toHaveBeenCalledWith('Fetching observations for:', taxonName);
        expect(result).toEqual([]);
        done();
      });

      const req = httpMock.expectOne((req) => 
        req.url === 'https://api.inaturalist.org/v1/observations'
      );
      req.flush(emptyResponse);
    });

    it('should handle null results', (done) => {
      const taxonName = 'Test species';
      const nullResponse = { results: null };

      service.getObservations(taxonName).subscribe(result => {
        expect(console.log).toHaveBeenCalledWith('Fetching observations for:', taxonName);
        expect(result).toEqual([]);
        done();
      });

      const req = httpMock.expectOne((req) => 
        req.url === 'https://api.inaturalist.org/v1/observations'
      );
      req.flush(nullResponse);
    });

    it('should handle observations with missing taxon name', (done) => {
      const taxonName = 'Test species';
      const responseWithMissingTaxon = {
        results: [
          {
            taxon: null,
            photos: [{ url: 'https://example.com/photo.jpg' }]
          },
          {
            taxon: {},
            photos: [{ url: 'https://example.com/photo2.jpg' }]
          }
        ]
      };

      const expectedResult = [
        {
          species: 'Non identifié',
          photos: ['https://example.com/photo.jpg']
        },
        {
          species: 'Non identifié',
          photos: ['https://example.com/photo2.jpg']
        }
      ];

      service.getObservations(taxonName).subscribe(result => {
        expect(result).toEqual(expectedResult);
        done();
      });

      const req = httpMock.expectOne((req) => 
        req.url === 'https://api.inaturalist.org/v1/observations'
      );
      req.flush(responseWithMissingTaxon);
    });

    it('should handle observations with missing photos', (done) => {
      const taxonName = 'Test species';
      const responseWithMissingPhotos = {
        results: [
          {
            taxon: { name: 'Rosa canina' },
            photos: null
          },
          {
            taxon: { name: 'Quercus robur' },
            photos: []
          },
          {
            taxon: { name: 'Pinus sylvestris' }
          }
        ]
      };

      const expectedResult = [
        {
          species: 'Rosa canina',
          photos: []
        },
        {
          species: 'Quercus robur',
          photos: []
        },
        {
          species: 'Pinus sylvestris',
          photos: []
        }
      ];

      service.getObservations(taxonName).subscribe(result => {
        expect(result).toEqual(expectedResult);
        done();
      });

      const req = httpMock.expectOne((req) => 
        req.url === 'https://api.inaturalist.org/v1/observations'
      );
      req.flush(responseWithMissingPhotos);
    });

    it('should transform square images to large images', (done) => {
      const taxonName = 'Test species';
      const responseWithSquareImages = {
        results: [
          {
            taxon: { name: 'Rosa canina' },
            photos: [
              { url: 'https://example.com/square.jpg' },
              { url: 'https://example.com/square.jpeg' },
              { url: 'https://example.com/square.png' },
              { url: 'https://example.com/large.jpg' },
              { url: 'https://example.com/other.jpg' }
            ]
          }
        ]
      };

      const expectedResult = [
        {
          species: 'Rosa canina',
          photos: [
            'https://example.com/large.jpg',
            'https://example.com/large.jpeg',
            'https://example.com/large.png',
            'https://example.com/large.jpg',
            'https://example.com/other.jpg'
          ]
        }
      ];

      service.getObservations(taxonName).subscribe(result => {
        expect(result).toEqual(expectedResult);
        done();
      });

      const req = httpMock.expectOne((req) => 
        req.url === 'https://api.inaturalist.org/v1/observations'
      );
      req.flush(responseWithSquareImages);
    });

    it('should handle HTTP errors gracefully', (done) => {
      const taxonName = 'Test species';
      const errorMessage = 'Network error';

      service.getObservations(taxonName).subscribe(result => {
        expect(console.log).toHaveBeenCalledWith('Fetching observations for:', taxonName);
        expect(console.error).toHaveBeenCalledWith(`Error fetching observations for ${taxonName}:`, jasmine.any(Object));
        expect(result).toEqual([]);
        done();
      });

      const req = httpMock.expectOne((req) => 
        req.url === 'https://api.inaturalist.org/v1/observations'
      );
      req.flush(errorMessage, { status: 500, statusText: 'Internal Server Error' });
    });

    it('should handle different taxon name formats', (done) => {
      const taxonNames = ['Rosa canina', 'Quercus robur', 'Pinus sylvestris'];

      let completedTests = 0;
      taxonNames.forEach(taxonName => {
        service.getObservations(taxonName).subscribe(result => {
          expect(console.log).toHaveBeenCalledWith('Fetching observations for:', taxonName);
          completedTests++;
          if (completedTests === taxonNames.length) {
            done();
          }
        });
      });

      // Respond to all requests
      const requests = httpMock.match((req) => 
        req.url === 'https://api.inaturalist.org/v1/observations'
      );
      requests.forEach(req => {
        req.flush(mockApiResponse);
      });
    });

    it('should handle special characters in taxon names', (done) => {
      const taxonName = 'Rosa × damascena';

      service.getObservations(taxonName).subscribe(result => {
        expect(console.log).toHaveBeenCalledWith('Fetching observations for:', taxonName);
        done();
      });

      const req = httpMock.expectOne((req) => 
        req.url === 'https://api.inaturalist.org/v1/observations'
      );
      expect(req.request.params.get('taxon_name')).toBe(taxonName);
      req.flush(mockApiResponse);
    });

    it('should handle empty taxon name', (done) => {
      const taxonName = '';

      service.getObservations(taxonName).subscribe(result => {
        expect(console.log).toHaveBeenCalledWith('Fetching observations for:', taxonName);
        done();
      });

      const req = httpMock.expectOne((req) => 
        req.url === 'https://api.inaturalist.org/v1/observations'
      );
      expect(req.request.params.get('taxon_name')).toBe(taxonName);
      req.flush(mockApiResponse);
    });

    it('should handle different limit values', (done) => {
      const taxonName = 'Rosa canina';
      const limits = [1, 5, 10, 25];

      let completedTests = 0;
      limits.forEach(limit => {
        service.getObservations(taxonName, limit).subscribe(result => {
          expect(console.log).toHaveBeenCalledWith('Fetching observations for:', taxonName);
          completedTests++;
          if (completedTests === limits.length) {
            done();
          }
        });
      });

      // Respond to all requests
      const requests = httpMock.match((req) => 
        req.url === 'https://api.inaturalist.org/v1/observations'
      );
      requests.forEach((req, index) => {
        expect(req.request.params.get('per_page')).toBe(limits[index].toString());
        req.flush(mockApiResponse);
      });
    });
  });
});