import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CreateComponent } from './create.component';
import { VersionService } from '../../shared/services/versions/versions.service';
import { LoggingService } from '../../shared/services/logging.service';
import { PerformanceService } from '../../shared/services/performance.service';
import { Application } from './component/application/application';
import { SearchStore } from './store';

describe('CreateComponent', () => {
  let component: CreateComponent;
  let fixture: ComponentFixture<CreateComponent>;
  let versionService: jasmine.SpyObj<VersionService>;
  let loggingService: jasmine.SpyObj<LoggingService>;
  let performanceService: jasmine.SpyObj<PerformanceService>;
  let application: jasmine.SpyObj<Application>;
  let store: any;

  beforeEach(async () => {
    const versionServiceSpy = jasmine.createSpyObj('VersionService', ['logToConsole']);
    const loggingServiceSpy = jasmine.createSpyObj('LoggingService', ['info']);
    const performanceServiceSpy = jasmine.createSpyObj('PerformanceService', [
      'measure', 
      'logSummary', 
      'getMetrics', 
      'clearMetrics',
      'getStats'
    ]);
    
    const applicationSpy = jasmine.createSpyObj('Application', ['generate']);
    const storeSpy = jasmine.createSpyObj('SearchStore', ['updateArticle', 'clearErrors', 'article', 'image_url', 'updateImageUrl', 'step', 'isGenerating', 'error', 'postId', 'internalImages', 'faq', 'video', 'titre']);
    
    // Configurer les valeurs de retour par défaut
    performanceServiceSpy.getMetrics.and.returnValue([]);
    performanceServiceSpy.getStats.and.returnValue([]);
    storeSpy.article.and.returnValue('');
    storeSpy.image_url.and.returnValue('');
    storeSpy.step.and.returnValue(0);
    storeSpy.isGenerating.and.returnValue(false);
    storeSpy.error.and.returnValue([]);
    storeSpy.postId.and.returnValue('test-post-id');
    storeSpy.internalImages.and.returnValue([]);
    storeSpy.faq.and.returnValue([]);
    storeSpy.video.and.returnValue('');
    storeSpy.titre.and.returnValue('Test Title');

    await TestBed.configureTestingModule({
      imports: [ CreateComponent, HttpClientTestingModule ],
      providers: [ 
        provideZonelessChangeDetection(),
        { provide: VersionService, useValue: versionServiceSpy },
        { provide: LoggingService, useValue: loggingServiceSpy },
        { provide: PerformanceService, useValue: performanceServiceSpy },
        { provide: Application, useValue: applicationSpy },
        { provide: SearchStore, useValue: storeSpy }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateComponent);
    component = fixture.componentInstance;
    versionService = TestBed.inject(VersionService) as jasmine.SpyObj<VersionService>;
    loggingService = TestBed.inject(LoggingService) as jasmine.SpyObj<LoggingService>;
    performanceService = TestBed.inject(PerformanceService) as jasmine.SpyObj<PerformanceService>;
    application = TestBed.inject(Application) as jasmine.SpyObj<Application>;
    store = TestBed.inject(SearchStore);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Constructor', () => {
    it('should call versionService.logToConsole() on initialization', () => {
      // Le constructeur est appelé lors de la création du composant
      expect(versionService.logToConsole).toHaveBeenCalled();
    });

    it('should initialize with default values', () => {
      expect(component.articleIdea).toBe('');
      expect(component.showCompletionDialog).toBeFalse();
      expect(component.showPerformance()).toBeTrue();
      expect(component.showErrors()).toBeTrue();
      expect(component.showGeneration()).toBeTrue();
      expect(component.showStats()).toBeTrue();
      expect(component.showImagePreview()).toBeTrue();
      expect(component.showEditor()).toBeTrue();
      expect(component.showFormEditor()).toBeTrue();
    });
  });

  describe('generate()', () => {
    beforeEach(() => {
      // Reset des spies avant chaque test
      loggingService.info.calls.reset();
      performanceService.measure.calls.reset();
      performanceService.logSummary.calls.reset();
      application.generate.calls.reset();
    });

    it('should log info message when generate is called', () => {
      component.generate();
      
      expect(loggingService.info).toHaveBeenCalledWith('COMPONENT', '🚀 Début appel generate()');
    });

    it('should call performanceService.measure with correct parameters', () => {
      component.generate();
      
      expect(performanceService.measure).toHaveBeenCalledWith(
        'generateArticle',
        'Article Generation',
        jasmine.any(Function)
      );
    });

    it('should call application.generate with articleIdea', () => {
      component.articleIdea = 'Test article idea';
      component.generate();
      
      // Le callback de performanceService.measure doit être exécuté
      const measureCall = performanceService.measure.calls.mostRecent();
      const callback = measureCall.args[2];
      callback(); // Exécuter le callback
      
      expect(application.generate).toHaveBeenCalledWith('Test article idea');
    });

    it('should schedule performanceService.logSummary after 2 seconds', (done) => {
      component.generate();
      
      // Vérifier que logSummary n'est pas encore appelé immédiatement
      expect(performanceService.logSummary).not.toHaveBeenCalled();
      
      // Attendre 2.1 secondes pour que le setTimeout se déclenche
      setTimeout(() => {
        expect(performanceService.logSummary).toHaveBeenCalled();
        done();
      }, 2100);
    });

    it('should handle empty articleIdea', () => {
      component.articleIdea = '';
      component.generate();
      
      // Le callback de performanceService.measure doit être exécuté
      const measureCall = performanceService.measure.calls.mostRecent();
      const callback = measureCall.args[2];
      callback(); // Exécuter le callback
      
      expect(application.generate).toHaveBeenCalledWith('');
    });
  });

  describe('onArticleIdeaChange()', () => {
    it('should update articleIdea property', () => {
      const testValue = 'Test article idea';
      
      component.onArticleIdeaChange(testValue);
      
      expect(component.articleIdea).toBe(testValue);
    });

    it('should handle empty string', () => {
      component.onArticleIdeaChange('');
      
      expect(component.articleIdea).toBe('');
    });

    it('should handle special characters', () => {
      const specialValue = 'Test with émojis 🚀 and spécial chars';
      
      component.onArticleIdeaChange(specialValue);
      
      expect(component.articleIdea).toBe(specialValue);
    });
  });

  describe('Toggle methods', () => {
    beforeEach(() => {
      // Reset tous les signals à true avant chaque test
      component.showPerformance.set(true);
      component.showErrors.set(true);
      component.showGeneration.set(true);
      component.showStats.set(true);
      component.showImagePreview.set(true);
      component.showEditor.set(true);
      component.showFormEditor.set(true);
    });

    describe('togglePerformance()', () => {
      it('should toggle showPerformance from true to false', () => {
        expect(component.showPerformance()).toBeTrue();
        
        component.togglePerformance();
        
        expect(component.showPerformance()).toBeFalse();
      });

      it('should toggle showPerformance from false to true', () => {
        component.showPerformance.set(false);
        
        component.togglePerformance();
        
        expect(component.showPerformance()).toBeTrue();
      });
    });

    describe('toggleErrors()', () => {
      it('should toggle showErrors from true to false', () => {
        expect(component.showErrors()).toBeTrue();
        
        component.toggleErrors();
        
        expect(component.showErrors()).toBeFalse();
      });

      it('should toggle showErrors from false to true', () => {
        component.showErrors.set(false);
        
        component.toggleErrors();
        
        expect(component.showErrors()).toBeTrue();
      });
    });

    describe('toggleGeneration()', () => {
      it('should toggle showGeneration from true to false', () => {
        expect(component.showGeneration()).toBeTrue();
        
        component.toggleGeneration();
        
        expect(component.showGeneration()).toBeFalse();
      });

      it('should toggle showGeneration from false to true', () => {
        component.showGeneration.set(false);
        
        component.toggleGeneration();
        
        expect(component.showGeneration()).toBeTrue();
      });
    });

    describe('toggleStats()', () => {
      it('should toggle showStats from true to false', () => {
        expect(component.showStats()).toBeTrue();
        
        component.toggleStats();
        
        expect(component.showStats()).toBeFalse();
      });

      it('should toggle showStats from false to true', () => {
        component.showStats.set(false);
        
        component.toggleStats();
        
        expect(component.showStats()).toBeTrue();
      });
    });

    describe('toggleImagePreview()', () => {
      it('should toggle showImagePreview from true to false', () => {
        expect(component.showImagePreview()).toBeTrue();
        
        component.toggleImagePreview();
        
        expect(component.showImagePreview()).toBeFalse();
      });

      it('should toggle showImagePreview from false to true', () => {
        component.showImagePreview.set(false);
        
        component.toggleImagePreview();
        
        expect(component.showImagePreview()).toBeTrue();
      });
    });

    describe('toggleEditor()', () => {
      it('should toggle showEditor from true to false', () => {
        expect(component.showEditor()).toBeTrue();
        
        component.toggleEditor();
        
        expect(component.showEditor()).toBeFalse();
      });

      it('should toggle showEditor from false to true', () => {
        component.showEditor.set(false);
        
        component.toggleEditor();
        
        expect(component.showEditor()).toBeTrue();
      });
    });

    describe('toggleFormEditor()', () => {
      it('should toggle showFormEditor from true to false', () => {
        expect(component.showFormEditor()).toBeTrue();
        
        component.toggleFormEditor();
        
        expect(component.showFormEditor()).toBeFalse();
      });

      it('should toggle showFormEditor from false to true', () => {
        component.showFormEditor.set(false);
        
        component.toggleFormEditor();
        
        expect(component.showFormEditor()).toBeTrue();
      });
    });
  });

  describe('onArticleChange()', () => {
    beforeEach(() => {
      // Reset des spies avant chaque test
      loggingService.info.calls.reset();
    });

    it('should log info message with article length', () => {
      const testArticle = 'Test article content';
      
      component.onArticleChange(testArticle);
      
      expect(loggingService.info).toHaveBeenCalledWith(
        'COMPONENT', 
        '📝 Article modifié dans l\'éditeur', 
        { length: testArticle.length }
      );
    });

    it('should call store.updateArticle with the new article', () => {
      const testArticle = 'New article content';
      
      component.onArticleChange(testArticle);
      
      expect(store.updateArticle).toHaveBeenCalledWith(testArticle);
    });

    it('should handle empty article', () => {
      component.onArticleChange('');
      
      expect(loggingService.info).toHaveBeenCalledWith(
        'COMPONENT', 
        '📝 Article modifié dans l\'éditeur', 
        { length: 0 }
      );
      expect(store.updateArticle).toHaveBeenCalledWith('');
    });

    it('should handle long article', () => {
      const longArticle = 'A'.repeat(1000);
      
      component.onArticleChange(longArticle);
      
      expect(loggingService.info).toHaveBeenCalledWith(
        'COMPONENT', 
        '📝 Article modifié dans l\'éditeur', 
        { length: 1000 }
      );
      expect(store.updateArticle).toHaveBeenCalledWith(longArticle);
    });
  });

  describe('clearErrors()', () => {
    beforeEach(() => {
      // Reset des spies avant chaque test
      loggingService.info.calls.reset();
      store.clearErrors.calls.reset();
    });

    it('should log info message when clearing errors', () => {
      component.clearErrors();
      
      expect(loggingService.info).toHaveBeenCalledWith('COMPONENT', '🧹 Nettoyage des erreurs');
    });

    it('should call store.clearErrors', () => {
      component.clearErrors();
      
      expect(store.clearErrors).toHaveBeenCalled();
    });

    it('should call both logging and store methods', () => {
      component.clearErrors();
      
      expect(loggingService.info).toHaveBeenCalledWith('COMPONENT', '🧹 Nettoyage des erreurs');
      expect(store.clearErrors).toHaveBeenCalled();
    });
  });

  describe('showPerformanceStats()', () => {
    beforeEach(() => {
      // Reset des spies avant chaque test
      loggingService.info.calls.reset();
      performanceService.logSummary.calls.reset();
    });

    it('should log info message when showing performance stats', () => {
      component.showPerformanceStats();
      
      expect(loggingService.info).toHaveBeenCalledWith('COMPONENT', '📊 Affichage des statistiques de performance');
    });

    it('should call performanceService.logSummary', () => {
      component.showPerformanceStats();
      
      expect(performanceService.logSummary).toHaveBeenCalled();
    });

    it('should call both logging and performance methods', () => {
      component.showPerformanceStats();
      
      expect(loggingService.info).toHaveBeenCalledWith('COMPONENT', '📊 Affichage des statistiques de performance');
      expect(performanceService.logSummary).toHaveBeenCalled();
    });
  });

  describe('Utility methods', () => {
    describe('trackByIndex()', () => {
      it('should return the index as trackBy value', () => {
        const result1 = component.trackByIndex(0, 'item1');
        const result2 = component.trackByIndex(5, 'item2');
        const result3 = component.trackByIndex(10, 'item3');
        
        expect(result1).toBe(0);
        expect(result2).toBe(5);
        expect(result3).toBe(10);
      });

      it('should work with different item types', () => {
        expect(component.trackByIndex(0, 'string')).toBe(0);
        expect(component.trackByIndex(1, '123')).toBe(1);
        expect(component.trackByIndex(2, '{}')).toBe(2);
      });
    });

    describe('getArticleStats()', () => {
      beforeEach(() => {
        // Reset and configure store.article() to return test content
        store.article.and.returnValue('<span id="paragraphe-1">Test paragraph 1</span><span id="paragraphe-2">Test paragraph 2</span>');
      });

      it('should return correct character count', () => {
        const stats = component.getArticleStats();
        expect(stats.characters).toBe(94); // Length of the test content
      });

      it('should return correct word count', () => {
        const stats = component.getArticleStats();
        expect(stats.words).toBe(7); // "Test", "paragraph", "1", "Test", "paragraph", "2"
      });

      it('should return correct paragraph count', () => {
        const stats = component.getArticleStats();
        expect(stats.paragraphs).toBe(2); // Two paragraphe spans
      });

      it('should handle empty article', () => {
        store.article.and.returnValue('');
        const stats = component.getArticleStats();
        
        expect(stats.characters).toBe(0);
        expect(stats.words).toBe(0);
        expect(stats.paragraphs).toBe(0);
      });

      it('should handle null article', () => {
        store.article.and.returnValue(null);
        const stats = component.getArticleStats();
        
        expect(stats.characters).toBe(0);
        expect(stats.words).toBe(0);
        expect(stats.paragraphs).toBe(0);
      });
    });

    describe('getBotanicalNamesCount()', () => {
      it('should return correct count of botanical names', () => {
        store.article.and.returnValue('<span class="inat-vegetal">Plant 1</span><span class="inat-vegetal">Plant 2</span><span class="other">Not botanical</span>');
        
        const count = component.getBotanicalNamesCount();
        expect(count).toBe(2);
      });

      it('should return 0 when no botanical names', () => {
        store.article.and.returnValue('<span class="other">Not botanical</span>');
        
        const count = component.getBotanicalNamesCount();
        expect(count).toBe(0);
      });

      it('should handle empty article', () => {
        store.article.and.returnValue('');
        
        const count = component.getBotanicalNamesCount();
        expect(count).toBe(0);
      });
    });

    describe('getInternalLinksStats()', () => {
      it('should return correct link statistics', () => {
        const testHtml = `
          <a class="myTooltip" href="/link1">Link 1</a>
          <a class="myTooltip" href="/link2">Link 2</a>
          <a class="myTooltip" href="/link1">Link 1 duplicate</a>
          <a class="other">Not internal</a>
        `;
        store.article.and.returnValue(testHtml);
        
        const stats = component.getInternalLinksStats();
        
        expect(stats.total).toBe(3);
        expect(stats.unique).toBe(2);
        expect(stats.duplicates).toBe(1);
      });

      it('should handle no internal links', () => {
        store.article.and.returnValue('<a class="other">Not internal</a>');
        
        const stats = component.getInternalLinksStats();
        
        expect(stats.total).toBe(0);
        expect(stats.unique).toBe(0);
        expect(stats.duplicates).toBe(0);
      });

      it('should handle empty article', () => {
        store.article.and.returnValue('');
        
        const stats = component.getInternalLinksStats();
        
        expect(stats.total).toBe(0);
        expect(stats.unique).toBe(0);
        expect(stats.duplicates).toBe(0);
      });
    });
  });
}); 