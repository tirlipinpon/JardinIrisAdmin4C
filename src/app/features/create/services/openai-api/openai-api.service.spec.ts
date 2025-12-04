import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { OpenaiApiService } from './openai-api.service';
import { DeepseekProxyService } from '../deepseek-proxy/deepseek-proxy.service';

describe('OpenaiApiService', () => {
  let service: OpenaiApiService;
  let deepseekProxyService: jasmine.SpyObj<DeepseekProxyService>;

  beforeEach(() => {
    const deepseekSpy = jasmine.createSpyObj('DeepseekProxyService', ['createCompletion']);
    TestBed.configureTestingModule({
      providers: [
        OpenaiApiService,
        provideZonelessChangeDetection(),
        { provide: DeepseekProxyService, useValue: deepseekSpy }
      ]
    });

    service = TestBed.inject(OpenaiApiService);
    deepseekProxyService = TestBed.inject(DeepseekProxyService) as jasmine.SpyObj<DeepseekProxyService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('fetchData()', () => {
    const mockPrompt = {
      systemRole: { role: 'system', content: 'Test system prompt' },
      userRole: { role: 'user', content: 'Test user prompt' }
    };

    beforeEach(() => {
      // Mock les clients OpenAI
      spyOn(service.openai.chat.completions, 'create').and.returnValue({
        choices: [{
          message: {
            content: 'Test response content'
          }
        }]
      } as any);
      deepseekProxyService.createCompletion.and.returnValue(Promise.resolve({
        choices: [{
          message: {
            content: 'Test deepseek response content'
          }
        }]
      } as any));
    });

    it('should fetch data using OpenAI client by default', async () => {
      const result = await service.fetchData(mockPrompt, false, 'test-debug');

      expect(service.openai.chat.completions.create).toHaveBeenCalledWith(
        {
          messages: [
            mockPrompt.systemRole as any,
            mockPrompt.userRole as any
          ],
          model: 'gpt-5-mini-2025-08-07',
        },
        {
          headers: { 'X-Request-ID': 'test-debug' }
        }
      );
      expect(deepseekProxyService.createCompletion).not.toHaveBeenCalled();
      expect(result).toBe('Test response content');
    });

    it('should fetch data using Deepseek client when deepseek is true', async () => {
      const result = await service.fetchData(mockPrompt, true, 'test-debug-deepseek');

      expect(deepseekProxyService.createCompletion).toHaveBeenCalledWith({
        messages: [
          mockPrompt.systemRole as any,
          mockPrompt.userRole as any
        ],
        requestId: 'test-debug-deepseek',
        maxTokens: 4500
      });
      expect(service.openai.chat.completions.create).not.toHaveBeenCalled();
      expect(result).toBe('Test deepseek response content');
    });

    it('should fetch data without debug name', async () => {
      const result = await service.fetchData(mockPrompt);

      expect(service.openai.chat.completions.create).toHaveBeenCalledWith(
        {
          messages: [
            mockPrompt.systemRole as any,
            mockPrompt.userRole as any
          ],
          model: 'gpt-5-mini-2025-08-07',
        },
        {
          headers: { 'X-Request-ID': undefined }
        }
      );
      expect(result).toBe('Test response content');
    });

    it('should handle API errors gracefully', async () => {
      const errorMessage = 'API Error';
      (service.openai.chat.completions.create as jasmine.Spy).and.returnValue(Promise.reject(errorMessage));

      try {
        await service.fetchData(mockPrompt, false, 'test-error');
        fail('Expected error but got result');
      } catch (error) {
        expect(error).toBe(errorMessage);
        expect(service.openai.chat.completions.create).toHaveBeenCalled();
      }
    });

    it('should handle empty response content', async () => {
      (service.openai.chat.completions.create as jasmine.Spy).and.returnValue({
        choices: [{
          message: {
            content: null
          }
        }]
      } as any);

      const result = await service.fetchData(mockPrompt);

      expect(result).toBeNull();
    });

    it('should handle response with no choices', async () => {
      (service.openai.chat.completions.create as jasmine.Spy).and.returnValue({
        choices: []
      } as any);

      try {
        await service.fetchData(mockPrompt);
        fail('Expected error but got result');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('fetchDataImage()', () => {
    const mockPrompt = {
      systemRole: { role: 'system', content: 'Test system prompt' },
      userRole: { content: 'Test user prompt with images' }
    };
    const mockUrls = ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'];

    beforeEach(() => {
      spyOn(service.openai.chat.completions, 'create').and.returnValue({
        choices: [{
          message: {
            content: 'Test image analysis response'
          }
        }]
      } as any);
    });

    it('should fetch data with images using OpenAI', async () => {
      const result = await service.fetchDataImage(mockPrompt, mockUrls, 'test-image-debug');

      expect(service.openai.chat.completions.create).toHaveBeenCalledWith({
        model: 'gpt-4.1-mini',
        messages: [
          mockPrompt.systemRole as any,
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: mockPrompt.userRole.content,
              },
              {
                type: 'image_url',
                image_url: { url: mockUrls[0] },
              },
              {
                type: 'image_url',
                image_url: { url: mockUrls[1] },
              },
            ],
          }],
      });
      expect(result).toBe('Test image analysis response');
    });

    it('should fetch data with images without debug name', async () => {
      const result = await service.fetchDataImage(mockPrompt, mockUrls);

      expect(service.openai.chat.completions.create).toHaveBeenCalledWith({
        model: 'gpt-4.1-mini',
        messages: [
          mockPrompt.systemRole as any,
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: mockPrompt.userRole.content,
              },
              {
                type: 'image_url',
                image_url: { url: mockUrls[0] },
              },
              {
                type: 'image_url',
                image_url: { url: mockUrls[1] },
              },
            ],
          }],
      });
      expect(result).toBe('Test image analysis response');
    });

    it('should handle empty URLs array', async () => {
      const result = await service.fetchDataImage(mockPrompt, []);

      expect(service.openai.chat.completions.create).toHaveBeenCalledWith({
        model: 'gpt-4.1-mini',
        messages: [
          mockPrompt.systemRole as any,
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: mockPrompt.userRole.content,
              },
            ],
          }],
      });
      expect(result).toBe('Test image analysis response');
    });

    it('should handle API errors in fetchDataImage', async () => {
      const errorMessage = 'Image API Error';
      (service.openai.chat.completions.create as jasmine.Spy).and.returnValue(Promise.reject(errorMessage));

      try {
        await service.fetchDataImage(mockPrompt, mockUrls);
        fail('Expected error but got result');
      } catch (error) {
        expect(error).toBe(errorMessage);
      }
    });

    it('should handle invalid_image_url error with retry', async () => {
      const invalidImageError = {
        error: {
          message: 'Timeout while downloading image',
          code: 'invalid_image_url'
        }
      };
      
      // Premier appel échoue avec invalid_image_url
      let callCount = 0;
      (service.openai.chat.completions.create as jasmine.Spy).and.callFake(() => {
        callCount++;
        if (callCount === 1) {
          return Promise.reject(invalidImageError);
        } else {
          return Promise.resolve({
            choices: [{ message: { content: '{"imageUrl": "https://example.com/fallback.jpg"}' } }]
          });
        }
      });

      // Mock fetch pour la validation des URLs
      spyOn(window, 'fetch').and.returnValue(Promise.resolve({
        ok: true,
        headers: new Map([['content-type', 'image/jpeg']])
      } as any));

      const result = await service.fetchDataImage(mockPrompt, mockUrls);
      
      expect(result).toBe('{"imageUrl": "https://example.com/fallback.jpg"}');
      expect(service.openai.chat.completions.create).toHaveBeenCalled();
    });

    it('should return empty imageUrl when no valid URLs found', async () => {
      // Mock fetch pour simuler des URLs invalides
      spyOn(window, 'fetch').and.returnValue(Promise.reject(new Error('URL inaccessible')));

      const result = await service.fetchDataImage(mockPrompt, mockUrls);
      
      expect(result).toBe('{"imageUrl": ""}');
      expect(service.openai.chat.completions.create).not.toHaveBeenCalled();
    });
  });

  describe('imageGeneratorUrl()', () => {
    beforeEach(() => {
      spyOn(service.openai.images, 'generate').and.returnValue({
        data: [{
          b64_json: 'base64-encoded-image-data'
        }]
      } as any);
    });

    it('should generate image with prompt and return base64', async () => {
      const result = await service.imageGeneratorUrl('Test image prompt', 'test-image-gen');

      expect(service.openai.images.generate).toHaveBeenCalledWith({
        model: 'gpt-image-1',
        prompt: 'Test image prompt',
        n: 1,
        size: '1024x1024'
      }, {
        headers: { 'X-Request-ID': 'test-image-gen' }
      });
      expect(result).toBe('base64-encoded-image-data');
    });

    it('should generate image without debug name', async () => {
      const result = await service.imageGeneratorUrl('Test image prompt');

      expect(service.openai.images.generate).toHaveBeenCalledWith({
        model: 'gpt-image-1',
        prompt: 'Test image prompt',
        n: 1,
        size: '1024x1024'
      }, {
        headers: {}
      });
      expect(result).toBe('base64-encoded-image-data');
    });

    it('should throw error when no image is generated', async () => {
      (service.openai.images.generate as jasmine.Spy).and.returnValue(Promise.resolve({
        data: []
      } as any));

      try {
        await service.imageGeneratorUrl('Test image prompt');
        fail('Expected error but got result');
      } catch (error) {
        expect((error as Error).message).toBe("Aucune image n'a été générée");
      }
    });

    it('should throw error when data is null', async () => {
      (service.openai.images.generate as jasmine.Spy).and.returnValue(Promise.resolve({
        data: null
      } as any));

      try {
        await service.imageGeneratorUrl('Test image prompt');
        fail('Expected error but got result');
      } catch (error) {
        expect((error as Error).message).toBe("Aucune image n'a été générée");
      }
    });

    it('should handle API errors in imageGeneratorUrl', async () => {
      const errorMessage = 'Image generation API Error';
      (service.openai.images.generate as jasmine.Spy).and.returnValue(Promise.reject(errorMessage));

      try {
        await service.imageGeneratorUrl('Test image prompt');
        fail('Expected error but got result');
      } catch (error) {
        expect(error).toBe(errorMessage);
      }
    });

    it('should handle different image prompts', async () => {
      const prompts = [
        'A beautiful garden',
        'Modern architecture',
        'Abstract art',
        'Nature landscape'
      ];

      for (const prompt of prompts) {
        await service.imageGeneratorUrl(prompt);
        expect(service.openai.images.generate).toHaveBeenCalledWith({
          model: 'gpt-image-1',
          prompt: prompt,
          n: 1,
          size: '1024x1024'
        }, {
          headers: {}
        });
      }
    });
  });
});