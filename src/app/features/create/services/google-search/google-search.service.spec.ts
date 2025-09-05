import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { GoogleSearchService } from './google-search.service';

describe('GoogleSearchService', () => {
  let service: GoogleSearchService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ provideZonelessChangeDetection() ]
    });
    service = TestBed.inject(GoogleSearchService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
