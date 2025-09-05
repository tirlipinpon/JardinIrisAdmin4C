import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';

import { GetPromptsService } from './get-prompts.service';

describe('GetPromptsService', () => {
  let service: GetPromptsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ provideZonelessChangeDetection() ]
    });
    service = TestBed.inject(GetPromptsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
