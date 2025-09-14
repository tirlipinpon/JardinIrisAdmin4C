import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { of, throwError } from 'rxjs';
import { InfrastructurePerformanceService } from './infrastructure-performance.service';
import { PerformanceService } from './performance.service';
import { Infrastructure } from '../../features/create/components/infrastructure/infrastructure';
import { Post } from '../../features/create/types/post';
import { InternalImageData } from '../../features/create/types/internalImageData';

describe('InfrastructurePerformanceService', () => {
  let service: InfrastructurePerformanceService;
  let mockPerformanceService: jasmine.SpyObj<PerformanceService>;
  let mockInfrastructure: jasmine.SpyObj<Infrastructure>;

  beforeEach(() => {
    const performanceServiceSpy = jasmine.createSpyObj('PerformanceService', ['measure']);
    const infrastructureSpy = jasmine.createSpyObj('Infrastructure', [
      'getNextPostId',
      'getLastPostTitreAndId',
      'setPost',
      'setImageUrl',
      'setVideo',
      'setFaq',
      'internalImage',
      'setInternalLink',
      'vegetal',
      'savePostComplete',
      'saveFaqItems',
      'saveInternalImages'
    ]);

    TestBed.configureTestingModule({
      providers: [
        InfrastructurePerformanceService,
        provideZonelessChangeDetection(),
        { provide: PerformanceService, useValue: performanceServiceSpy },
        { provide: Infrastructure, useValue: infrastructureSpy }
      ]
    });

    service = TestBed.inject(InfrastructurePerformanceService);
    mockPerformanceService = TestBed.inject(PerformanceService) as jasmine.SpyObj<PerformanceService>;
    mockInfrastructure = TestBed.inject(Infrastructure) as jasmine.SpyObj<Infrastructure>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getNextPostId()', () => {
    it('should call performanceService.measure with correct parameters', () => {
      const mockResult = 123;
      mockInfrastructure.getNextPostId.and.returnValue(of(mockResult));
      mockPerformanceService.measure.and.returnValue(of(mockResult));

      service.getNextPostId();

      expect(mockPerformanceService.measure).toHaveBeenCalledWith(
        'getNextPostId',
        'Database',
        jasmine.any(Function)
      );
    });

    it('should return the result from infrastructure.getNextPostId', (done) => {
      const mockResult = 456;
      mockInfrastructure.getNextPostId.and.returnValue(of(mockResult));
      mockPerformanceService.measure.and.callFake((name, category, operation) => operation());

      service.getNextPostId().subscribe(result => {
        expect(result).toBe(mockResult);
        done();
      });
    });
  });

  describe('getLastPostTitreAndId()', () => {
    it('should call performanceService.measure with correct parameters', () => {
      const mockResult = [{ titre: 'Test', id: 1, new_href: 'test.html' }];
      mockInfrastructure.getLastPostTitreAndId.and.returnValue(of(mockResult));
      mockPerformanceService.measure.and.returnValue(of(mockResult));

      service.getLastPostTitreAndId();

      expect(mockPerformanceService.measure).toHaveBeenCalledWith(
        'getLastPostTitreAndId',
        'Database',
        jasmine.any(Function)
      );
    });

    it('should return the result from infrastructure.getLastPostTitreAndId', (done) => {
      const mockResult = [{ titre: 'Test Title', id: 123, new_href: 'test-title.html' }];
      mockInfrastructure.getLastPostTitreAndId.and.returnValue(of(mockResult));
      mockPerformanceService.measure.and.callFake((name, category, operation) => operation());

      service.getLastPostTitreAndId().subscribe(result => {
        expect(result).toBe(mockResult);
        done();
      });
    });
  });

  describe('setPost()', () => {
    it('should call performanceService.measure with correct parameters', () => {
      const articleIdea = 'Test article idea';
      const mockResult = { id: 1, titre: 'Test' } as Post;
      mockInfrastructure.setPost.and.returnValue(of(mockResult));
      mockPerformanceService.measure.and.returnValue(of(mockResult));

      service.setPost(articleIdea);

      expect(mockPerformanceService.measure).toHaveBeenCalledWith(
        'setPost',
        'API External',
        jasmine.any(Function)
      );
    });

    it('should call infrastructure.setPost with correct parameter', () => {
      const articleIdea = 'Test article idea';
      const mockResult = { id: 1, titre: 'Test' } as Post;
      mockInfrastructure.setPost.and.returnValue(of(mockResult));
      mockPerformanceService.measure.and.callFake((name, category, operation) => operation());

      service.setPost(articleIdea);

      expect(mockInfrastructure.setPost).toHaveBeenCalledWith(articleIdea);
    });
  });

  describe('setImageUrl()', () => {
    it('should call performanceService.measure with correct parameters', () => {
      const phraseAccroche = 'Test phrase';
      const postId = 123;
      const mockResult = 'https://example.com/image.jpg';
      mockInfrastructure.setImageUrl.and.returnValue(of(mockResult));
      mockPerformanceService.measure.and.returnValue(of(mockResult));

      service.setImageUrl(phraseAccroche, postId);

      expect(mockPerformanceService.measure).toHaveBeenCalledWith(
        'setImageUrl',
        'Image Processing',
        jasmine.any(Function)
      );
    });

    it('should call infrastructure.setImageUrl with correct parameters', () => {
      const phraseAccroche = 'Test phrase';
      const postId = 123;
      const mockResult = 'https://example.com/image.jpg';
      mockInfrastructure.setImageUrl.and.returnValue(of(mockResult));
      mockPerformanceService.measure.and.callFake((name, category, operation) => operation());

      service.setImageUrl(phraseAccroche, postId);

      expect(mockInfrastructure.setImageUrl).toHaveBeenCalledWith(phraseAccroche, postId);
    });
  });

  describe('setVideo()', () => {
    it('should call performanceService.measure with correct parameters', () => {
      const phraseAccroche = 'Test phrase';
      const postId = 123;
      const mockResult = 'https://example.com/video.mp4';
      mockInfrastructure.setVideo.and.returnValue(of(mockResult));
      mockPerformanceService.measure.and.returnValue(of(mockResult));

      service.setVideo(phraseAccroche, postId);

      expect(mockPerformanceService.measure).toHaveBeenCalledWith(
        'setVideo',
        'Video Processing',
        jasmine.any(Function)
      );
    });

    it('should call infrastructure.setVideo with correct parameters', () => {
      const phraseAccroche = 'Test phrase';
      const postId = 123;
      const mockResult = 'https://example.com/video.mp4';
      mockInfrastructure.setVideo.and.returnValue(of(mockResult));
      mockPerformanceService.measure.and.callFake((name, category, operation) => operation());

      service.setVideo(phraseAccroche, postId);

      expect(mockInfrastructure.setVideo).toHaveBeenCalledWith(phraseAccroche, postId);
    });
  });

  describe('setFaq()', () => {
    it('should call performanceService.measure with correct parameters', () => {
      const article = 'Test article content';
      const mockResult = [{ question: 'Q?', response: 'A' }];
      mockInfrastructure.setFaq.and.returnValue(of(mockResult));
      mockPerformanceService.measure.and.returnValue(of(mockResult));

      service.setFaq(article);

      expect(mockPerformanceService.measure).toHaveBeenCalledWith(
        'setFaq',
        'Text Processing',
        jasmine.any(Function)
      );
    });

    it('should call infrastructure.setFaq with correct parameter', () => {
      const article = 'Test article content';
      const mockResult = [{ question: 'Q?', response: 'A' }];
      mockInfrastructure.setFaq.and.returnValue(of(mockResult));
      mockPerformanceService.measure.and.callFake((name, category, operation) => operation());

      service.setFaq(article);

      expect(mockInfrastructure.setFaq).toHaveBeenCalledWith(article);
    });
  });

  describe('internalImage()', () => {
    it('should call performanceService.measure with correct parameters', () => {
      const article = 'Test article content';
      const postId = 123;
      const mockResult = { article, images: [] as InternalImageData[] };
      mockInfrastructure.internalImage.and.returnValue(of(mockResult));
      mockPerformanceService.measure.and.returnValue(of(mockResult));

      service.internalImage(article, postId);

      expect(mockPerformanceService.measure).toHaveBeenCalledWith(
        'internalImage',
        'Image Processing',
        jasmine.any(Function)
      );
    });

    it('should call infrastructure.internalImage with correct parameters', () => {
      const article = 'Test article content';
      const postId = 123;
      const mockResult = { article, images: [] as InternalImageData[] };
      mockInfrastructure.internalImage.and.returnValue(of(mockResult));
      mockPerformanceService.measure.and.callFake((name, category, operation) => operation());

      service.internalImage(article, postId);

      expect(mockInfrastructure.internalImage).toHaveBeenCalledWith(article, postId);
    });
  });

  describe('setInternalLink()', () => {
    it('should call performanceService.measure with correct parameters', () => {
      const article = 'Test article content';
      const postTitreAndId = [{ titre: 'Test', id: 1, new_href: 'test.html' }];
      const mockResult = 'Updated article with links';
      mockInfrastructure.setInternalLink.and.returnValue(of(mockResult));
      mockPerformanceService.measure.and.returnValue(of(mockResult));

      service.setInternalLink(article, postTitreAndId);

      expect(mockPerformanceService.measure).toHaveBeenCalledWith(
        'setInternalLink',
        'Text Processing',
        jasmine.any(Function)
      );
    });

    it('should call infrastructure.setInternalLink with correct parameters', () => {
      const article = 'Test article content';
      const postTitreAndId = [{ titre: 'Test', id: 1, new_href: 'test.html' }];
      const mockResult = 'Updated article with links';
      mockInfrastructure.setInternalLink.and.returnValue(of(mockResult));
      mockPerformanceService.measure.and.callFake((name, category, operation) => operation());

      service.setInternalLink(article, postTitreAndId);

      expect(mockInfrastructure.setInternalLink).toHaveBeenCalledWith(article, postTitreAndId);
    });
  });

  describe('vegetal()', () => {
    it('should call performanceService.measure with correct parameters', () => {
      const article = 'Test article content';
      const mockResult = 'Article with botanical names';
      mockInfrastructure.vegetal.and.returnValue(of(mockResult));
      mockPerformanceService.measure.and.returnValue(of(mockResult));

      service.vegetal(article);

      expect(mockPerformanceService.measure).toHaveBeenCalledWith(
        'vegetal',
        'Text Processing',
        jasmine.any(Function)
      );
    });

    it('should call infrastructure.vegetal with correct parameter', () => {
      const article = 'Test article content';
      const mockResult = 'Article with botanical names';
      mockInfrastructure.vegetal.and.returnValue(of(mockResult));
      mockPerformanceService.measure.and.callFake((name, category, operation) => operation());

      service.vegetal(article);

      expect(mockInfrastructure.vegetal).toHaveBeenCalledWith(article);
    });
  });

  describe('savePostComplete()', () => {
    it('should call performanceService.measure with correct parameters', () => {
      const post = { id: 1, titre: 'Test' } as Post;
      const mockResult = true;
      mockInfrastructure.savePostComplete.and.returnValue(of(mockResult));
      mockPerformanceService.measure.and.returnValue(of(mockResult));

      service.savePostComplete(post);

      expect(mockPerformanceService.measure).toHaveBeenCalledWith(
        'savePostComplete',
        'Database',
        jasmine.any(Function)
      );
    });

    it('should call infrastructure.savePostComplete with correct parameter', () => {
      const post = { id: 1, titre: 'Test' } as Post;
      const mockResult = true;
      mockInfrastructure.savePostComplete.and.returnValue(of(mockResult));
      mockPerformanceService.measure.and.callFake((name, category, operation) => operation());

      service.savePostComplete(post);

      expect(mockInfrastructure.savePostComplete).toHaveBeenCalledWith(post);
    });
  });

  describe('saveFaqItems()', () => {
    it('should call performanceService.measure with correct parameters', () => {
      const postId = 123;
      const faqItems = [{ question: 'Q?', response: 'A' }];
      const mockResult = true;
      mockInfrastructure.saveFaqItems.and.returnValue(of(mockResult));
      mockPerformanceService.measure.and.returnValue(of(mockResult));

      service.saveFaqItems(postId, faqItems);

      expect(mockPerformanceService.measure).toHaveBeenCalledWith(
        'saveFaqItems',
        'Database',
        jasmine.any(Function)
      );
    });

    it('should call infrastructure.saveFaqItems with correct parameters', () => {
      const postId = 123;
      const faqItems = [{ question: 'Q?', response: 'A' }];
      const mockResult = true;
      mockInfrastructure.saveFaqItems.and.returnValue(of(mockResult));
      mockPerformanceService.measure.and.callFake((name, category, operation) => operation());

      service.saveFaqItems(postId, faqItems);

      expect(mockInfrastructure.saveFaqItems).toHaveBeenCalledWith(postId, faqItems);
    });
  });

  describe('saveInternalImages()', () => {
    it('should call performanceService.measure with correct parameters', () => {
      const postId = 123;
      const images = [{ chapitre_id: 1, chapitre_key_word: 'test', url_Image: 'url', explanation_word: 'test' }] as InternalImageData[];
      const mockResult = true;
      mockInfrastructure.saveInternalImages.and.returnValue(of(mockResult));
      mockPerformanceService.measure.and.returnValue(of(mockResult));

      service.saveInternalImages(postId, images);

      expect(mockPerformanceService.measure).toHaveBeenCalledWith(
        'saveInternalImages',
        'Database',
        jasmine.any(Function)
      );
    });

    it('should call infrastructure.saveInternalImages with correct parameters', () => {
      const postId = 123;
      const images = [{ chapitre_id: 1, chapitre_key_word: 'test', url_Image: 'url', explanation_word: 'test' }] as InternalImageData[];
      const mockResult = true;
      mockInfrastructure.saveInternalImages.and.returnValue(of(mockResult));
      mockPerformanceService.measure.and.callFake((name, category, operation) => operation());

      service.saveInternalImages(postId, images);

      expect(mockInfrastructure.saveInternalImages).toHaveBeenCalledWith(postId, images);
    });
  });

  describe('Error handling', () => {
    it('should propagate errors from infrastructure methods', (done) => {
      const error = new Error('Test error');
      mockInfrastructure.getNextPostId.and.returnValue(throwError(() => error));
      mockPerformanceService.measure.and.callFake((name, category, operation) => operation());

      service.getNextPostId().subscribe({
        error: (err) => {
          expect(err).toBe(error);
          done();
        }
      });
    });

    it('should handle performance measurement errors', (done) => {
      const error = new Error('Performance error');
      mockInfrastructure.getNextPostId.and.returnValue(of(123));
      mockPerformanceService.measure.and.throwError(error);

      expect(() => service.getNextPostId()).toThrow(error);
      done();
    });
  });

  describe('Integration tests', () => {
    it('should work with multiple consecutive calls', () => {
      const mockPostId = 123;
      const mockPostTitreAndId = [{ titre: 'Test', id: 1, new_href: 'test.html' }];
      
      mockInfrastructure.getNextPostId.and.returnValue(of(mockPostId));
      mockInfrastructure.getLastPostTitreAndId.and.returnValue(of(mockPostTitreAndId));
      mockPerformanceService.measure.and.callFake((name, category, operation) => operation());

      service.getNextPostId();
      service.getLastPostTitreAndId();

      expect(mockPerformanceService.measure).toHaveBeenCalledTimes(2);
      expect(mockInfrastructure.getNextPostId).toHaveBeenCalled();
      expect(mockInfrastructure.getLastPostTitreAndId).toHaveBeenCalled();
    });

    it('should maintain correct category mapping for all methods', () => {
      const categories = {
        'getNextPostId': 'Database',
        'getLastPostTitreAndId': 'Database',
        'setPost': 'API External',
        'setImageUrl': 'Image Processing',
        'setVideo': 'Video Processing',
        'setFaq': 'Text Processing',
        'internalImage': 'Image Processing',
        'setInternalLink': 'Text Processing',
        'vegetal': 'Text Processing',
        'savePostComplete': 'Database',
        'saveFaqItems': 'Database',
        'saveInternalImages': 'Database'
      };

      // Mock all infrastructure methods
      Object.keys(categories).forEach(method => {
        (mockInfrastructure as any)[method].and.returnValue(of({}));
      });
      mockPerformanceService.measure.and.returnValue(of({}));

      // Call all service methods
      service.getNextPostId();
      service.getLastPostTitreAndId();
      service.setPost('test');
      service.setImageUrl('test', 1);
      service.setVideo('test', 1);
      service.setFaq('test');
      service.internalImage('test', 1);
      service.setInternalLink('test', []);
      service.vegetal('test');
      service.savePostComplete({} as Post);
      service.saveFaqItems(1, []);
      service.saveInternalImages(1, []);

      // Verify category mapping
      Object.entries(categories).forEach(([method, category]) => {
        expect(mockPerformanceService.measure).toHaveBeenCalledWith(
          method,
          category,
          jasmine.any(Function)
        );
      });
    });
  });
});
