import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AddScientificNameService } from './add-scientific-name.service';

describe('AddScientificNameService', () => {
  let service: AddScientificNameService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ provideZonelessChangeDetection() ]
    });
    service = TestBed.inject(AddScientificNameService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

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
});

