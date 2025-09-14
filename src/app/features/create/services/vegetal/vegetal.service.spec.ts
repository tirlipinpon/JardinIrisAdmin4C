import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { of, throwError } from 'rxjs';
import { VegetalService } from './vegetal.service';
import { LoggingService } from '../../../../shared/services/logging.service';
import { GetPromptsService } from '../get-prompts/get-prompts.service';
import { OpenaiApiService } from '../openai-api/openai-api.service';
import { AddScientificNameService } from '../add-scientific-name/add-scientific-name.service';

describe('VegetalService', () => {
  let service: VegetalService;
  let loggingService: jasmine.SpyObj<LoggingService>;
  let getPromptsService: jasmine.SpyObj<GetPromptsService>;
  let openaiApiService: jasmine.SpyObj<OpenaiApiService>;
  let addScientificNameService: jasmine.SpyObj<AddScientificNameService>;

  beforeEach(() => {
    const loggingSpy = jasmine.createSpyObj('LoggingService', ['info']);
    const getPromptsSpy = jasmine.createSpyObj('GetPromptsService', ['getPromptAddVegetalInArticle']);
    const openaiSpy = jasmine.createSpyObj('OpenaiApiService', ['fetchData']);
    const addScientificSpy = jasmine.createSpyObj('AddScientificNameService', ['processAddUrlFromScientificNameInHtml']);

    TestBed.configureTestingModule({
      providers: [
        VegetalService,
        { provide: LoggingService, useValue: loggingSpy },
        { provide: GetPromptsService, useValue: getPromptsSpy },
        { provide: OpenaiApiService, useValue: openaiSpy },
        { provide: AddScientificNameService, useValue: addScientificSpy },
        provideZonelessChangeDetection()
      ]
    });

    service = TestBed.inject(VegetalService);
    loggingService = TestBed.inject(LoggingService) as jasmine.SpyObj<LoggingService>;
    getPromptsService = TestBed.inject(GetPromptsService) as jasmine.SpyObj<GetPromptsService>;
    openaiApiService = TestBed.inject(OpenaiApiService) as jasmine.SpyObj<OpenaiApiService>;
    addScientificNameService = TestBed.inject(AddScientificNameService) as jasmine.SpyObj<AddScientificNameService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('enrichArticleWithBotanicalNames()', () => {
    const testArticle = '<p>Test article content</p>';
    const testPrompt = {
      systemRole: { role: 'system', content: 'Test prompt for vegetal enrichment' },
      userRole: { role: 'user', content: testArticle }
    };
    const mockUpgradedArticle = '<p>Enhanced article with botanical names</p>';

    beforeEach(() => {
      getPromptsService.getPromptAddVegetalInArticle.and.returnValue(testPrompt);
    });

    it('should enrich article with botanical names successfully', (done) => {
      const mockApiResponse = '{"upgraded": "' + mockUpgradedArticle + '"}';
      openaiApiService.fetchData.and.returnValue(Promise.resolve(mockApiResponse));
      addScientificNameService.processAddUrlFromScientificNameInHtml.and.returnValue(of(mockUpgradedArticle));

      service.enrichArticleWithBotanicalNames(testArticle).subscribe(result => {
        expect(getPromptsService.getPromptAddVegetalInArticle).toHaveBeenCalledWith(testArticle, 0);
        expect(openaiApiService.fetchData).toHaveBeenCalledWith(testPrompt, false, 'vegetal global');
        expect(addScientificNameService.processAddUrlFromScientificNameInHtml).toHaveBeenCalledWith(mockUpgradedArticle);
        expect(loggingService.info).toHaveBeenCalledWith('VEGETAL_SVC', '📨 Vegetal terminé');
        expect(result).toBe(mockUpgradedArticle);
        done();
      });
    });

    it('should handle case when API returns null result', (done) => {
      openaiApiService.fetchData.and.returnValue(Promise.resolve(null));
      addScientificNameService.processAddUrlFromScientificNameInHtml.and.returnValue(of(testArticle));

      service.enrichArticleWithBotanicalNames(testArticle).subscribe(result => {
        expect(getPromptsService.getPromptAddVegetalInArticle).toHaveBeenCalledWith(testArticle, 0);
        expect(openaiApiService.fetchData).toHaveBeenCalledWith(testPrompt, false, 'vegetal global');
        expect(addScientificNameService.processAddUrlFromScientificNameInHtml).toHaveBeenCalledWith(testArticle);
        expect(loggingService.info).toHaveBeenCalledWith('VEGETAL_SVC', '📨 Vegetal terminé');
        expect(result).toBe(testArticle);
        done();
      });
    });

    it('should handle case when API returns empty string', (done) => {
      openaiApiService.fetchData.and.returnValue(Promise.resolve(''));
      addScientificNameService.processAddUrlFromScientificNameInHtml.and.returnValue(of(testArticle));

      service.enrichArticleWithBotanicalNames(testArticle).subscribe(result => {
        expect(getPromptsService.getPromptAddVegetalInArticle).toHaveBeenCalledWith(testArticle, 0);
        expect(openaiApiService.fetchData).toHaveBeenCalledWith(testPrompt, false, 'vegetal global');
        expect(addScientificNameService.processAddUrlFromScientificNameInHtml).toHaveBeenCalledWith(testArticle);
        expect(loggingService.info).toHaveBeenCalledWith('VEGETAL_SVC', '📨 Vegetal terminé');
        expect(result).toBe(testArticle);
        done();
      });
    });

    it('should handle JSON parsing error gracefully', (done) => {
      const invalidJsonResponse = 'invalid json response';
      openaiApiService.fetchData.and.returnValue(Promise.resolve(invalidJsonResponse));
      addScientificNameService.processAddUrlFromScientificNameInHtml.and.returnValue(of(testArticle));

      service.enrichArticleWithBotanicalNames(testArticle).subscribe(result => {
        expect(getPromptsService.getPromptAddVegetalInArticle).toHaveBeenCalledWith(testArticle, 0);
        expect(openaiApiService.fetchData).toHaveBeenCalledWith(testPrompt, false, 'vegetal global');
        expect(addScientificNameService.processAddUrlFromScientificNameInHtml).toHaveBeenCalledWith(testArticle);
        expect(loggingService.info).toHaveBeenCalledWith('VEGETAL_SVC', '📨 Vegetal terminé');
        expect(result).toBe(testArticle);
        done();
      });
    });

    it('should handle case when upgraded field is missing in JSON', (done) => {
      const mockApiResponse = '{"other_field": "value"}';
      openaiApiService.fetchData.and.returnValue(Promise.resolve(mockApiResponse));
      addScientificNameService.processAddUrlFromScientificNameInHtml.and.returnValue(of(testArticle));

      service.enrichArticleWithBotanicalNames(testArticle).subscribe(result => {
        expect(getPromptsService.getPromptAddVegetalInArticle).toHaveBeenCalledWith(testArticle, 0);
        expect(openaiApiService.fetchData).toHaveBeenCalledWith(testPrompt, false, 'vegetal global');
        expect(addScientificNameService.processAddUrlFromScientificNameInHtml).toHaveBeenCalledWith(testArticle);
        expect(loggingService.info).toHaveBeenCalledWith('VEGETAL_SVC', '📨 Vegetal terminé');
        expect(result).toBe(testArticle);
        done();
      });
    });

    it('should handle case when upgraded field is null in JSON', (done) => {
      const mockApiResponse = '{"upgraded": null}';
      openaiApiService.fetchData.and.returnValue(Promise.resolve(mockApiResponse));
      addScientificNameService.processAddUrlFromScientificNameInHtml.and.returnValue(of(testArticle));

      service.enrichArticleWithBotanicalNames(testArticle).subscribe(result => {
        expect(getPromptsService.getPromptAddVegetalInArticle).toHaveBeenCalledWith(testArticle, 0);
        expect(openaiApiService.fetchData).toHaveBeenCalledWith(testPrompt, false, 'vegetal global');
        expect(addScientificNameService.processAddUrlFromScientificNameInHtml).toHaveBeenCalledWith(testArticle);
        expect(loggingService.info).toHaveBeenCalledWith('VEGETAL_SVC', '📨 Vegetal terminé');
        expect(result).toBe(testArticle);
        done();
      });
    });

    it('should handle case when upgraded field is empty string in JSON', (done) => {
      const mockApiResponse = '{"upgraded": ""}';
      openaiApiService.fetchData.and.returnValue(Promise.resolve(mockApiResponse));
      addScientificNameService.processAddUrlFromScientificNameInHtml.and.returnValue(of(testArticle));

      service.enrichArticleWithBotanicalNames(testArticle).subscribe(result => {
        expect(getPromptsService.getPromptAddVegetalInArticle).toHaveBeenCalledWith(testArticle, 0);
        expect(openaiApiService.fetchData).toHaveBeenCalledWith(testPrompt, false, 'vegetal global');
        expect(addScientificNameService.processAddUrlFromScientificNameInHtml).toHaveBeenCalledWith(testArticle);
        expect(loggingService.info).toHaveBeenCalledWith('VEGETAL_SVC', '📨 Vegetal terminé');
        expect(result).toBe(testArticle);
        done();
      });
    });

    it('should work with different article content', (done) => {
      const differentArticle = '<div>Different content with plants</div>';
      const differentPrompt = {
        systemRole: { role: 'system', content: 'Different prompt' },
        userRole: { role: 'user', content: differentArticle }
      };
      getPromptsService.getPromptAddVegetalInArticle.and.returnValue(differentPrompt);
      
      const mockApiResponse = '{"upgraded": "' + mockUpgradedArticle + '"}';
      openaiApiService.fetchData.and.returnValue(Promise.resolve(mockApiResponse));
      addScientificNameService.processAddUrlFromScientificNameInHtml.and.returnValue(of(mockUpgradedArticle));

      service.enrichArticleWithBotanicalNames(differentArticle).subscribe(result => {
        expect(getPromptsService.getPromptAddVegetalInArticle).toHaveBeenCalledWith(differentArticle, 0);
        expect(openaiApiService.fetchData).toHaveBeenCalledWith(differentPrompt, false, 'vegetal global');
        expect(addScientificNameService.processAddUrlFromScientificNameInHtml).toHaveBeenCalledWith(mockUpgradedArticle);
        expect(loggingService.info).toHaveBeenCalledWith('VEGETAL_SVC', '📨 Vegetal terminé');
        expect(result).toBe(mockUpgradedArticle);
        done();
      });
    });

    it('should handle complex JSON structure', (done) => {
      const complexUpgradedArticle = '<p>Complex article with multiple botanical names: <em>Rosa canina</em> and <em>Quercus robur</em></p>';
      const complexJsonResponse = '{"upgraded": "' + complexUpgradedArticle + '", "metadata": {"processed": true}}';
      openaiApiService.fetchData.and.returnValue(Promise.resolve(complexJsonResponse));
      addScientificNameService.processAddUrlFromScientificNameInHtml.and.returnValue(of(complexUpgradedArticle));

      service.enrichArticleWithBotanicalNames(testArticle).subscribe(result => {
        expect(getPromptsService.getPromptAddVegetalInArticle).toHaveBeenCalledWith(testArticle, 0);
        expect(openaiApiService.fetchData).toHaveBeenCalledWith(testPrompt, false, 'vegetal global');
        expect(addScientificNameService.processAddUrlFromScientificNameInHtml).toHaveBeenCalledWith(complexUpgradedArticle);
        expect(loggingService.info).toHaveBeenCalledWith('VEGETAL_SVC', '📨 Vegetal terminé');
        expect(result).toBe(complexUpgradedArticle);
        done();
      });
    });

    it('should handle malformed JSON with extra characters', (done) => {
      const malformedJsonResponse = 'some text before {"upgraded": "' + mockUpgradedArticle + '"} some text after';
      openaiApiService.fetchData.and.returnValue(Promise.resolve(malformedJsonResponse));
      addScientificNameService.processAddUrlFromScientificNameInHtml.and.returnValue(of(testArticle));

      service.enrichArticleWithBotanicalNames(testArticle).subscribe(result => {
        expect(getPromptsService.getPromptAddVegetalInArticle).toHaveBeenCalledWith(testArticle, 0);
        expect(openaiApiService.fetchData).toHaveBeenCalledWith(testPrompt, false, 'vegetal global');
        // Si extractJSONBlock ne trouve pas de JSON valide, ça tombe dans le catch et utilise l'article original
        expect(addScientificNameService.processAddUrlFromScientificNameInHtml).toHaveBeenCalledWith(testArticle);
        expect(loggingService.info).toHaveBeenCalledWith('VEGETAL_SVC', '📨 Vegetal terminé');
        expect(result).toBe(testArticle);
        done();
      });
    });

    it('should handle API service error', (done) => {
      openaiApiService.fetchData.and.returnValue(Promise.reject('API Error'));
      addScientificNameService.processAddUrlFromScientificNameInHtml.and.returnValue(of(testArticle));

      service.enrichArticleWithBotanicalNames(testArticle).subscribe({
        next: (result) => {
          expect(getPromptsService.getPromptAddVegetalInArticle).toHaveBeenCalledWith(testArticle, 0);
          expect(openaiApiService.fetchData).toHaveBeenCalledWith(testPrompt, false, 'vegetal global');
          expect(addScientificNameService.processAddUrlFromScientificNameInHtml).toHaveBeenCalledWith(testArticle);
          expect(loggingService.info).toHaveBeenCalledWith('VEGETAL_SVC', '📨 Vegetal terminé');
          expect(result).toBe(testArticle);
          done();
        },
        error: (error) => {
          expect(error).toBe('API Error');
          done();
        }
      });
    });

    it('should handle scientific name service error', (done) => {
      const mockApiResponse = '{"upgraded": "' + mockUpgradedArticle + '"}';
      openaiApiService.fetchData.and.returnValue(Promise.resolve(mockApiResponse));
      addScientificNameService.processAddUrlFromScientificNameInHtml.and.returnValue(throwError('Scientific Name Service Error'));

      service.enrichArticleWithBotanicalNames(testArticle).subscribe({
        next: (result) => {
          done.fail('Expected error but got result');
        },
        error: (error) => {
          expect(getPromptsService.getPromptAddVegetalInArticle).toHaveBeenCalledWith(testArticle, 0);
          expect(openaiApiService.fetchData).toHaveBeenCalledWith(testPrompt, false, 'vegetal global');
          expect(addScientificNameService.processAddUrlFromScientificNameInHtml).toHaveBeenCalledWith(mockUpgradedArticle);
          expect(error).toBe('Scientific Name Service Error');
          done();
        }
      });
    });
  });
});