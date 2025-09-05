// unsplash-image.service.spec.ts
import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { UnsplashImageService } from './unsplash-image.service';

describe('UnsplashImageService', () => {
  let service: UnsplashImageService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule // Ajout de ce module pour simuler HttpClient
      ],
      providers: [
        UnsplashImageService,
        provideZonelessChangeDetection()
      ]
    });
    service = TestBed.inject(UnsplashImageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // Autres tests pour UnsplashImageService...
});
