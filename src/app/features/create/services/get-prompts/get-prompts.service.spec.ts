import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { GetPromptsService } from './get-prompts.service';
import { VideoInfo } from '../../types/videoInfo';

describe('GetPromptsService', () => {
  let service: GetPromptsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        GetPromptsService,
        provideZonelessChangeDetection()
      ]
    });
    service = TestBed.inject(GetPromptsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('generateArticle', () => {
    it('should return correct structure for article generation', () => {
      const article = 'Test article content';
      const result = service.generateArticle(article);

      expect(result).toBeDefined();
      expect(result.systemRole).toBeDefined();
      expect(result.userRole).toBeDefined();
      expect(result.systemRole.role).toBe('system');
      expect(result.userRole.role).toBe('user');
      expect(result.systemRole.content).toContain('Rédige un article');
      expect(result.userRole.content).toContain(article);
    });

    it('should handle undefined article parameter', () => {
      const result = service.generateArticle();

      expect(result).toBeDefined();
      expect(result.systemRole).toBeDefined();
      expect(result.userRole).toBeDefined();
      expect(result.userRole.content).toContain('undefined');
    });
  });

  describe('generateKeyWordForSearchVideo', () => {
    it('should return correct structure for keyword generation', () => {
      const phraseAccroche = 'Test phrase accroche';
      const result = service.generateKeyWordForSearchVideo(phraseAccroche);

      expect(result).toBeDefined();
      expect(result.systemRole).toBeDefined();
      expect(result.userRole).toBeDefined();
      expect(result.systemRole.role).toBe('system');
      expect(result.userRole.role).toBe('user');
      expect(result.systemRole.content).toContain('YouTube');
      expect(result.userRole.content).toContain(phraseAccroche);
    });
  });

  describe('addVideo', () => {
    it('should return correct structure for video addition', () => {
      const postTitle = 'Test post title';
      const result = service.addVideo(postTitle);

      expect(result).toBeDefined();
      expect(result.systemRole).toBeDefined();
      expect(result.userRole).toBeDefined();
      expect(result.systemRole.role).toBe('system');
      expect(result.userRole.role).toBe('user');
      expect(result.systemRole.content).toContain('YouTube');
      expect(result.userRole.content).toContain(postTitle);
    });
  });

  describe('getPromptFaq', () => {
    it('should return correct structure for FAQ generation', () => {
      const upgradedArticle = 'Test upgraded article';
      const result = service.getPromptFaq(upgradedArticle);

      expect(result).toBeDefined();
      expect(result.systemRole).toBeDefined();
      expect(result.userRole).toBeDefined();
      expect(result.systemRole.role).toBe('system');
      expect(result.userRole.role).toBe('user');
      expect(result.systemRole.content).toContain('paragraphe');
      expect(result.userRole.content).toContain(upgradedArticle);
    });
  });

  describe('searchVideoFromYoutubeResult', () => {
    it('should return correct structure for video search', () => {
      const postTitle = 'Test post title';
      const videoList: VideoInfo[] = [
        {
          videoId: 'test123',
          channelTitle: 'Test Channel',
          description: 'Test description'
        },
        {
          videoId: 'test456',
          channelTitle: 'Another Channel',
          description: 'Another description'
        }
      ];

      const result = service.searchVideoFromYoutubeResult(postTitle, videoList);

      expect(result).toBeDefined();
      expect(result.systemRole).toBeDefined();
      expect(result.userRole).toBeDefined();
      expect(result.systemRole.role).toBe('system');
      expect(result.userRole.role).toBe('user');
      expect(result.systemRole.content).toContain('VideoInfo');
      expect(result.userRole.content).toContain(postTitle);
      expect(result.userRole.content).toContain('test123');
      expect(result.userRole.content).toContain('Test Channel');
    });

    it('should handle empty video list', () => {
      const postTitle = 'Test post title';
      const videoList: VideoInfo[] = [];

      const result = service.searchVideoFromYoutubeResult(postTitle, videoList);

      expect(result).toBeDefined();
      expect(result.userRole.content).toContain(postTitle);
      expect(result.userRole.content).toContain('Test post title');
    });

    it('should filter duplicate video IDs', () => {
      const postTitle = 'Test post title';
      const videoList: VideoInfo[] = [
        {
          videoId: 'test123',
          channelTitle: 'Test Channel',
          description: 'Test description'
        },
        {
          videoId: 'test123', // Duplicate
          channelTitle: 'Another Channel',
          description: 'Another description'
        }
      ];

      const result = service.searchVideoFromYoutubeResult(postTitle, videoList);

      expect(result).toBeDefined();
      expect(result.userRole.content).toContain('test123');
      // Should only appear once due to filtering
      const occurrences = (result.userRole.content.match(/test123/g) || []).length;
      expect(occurrences).toBe(1);
    });
  });

  describe('getPromptGenericSelectKeyWordsFromChapitresInArticle', () => {
    it('should return correct structure for keyword selection', () => {
      const titreArticle = 'Test article title';
      const paragrapheKeyWordList = ['keyword1', 'keyword2'];

      const result = service.getPromptGenericSelectKeyWordsFromChapitresInArticle(titreArticle, paragrapheKeyWordList);

      expect(result).toBeDefined();
      expect(result.systemRole).toBeDefined();
      expect(result.userRole).toBeDefined();
      expect(result.systemRole.role).toBe('system');
      expect(result.userRole.role).toBe('user');
      expect(result.systemRole.content).toContain('Unsplash');
      expect(result.userRole.content).toContain(titreArticle);
      expect(result.userRole.content).toContain('keyword1');
      expect(result.userRole.content).toContain('keyword2');
    });

    it('should handle empty keyword list', () => {
      const titreArticle = 'Test article title';
      const paragrapheKeyWordList: string[] = [];

      const result = service.getPromptGenericSelectKeyWordsFromChapitresInArticle(titreArticle, paragrapheKeyWordList);

      expect(result).toBeDefined();
      expect(result.userRole.content).toContain(titreArticle);
    });
  });

  describe('getPromptGenericSelectBestImageForChapitresInArticleWithVision', () => {
    it('should return correct structure for image selection', () => {
      const article = 'Test article content';
      const images = ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'];

      const result = service.getPromptGenericSelectBestImageForChapitresInArticleWithVision(article, images);

      expect(result).toBeDefined();
      expect(result.systemRole).toBeDefined();
      expect(result.userRole).toBeDefined();
      expect(result.systemRole.role).toBe('system');
      expect(result.userRole.role).toBe('user');
      expect(result.systemRole.content).toContain('gardening');
      expect(result.userRole.content).toContain(article);
      expect(result.userRole.content).toContain('image1.jpg');
      expect(result.userRole.content).toContain('image2.jpg');
    });

    it('should handle empty images array', () => {
      const article = 'Test article content';
      const images: string[] = [];

      const result = service.getPromptGenericSelectBestImageForChapitresInArticleWithVision(article, images);

      expect(result).toBeDefined();
      expect(result.userRole.content).toContain(article);
      expect(result.userRole.content).toContain('[]');
    });
  });

  describe('getOpenAiPromptImageGenerator', () => {
    it('should return correct prompt for image generation', () => {
      const description = 'Test description';
      const result = service.getOpenAiPromptImageGenerator(description);

      expect(result).toBeDefined();
      expect(result).toContain(description);
      expect(result).toContain('hyper réaliste');
      expect(result).toContain('photographie');
    });
  });

  describe('addInternalLinkInArticle', () => {
    it('should return correct structure for internal link addition', () => {
      const article = 'Test article content';
      const listTitreIdHref = [
        { id: '1', titre: 'Test Title', new_href: 'test-href' }
      ];

      const result = service.addInternalLinkInArticle(article, listTitreIdHref);

      expect(result).toBeDefined();
      expect(result.systemRole).toBeDefined();
      expect(result.userRole).toBeDefined();
      expect(result.systemRole.role).toBe('system');
      expect(result.userRole.role).toBe('user');
      expect(result.systemRole.content).toContain('paragraphe');
      expect(result.userRole.content).toContain(article);
      expect(result.userRole.content).toContain('Test Title');
    });

    it('should handle empty listTitreIdHref', () => {
      const article = 'Test article content';
      const listTitreIdHref: any[] = [];

      const result = service.addInternalLinkInArticle(article, listTitreIdHref);

      expect(result).toBeDefined();
      expect(result.userRole.content).toContain(article);
      expect(result.userRole.content).toContain('[]');
    });
  });

  describe('getPromptAddVegetalInArticle', () => {
    it('should return correct structure for vegetal addition', () => {
      const article = 'Test article content';
      const paragrapheId = 1;

      const result = service.getPromptAddVegetalInArticle(article, paragrapheId);

      expect(result).toBeDefined();
      expect(result.systemRole).toBeDefined();
      expect(result.userRole).toBeDefined();
      expect(result.systemRole.role).toBe('system');
      expect(result.userRole.role).toBe('user');
      expect(result.systemRole.content).toContain('botaniste');
      expect(result.userRole.content).toContain(article);
    });

    it('should handle different paragraphe IDs', () => {
      const article = 'Test article content';
      const paragrapheId = 5;

      const result = service.getPromptAddVegetalInArticle(article, paragrapheId);

      expect(result).toBeDefined();
      expect(result.systemRole.content).toContain('data-paragraphe-id');
    });
  });

  describe('Private methods', () => {
    it('should have getPerplexityPromptSystemSelectKeyWordsFromChapitresInArticle method', () => {
      const result = service.getPerplexityPromptSystemSelectKeyWordsFromChapitresInArticle();
      
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
      expect(result).toContain('Unsplash');
    });

    it('should have getPerplexityPromptUserSelectKeyWordsFromChapitresInArticle method', () => {
      const titreArticle = 'Test title';
      const paragrapheKeyWordList = ['keyword1'];
      
      const result = service.getPerplexityPromptUserSelectKeyWordsFromChapitresInArticle(titreArticle, paragrapheKeyWordList);
      
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
      expect(result).toContain(titreArticle);
      expect(result).toContain('keyword1');
    });

    it('should have getPromptSystemAddInternalLinkInArticle method', () => {
      const newHref = 'test-href';
      
      const result = service.getPromptSystemAddInternalLinkInArticle(newHref);
      
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
      expect(result).toContain('paragraphe');
    });

    it('should have getPromptUserAddInternalLinkInArticle method', () => {
      const article = 'Test article';
      const listTitreIdHref = [{ id: '1', titre: 'Test', new_href: 'test' }];
      
      const result = service.getPromptUserAddInternalLinkInArticle(article, listTitreIdHref);
      
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
      expect(result).toContain(article);
    });
  });
});