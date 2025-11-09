import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { SupabaseService } from './supabase.service';

describe('SupabaseService', () => {
  let service: SupabaseService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        SupabaseService,
        provideZonelessChangeDetection()
      ]
    });

    service = TestBed.inject(SupabaseService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should have a Supabase client', () => {
    expect(service.client).toBeDefined();
  });


  describe('getNextPostId()', () => {
    it('should be defined', () => {
      expect(service.getNextPostId).toBeDefined();
      expect(typeof service.getNextPostId).toBe('function');
    });
  });

  describe('getLastPostTitreAndId()', () => {
    it('should be defined', () => {
      expect(service.getLastPostTitreAndId).toBeDefined();
      expect(typeof service.getLastPostTitreAndId).toBe('function');
    });
  });

  describe('uploadBase64ToSupabase()', () => {
    it('should be defined', () => {
      expect(service.uploadBase64ToSupabase).toBeDefined();
      expect(typeof service.uploadBase64ToSupabase).toBe('function');
    });
  });

  describe('updateImageUrlPostByIdForm()', () => {
    it('should be defined', () => {
      expect(service.updateImageUrlPostByIdForm).toBeDefined();
      expect(typeof service.updateImageUrlPostByIdForm).toBe('function');
    });
  });

  describe('setNewUrlImagesChapitres()', () => {
    it('should be defined', () => {
      expect(service.setNewUrlImagesChapitres).toBeDefined();
      expect(typeof service.setNewUrlImagesChapitres).toBe('function');
    });
  });

  describe('updatePostComplete()', () => {
    it('should be defined', () => {
      expect(service.updatePostComplete).toBeDefined();
      expect(typeof service.updatePostComplete).toBe('function');
    });
  });

  describe('saveFaqForPost()', () => {
    it('should be defined', () => {
      expect(service.saveFaqForPost).toBeDefined();
      expect(typeof service.saveFaqForPost).toBe('function');
    });
  });

  describe('Method signatures', () => {
    it('should have correct method signatures', () => {
      // Test that all methods exist and are functions
      const methods = [
        'getNextPostId',
        'getLastPostTitreAndId',
        'uploadBase64ToSupabase',
        'updateImageUrlPostByIdForm',
        'setNewUrlImagesChapitres',
        'updatePostComplete',
        'saveFaqForPost'
      ];

      methods.forEach(method => {
        expect(service[method as keyof SupabaseService]).toBeDefined();
        expect(typeof service[method as keyof SupabaseService]).toBe('function');
      });
    });
  });

  describe('Service initialization', () => {
    it('should initialize with Supabase client', () => {
      expect(service.client).toBeDefined();
      expect(service.client).not.toBeNull();
    });
  });

  describe('Async methods return promises', () => {
    it('should return promises for async methods', () => {
      const asyncMethods = [
        () => service.getNextPostId(),
        () => service.getLastPostTitreAndId(),
        () => service.uploadBase64ToSupabase(123, 'test'),
        () => service.updateImageUrlPostByIdForm(123, 'test'),
        () => service.setNewUrlImagesChapitres('url', 1, 123, 'keyword', 'explanation'),
        () => service.updatePostComplete({} as any),
        () => service.saveFaqForPost(123, [])
      ];

      asyncMethods.forEach(method => {
        const result = method();
        expect(result).toBeInstanceOf(Promise);
      });
    });
  });

  describe('Error handling', () => {
    it('should handle errors gracefully', async () => {
      // Test that methods don't throw synchronous errors
      expect(() => {
        service.getNextPostId();
        service.getLastPostTitreAndId();
        service.uploadBase64ToSupabase(123, 'test');
        service.updateImageUrlPostByIdForm(123, 'test');
        service.setNewUrlImagesChapitres('url', 1, 123, 'keyword', 'explanation');
        service.updatePostComplete({} as any);
        service.saveFaqForPost(123, []);
      }).not.toThrow();
    });
  });
});