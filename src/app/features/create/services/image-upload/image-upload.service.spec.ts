import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { ImageUploadService } from './image-upload.service';
import { LoggingService } from '../../../../shared/services/logging.service';
import { SupabaseService } from '../../../../shared/services/supabase.service';
import { GetPromptsService } from '../get-prompts/get-prompts.service';
import { OpenaiApiService } from '../openai-api/openai-api.service';

describe('ImageUploadService', () => {
  let service: ImageUploadService;
  let loggingService: jasmine.SpyObj<LoggingService>;
  let supabaseService: jasmine.SpyObj<SupabaseService>;
  let getPromptsService: jasmine.SpyObj<GetPromptsService>;
  let openaiApiService: jasmine.SpyObj<OpenaiApiService>;

  beforeEach(() => {
    const loggingSpy = jasmine.createSpyObj('LoggingService', ['info', 'warn', 'error']);
    const supabaseSpy = jasmine.createSpyObj('SupabaseService', ['uploadBase64ToSupabase', 'updateImageUrlPostByIdForm']);
    const getPromptsSpy = jasmine.createSpyObj('GetPromptsService', ['getOpenAiPromptImageGenerator']);
    const openaiSpy = jasmine.createSpyObj('OpenaiApiService', ['imageGeneratorUrl']);

    TestBed.configureTestingModule({
      providers: [
        ImageUploadService,
        { provide: LoggingService, useValue: loggingSpy },
        { provide: SupabaseService, useValue: supabaseSpy },
        { provide: GetPromptsService, useValue: getPromptsSpy },
        { provide: OpenaiApiService, useValue: openaiSpy },
        provideZonelessChangeDetection()
      ]
    });

    service = TestBed.inject(ImageUploadService);
    loggingService = TestBed.inject(LoggingService) as jasmine.SpyObj<LoggingService>;
    supabaseService = TestBed.inject(SupabaseService) as jasmine.SpyObj<SupabaseService>;
    getPromptsService = TestBed.inject(GetPromptsService) as jasmine.SpyObj<GetPromptsService>;
    openaiApiService = TestBed.inject(OpenaiApiService) as jasmine.SpyObj<OpenaiApiService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('generateAndUploadImage()', () => {
    const testPhraseAccroche = 'Beautiful garden landscape';
    const testPostId = 123;
    const mockImagePrompt = 'Generate a beautiful garden landscape image';
    const mockB64Image = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
    const mockSupabaseImageUrl = 'https://supabase.example.com/images/123.jpg';

    beforeEach(() => {
      getPromptsService.getOpenAiPromptImageGenerator.and.returnValue(mockImagePrompt);
      openaiApiService.imageGeneratorUrl.and.returnValue(Promise.resolve(mockB64Image));
      supabaseService.uploadBase64ToSupabase.and.returnValue(Promise.resolve(mockSupabaseImageUrl));
      supabaseService.updateImageUrlPostByIdForm.and.returnValue(Promise.resolve() as any);
    });

    it('should generate and upload image successfully with useMock = false', (done) => {
      service.generateAndUploadImage(testPhraseAccroche, testPostId, false).subscribe(result => {
        expect(getPromptsService.getOpenAiPromptImageGenerator).toHaveBeenCalledWith(testPhraseAccroche);
        expect(openaiApiService.imageGeneratorUrl).toHaveBeenCalledWith(mockImagePrompt);
        expect(supabaseService.uploadBase64ToSupabase).toHaveBeenCalledWith(testPostId, mockB64Image);
        expect(supabaseService.updateImageUrlPostByIdForm).toHaveBeenCalledWith(testPostId, mockSupabaseImageUrl);
        expect(loggingService.info).toHaveBeenCalledWith('IMAGE_UPLOAD_SVC', '🖼️ Upload OK', { postId: testPostId, imageUrl: mockSupabaseImageUrl });
        expect(result).toBe(mockSupabaseImageUrl);
        done();
      });
    });

    it('should use mock image when useMock = true', (done) => {
      service.generateAndUploadImage(testPhraseAccroche, testPostId, true).subscribe(result => {
        expect(getPromptsService.getOpenAiPromptImageGenerator).not.toHaveBeenCalled();
        expect(openaiApiService.imageGeneratorUrl).not.toHaveBeenCalled();
        expect(loggingService.info).toHaveBeenCalledWith('IMAGE_UPLOAD_SVC', '🎭 Mock image base64 pour upload', { postId: testPostId });
        expect(supabaseService.uploadBase64ToSupabase).toHaveBeenCalledWith(testPostId, mockB64Image);
        expect(supabaseService.updateImageUrlPostByIdForm).toHaveBeenCalledWith(testPostId, mockSupabaseImageUrl);
        expect(loggingService.info).toHaveBeenCalledWith('IMAGE_UPLOAD_SVC', '🖼️ Upload OK', { postId: testPostId, imageUrl: mockSupabaseImageUrl });
        expect(result).toBe(mockSupabaseImageUrl);
        done();
      });
    });

    it('should handle OpenAI API returning null image', (done) => {
      openaiApiService.imageGeneratorUrl.and.returnValue(Promise.resolve(null) as any);

      service.generateAndUploadImage(testPhraseAccroche, testPostId, false).subscribe(result => {
        expect(getPromptsService.getOpenAiPromptImageGenerator).toHaveBeenCalledWith(testPhraseAccroche);
        expect(openaiApiService.imageGeneratorUrl).toHaveBeenCalledWith(mockImagePrompt);
        expect(loggingService.warn).toHaveBeenCalledWith('IMAGE_UPLOAD_SVC', '⚠️ Pas d\'image générée');
        expect(supabaseService.uploadBase64ToSupabase).not.toHaveBeenCalled();
        expect(supabaseService.updateImageUrlPostByIdForm).not.toHaveBeenCalled();
        expect(result).toBe('https://via.placeholder.com/800x400/666/white?text=Aucune+Image+Generee');
        done();
      });
    });

    it('should handle OpenAI API returning undefined image', (done) => {
      openaiApiService.imageGeneratorUrl.and.returnValue(Promise.resolve(undefined) as any);

      service.generateAndUploadImage(testPhraseAccroche, testPostId, false).subscribe(result => {
        expect(getPromptsService.getOpenAiPromptImageGenerator).toHaveBeenCalledWith(testPhraseAccroche);
        expect(openaiApiService.imageGeneratorUrl).toHaveBeenCalledWith(mockImagePrompt);
        expect(loggingService.warn).toHaveBeenCalledWith('IMAGE_UPLOAD_SVC', '⚠️ Pas d\'image générée');
        expect(supabaseService.uploadBase64ToSupabase).not.toHaveBeenCalled();
        expect(supabaseService.updateImageUrlPostByIdForm).not.toHaveBeenCalled();
        expect(result).toBe('https://via.placeholder.com/800x400/666/white?text=Aucune+Image+Generee');
        done();
      });
    });

    it('should handle Supabase upload returning null', (done) => {
      supabaseService.uploadBase64ToSupabase.and.returnValue(Promise.resolve(null) as any);

      service.generateAndUploadImage(testPhraseAccroche, testPostId, false).subscribe(result => {
        expect(getPromptsService.getOpenAiPromptImageGenerator).toHaveBeenCalledWith(testPhraseAccroche);
        expect(openaiApiService.imageGeneratorUrl).toHaveBeenCalledWith(mockImagePrompt);
        expect(supabaseService.uploadBase64ToSupabase).toHaveBeenCalledWith(testPostId, mockB64Image);
        expect(loggingService.warn).toHaveBeenCalledWith('IMAGE_UPLOAD_SVC', '⚠️ Upload échoué - fallback');
        expect(supabaseService.updateImageUrlPostByIdForm).not.toHaveBeenCalled();
        expect(result).toBe('https://via.placeholder.com/800x400/4caf50/white?text=Image+Jardin+Iris');
        done();
      });
    });

    it('should handle Supabase upload returning empty string', (done) => {
      supabaseService.uploadBase64ToSupabase.and.returnValue(Promise.resolve('') as any);

      service.generateAndUploadImage(testPhraseAccroche, testPostId, false).subscribe(result => {
        expect(getPromptsService.getOpenAiPromptImageGenerator).toHaveBeenCalledWith(testPhraseAccroche);
        expect(openaiApiService.imageGeneratorUrl).toHaveBeenCalledWith(mockImagePrompt);
        expect(supabaseService.uploadBase64ToSupabase).toHaveBeenCalledWith(testPostId, mockB64Image);
        expect(loggingService.warn).toHaveBeenCalledWith('IMAGE_UPLOAD_SVC', '⚠️ Upload échoué - fallback');
        expect(supabaseService.updateImageUrlPostByIdForm).not.toHaveBeenCalled();
        expect(result).toBe('https://via.placeholder.com/800x400/4caf50/white?text=Image+Jardin+Iris');
        done();
      });
    });

    it('should handle upload error in try-catch block', (done) => {
      const uploadError = new Error('Supabase upload failed');
      supabaseService.uploadBase64ToSupabase.and.returnValue(Promise.reject(uploadError));

      service.generateAndUploadImage(testPhraseAccroche, testPostId, false).subscribe(result => {
        expect(getPromptsService.getOpenAiPromptImageGenerator).toHaveBeenCalledWith(testPhraseAccroche);
        expect(openaiApiService.imageGeneratorUrl).toHaveBeenCalledWith(mockImagePrompt);
        expect(supabaseService.uploadBase64ToSupabase).toHaveBeenCalledWith(testPostId, mockB64Image);
        expect(loggingService.error).toHaveBeenCalledWith('IMAGE_UPLOAD_SVC', '🚫 Erreur upload', uploadError);
        expect(supabaseService.updateImageUrlPostByIdForm).not.toHaveBeenCalled();
        expect(result).toBe('https://via.placeholder.com/800x400/4caf50/white?text=Image+Non+Disponible');
        done();
      });
    });

    it('should handle updateImageUrlPostByIdForm error', (done) => {
      const updateError = new Error('Update failed');
      supabaseService.updateImageUrlPostByIdForm.and.returnValue(Promise.reject(updateError));

      service.generateAndUploadImage(testPhraseAccroche, testPostId, false).subscribe(result => {
        expect(getPromptsService.getOpenAiPromptImageGenerator).toHaveBeenCalledWith(testPhraseAccroche);
        expect(openaiApiService.imageGeneratorUrl).toHaveBeenCalledWith(mockImagePrompt);
        expect(supabaseService.uploadBase64ToSupabase).toHaveBeenCalledWith(testPostId, mockB64Image);
        expect(supabaseService.updateImageUrlPostByIdForm).toHaveBeenCalledWith(testPostId, mockSupabaseImageUrl);
        expect(loggingService.error).toHaveBeenCalledWith('IMAGE_UPLOAD_SVC', '🚫 Erreur upload', updateError);
        expect(result).toBe('https://via.placeholder.com/800x400/4caf50/white?text=Image+Non+Disponible');
        done();
      });
    });

    it('should handle different phrase accroche values', (done) => {
      const phrases = [
        'Beautiful garden',
        'Modern landscape design',
        'Urban gardening tips',
        'Flower arrangement ideas',
        'Sustainable gardening practices'
      ];

      let completedTests = 0;
      phrases.forEach(phrase => {
        service.generateAndUploadImage(phrase, testPostId, false).subscribe(result => {
          expect(getPromptsService.getOpenAiPromptImageGenerator).toHaveBeenCalledWith(phrase);
          expect(result).toBe(mockSupabaseImageUrl);
          completedTests++;
          if (completedTests === phrases.length) {
            done();
          }
        });
      });
    });

    it('should handle different post IDs', (done) => {
      const postIds = [1, 123, 456, 999, 1000];

      let completedTests = 0;
      postIds.forEach(postId => {
        service.generateAndUploadImage(testPhraseAccroche, postId, false).subscribe(result => {
          expect(supabaseService.uploadBase64ToSupabase).toHaveBeenCalledWith(postId, mockB64Image);
          expect(supabaseService.updateImageUrlPostByIdForm).toHaveBeenCalledWith(postId, mockSupabaseImageUrl);
          expect(result).toBe(mockSupabaseImageUrl);
          completedTests++;
          if (completedTests === postIds.length) {
            done();
          }
        });
      });
    });

    it('should handle OpenAI API error', (done) => {
      const apiError = new Error('OpenAI API error');
      openaiApiService.imageGeneratorUrl.and.returnValue(Promise.reject(apiError));

      service.generateAndUploadImage(testPhraseAccroche, testPostId, false).subscribe({
        next: (result) => {
          // Quand l'API OpenAI échoue, b64_json sera null, donc on retourne le placeholder
          expect(loggingService.warn).toHaveBeenCalledWith('IMAGE_UPLOAD_SVC', '⚠️ Pas d\'image générée');
          expect(result).toBe('https://via.placeholder.com/800x400/666/white?text=Aucune+Image+Generee');
          done();
        },
        error: (error) => {
          // L'erreur est propagée par l'Observable
          expect(error).toBe(apiError);
          done();
        }
      });
    });

    it('should handle empty phrase accroche', (done) => {
      const emptyPhrase = '';

      service.generateAndUploadImage(emptyPhrase, testPostId, false).subscribe(result => {
        expect(getPromptsService.getOpenAiPromptImageGenerator).toHaveBeenCalledWith(emptyPhrase);
        expect(result).toBe(mockSupabaseImageUrl);
        done();
      });
    });

    it('should handle phrase with special characters', (done) => {
      const specialPhrase = 'Garden café & restaurant design!';

      service.generateAndUploadImage(specialPhrase, testPostId, false).subscribe(result => {
        expect(getPromptsService.getOpenAiPromptImageGenerator).toHaveBeenCalledWith(specialPhrase);
        expect(result).toBe(mockSupabaseImageUrl);
        done();
      });
    });

    it('should handle phrase with Unicode characters', (done) => {
      const unicodePhrase = 'Jardin français avec fleurs éclatantes';

      service.generateAndUploadImage(unicodePhrase, testPostId, false).subscribe(result => {
        expect(getPromptsService.getOpenAiPromptImageGenerator).toHaveBeenCalledWith(unicodePhrase);
        expect(result).toBe(mockSupabaseImageUrl);
        done();
      });
    });

    it('should handle zero post ID', (done) => {
      const zeroPostId = 0;

      service.generateAndUploadImage(testPhraseAccroche, zeroPostId, false).subscribe(result => {
        expect(supabaseService.uploadBase64ToSupabase).toHaveBeenCalledWith(zeroPostId, mockB64Image);
        expect(supabaseService.updateImageUrlPostByIdForm).toHaveBeenCalledWith(zeroPostId, mockSupabaseImageUrl);
        expect(result).toBe(mockSupabaseImageUrl);
        done();
      });
    });

    it('should handle negative post ID', (done) => {
      const negativePostId = -1;

      service.generateAndUploadImage(testPhraseAccroche, negativePostId, false).subscribe(result => {
        expect(supabaseService.uploadBase64ToSupabase).toHaveBeenCalledWith(negativePostId, mockB64Image);
        expect(supabaseService.updateImageUrlPostByIdForm).toHaveBeenCalledWith(negativePostId, mockSupabaseImageUrl);
        expect(result).toBe(mockSupabaseImageUrl);
        done();
      });
    });

    it('should handle very long phrase accroche', (done) => {
      const longPhrase = 'A'.repeat(1000);

      service.generateAndUploadImage(longPhrase, testPostId, false).subscribe(result => {
        expect(getPromptsService.getOpenAiPromptImageGenerator).toHaveBeenCalledWith(longPhrase);
        expect(result).toBe(mockSupabaseImageUrl);
        done();
      });
    });

    it('should handle mock image with different post ID', (done) => {
      const differentPostId = 456;

      service.generateAndUploadImage(testPhraseAccroche, differentPostId, true).subscribe(result => {
        expect(loggingService.info).toHaveBeenCalledWith('IMAGE_UPLOAD_SVC', '🎭 Mock image base64 pour upload', { postId: differentPostId });
        expect(supabaseService.uploadBase64ToSupabase).toHaveBeenCalledWith(differentPostId, mockB64Image);
        expect(supabaseService.updateImageUrlPostByIdForm).toHaveBeenCalledWith(differentPostId, mockSupabaseImageUrl);
        expect(result).toBe(mockSupabaseImageUrl);
        done();
      });
    });
  });
});
