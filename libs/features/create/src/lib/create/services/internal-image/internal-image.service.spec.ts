import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { of, throwError } from 'rxjs';
import { InternalImageService } from './internal-image.service';
import { LoggingService } from '@jardin-iris/core/data-access';
import { GetPromptsService } from '../get-prompts/get-prompts.service';
import { OpenaiApiService } from '../openai-api/openai-api.service';
import { PexelsApiService } from '../pexels-api/pexels-api.service';

describe('InternalImageService', () => {
  let service: InternalImageService;
  let mockLoggingService: jasmine.SpyObj<LoggingService>;
  let mockGetPromptsService: jasmine.SpyObj<GetPromptsService>;
  let mockOpenaiApiService: jasmine.SpyObj<OpenaiApiService>;
  let mockPexelsApiService: jasmine.SpyObj<PexelsApiService>;

  beforeEach(() => {
    const loggingServiceSpy = jasmine.createSpyObj('LoggingService', ['info', 'warn', 'error']);
    const getPromptsServiceSpy = jasmine.createSpyObj('GetPromptsService', [
      'getPromptGenericSelectKeyWordsFromChapitresInArticle',
      'getPromptGenericSelectBestImageForChapitresInArticleWithVision'
    ]);
    const openaiApiServiceSpy = jasmine.createSpyObj('OpenaiApiService', ['fetchData', 'fetchDataImage']);
    const pexelsApiServiceSpy = jasmine.createSpyObj('PexelsApiService', ['searchImages']);

    TestBed.configureTestingModule({
      providers: [
        InternalImageService,
        provideZonelessChangeDetection(),
        { provide: LoggingService, useValue: loggingServiceSpy },
        { provide: GetPromptsService, useValue: getPromptsServiceSpy },
        { provide: OpenaiApiService, useValue: openaiApiServiceSpy },
        { provide: PexelsApiService, useValue: pexelsApiServiceSpy }
      ]
    });

    service = TestBed.inject(InternalImageService);
    mockLoggingService = TestBed.inject(LoggingService) as jasmine.SpyObj<LoggingService>;
    mockGetPromptsService = TestBed.inject(GetPromptsService) as jasmine.SpyObj<GetPromptsService>;
    mockOpenaiApiService = TestBed.inject(OpenaiApiService) as jasmine.SpyObj<OpenaiApiService>;
    mockPexelsApiService = TestBed.inject(PexelsApiService) as jasmine.SpyObj<PexelsApiService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('generateInternalImages()', () => {
    const mockArticle = `
      <span id="paragraphe-1"><h4>Introduction</h4>Content 1</span>
      <span id="paragraphe-2"><h4>Développement</h4>Content 2</span>
    `;
    const postId = 123;

    const mockKeywordPrompt = { systemRole: { role: 'system', content: 'test' }, userRole: { role: 'user', content: 'test' } };
    const mockKeywordResult = '```json\n{"keyWord": "nature", "explanation": "Beautiful nature"}\n```';
    const mockVisionPrompt = { systemRole: { role: 'system', content: 'test' }, userRole: { role: 'user', content: 'test' } };
    const mockVisionResult = '```json\n{"imageUrl": "https://example.com/medium.jpg"}\n```';

    const mockImages = [
      { src: { medium: 'https://example.com/medium.jpg', large: 'https://example.com/large.jpg' } },
      { src: { medium: 'https://example.com/medium2.jpg', large: 'https://example.com/large2.jpg' } }
    ];

    beforeEach(() => {
      mockGetPromptsService.getPromptGenericSelectKeyWordsFromChapitresInArticle.and.returnValue(mockKeywordPrompt);
      mockGetPromptsService.getPromptGenericSelectBestImageForChapitresInArticleWithVision.and.returnValue(mockVisionPrompt);
      mockOpenaiApiService.fetchData.and.returnValue(Promise.resolve(mockKeywordResult));
      mockOpenaiApiService.fetchDataImage.and.returnValue(Promise.resolve(mockVisionResult));
      mockPexelsApiService.searchImages.and.returnValue(of(mockImages as any));
    });

    it('should generate internal images successfully', (done) => {
      service.generateInternalImages(mockArticle, postId).subscribe(result => {
        expect(result.article).toBe(mockArticle);
        expect(result.images.length).toBeGreaterThan(0);
        expect(mockLoggingService.info).toHaveBeenCalledWith('INTERNAL_IMAGE_SVC', '🔧 Début generation', { articleLength: mockArticle.length, postId });
        done();
      });
    });

    it('should log chapter processing', (done) => {
      service.generateInternalImages(mockArticle, postId).subscribe(() => {
        expect(mockLoggingService.info).toHaveBeenCalledWith('INTERNAL_IMAGE_SVC', '🔧 Chapitre 1/5');
        expect(mockLoggingService.info).toHaveBeenCalledWith('INTERNAL_IMAGE_SVC', '🔧 Chapitre 2/5');
        done();
      });
    });

    it('should handle missing paragraphs', (done) => {
      const incompleteArticle = '<span id="paragraphe-1"><h4>Only one</h4></span>';
      
      service.generateInternalImages(incompleteArticle, postId).subscribe(result => {
        expect(result.images.length).toBe(1);
        expect(mockLoggingService.warn).toHaveBeenCalledWith('INTERNAL_IMAGE_SVC', 'Paragraphe 2 non trouvé');
        done();
      });
    });

    it('should handle missing H4 tags', (done) => {
      const noH4Article = '<span id="paragraphe-1">No H4 here</span>';
      
      service.generateInternalImages(noH4Article, postId).subscribe(result => {
        expect(result.images.length).toBe(0);
        expect(mockLoggingService.warn).toHaveBeenCalledWith('INTERNAL_IMAGE_SVC', 'Aucun <h4> au chapitre 1');
        done();
      });
    });

    it('should handle OpenAI keyword API failure', (done) => {
      mockOpenaiApiService.fetchData.and.returnValue(Promise.resolve(null));
      
      service.generateInternalImages(mockArticle, postId).subscribe(result => {
        expect(result.images.length).toBe(1); // Maintenant on retourne un placeholder
        expect(result.images[0].chapitre_id).toBe(1);
        expect(result.images[0].url_Image).toContain('placeholder');
        expect(mockLoggingService.warn).toHaveBeenCalledWith('INTERNAL_IMAGE_SVC', 'Aucun mot-clé pour 1');
        done();
      });
    });

    it('should handle invalid keyword JSON', (done) => {
      const invalidJsonResult = 'invalid json';
      mockOpenaiApiService.fetchData.and.returnValue(Promise.resolve(invalidJsonResult));
      
      const warningCallback = jasmine.createSpy('warningCallback');
      service.generateInternalImages(mockArticle, postId, warningCallback).subscribe(result => {
        expect(result.images.length).toBe(1); // Maintenant on retourne un placeholder
        expect(result.images[0].chapitre_id).toBe(1);
        expect(result.images[0].url_Image).toContain('placeholder');
        expect(warningCallback).toHaveBeenCalledWith('Erreur parsing mot-clé pour chapitre 1 - utilisation placeholder');
        done();
      });
    });

    it('should handle duplicate keywords', (done) => {
      const duplicateKeywordResult = '```json\n{"keyWord": "nature", "explanation": "Duplicate"}\n```';
      mockOpenaiApiService.fetchData.and.returnValue(Promise.resolve(duplicateKeywordResult));
      
      service.generateInternalImages(mockArticle, postId).subscribe(result => {
        expect(result.images.length).toBe(1); // Maintenant on retourne un placeholder pour le dupliqué
        expect(result.images[0].chapitre_id).toBe(1);
        expect(result.images[0].url_Image).toContain('placeholder');
        expect(mockLoggingService.warn).toHaveBeenCalledWith('INTERNAL_IMAGE_SVC', 'Mot-clé invalide/dupliqué: nature');
        done();
      });
    });

    it('should handle empty Pexels results', (done) => {
      mockPexelsApiService.searchImages.and.returnValue(of([]));
      
      service.generateInternalImages(mockArticle, postId).subscribe(result => {
        expect(result.images.length).toBe(1); // Maintenant on retourne un placeholder
        expect(result.images[0].chapitre_id).toBe(1);
        expect(result.images[0].url_Image).toContain('placeholder');
        expect(mockLoggingService.warn).toHaveBeenCalledWith('INTERNAL_IMAGE_SVC', 'Aucune image Pexels: nature');
        done();
      });
    });

    it('should handle vision API failure', (done) => {
      mockOpenaiApiService.fetchDataImage.and.returnValue(Promise.resolve(null));
      
      service.generateInternalImages(mockArticle, postId).subscribe(result => {
        expect(result.images.length).toBe(1); // Maintenant on retourne un placeholder
        expect(result.images[0].chapitre_id).toBe(1);
        expect(result.images[0].url_Image).toContain('placeholder');
        done();
      });
    });

    it('should handle invalid vision JSON', (done) => {
      const invalidVisionResult = 'invalid vision json';
      mockOpenaiApiService.fetchDataImage.and.returnValue(Promise.resolve(invalidVisionResult));
      
      const warningCallback = jasmine.createSpy('warningCallback');
      service.generateInternalImages(mockArticle, postId, warningCallback).subscribe(result => {
        expect(result.images.length).toBe(0);
        expect(warningCallback).toHaveBeenCalledWith('Erreur parsing sélection image chapitre 1');
        done();
      });
    });

    it('should handle image URL not found', (done) => {
      const wrongUrlResult = '```json\n{"imageUrl": "https://wrong-url.com/image.jpg"}\n```';
      mockOpenaiApiService.fetchDataImage.and.returnValue(Promise.resolve(wrongUrlResult));
      
      service.generateInternalImages(mockArticle, postId).subscribe(result => {
        expect(result.images.length).toBe(0);
        done();
      });
    });

    it('should call warning callback on errors', (done) => {
      const warningCallback = jasmine.createSpy('warningCallback');
      mockOpenaiApiService.fetchData.and.returnValue(Promise.reject(new Error('API Error')));
      
      service.generateInternalImages(mockArticle, postId, warningCallback).subscribe(result => {
        expect(warningCallback).toHaveBeenCalledWith('Erreur globale internalImage');
        expect(result.article).toBe(mockArticle);
        expect(result.images).toEqual([]);
        done();
      });
    });

    it('should handle empty keyword', (done) => {
      const emptyKeywordResult = '```json\n{"keyWord": "", "explanation": "Empty"}\n```';
      mockOpenaiApiService.fetchData.and.returnValue(Promise.resolve(emptyKeywordResult));
      
      service.generateInternalImages(mockArticle, postId).subscribe(result => {
        expect(result.images.length).toBe(0);
        expect(mockLoggingService.warn).toHaveBeenCalledWith('INTERNAL_IMAGE_SVC', 'Mot-clé invalide/dupliqué: ');
        done();
      });
    });

    it('should create correct InternalImageData structure', (done) => {
      service.generateInternalImages(mockArticle, postId).subscribe(result => {
        if (result.images.length > 0) {
          const imageData = result.images[0];
          expect(imageData.chapitre_id).toBe(1);
          expect(imageData.chapitre_key_word).toBe('nature');
          expect(imageData.url_Image).toBe('https://example.com/large.jpg');
          expect(imageData.explanation_word).toBe('Beautiful nature');
        }
        done();
      });
    });

    it('should log completion info', (done) => {
      service.generateInternalImages(mockArticle, postId).subscribe(result => {
        expect(mockLoggingService.info).toHaveBeenCalledWith('INTERNAL_IMAGE_SVC', jasmine.stringMatching(/📨 Terminé: \d+\/5/));
        done();
      });
    });

    it('should handle complex article with multiple chapters', (done) => {
      const complexArticle = `
        <span id="paragraphe-1"><h4>Chapter 1</h4>Content 1</span>
        <span id="paragraphe-2"><h4>Chapter 2</h4>Content 2</span>
        <span id="paragraphe-3"><h4>Chapter 3</h4>Content 3</span>
      `;
      
      // Mock different keywords for each chapter
      let callCount = 0;
      mockOpenaiApiService.fetchData.and.callFake(() => {
        callCount++;
        const keywords = ['nature', 'city', 'ocean'];
        const explanations = ['Beautiful nature', 'Urban city', 'Blue ocean'];
        const result = `{"keyWord": "${keywords[callCount - 1]}", "explanation": "${explanations[callCount - 1]}"}`;
        return Promise.resolve(`\`\`\`json\n${result}\n\`\`\``);
      });
      
      service.generateInternalImages(complexArticle, postId).subscribe(result => {
        expect(result.images.length).toBe(3);
        expect(result.images[0].chapitre_key_word).toBe('nature');
        expect(result.images[1].chapitre_key_word).toBe('city');
        expect(result.images[2].chapitre_key_word).toBe('ocean');
        done();
      });
    });

    it('should handle Pexels API error', (done) => {
      mockPexelsApiService.searchImages.and.returnValue(throwError(() => new Error('Pexels API Error')));
      
      const warningCallback = jasmine.createSpy('warningCallback');
      service.generateInternalImages(mockArticle, postId, warningCallback).subscribe(result => {
        expect(warningCallback).toHaveBeenCalledWith('Erreur globale internalImage');
        expect(mockLoggingService.error).toHaveBeenCalledWith('INTERNAL_IMAGE_SVC', 'Erreur', jasmine.any(Error));
        done();
      });
    });

    it('should handle empty article', (done) => {
      service.generateInternalImages('', postId).subscribe(result => {
        expect(result.article).toBe('');
        expect(result.images.length).toBe(0);
        expect(mockLoggingService.warn).toHaveBeenCalledWith('INTERNAL_IMAGE_SVC', 'Paragraphe 1 non trouvé');
        done();
      });
    });

    it('should handle malformed article structure', (done) => {
      const malformedArticle = '<span>No ID here</span><div>Not a span</div>';
      
      service.generateInternalImages(malformedArticle, postId).subscribe(result => {
        expect(result.images.length).toBe(0);
        expect(mockLoggingService.warn).toHaveBeenCalledWith('INTERNAL_IMAGE_SVC', 'Paragraphe 1 non trouvé');
        done();
      });
    });

    it('should use correct regex patterns for paragraph extraction', (done) => {
      const articleWithQuotes = '<span id=\'paragraphe-1\'><h4>Single quotes</h4>Content</span>';
      
      service.generateInternalImages(articleWithQuotes, postId).subscribe(result => {
        expect(result.images.length).toBe(1);
        expect(mockLoggingService.info).toHaveBeenCalledWith('INTERNAL_IMAGE_SVC', '🔧 Chapitre 1/5');
        done();
      });
    });

    it('should handle H4 with attributes', (done) => {
      const articleWithH4Attributes = '<span id="paragraphe-1"><h4 class="title" data-id="1">Title with attributes</h4>Content</span>';
      
      service.generateInternalImages(articleWithH4Attributes, postId).subscribe(result => {
        expect(result.images.length).toBe(1);
        done();
      });
    });

    it('should track used keywords correctly', (done) => {
      const duplicateArticle = `
        <span id="paragraphe-1"><h4>First</h4>Content 1</span>
        <span id="paragraphe-2"><h4>Second</h4>Content 2</span>
      `;
      
      // Mock same keyword for both chapters
      mockOpenaiApiService.fetchData.and.returnValue(Promise.resolve(mockKeywordResult));
      
      service.generateInternalImages(duplicateArticle, postId).subscribe(result => {
        expect(result.images.length).toBe(1); // Only first should succeed
        expect(mockLoggingService.warn).toHaveBeenCalledWith('INTERNAL_IMAGE_SVC', 'Mot-clé invalide/dupliqué: nature');
        done();
      });
    });
  });
});
