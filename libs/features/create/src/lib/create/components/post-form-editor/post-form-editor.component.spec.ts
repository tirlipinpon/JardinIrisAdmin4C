import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDividerModule } from '@angular/material/divider';
import { DomSanitizer } from '@angular/platform-browser';

import { PostFormEditorComponent } from './post-form-editor.component';
import { SearchStore } from '../../store';
import { LoggingService } from '@jardin-iris/core/data-access';

describe('PostFormEditorComponent', () => {
  let component: PostFormEditorComponent;
  let fixture: ComponentFixture<PostFormEditorComponent>;
  let mockStore: jasmine.SpyObj<any>;
  let mockLoggingService: jasmine.SpyObj<LoggingService>;
  let mockSanitizer: jasmine.SpyObj<DomSanitizer>;

  beforeEach(async () => {
    const storeSpy = jasmine.createSpyObj('SearchStore', [
      'updateTitre', 'updateDescriptionMeteo', 'updatePhraseAccroche', 
      'updateNewHref', 'updateCitation', 'updateCategorie', 'updateVideo',
      'updateFaqItem', 'deleteFaqItem', 'addFaqItem', 'updateInternalImages',
      'titre', 'description_meteo', 'phrase_accroche', 'new_href', 
      'citation', 'categorie', 'video', 'faq', 'internalImages'
    ]);

    const loggingSpy = jasmine.createSpyObj('LoggingService', ['info', 'error', 'warn']);
    const sanitizerSpy = jasmine.createSpyObj('DomSanitizer', ['bypassSecurityTrustResourceUrl']);

    // Mock des signaux avec des spies
    storeSpy.titre = jasmine.createSpy().and.returnValue('');
    storeSpy.description_meteo = jasmine.createSpy().and.returnValue('');
    storeSpy.phrase_accroche = jasmine.createSpy().and.returnValue('');
    storeSpy.new_href = jasmine.createSpy().and.returnValue('');
    storeSpy.citation = jasmine.createSpy().and.returnValue('');
    storeSpy.categorie = jasmine.createSpy().and.returnValue('');
    storeSpy.video = jasmine.createSpy().and.returnValue('');
    storeSpy.faq = jasmine.createSpy().and.returnValue([]);
    storeSpy.internalImages = jasmine.createSpy().and.returnValue([]);

    await TestBed.configureTestingModule({
      imports: [
        PostFormEditorComponent,
        ReactiveFormsModule,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatButtonModule,
        MatIconModule,
        MatExpansionModule,
        MatDividerModule
      ],
      providers: [
        FormBuilder,
        { provide: SearchStore, useValue: storeSpy },
        { provide: LoggingService, useValue: loggingSpy },
        { provide: DomSanitizer, useValue: sanitizerSpy },
        provideZonelessChangeDetection()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PostFormEditorComponent);
    component = fixture.componentInstance;
    mockStore = TestBed.inject(SearchStore) as jasmine.SpyObj<any>;
    mockLoggingService = TestBed.inject(LoggingService) as jasmine.SpyObj<LoggingService>;
    mockSanitizer = TestBed.inject(DomSanitizer) as jasmine.SpyObj<DomSanitizer>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Initialization', () => {
    it('should initialize with default values', () => {
      expect(component.videoUrl).toBe('');
      expect(component.originalVideoUrl).toBe('');
      expect(component.videoLoading).toBe(false);
      expect(component.videoError).toBe(false);
      expect(component.usePreviewMode).toBe(true);
    });

    it('should initialize form on ngOnInit', () => {
      component.ngOnInit();
      expect(component.postForm).toBeDefined();
      expect(component.postForm.get('titre')).toBeTruthy();
      expect(component.postForm.get('description_meteo')).toBeTruthy();
      expect(component.postForm.get('phrase_accroche')).toBeTruthy();
      expect(component.postForm.get('new_href')).toBeTruthy();
      expect(component.postForm.get('citation')).toBeTruthy();
      expect(component.postForm.get('categorie')).toBeTruthy();
    });

    it('should load data from store on initialization', () => {
      mockStore.titre.and.returnValue('Test Title');
      mockStore.description_meteo.and.returnValue('Test Weather');
      mockStore.video.and.returnValue('https://youtube.com/watch?v=test123');

      component.ngOnInit();

      expect(component.postForm.get('titre')?.value).toBe('Test Title');
      expect(component.postForm.get('description_meteo')?.value).toBe('Test Weather');
      expect(component.videoUrl).toBe('https://youtube.com/watch?v=test123');
      expect(component.originalVideoUrl).toBe('https://youtube.com/watch?v=test123');
    });

    it('should initialize categories correctly', () => {
      component.ngOnInit();
      expect(component.categories).toBeDefined();
      expect(component.categories.length).toBeGreaterThan(0);
      expect(component.categories[0].value).toBeDefined();
      expect(component.categories[0].label).toBeDefined();
    });
  });

  describe('Dirty field checks', () => {
    beforeEach(() => {
      component.ngOnInit();
    });

    it('should check if titre is dirty', () => {
      component.postForm.get('titre')?.setValue('New Title');
      component.postForm.get('titre')?.markAsDirty();
      expect(component.isTitreDirty()).toBe(true);
    });

    it('should check if description_meteo is dirty', () => {
      component.postForm.get('description_meteo')?.setValue('New Weather');
      component.postForm.get('description_meteo')?.markAsDirty();
      expect(component.isDescriptionMeteoDirty()).toBe(true);
    });

    it('should check if phrase_accroche is dirty', () => {
      component.postForm.get('phrase_accroche')?.setValue('New Hook');
      component.postForm.get('phrase_accroche')?.markAsDirty();
      expect(component.isPhraseAccrocheDirty()).toBe(true);
    });

    it('should check if new_href is dirty', () => {
      component.postForm.get('new_href')?.setValue('New Link');
      component.postForm.get('new_href')?.markAsDirty();
      expect(component.isNewHrefDirty()).toBe(true);
    });

    it('should check if citation is dirty', () => {
      component.postForm.get('citation')?.setValue('New Citation');
      component.postForm.get('citation')?.markAsDirty();
      expect(component.isCitationDirty()).toBe(true);
    });

    it('should check if categorie is dirty', () => {
      component.postForm.get('categorie')?.setValue('New Category');
      component.postForm.get('categorie')?.markAsDirty();
      expect(component.isCategorieDirty()).toBe(true);
    });

    it('should return false for non-dirty fields', () => {
      expect(component.isTitreDirty()).toBe(false);
      expect(component.isDescriptionMeteoDirty()).toBe(false);
      expect(component.isPhraseAccrocheDirty()).toBe(false);
      expect(component.isNewHrefDirty()).toBe(false);
      expect(component.isCitationDirty()).toBe(false);
      expect(component.isCategorieDirty()).toBe(false);
    });
  });

  describe('Field saving', () => {
    beforeEach(() => {
      component.ngOnInit();
    });

    it('should save titre field', () => {
      component.postForm.get('titre')?.setValue('New Title');
      component.saveField('titre');
      
      expect(mockStore.updateTitre).toHaveBeenCalledWith('New Title');
      expect(mockLoggingService.info).toHaveBeenCalledWith('POST_FORM_EDITOR', '💾 Sauvegarde du champ titre', { value: 'New Title' });
    });

    it('should save description_meteo field', () => {
      component.postForm.get('description_meteo')?.setValue('New Weather');
      component.saveField('description_meteo');
      
      expect(mockStore.updateDescriptionMeteo).toHaveBeenCalledWith('New Weather');
      expect(mockLoggingService.info).toHaveBeenCalledWith('POST_FORM_EDITOR', '💾 Sauvegarde du champ description_meteo', { value: 'New Weather' });
    });

    it('should save phrase_accroche field', () => {
      component.postForm.get('phrase_accroche')?.setValue('New Hook');
      component.saveField('phrase_accroche');
      
      expect(mockStore.updatePhraseAccroche).toHaveBeenCalledWith('New Hook');
      expect(mockLoggingService.info).toHaveBeenCalledWith('POST_FORM_EDITOR', '💾 Sauvegarde du champ phrase_accroche', { value: 'New Hook' });
    });

    it('should save new_href field', () => {
      component.postForm.get('new_href')?.setValue('New Link');
      component.saveField('new_href');
      
      expect(mockStore.updateNewHref).toHaveBeenCalledWith('New Link');
      expect(mockLoggingService.info).toHaveBeenCalledWith('POST_FORM_EDITOR', '💾 Sauvegarde du champ new_href', { value: 'New Link' });
    });

    it('should save citation field', () => {
      component.postForm.get('citation')?.setValue('New Citation');
      component.saveField('citation');
      
      expect(mockStore.updateCitation).toHaveBeenCalledWith('New Citation');
      expect(mockLoggingService.info).toHaveBeenCalledWith('POST_FORM_EDITOR', '💾 Sauvegarde du champ citation', { value: 'New Citation' });
    });

    it('should save categorie field', () => {
      component.postForm.get('categorie')?.setValue('New Category');
      component.saveField('categorie');
      
      expect(mockStore.updateCategorie).toHaveBeenCalledWith('New Category');
      expect(mockLoggingService.info).toHaveBeenCalledWith('POST_FORM_EDITOR', '💾 Sauvegarde du champ categorie', { value: 'New Category' });
    });

    it('should mark field as pristine after save', () => {
      component.postForm.get('titre')?.setValue('New Title');
      component.postForm.get('titre')?.markAsDirty();
      spyOn(component.postForm.get('titre')!, 'markAsPristine');
      
      component.saveField('titre');
      
      expect(component.postForm.get('titre')?.markAsPristine).toHaveBeenCalled();
    });
  });

  describe('Video URL handling', () => {
    beforeEach(() => {
      component.ngOnInit();
    });

    it('should check if video URL is dirty', () => {
      component.originalVideoUrl = 'original-url';
      component.videoUrl = 'new-url';
      expect(component.isVideoUrlDirty()).toBe(true);
    });

    it('should return false when video URL is not dirty', () => {
      component.originalVideoUrl = 'same-url';
      component.videoUrl = 'same-url';
      expect(component.isVideoUrlDirty()).toBe(false);
    });

    it('should save video URL when dirty', () => {
      component.videoUrl = 'new-video-url';
      component.originalVideoUrl = 'old-video-url';
      
      component.saveVideoUrl();
      
      expect(mockStore.updateVideo).toHaveBeenCalledWith('new-video-url');
      expect(component.originalVideoUrl).toBe('new-video-url');
      expect(mockLoggingService.info).toHaveBeenCalledWith('POST_FORM_EDITOR', '🎥 Sauvegarde URL vidéo', { videoUrl: 'new-video-url' });
    });

    it('should not save video URL when not dirty', () => {
      component.videoUrl = 'same-url';
      component.originalVideoUrl = 'same-url';
      
      component.saveVideoUrl();
      
      expect(mockStore.updateVideo).not.toHaveBeenCalled();
    });

    it('should remove video', () => {
      component.videoUrl = 'test-url';
      component.originalVideoUrl = 'test-url';
      component.videoLoading = true;
      component.videoError = true;
      
      component.removeVideo();
      
      expect(component.videoUrl).toBe('');
      expect(component.originalVideoUrl).toBe('');
      expect(component.videoLoading).toBe(false);
      expect(component.videoError).toBe(false);
      expect(mockStore.updateVideo).toHaveBeenCalledWith('');
      expect(mockLoggingService.info).toHaveBeenCalledWith('POST_FORM_EDITOR', '🗑️ Suppression de la vidéo');
    });
  });

  describe('Video events', () => {
    beforeEach(() => {
      component.ngOnInit();
    });

    it('should handle video load success', () => {
      component.videoLoading = true;
      component.videoError = true;
      
      component.onVideoLoad();
      
      expect(component.videoLoading).toBe(false);
      expect(component.videoError).toBe(false);
      expect(mockLoggingService.info).toHaveBeenCalledWith('POST_FORM_EDITOR', '✅ Vidéo chargée avec succès');
    });

    it('should handle video error', () => {
      component.videoLoading = true;
      component.videoError = false;
      
      component.onVideoError();
      
      expect(component.videoLoading).toBe(false);
      expect(component.videoError).toBe(true);
      expect(mockLoggingService.error).toHaveBeenCalledWith('POST_FORM_EDITOR', '❌ Erreur lors du chargement de la vidéo');
    });

    it('should retry video', () => {
      component.videoError = true;
      component.videoLoading = false;
      spyOn(component as any, 'startVideoLoadTimeout');
      
      component.retryVideo();
      
      expect(component.videoLoading).toBe(true);
      expect(component.videoError).toBe(false);
      expect(mockLoggingService.info).toHaveBeenCalledWith('POST_FORM_EDITOR', '🔄 Nouvelle tentative de chargement de la vidéo');
      expect((component as any).startVideoLoadTimeout).toHaveBeenCalled();
    });

    it('should force stop loading', () => {
      component.videoLoading = true;
      component.videoError = true;
      
      component.forceStopLoading();
      
      expect(component.videoLoading).toBe(false);
      expect(component.videoError).toBe(false);
      expect(mockLoggingService.info).toHaveBeenCalledWith('POST_FORM_EDITOR', '🛑 Arrêt forcé du chargement de la vidéo');
    });

    it('should toggle video mode', () => {
      component.usePreviewMode = true;
      component.videoLoading = true;
      component.videoError = true;
      
      component.toggleVideoMode();
      
      expect(component.usePreviewMode).toBe(false);
      expect(component.videoLoading).toBe(false);
      expect(component.videoError).toBe(false);
      expect(mockLoggingService.info).toHaveBeenCalledWith('POST_FORM_EDITOR', '🔄 Basculement vers le mode Lecteur');
    });
  });

  describe('YouTube utilities', () => {
    beforeEach(() => {
      component.ngOnInit();
    });

    it('should extract video ID from YouTube URL', () => {
      const testUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
      const videoId = component.extractVideoId(testUrl);
      expect(videoId).toBe('dQw4w9WgXcQ');
    });

    it('should extract video ID from youtu.be URL', () => {
      const testUrl = 'https://youtu.be/dQw4w9WgXcQ';
      const videoId = component.extractVideoId(testUrl);
      expect(videoId).toBe('dQw4w9WgXcQ');
    });

    it('should return empty string for invalid URL', () => {
      const testUrl = 'https://invalid-url.com';
      const videoId = component.extractVideoId(testUrl);
      expect(videoId).toBe('');
    });

    it('should get YouTube embed URL', () => {
      const videoId = 'test123';
      const mockSafeUrl = 'safe-url';
      mockSanitizer.bypassSecurityTrustResourceUrl.and.returnValue(mockSafeUrl as any);
      
      const result = component.getYouTubeEmbedUrl(videoId);
      
      expect(result).toBe(mockSafeUrl);
      expect(mockSanitizer.bypassSecurityTrustResourceUrl).toHaveBeenCalledWith(
        jasmine.stringMatching(new RegExp(`https://www.youtube.com/embed/${videoId}\\?`))
      );
    });

    it('should get YouTube thumbnail URL', () => {
      const videoId = 'test123';
      const result = component.getYouTubeThumbnailUrl(videoId);
      expect(result).toBe(`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`);
    });

    it('should get YouTube watch URL', () => {
      const videoId = 'test123';
      const result = component.getYouTubeWatchUrl(videoId);
      expect(result).toBe(`https://www.youtube.com/watch?v=${videoId}`);
    });

    it('should open video in new tab', () => {
      component.videoUrl = 'https://www.youtube.com/watch?v=test123';
      spyOn(window, 'open');
      spyOn(component, 'extractVideoId').and.returnValue('test123');
      spyOn(component, 'getYouTubeWatchUrl').and.returnValue('https://www.youtube.com/watch?v=test123');
      
      component.openVideoInNewTab();
      
      expect(window.open).toHaveBeenCalledWith(
        'https://www.youtube.com/watch?v=test123',
        '_blank',
        'noopener,noreferrer'
      );
      expect(mockLoggingService.info).toHaveBeenCalledWith(
        'POST_FORM_EDITOR',
        '🔗 Ouverture de la vidéo dans un nouvel onglet',
        { watchUrl: 'https://www.youtube.com/watch?v=test123' }
      );
    });

    it('should not open video in new tab if no video ID', () => {
      component.videoUrl = 'invalid-url';
      spyOn(window, 'open');
      
      component.openVideoInNewTab();
      
      expect(window.open).not.toHaveBeenCalled();
    });
  });

  describe('FAQ management', () => {
    beforeEach(() => {
      component.ngOnInit();
    });

    it('should save FAQ item', () => {
      const mockFaqItem = { question: 'Test?', response: 'Test answer' };
      mockStore.faq.and.returnValue([mockFaqItem]);
      
      component.saveFaqItem(0);
      
      expect(mockStore.updateFaqItem).toHaveBeenCalledWith(0, mockFaqItem);
      expect(mockLoggingService.info).toHaveBeenCalledWith('POST_FORM_EDITOR', '💾 Sauvegarde FAQ item 0', mockFaqItem);
    });

    it('should delete FAQ item', () => {
      component.deleteFaqItem(1);
      
      expect(mockStore.deleteFaqItem).toHaveBeenCalledWith(1);
      expect(mockLoggingService.info).toHaveBeenCalledWith('POST_FORM_EDITOR', '🗑️ Suppression FAQ item 1');
    });

    it('should add new FAQ item', () => {
      component.addNewFaqItem();
      
      expect(mockStore.addFaqItem).toHaveBeenCalledWith({ question: 'Nouvelle question', response: 'Nouvelle réponse' });
      expect(mockLoggingService.info).toHaveBeenCalledWith('POST_FORM_EDITOR', '➕ Ajout d\'une nouvelle question FAQ');
    });
  });

  describe('Internal images management', () => {
    beforeEach(() => {
      component.ngOnInit();
    });

    it('should update internal image', () => {
      const mockImages = [{ title: 'Old Title', url: 'old-url' }];
      mockStore.internalImages.and.returnValue(mockImages);
      
      component.updateInternalImage(0, 'title', 'New Title');
      
      expect(mockStore.updateInternalImages).toHaveBeenCalledWith([{ title: 'New Title', url: 'old-url' }]);
      expect(mockLoggingService.info).toHaveBeenCalledWith('POST_FORM_EDITOR', '🖼️ Mise à jour image interne 0', { field: 'title', value: 'New Title' });
    });

    it('should remove internal image', () => {
      const mockImages = [{ title: 'Image 1' }, { title: 'Image 2' }];
      mockStore.internalImages.and.returnValue(mockImages);
      
      component.removeInternalImage(1);
      
      expect(mockStore.updateInternalImages).toHaveBeenCalledWith([{ title: 'Image 1' }]);
      expect(mockLoggingService.info).toHaveBeenCalledWith('POST_FORM_EDITOR', '🗑️ Suppression image interne 1');
    });
  });

  describe('Video load timeout', () => {
    beforeEach(() => {
      component.ngOnInit();
      jasmine.clock().install();
    });

    afterEach(() => {
      jasmine.clock().uninstall();
    });

    it('should timeout video loading after 10 seconds', () => {
      component.videoLoading = true;
      component.videoError = false;
      
      (component as any).startVideoLoadTimeout();
      jasmine.clock().tick(10000);
      
      expect(component.videoLoading).toBe(false);
      expect(component.videoError).toBe(true);
      expect(mockLoggingService.warn).toHaveBeenCalledWith('POST_FORM_EDITOR', '⏰ Timeout du chargement de la vidéo');
    });

    it('should not timeout if video loading is already false', () => {
      component.videoLoading = false;
      component.videoError = false;
      
      (component as any).startVideoLoadTimeout();
      jasmine.clock().tick(10000);
      
      expect(component.videoLoading).toBe(false);
      expect(component.videoError).toBe(false);
      expect(mockLoggingService.warn).not.toHaveBeenCalled();
    });
  });

  describe('Lifecycle hooks', () => {
    it('should handle ngOnDestroy without errors', () => {
      expect(() => component.ngOnDestroy()).not.toThrow();
    });
  });
});
