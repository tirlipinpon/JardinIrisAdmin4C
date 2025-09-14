import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Infrastructure } from './infrastructure';



describe('Infrastructure', () => {
  let service: Infrastructure;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ provideZonelessChangeDetection() ]
    });
    service = TestBed.inject(Infrastructure);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
