import { TestBed } from '@angular/core/testing';

import { PexelsApiService } from './pexels-api.service';

describe('PexelsApiService', () => {
  let service: PexelsApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PexelsApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
