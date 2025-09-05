import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';

import { OpenaiApiService } from './openai-api.service';

describe('OpenaiApiService', () => {
  let service: OpenaiApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ provideZonelessChangeDetection() ]
    });
    service = TestBed.inject(OpenaiApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
