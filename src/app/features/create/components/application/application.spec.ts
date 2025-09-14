import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { Application } from './application';
import { LoggingService } from '../../../../shared/services/logging.service';

describe('Application', () => {
  let service: Application;
  let mockLoggingService: jasmine.SpyObj<LoggingService>;

  beforeEach(() => {
    const loggingSpy = jasmine.createSpyObj('LoggingService', ['info']);

    TestBed.configureTestingModule({
      providers: [
        Application,
        { provide: LoggingService, useValue: loggingSpy },
        provideZonelessChangeDetection()
      ]
    });

    service = TestBed.inject(Application);
    mockLoggingService = TestBed.inject(LoggingService) as jasmine.SpyObj<LoggingService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should inject dependencies correctly', () => {
    expect(service).toBeDefined();
    expect(mockLoggingService).toBeDefined();
  });

  describe('generate()', () => {
    it('should log generation start', () => {
      const articleIdea = 'Test article idea';
      
      service.generate(articleIdea);
      
      expect(mockLoggingService.info).toHaveBeenCalledWith(
        'APPLICATION',
        '🚀 Début du processus de génération',
        { articleIdea }
      );
    });

    it('should handle empty article idea', () => {
      const articleIdea = '';
      
      service.generate(articleIdea);
      
      expect(mockLoggingService.info).toHaveBeenCalledWith(
        'APPLICATION',
        '🚀 Début du processus de génération',
        { articleIdea: '' }
      );
    });

    it('should handle undefined article idea', () => {
      const articleIdea = undefined as any;
      
      service.generate(articleIdea);
      
      expect(mockLoggingService.info).toHaveBeenCalledWith(
        'APPLICATION',
        '🚀 Début du processus de génération',
        { articleIdea: undefined }
      );
    });

    it('should handle long article idea', () => {
      const articleIdea = 'A'.repeat(1000);
      
      service.generate(articleIdea);
      
      expect(mockLoggingService.info).toHaveBeenCalledWith(
        'APPLICATION',
        '🚀 Début du processus de génération',
        { articleIdea: 'A'.repeat(1000) }
      );
    });

    it('should be called multiple times', () => {
      const articleIdea1 = 'First idea';
      const articleIdea2 = 'Second idea';
      
      service.generate(articleIdea1);
      service.generate(articleIdea2);
      
      expect(mockLoggingService.info).toHaveBeenCalledTimes(2);
    });
  });

  describe('Service Behavior', () => {
    it('should initialize without errors', () => {
      expect(() => new Application()).not.toThrow();
    });

    it('should have logging service available', () => {
      expect(mockLoggingService.info).toBeDefined();
      expect(typeof mockLoggingService.info).toBe('function');
    });

    it('should handle service instantiation', () => {
      const newService = TestBed.inject(Application);
      expect(newService).toBeDefined();
      expect(newService).toBeInstanceOf(Application);
    });
  });
});