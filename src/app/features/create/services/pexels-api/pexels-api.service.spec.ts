import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';

import { PexelsApiService } from './pexels-api.service';

describe('PexelsApiService', () => {
  let service: PexelsApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ provideZonelessChangeDetection() ]
    });
    service = TestBed.inject(PexelsApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
