import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { of, throwError } from 'rxjs';
import { PostgrestError } from '@supabase/supabase-js';

import { Infrastructure } from './infrastructure';
import { SupabaseService } from '../../../../shared/services/supabase.service';
import { LoggingService } from '../../../../shared/services/logging.service';
import { GetPromptsService } from '../../services/get-prompts/get-prompts.service';
import { OpenaiApiService } from '../../services/openai-api/openai-api.service';
import { GoogleSearchService } from '../../services/google-search/google-search.service';
import { PexelsApiService } from '../../services/pexels-api/pexels-api.service';
import { AddScientificNameService } from '../../services/add-scientific-name/add-scientific-name.service';
import { InternalImageService } from '../../services/internal-image/internal-image.service';
import { ImageUploadService } from '../../services/image-upload/image-upload.service';
import { VideoService } from '../../services/video/video.service';
import { VegetalService } from '../../services/vegetal/vegetal.service';
import { Post } from '../../types/post';

describe('Infrastructure', () => {
  let service: Infrastructure;
  let mockSupabaseService: jasmine.SpyObj<SupabaseService>;
  let mockLoggingService: jasmine.SpyObj<LoggingService>;
  let mockGetPromptsService: jasmine.SpyObj<GetPromptsService>;
  let mockOpenaiApiService: jasmine.SpyObj<OpenaiApiService>;
  let mockInternalImageService: jasmine.SpyObj<InternalImageService>;
  let mockImageUploadService: jasmine.SpyObj<ImageUploadService>;
  let mockVideoService: jasmine.SpyObj<VideoService>;
  let mockVegetalService: jasmine.SpyObj<VegetalService>;

  beforeEach(() => {
    // Créer les mocks pour tous les services
    const supabaseSpy = jasmine.createSpyObj('SupabaseService', [
      'getNextPostId', 'getLastPostTitreAndId', 'updatePostComplete', 
      'saveFaqForPost', 'setNewUrlImagesChapitres'
    ]);
    const loggingSpy = jasmine.createSpyObj('LoggingService', ['info', 'error']);
    const promptsSpy = jasmine.createSpyObj('GetPromptsService', [
      'generateArticle', 'getPromptFaq', 'addInternalLinkInArticle'
    ]);
    const openaiSpy = jasmine.createSpyObj('OpenaiApiService', ['fetchData']);
    const googleSpy = jasmine.createSpyObj('GoogleSearchService', ['search']);
    const pexelsSpy = jasmine.createSpyObj('PexelsApiService', ['searchImages']);
    const scientificSpy = jasmine.createSpyObj('AddScientificNameService', ['addScientificNames']);
    const internalImageSpy = jasmine.createSpyObj('InternalImageService', ['generateInternalImages']);
    const imageUploadSpy = jasmine.createSpyObj('ImageUploadService', ['generateAndUploadImage']);
    const videoSpy = jasmine.createSpyObj('VideoService', ['findBestVideoUrl']);
    const vegetalSpy = jasmine.createSpyObj('VegetalService', ['enrichArticleWithBotanicalNames']);

    TestBed.configureTestingModule({
      providers: [
        Infrastructure,
        { provide: SupabaseService, useValue: supabaseSpy },
        { provide: LoggingService, useValue: loggingSpy },
        { provide: GetPromptsService, useValue: promptsSpy },
        { provide: OpenaiApiService, useValue: openaiSpy },
        { provide: GoogleSearchService, useValue: googleSpy },
        { provide: PexelsApiService, useValue: pexelsSpy },
        { provide: AddScientificNameService, useValue: scientificSpy },
        { provide: InternalImageService, useValue: internalImageSpy },
        { provide: ImageUploadService, useValue: imageUploadSpy },
        { provide: VideoService, useValue: videoSpy },
        { provide: VegetalService, useValue: vegetalSpy },
        provideZonelessChangeDetection()
      ]
    });

    service = TestBed.inject(Infrastructure);
    mockSupabaseService = TestBed.inject(SupabaseService) as jasmine.SpyObj<SupabaseService>;
    mockLoggingService = TestBed.inject(LoggingService) as jasmine.SpyObj<LoggingService>;
    mockGetPromptsService = TestBed.inject(GetPromptsService) as jasmine.SpyObj<GetPromptsService>;
    mockOpenaiApiService = TestBed.inject(OpenaiApiService) as jasmine.SpyObj<OpenaiApiService>;
    mockInternalImageService = TestBed.inject(InternalImageService) as jasmine.SpyObj<InternalImageService>;
    mockImageUploadService = TestBed.inject(ImageUploadService) as jasmine.SpyObj<ImageUploadService>;
    mockVideoService = TestBed.inject(VideoService) as jasmine.SpyObj<VideoService>;
    mockVegetalService = TestBed.inject(VegetalService) as jasmine.SpyObj<VegetalService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('handleError()', () => {
    it('should return PostgrestError as-is when error is already PostgrestError', () => {
      const postgrestError: PostgrestError = {
        message: 'Test error',
        details: 'Test details',
        hint: 'Test hint',
        code: 'TEST_CODE',
        name: 'PostgrestError'
      };

      const result = (service as any).handleError(postgrestError, 'test context', 'testMethod');

      expect(result).toBe(postgrestError);
      expect(mockLoggingService.error).toHaveBeenCalledWith(
        'INFRASTRUCTURE',
        'Erreur dans testMethod - test context',
        postgrestError
      );
    });

    it('should create PostgrestError from regular Error', () => {
      const regularError = new Error('Regular error message');
      regularError.stack = 'Error stack trace';

      const result = (service as any).handleError(regularError, 'test context', 'testMethod');

      expect(result).toEqual({
        message: 'Regular error message',
        details: 'Contexte: test context. Erreur originale: Error stack trace',
        hint: 'Vérifiez les logs pour plus de détails sur l\'erreur dans testMethod',
        code: 'INFRA_ERROR_TESTMETHOD',
        name: 'PostgrestError'
      });
    });

    it('should handle error without message or stack', () => {
      const errorWithoutDetails = { code: 'CUSTOM_CODE' };

      const result = (service as any).handleError(errorWithoutDetails, 'test context', 'testMethod');

      expect(result.message).toContain('testMethod');
      expect(result.code).toBe('CUSTOM_CODE');
    });
  });

  describe('wrapWithErrorHandling()', () => {
    it('should return result when operation succeeds', (done) => {
      const mockResult = { success: true };
      const operation = () => of(mockResult);

      (service as any).wrapWithErrorHandling(operation, 'testMethod', 'test context')
        .subscribe((result: any) => {
          expect(result).toBe(mockResult);
          done();
        });
    });

    it('should return PostgrestError when operation fails', (done) => {
      const operation = () => throwError(() => new Error('Operation failed'));

      (service as any).wrapWithErrorHandling(operation, 'testMethod', 'test context')
        .subscribe((result: any) => {
          expect(result).toEqual(jasmine.objectContaining({
            message: 'Operation failed',
            code: 'INFRA_ERROR_TESTMETHOD',
            name: 'PostgrestError'
          }));
          done();
        });
    });
  });

  describe('warning callback system', () => {
    it('should set and call warning callback', () => {
      const mockCallback = jasmine.createSpy('warningCallback');
      
      service.setWarningCallback(mockCallback);
      (service as any).signalWarning('Test warning message');

      expect(mockCallback).toHaveBeenCalledWith('Test warning message');
    });

    it('should not call callback when not set', () => {
      expect(() => {
        (service as any).signalWarning('Test warning message');
      }).not.toThrow();
    });
  });

  describe('testError()', () => {
    it('should return rejected promise wrapped in Observable', (done) => {
      service.testError().subscribe((result: any) => {
        expect(result).toEqual(jasmine.objectContaining({
          message: 'Erreur de test pour vérifier la remontée dans le store',
          code: 'INFRA_ERROR_TESTERROR',
          name: 'PostgrestError'
        }));
        done();
      });
    });
  });

  describe('testSupabaseStorageError()', () => {
    it('should return mock image URL and call warning callback', (done) => {
      const mockCallback = jasmine.createSpy('warningCallback');
      service.setWarningCallback(mockCallback);

      service.testSupabaseStorageError().subscribe((result: any) => {
        expect(result).toBe('https://via.placeholder.com/800x400/4caf50/white?text=Test+Erreur+Storage');
        expect(mockCallback).toHaveBeenCalledWith(
          jasmine.stringMatching(/Erreur Supabase Storage \(test\)/)
        );
        done();
      });
    });
  });

  describe('getNextPostId()', () => {
    it('should call supabase service and handle success', (done) => {
      mockSupabaseService.getNextPostId.and.returnValue(Promise.resolve(123));

      // Mock isLocalhost pour retourner false (appel réel)
      spyOn(service as any, 'isLocalhost').and.returnValue(false);

      service.getNextPostId().subscribe((result: any) => {
        expect(result).toBe(123);
        expect(mockSupabaseService.getNextPostId).toHaveBeenCalled();
        done();
      });
    });

    it('should return mock data when on localhost', (done) => {
      // Mock isLocalhost pour retourner true (mode mock)
      spyOn(service as any, 'isLocalhost').and.returnValue(true);

      service.getNextPostId().subscribe((result: any) => {
        expect(result).toBe(666);
        expect(mockLoggingService.info).toHaveBeenCalledWith(
          'INFRASTRUCTURE',
          '📨 Réponse: Mock data',
          { postId: 666 }
        );
        done();
      });
    });
  });

  describe('getLastPostTitreAndId()', () => {
    it('should return mock data when on localhost', (done) => {
      // Mock isLocalhost pour retourner true
      spyOn(service as any, 'isLocalhost').and.returnValue(true);

      service.getLastPostTitreAndId().subscribe((result: any) => {
        expect(Array.isArray(result)).toBe(true);
        expect((result as any[]).length).toBeGreaterThan(0);
        expect((result as any[])[0]).toEqual(jasmine.objectContaining({
          titre: jasmine.any(String),
          id: jasmine.any(Number),
          new_href: jasmine.any(String)
        }));
        done();
      });
    });

    it('should call supabase service when not on localhost', () => {
      const mockPosts = [
        { titre: 'Test Post', id: 1, new_href: 'test-post' }
      ];
      mockSupabaseService.getLastPostTitreAndId.and.returnValue(Promise.resolve(mockPosts));

      // Mock isLocalhost pour retourner false
      spyOn(service as any, 'isLocalhost').and.returnValue(false);

      service.getLastPostTitreAndId().subscribe();

      expect(mockSupabaseService.getLastPostTitreAndId).toHaveBeenCalledWith(10);
    });
  });

  describe('setPost()', () => {
    const mockArticleIdea = 'Test article idea';

    it('should return mock data when on localhost', (done) => {
      // Mock isLocalhost pour retourner true
      spyOn(service as any, 'isLocalhost').and.returnValue(true);

      service.setPost(mockArticleIdea).subscribe((result: any) => {
        expect(result).toEqual(jasmine.objectContaining({
          titre: jasmine.any(String),
          description_meteo: jasmine.any(String),
          phrase_accroche: jasmine.any(String),
          article: jasmine.any(String),
          citation: jasmine.any(String),
          categorie: jasmine.any(String),
          new_href: jasmine.any(String)
        }));
        done();
      });
    });

    it('should call services when not on localhost', () => {
      // Mock isLocalhost pour retourner false
      spyOn(service as any, 'isLocalhost').and.returnValue(false);
      
      mockGetPromptsService.generateArticle.and.returnValue('Test prompt');
      mockOpenaiApiService.fetchData.and.returnValue(Promise.resolve('{"titre":"Test"}'));

      service.setPost(mockArticleIdea).subscribe();

      expect(mockGetPromptsService.generateArticle).toHaveBeenCalledWith(mockArticleIdea);
      expect(mockOpenaiApiService.fetchData).toHaveBeenCalledWith('Test prompt', true, 'setPost');
    });
  });

  describe('setImageUrl()', () => {
    const mockPhraseAccroche = 'Test phrase';
    const mockPostId = 123;

    it('should return mock data when on localhost', (done) => {
      // Mock isLocalhost pour retourner true
      spyOn(service as any, 'isLocalhost').and.returnValue(true);

      service.setImageUrl(mockPhraseAccroche, mockPostId).subscribe((result: any) => {
        expect(result).toBe('https://zmgfaiprgbawcernymqa.supabase.co/storage/v1/object/public/jardin-iris-images-post/704.png');
        done();
      });
    });

    it('should call imageUploadService when not on localhost', () => {
      // Mock isLocalhost pour retourner false
      spyOn(service as any, 'isLocalhost').and.returnValue(false);
      
      mockImageUploadService.generateAndUploadImage.and.returnValue(of('image-url'));

      service.setImageUrl(mockPhraseAccroche, mockPostId).subscribe();

      expect(mockImageUploadService.generateAndUploadImage).toHaveBeenCalledWith(
        mockPhraseAccroche, 
        mockPostId, 
        false
      );
    });
  });

  describe('setVideo()', () => {
    const mockPhraseAccroche = 'Test phrase';
    const mockPostId = 123;

    it('should return mock data when on localhost', (done) => {
      // Mock isLocalhost pour retourner true
      spyOn(service as any, 'isLocalhost').and.returnValue(true);

      service.setVideo(mockPhraseAccroche, mockPostId).subscribe((result: any) => {
        expect(result).toBe('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
        done();
      });
    });

    it('should call videoService when not on localhost', () => {
      // Mock isLocalhost pour retourner false
      spyOn(service as any, 'isLocalhost').and.returnValue(false);
      
      mockVideoService.findBestVideoUrl.and.returnValue(of('video-url'));

      service.setVideo(mockPhraseAccroche, mockPostId).subscribe();

      expect(mockVideoService.findBestVideoUrl).toHaveBeenCalledWith(mockPhraseAccroche, false);
    });
  });

  describe('setFaq()', () => {
    const mockArticle = 'Test article content';

    it('should return mock data when on localhost', (done) => {
      // Mock isLocalhost pour retourner true
      spyOn(service as any, 'isLocalhost').and.returnValue(true);

      service.setFaq(mockArticle).subscribe((result: any) => {
        expect(Array.isArray(result)).toBe(true);
        expect((result as any[]).length).toBeGreaterThan(0);
        expect((result as any[])[0]).toEqual(jasmine.objectContaining({
          question: jasmine.any(String),
          response: jasmine.any(String)
        }));
        done();
      });
    });

    it('should call services when not on localhost', () => {
      // Mock isLocalhost pour retourner false
      spyOn(service as any, 'isLocalhost').and.returnValue(false);
      
      mockGetPromptsService.getPromptFaq.and.returnValue('Test FAQ prompt');
      mockOpenaiApiService.fetchData.and.returnValue(Promise.resolve('[{"question":"Q","response":"R"}]'));

      service.setFaq(mockArticle).subscribe();

      expect(mockGetPromptsService.getPromptFaq).toHaveBeenCalledWith(mockArticle);
      expect(mockOpenaiApiService.fetchData).toHaveBeenCalledWith('Test FAQ prompt', true, 'setFaq');
    });
  });

  describe('savePostComplete()', () => {
    const mockPost: Post = {
      id: 123,
      titre: 'Test Post',
      description_meteo: 'Test weather',
      phrase_accroche: 'Test phrase',
      article: 'Test article',
      citation: 'Test citation',
      lien_url_article: { lien1: 'test-link' },
      categorie: 'test',
      new_href: 'test-href'
    };

    it('should return mock success when on localhost', (done) => {
      // Mock isLocalhost pour retourner true
      spyOn(service as any, 'isLocalhost').and.returnValue(true);

      service.savePostComplete(mockPost).subscribe((result: any) => {
        expect(result).toBe(true);
        done();
      });
    });

    it('should call supabaseService when not on localhost', () => {
      // Mock isLocalhost pour retourner false
      spyOn(service as any, 'isLocalhost').and.returnValue(false);
      
      mockSupabaseService.updatePostComplete.and.returnValue(Promise.resolve());

      service.savePostComplete(mockPost).subscribe();

      expect(mockSupabaseService.updatePostComplete).toHaveBeenCalledWith(mockPost);
    });
  });

  describe('saveFaqItems()', () => {
    const mockPostId = 123;
    const mockFaqItems = [
      { question: 'Test question', response: 'Test response' }
    ];

    it('should return mock success when on localhost', (done) => {
      // Mock isLocalhost pour retourner true
      spyOn(service as any, 'isLocalhost').and.returnValue(true);

      service.saveFaqItems(mockPostId, mockFaqItems).subscribe((result: any) => {
        expect(result).toBe(true);
        done();
      });
    });

    it('should call supabaseService when not on localhost', () => {
      // Mock isLocalhost pour retourner false
      spyOn(service as any, 'isLocalhost').and.returnValue(false);
      
      mockSupabaseService.saveFaqForPost.and.returnValue(Promise.resolve());

      service.saveFaqItems(mockPostId, mockFaqItems).subscribe();

      expect(mockSupabaseService.saveFaqForPost).toHaveBeenCalledWith(mockPostId, mockFaqItems);
    });
  });

  describe('Error handling scenarios', () => {
    it('should handle Supabase errors in getNextPostId', (done) => {
      const supabaseError: PostgrestError = {
        message: 'Database connection failed',
        details: 'Connection timeout',
        hint: 'Check network',
        code: 'CONNECTION_ERROR',
        name: 'PostgrestError'
      };
      mockSupabaseService.getNextPostId.and.returnValue(Promise.reject(supabaseError));

      // Mock isLocalhost pour retourner false
      spyOn(service as any, 'isLocalhost').and.returnValue(false);

      service.getNextPostId().subscribe((result: any) => {
        expect(result).toBe(supabaseError);
        done();
      });
    });

    it('should handle OpenAI API errors in setPost', (done) => {
      // Mock isLocalhost pour retourner false
      spyOn(service as any, 'isLocalhost').and.returnValue(false);
      
      mockGetPromptsService.generateArticle.and.returnValue('Test prompt');
      mockOpenaiApiService.fetchData.and.returnValue(Promise.reject(new Error('OpenAI API Error')));

      service.setPost('test idea').subscribe((result: any) => {
        expect(result).toEqual(jasmine.objectContaining({
          message: 'OpenAI API Error',
          code: 'INFRA_ERROR_SETPOST',
          name: 'PostgrestError'
        }));
        done();
      });
    });
  });
});