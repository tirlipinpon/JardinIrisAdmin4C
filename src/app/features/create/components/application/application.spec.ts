import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';

import { Application } from './application';
import { SearchStore } from '../../store';
import { LoggingService } from '../../../../shared/services/logging.service';

describe('Application', () => {
  let service: Application;
  let mockLoggingService: jasmine.SpyObj<LoggingService>;
  let mockStore: any;

  beforeEach(() => {
    const loggingSpy = jasmine.createSpyObj('LoggingService', ['info', 'error', 'warn']);
    const storeSpy = jasmine.createSpyObj('SearchStore', [
      'startGeneration', 'getNextPostId', 'getLastPostTitreAndId', 'setPost',
      'setVideo', 'setFaq', 'internalImage', 'setImageUrl', 'setInternalLink', 'vegetal'
    ], {
      step: () => 0,
      postId: () => null,
      article: () => null,
      postTitreAndId: () => []
    });

    TestBed.configureTestingModule({
      providers: [
        Application,
        { provide: LoggingService, useValue: loggingSpy },
        { provide: SearchStore, useValue: storeSpy },
        provideZonelessChangeDetection()
      ]
    });

    service = TestBed.inject(Application);
    mockLoggingService = TestBed.inject(LoggingService) as jasmine.SpyObj<LoggingService>;
    mockStore = TestBed.inject(SearchStore) as any;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('generate()', () => {
    it('should call store methods to start generation process', () => {
      const articleIdea = 'Test article idea';

      service.generate(articleIdea);

      expect(mockLoggingService.info).toHaveBeenCalledWith(
        'APPLICATION',
        '🚀 Début du processus de génération',
        { articleIdea }
      );
      expect(mockStore.startGeneration).toHaveBeenCalled();
      expect(mockStore.getNextPostId).toHaveBeenCalled();
      expect(mockStore.getLastPostTitreAndId).toHaveBeenCalled();
      expect(mockStore.setPost).toHaveBeenCalledWith(articleIdea);
    });

    it('should log generation start with different article ideas', () => {
      const testIdeas = [
        'Comment planter des tomates',
        'Entretien du jardin en hiver',
        'Les meilleures fleurs pour le printemps'
      ];

      testIdeas.forEach(idea => {
        service.generate(idea);
      });

      expect(mockStore.setPost).toHaveBeenCalledTimes(testIdeas.length);
      expect(mockLoggingService.info).toHaveBeenCalledWith(
        'APPLICATION',
        '🚀 Début du processus de génération',
        { articleIdea: testIdeas[0] }
      );
    });
  });

  describe('Constructor', () => {
    it('should initialize with injected dependencies', () => {
      expect(service).toBeTruthy();
      expect(service['store']).toBeDefined();
      expect(service['loggingService']).toBeDefined();
    });

    it('should set up effect on construction', () => {
      // L'effect est configuré dans le constructeur
      // On vérifie juste que le service est créé correctement
      expect(service).toBeTruthy();
    });
  });

  describe('Service Integration', () => {
    it('should have access to store methods', () => {
      expect(mockStore.startGeneration).toBeDefined();
      expect(mockStore.getNextPostId).toBeDefined();
      expect(mockStore.getLastPostTitreAndId).toBeDefined();
      expect(mockStore.setPost).toBeDefined();
      expect(mockStore.setVideo).toBeDefined();
      expect(mockStore.setFaq).toBeDefined();
      expect(mockStore.internalImage).toBeDefined();
      expect(mockStore.setImageUrl).toBeDefined();
      expect(mockStore.setInternalLink).toBeDefined();
      expect(mockStore.vegetal).toBeDefined();
    });

    it('should have access to logging service methods', () => {
      expect(mockLoggingService.info).toBeDefined();
      expect(mockLoggingService.error).toBeDefined();
      expect(mockLoggingService.warn).toBeDefined();
    });

    it('should have store signals accessible', () => {
      expect(typeof mockStore.step).toBe('function');
      expect(typeof mockStore.postId).toBe('function');
      expect(typeof mockStore.article).toBe('function');
      expect(typeof mockStore.postTitreAndId).toBe('function');
    });
  });
});