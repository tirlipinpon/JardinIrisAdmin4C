import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { InaturalistApiService } from './inaturalist-api.service';

describe('InaturalistApiService', () => {
  let service: InaturalistApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ provideZonelessChangeDetection() ]
    });
    service = TestBed.inject(InaturalistApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
