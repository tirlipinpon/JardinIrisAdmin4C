import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';
import { AddScientificNameService } from './add-scientific-name.service';
import { InaturalistApiService } from '../inaturalist-api/inaturalist-api.service';

describe('AddScientificNameService', () => {
  let service: AddScientificNameService;
  let mockInaturalistApiService: jasmine.SpyObj<InaturalistApiService>;

  beforeEach(() => {
    const spy = jasmine.createSpyObj('InaturalistApiService', ['getObservations']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        provideZonelessChangeDetection(),
        { provide: InaturalistApiService, useValue: spy }
      ]
    });
    
    service = TestBed.inject(AddScientificNameService);
    mockInaturalistApiService = TestBed.inject(InaturalistApiService) as jasmine.SpyObj<InaturalistApiService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('extractInatEntries', () => {
    it('should extract taxon entries from html', () => {
      const html = `
        <span class='inat-vegetal' data-taxon-name="Quercus" data-paragraphe-id='1-1'>
          chêne
          <div><img src="" /></div>
        </span>
      `;
      const result = (service as any).extractInatEntries(html);
      expect(result.length).toBe(1);
      expect(result[0]).toEqual({
        taxonName: 'Quercus',
        paragrapheId: '1-1',
        url: ''
      });
    });

    it('should extract multiple entries from html', () => {
      const html = `
        <span class='inat-vegetal' data-taxon-name="Quercus" data-paragraphe-id='1-1'>chêne</span>
        <span class='inat-vegetal' data-taxon-name="Rosa" data-paragraphe-id='2-1'>rose</span>
        <span class='inat-vegetal' data-taxon-name="Lavandula" data-paragraphe-id='3-1'>lavande</span>
      `;
      const result = (service as any).extractInatEntries(html);
      expect(result.length).toBe(3);
      expect(result[0].taxonName).toBe('Quercus');
      expect(result[1].taxonName).toBe('Rosa');
      expect(result[2].taxonName).toBe('Lavandula');
    });

    it('should handle html with no inat entries', () => {
      const html = '<p>Just a paragraph with no inat entries</p>';
      const result = (service as any).extractInatEntries(html);
      expect(result.length).toBe(0);
    });

    it('should handle empty html', () => {
      const html = '';
      const result = (service as any).extractInatEntries(html);
      expect(result.length).toBe(0);
    });

    it('should handle html with malformed inat entries', () => {
      const html = `
        <span class='inat-vegetal' data-taxon-name="Quercus">missing paragraphe-id</span>
        <span class='inat-vegetal' data-paragraphe-id='1-1'>missing taxon-name</span>
        <span class='inat-vegetal' data-taxon-name="Quercus" data-paragraphe-id='1-1'>valid entry</span>
      `;
      const result = (service as any).extractInatEntries(html);
      expect(result.length).toBe(1);
      expect(result[0].taxonName).toBe('Quercus');
    });

    it('should handle different quote styles in attributes', () => {
      const html = `
        <span class="inat-vegetal" data-taxon-name='Quercus' data-paragraphe-id="1-1">mixed quotes</span>
        <span class='inat-vegetal' data-taxon-name="Rosa" data-paragraphe-id='2-1'>single quotes</span>
        <span class="inat-vegetal" data-taxon-name="Lavandula" data-paragraphe-id="3-1">double quotes</span>
      `;
      const result = (service as any).extractInatEntries(html);
      expect(result.length).toBe(3);
    });

    it('should handle complex class names', () => {
      const html = `
        <span class='some-class inat-vegetal another-class' data-taxon-name="Quercus" data-paragraphe-id='1-1'>complex classes</span>
      `;
      const result = (service as any).extractInatEntries(html);
      expect(result.length).toBe(1);
      expect(result[0].taxonName).toBe('Quercus');
    });
  });

  describe('injectImageUrls', () => {
    it('should inject image urls correctly', () => {
      const html = `
        <span class="inat-vegetal" data-taxon-name="Quercus" data-paragraphe-id="1-1">
          arbre
          <div><img src="" alt=""/></div>
        </span>
      `;

      const updated = (service as any).injectImageUrls(html, [
        { paragrapheId: '1-1', url: 'https://photo.jpg' }
      ]);

      expect(updated).toContain('src="https://photo.jpg"');
      expect(updated).not.toContain('src=""');
    });

    it('should handle multiple spans with different paragraphe-ids', () => {
      const html = `
        <span class="inat-vegetal" data-paragraphe-id="1-1">
          <img src="" alt=""/>
        </span>
        <span class="inat-vegetal" data-paragraphe-id="2-1">
          <img src="" alt=""/>
        </span>
      `;

      const updated = (service as any).injectImageUrls(html, [
        { paragrapheId: '1-1', url: 'https://photo1.jpg' },
        { paragrapheId: '2-1', url: 'https://photo2.jpg' }
      ]);

      expect(updated).toContain('src="https://photo1.jpg"');
      expect(updated).toContain('src="https://photo2.jpg"');
    });

    it('should not modify spans without matching paragraphe-id', () => {
      const html = `
        <span class="inat-vegetal" data-paragraphe-id="1-1">
          <img src="" alt=""/>
        </span>
      `;

      const updated = (service as any).injectImageUrls(html, [
        { paragrapheId: '2-1', url: 'https://photo.jpg' }
      ]);

      expect(updated).toContain('src=""');
      expect(updated).not.toContain('src="https://photo.jpg"');
    });

    it('should not modify spans with empty url', () => {
      const html = `
        <span class="inat-vegetal" data-paragraphe-id="1-1">
          <img src="" alt=""/>
        </span>
      `;

      const updated = (service as any).injectImageUrls(html, [
        { paragrapheId: '1-1', url: '' }
      ]);

      expect(updated).toContain('src=""');
    });

    it('should handle spans with no img tags', () => {
      const html = `
        <span class="inat-vegetal" data-paragraphe-id="1-1">
          Just text content
        </span>
      `;

      const updated = (service as any).injectImageUrls(html, [
        { paragrapheId: '1-1', url: 'https://photo.jpg' }
      ]);

      expect(updated).toBe(html);
    });

    it('should handle different img src formats', () => {
      const html = `
        <span class="inat-vegetal" data-paragraphe-id="1-1">
          <img src="" alt=""/>
          <img src='' alt=""/>
          <img src alt=""/>
          <img src="existing.jpg" alt=""/>
        </span>
      `;

      const updated = (service as any).injectImageUrls(html, [
        { paragrapheId: '1-1', url: 'https://photo.jpg' }
      ]);

      expect(updated).toContain('src="https://photo.jpg"');
      // The regex only replaces empty src attributes, so existing.jpg should remain
      expect(updated).toContain('existing.jpg');
    });

    it('should handle complex html structure', () => {
      const html = `
        <div>
          <p>Some text</p>
          <span class="inat-vegetal" data-paragraphe-id="1-1">
            <div>
              <img src="" alt=""/>
              <p>More content</p>
            </div>
          </span>
          <p>More text</p>
        </div>
      `;

      const updated = (service as any).injectImageUrls(html, [
        { paragrapheId: '1-1', url: 'https://photo.jpg' }
      ]);

      expect(updated).toContain('src="https://photo.jpg"');
    });
  });

  describe('processAddUrlFromScientificNameInHtml', () => {
    it('should return original html when no entries found', (done) => {
      const html = '<p>No inat entries here</p>';
      
      service.processAddUrlFromScientificNameInHtml(html).subscribe(result => {
        expect(result).toBe(html);
        done();
      });
    });

    it('should process entries successfully', (done) => {
      const html = `
        <span class="inat-vegetal" data-taxon-name="Quercus" data-paragraphe-id="1-1">
          <img src="" alt=""/>
        </span>
      `;

      const mockObservations = [{
        species: 'Quercus',
        photos: ['https://quercus.jpg']
      }];

      mockInaturalistApiService.getObservations.and.returnValue(of(mockObservations));

      service.processAddUrlFromScientificNameInHtml(html).subscribe(result => {
        expect(result).toContain('src="https://quercus.jpg"');
        expect(mockInaturalistApiService.getObservations).toHaveBeenCalledWith('Quercus');
        done();
      });
    });

    it('should handle API errors gracefully', (done) => {
      const html = `
        <span class="inat-vegetal" data-taxon-name="Quercus" data-paragraphe-id="1-1">
          <img src="" alt=""/>
        </span>
      `;

      mockInaturalistApiService.getObservations.and.returnValue(throwError('API Error'));

      service.processAddUrlFromScientificNameInHtml(html).subscribe(result => {
        expect(result).toContain('src=""'); // Should remain unchanged due to error
        done();
      });
    });

    it('should handle observations with no photos', (done) => {
      const html = `
        <span class="inat-vegetal" data-taxon-name="Quercus" data-paragraphe-id="1-1">
          <img src="" alt=""/>
        </span>
      `;

      const mockObservations = [{ species: 'Quercus', photos: [] }]; // Empty photos array

      mockInaturalistApiService.getObservations.and.returnValue(of(mockObservations));

      service.processAddUrlFromScientificNameInHtml(html).subscribe(result => {
        expect(result).toContain('src=""'); // Should remain unchanged
        done();
      });
    });

    it('should handle observations with empty photos array', (done) => {
      const html = `
        <span class="inat-vegetal" data-taxon-name="Quercus" data-paragraphe-id="1-1">
          <img src="" alt=""/>
        </span>
      `;

      const mockObservations = [{
        species: 'Quercus',
        photos: []
      }];

      mockInaturalistApiService.getObservations.and.returnValue(of(mockObservations));

      service.processAddUrlFromScientificNameInHtml(html).subscribe(result => {
        expect(result).toContain('src=""'); // Should remain unchanged
        done();
      });
    });

    it('should handle multiple entries with mixed results', (done) => {
      const html = `
        <span class="inat-vegetal" data-taxon-name="Quercus" data-paragraphe-id="1-1">
          <img src="" alt=""/>
        </span>
        <span class="inat-vegetal" data-taxon-name="Rosa" data-paragraphe-id="2-1">
          <img src="" alt=""/>
        </span>
      `;

      mockInaturalistApiService.getObservations.and.callFake((taxonName) => {
        if (taxonName === 'Quercus') {
          return of([{ species: 'Quercus', photos: ['https://quercus.jpg'] }]);
        } else if (taxonName === 'Rosa') {
          return throwError('API Error');
        }
        return of([]);
      });

      service.processAddUrlFromScientificNameInHtml(html).subscribe(result => {
        expect(result).toContain('src="https://quercus.jpg"');
        expect(result).toContain('src=""'); // Rosa should remain unchanged due to error
        done();
      });
    });

    it('should handle entries with special characters in taxon names', (done) => {
      const html = `
        <span class="inat-vegetal" data-taxon-name="Quercus robur" data-paragraphe-id="1-1">
          <img src="" alt=""/>
        </span>
      `;

      const mockObservations = [{
        species: 'Quercus robur',
        photos: ['https://quercus-robur.jpg']
      }];

      mockInaturalistApiService.getObservations.and.returnValue(of(mockObservations));

      service.processAddUrlFromScientificNameInHtml(html).subscribe(result => {
        expect(result).toContain('src="https://quercus-robur.jpg"');
        expect(mockInaturalistApiService.getObservations).toHaveBeenCalledWith('Quercus robur');
        done();
      });
    });
  });
});