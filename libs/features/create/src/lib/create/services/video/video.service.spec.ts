import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { of } from 'rxjs';
import { VideoService } from './video.service';
import { LoggingService } from '@jardin-iris/core/data-access';
import { GetPromptsService } from '../get-prompts/get-prompts.service';
import { OpenaiApiService } from '../openai-api/openai-api.service';
import { GoogleSearchService, VideoInfo } from '../google-search/google-search.service';

describe('VideoService', () => {
  let service: VideoService;
  let mockLoggingService: jasmine.SpyObj<LoggingService>;
  let mockGetPromptsService: jasmine.SpyObj<GetPromptsService>;
  let mockOpenaiApiService: jasmine.SpyObj<OpenaiApiService>;
  let mockGoogleSearchService: jasmine.SpyObj<GoogleSearchService>;

  beforeEach(() => {
    const loggingServiceSpy = jasmine.createSpyObj('LoggingService', ['log', 'error', 'warn']);
    const getPromptsServiceSpy = jasmine.createSpyObj('GetPromptsService', [
      'generateKeyWordForSearchVideo',
      'searchVideoFromYoutubeResult'
    ]);
    const openaiApiServiceSpy = jasmine.createSpyObj('OpenaiApiService', ['fetchData']);
    const googleSearchServiceSpy = jasmine.createSpyObj('GoogleSearchService', ['searchFrenchVideo']);

    TestBed.configureTestingModule({
      providers: [
        VideoService,
        provideZonelessChangeDetection(),
        { provide: LoggingService, useValue: loggingServiceSpy },
        { provide: GetPromptsService, useValue: getPromptsServiceSpy },
        { provide: OpenaiApiService, useValue: openaiApiServiceSpy },
        { provide: GoogleSearchService, useValue: googleSearchServiceSpy }
      ]
    });

    service = TestBed.inject(VideoService);
    mockLoggingService = TestBed.inject(LoggingService) as jasmine.SpyObj<LoggingService>;
    mockGetPromptsService = TestBed.inject(GetPromptsService) as jasmine.SpyObj<GetPromptsService>;
    mockOpenaiApiService = TestBed.inject(OpenaiApiService) as jasmine.SpyObj<OpenaiApiService>;
    mockGoogleSearchService = TestBed.inject(GoogleSearchService) as jasmine.SpyObj<GoogleSearchService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('findBestVideoUrl()', () => {
    const mockVideoInfo: VideoInfo = {
      videoId: 'test123',
      channelTitle: 'Test Channel',
      description: 'Test Video Description'
    };

    beforeEach(() => {
      // Setup default mocks
      mockGetPromptsService.generateKeyWordForSearchVideo.and.returnValue('test prompt');
      mockGetPromptsService.searchVideoFromYoutubeResult.and.returnValue('video selection prompt');
      mockOpenaiApiService.fetchData.and.returnValue(Promise.resolve('{"keywords": "garden design"}') as any);
      mockGoogleSearchService.searchFrenchVideo.and.returnValue(of([mockVideoInfo]));
    });

    it('should return video URL when all steps succeed', (done) => {
      const phraseAccroche = 'Design de jardin moderne';
      const expectedVideoUrl = 'https://youtube.com/watch?v=selected123';

      // Mock the second OpenAI call for video selection
      mockOpenaiApiService.fetchData.and.callFake((prompt: string, useMock: boolean, type: string) => {
        if (type === 'video keyword') {
          return Promise.resolve('{"keywords": "garden design"}') as any;
        } else if (type === 'video choose') {
          return Promise.resolve(`{"video": "${expectedVideoUrl}"}`) as any;
        }
        return Promise.resolve('') as any;
      });

      service.findBestVideoUrl(phraseAccroche).subscribe(result => {
        expect(mockGetPromptsService.generateKeyWordForSearchVideo).toHaveBeenCalledWith(phraseAccroche);
        expect(mockOpenaiApiService.fetchData).toHaveBeenCalledWith('test prompt', true, 'video keyword');
        expect(mockGoogleSearchService.searchFrenchVideo).toHaveBeenCalledWith('garden design');
        expect(mockGetPromptsService.searchVideoFromYoutubeResult).toHaveBeenCalledWith(phraseAccroche, [mockVideoInfo]);
        expect(mockOpenaiApiService.fetchData).toHaveBeenCalledWith('video selection prompt', true, 'video choose');
        expect(result).toBe(expectedVideoUrl);
        done();
      });
    });

    it('should return empty string when OpenAI returns null', (done) => {
      mockOpenaiApiService.fetchData.and.returnValue(Promise.resolve(null) as any);

      service.findBestVideoUrl('test').subscribe(result => {
        expect(result).toBe('');
        done();
      });
    });

    it('should return empty string when OpenAI returns empty string', (done) => {
      mockOpenaiApiService.fetchData.and.returnValue(Promise.resolve('') as any);

      service.findBestVideoUrl('test').subscribe(result => {
        expect(result).toBe('');
        done();
      });
    });

    it('should return empty string when keywords are missing', (done) => {
      mockOpenaiApiService.fetchData.and.returnValue(Promise.resolve('{"keywords": null}') as any);

      service.findBestVideoUrl('test').subscribe(result => {
        expect(result).toBe('');
        done();
      });
    });

    it('should return empty string when keywords are empty', (done) => {
      mockOpenaiApiService.fetchData.and.returnValue(Promise.resolve('{"keywords": ""}') as any);

      service.findBestVideoUrl('test').subscribe(result => {
        expect(result).toBe('');
        done();
      });
    });

    it('should return empty string when no videos found', (done) => {
      mockGoogleSearchService.searchFrenchVideo.and.returnValue(of([]));

      service.findBestVideoUrl('test').subscribe(result => {
        expect(result).toBe('');
        done();
      });
    });

    it('should return empty string when video selection returns empty', (done) => {
      mockOpenaiApiService.fetchData.and.callFake((prompt: string, useMock: boolean, type: string) => {
        if (type === 'video keyword') {
          return Promise.resolve('{"keywords": "garden design"}') as any;
        } else if (type === 'video choose') {
          return Promise.resolve('{"video": ""}') as any;
        }
        return Promise.resolve('') as any;
      });

      service.findBestVideoUrl('test').subscribe(result => {
        expect(result).toBe('');
        done();
      });
    });

    it('should return empty string when video selection returns null', (done) => {
      mockOpenaiApiService.fetchData.and.callFake((prompt: string, useMock: boolean, type: string) => {
        if (type === 'video keyword') {
          return Promise.resolve('{"keywords": "garden design"}') as any;
        } else if (type === 'video choose') {
          return Promise.resolve('{"video": null}') as any;
        }
        return Promise.resolve('') as any;
      });

      service.findBestVideoUrl('test').subscribe(result => {
        expect(result).toBe('');
        done();
      });
    });

    it('should handle JSON parsing errors gracefully', (done) => {
      mockOpenaiApiService.fetchData.and.returnValue(Promise.resolve('invalid json') as any);

      service.findBestVideoUrl('test').subscribe(result => {
        expect(result).toBe('');
        done();
      });
    });

    it('should handle different phrase types', (done) => {
      const phrases = [
        'Design de jardin moderne',
        'Aménagement paysager urbain',
        'Plantes d\'intérieur tendance',
        'Jardin écologique durable'
      ];

      let completedTests = 0;
      phrases.forEach(phrase => {
        service.findBestVideoUrl(phrase).subscribe(result => {
          expect(mockGetPromptsService.generateKeyWordForSearchVideo).toHaveBeenCalledWith(phrase);
          completedTests++;
          if (completedTests === phrases.length) {
            done();
          }
        });
      });
    });

    it('should handle multiple video results', (done) => {
      const multipleVideos: VideoInfo[] = [
        mockVideoInfo,
        { ...mockVideoInfo, videoId: 'test456', channelTitle: 'Channel 2' },
        { ...mockVideoInfo, videoId: 'test789', channelTitle: 'Channel 3' }
      ];

      mockGoogleSearchService.searchFrenchVideo.and.returnValue(of(multipleVideos));
      mockOpenaiApiService.fetchData.and.callFake((prompt: string, useMock: boolean, type: string) => {
        if (type === 'video keyword') {
          return Promise.resolve('{"keywords": "garden design"}') as any;
        } else if (type === 'video choose') {
          return Promise.resolve('{"video": "https://youtube.com/watch?v=selected123"}') as any;
        }
        return Promise.resolve('') as any;
      });

      service.findBestVideoUrl('test').subscribe(result => {
        expect(mockGetPromptsService.searchVideoFromYoutubeResult).toHaveBeenCalledWith('test', multipleVideos);
        expect(result).toBe('https://youtube.com/watch?v=selected123');
        done();
      });
    });

    it('should handle useMock parameter', (done) => {
      service.findBestVideoUrl('test', true).subscribe(result => {
        expect(mockOpenaiApiService.fetchData).toHaveBeenCalledWith('test prompt', true, 'video keyword');
        done();
      });
    });

    it('should handle special characters in phrase', (done) => {
      const phraseWithSpecialChars = 'Café & jardin français avec plantes aromatiques!';

      service.findBestVideoUrl(phraseWithSpecialChars).subscribe(result => {
        expect(mockGetPromptsService.generateKeyWordForSearchVideo).toHaveBeenCalledWith(phraseWithSpecialChars);
        done();
      });
    });

    it('should handle empty phrase', (done) => {
      service.findBestVideoUrl('').subscribe(result => {
        expect(mockGetPromptsService.generateKeyWordForSearchVideo).toHaveBeenCalledWith('');
        expect(result).toBe('');
        done();
      });
    });

    it('should handle very long phrase', (done) => {
      const longPhrase = 'a'.repeat(1000);

      service.findBestVideoUrl(longPhrase).subscribe(result => {
        expect(mockGetPromptsService.generateKeyWordForSearchVideo).toHaveBeenCalledWith(longPhrase);
        expect(result).toBe('');
        done();
      });
    });

    it('should handle complex JSON structure in video selection', (done) => {
      const complexVideoResponse = '{"video": "https://youtube.com/watch?v=complex123", "confidence": 0.95}';
      
      mockOpenaiApiService.fetchData.and.callFake((prompt: string, useMock: boolean, type: string) => {
        if (type === 'video keyword') {
          return Promise.resolve('{"keywords": "garden design"}') as any;
        } else if (type === 'video choose') {
          return Promise.resolve(complexVideoResponse) as any;
        }
        return Promise.resolve('') as any;
      });

      service.findBestVideoUrl('test').subscribe(result => {
        expect(result).toBe('https://youtube.com/watch?v=complex123');
        done();
      });
    });

    it('should handle malformed JSON in video selection', (done) => {
      mockOpenaiApiService.fetchData.and.callFake((prompt: string, useMock: boolean, type: string) => {
        if (type === 'video keyword') {
          return Promise.resolve('{"keywords": "garden design"}') as any;
        } else if (type === 'video choose') {
          return Promise.resolve('{"video": ""}') as any;
        }
        return Promise.resolve('') as any;
      });

      service.findBestVideoUrl('test').subscribe(result => {
        expect(result).toBe('');
        done();
      });
    });

    it('should handle Google Search Service error', (done) => {
      mockGoogleSearchService.searchFrenchVideo.and.returnValue(of([]));

      service.findBestVideoUrl('test').subscribe(result => {
        expect(result).toBe('');
        done();
      });
    });

    it('should handle OpenAI API error in keyword generation', (done) => {
      mockOpenaiApiService.fetchData.and.returnValue(Promise.resolve('') as any);

      service.findBestVideoUrl('test').subscribe(result => {
        expect(result).toBe('');
        done();
      });
    });

    it('should handle OpenAI API error in video selection', (done) => {
      mockOpenaiApiService.fetchData.and.callFake((prompt: string, useMock: boolean, type: string) => {
        if (type === 'video keyword') {
          return Promise.resolve('{"keywords": "garden design"}') as any;
        } else if (type === 'video choose') {
          return Promise.resolve('{"video": ""}') as any;
        }
        return Promise.resolve('') as any;
      });

      service.findBestVideoUrl('test').subscribe(result => {
        expect(result).toBe('');
        done();
      });
    });
  });
});
