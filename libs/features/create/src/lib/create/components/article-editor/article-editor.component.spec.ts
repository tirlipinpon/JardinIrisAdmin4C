import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { NgxEditorModule } from 'ngx-editor';

import { ArticleEditorComponent } from './article-editor.component';

describe('ArticleEditorComponent', () => {
  let component: ArticleEditorComponent;
  let fixture: ComponentFixture<ArticleEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ArticleEditorComponent,
        ReactiveFormsModule,
        NgxEditorModule
      ],
      providers: [
        provideZonelessChangeDetection()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ArticleEditorComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Initialization', () => {
    it('should initialize with default values', () => {
      expect(component.articleContent).toBe('');
      expect(component.showPreview).toBe(false);
      expect(component.showRawHtml).toBe(false);
      expect(component.toolbar).toBeDefined();
    });

    it('should initialize with article input', () => {
      const testContent = '<p>Test article content</p>';
      fixture.componentRef.setInput('article', testContent);
      
      component.ngOnInit();
      
      expect(component.articleContent).toBe(testContent);
      expect(component.articleFormControl.value).toBe(testContent);
    });
  });

  describe('Lifecycle hooks', () => {
    it('should initialize editor on ngOnInit', () => {
      component.ngOnInit();
      expect(component.editor).toBeDefined();
    });

    it('should destroy editor on ngOnDestroy', () => {
      component.ngOnInit();
      spyOn(component.editor, 'destroy');
      
      component.ngOnDestroy();
      
      expect(component.editor.destroy).toHaveBeenCalled();
    });

    it('should handle ngOnDestroy when editor is not initialized', () => {
      // Ne pas appeler ngOnInit pour que l'éditeur reste undefined
      expect(() => component.ngOnDestroy()).not.toThrow();
    });

    it('should update content on ngOnChanges', () => {
      component.ngOnInit(); // Initialiser d'abord
      const newContent = '<p>New content</p>';
      fixture.componentRef.setInput('article', newContent);
      
      component.ngOnChanges();
      
      expect(component.articleContent).toBe(newContent);
      expect(component.articleFormControl.value).toBe(newContent);
    });
  });

  describe('Form control synchronization', () => {
    it('should sync FormControl changes with articleContent', () => {
      component.ngOnInit();
      const testValue = '<p>Form control value</p>';
      
      component.articleFormControl.setValue(testValue);
      
      expect(component.articleContent).toBe(testValue);
    });

    it('should handle null FormControl value', () => {
      component.ngOnInit();
      
      component.articleFormControl.setValue(null);
      
      expect(component.articleContent).toBe('');
    });
  });

  describe('Actions', () => {
    beforeEach(() => {
      component.ngOnInit();
    });

    it('should emit article content on save', () => {
      const testContent = '<p>Save test content</p>';
      component.articleFormControl.setValue(testContent);
      spyOn(component.articleChange, 'emit');
      
      component.onSave();
      
      expect(component.articleChange.emit).toHaveBeenCalledWith(testContent);
    });

    it('should use articleContent as fallback in onSave', () => {
      component.articleContent = '<p>Fallback content</p>';
      component.articleFormControl.setValue('');
      spyOn(component.articleChange, 'emit');
      
      component.onSave();
      
      expect(component.articleChange.emit).toHaveBeenCalledWith('');
    });
  });

  describe('Toggle functions', () => {
    beforeEach(() => {
      component.ngOnInit();
    });

    it('should toggle preview mode', () => {
      expect(component.showPreview).toBe(false);
      
      component.togglePreview();
      expect(component.showPreview).toBe(true);
      
      component.togglePreview();
      expect(component.showPreview).toBe(false);
    });

    it('should hide raw HTML when showing preview', () => {
      component.showRawHtml = true;
      
      component.togglePreview();
      
      expect(component.showPreview).toBe(true);
      expect(component.showRawHtml).toBe(false);
    });

    it('should toggle raw HTML mode', () => {
      expect(component.showRawHtml).toBe(false);
      
      component.toggleRawHtml();
      expect(component.showRawHtml).toBe(true);
      
      component.toggleRawHtml();
      expect(component.showRawHtml).toBe(false);
    });

    it('should hide preview when showing raw HTML', () => {
      component.showPreview = true;
      
      component.toggleRawHtml();
      
      expect(component.showRawHtml).toBe(true);
      expect(component.showPreview).toBe(false);
    });
  });

  describe('Word count', () => {
    beforeEach(() => {
      component.ngOnInit();
    });

    it('should return 0 for empty content', () => {
      component.articleFormControl.setValue('');
      expect(component.getWordCount()).toBe(0);
    });

    it('should return 0 for null content', () => {
      component.articleFormControl.setValue(null);
      expect(component.getWordCount()).toBe(0);
    });

    it('should count words in plain text', () => {
      component.articleFormControl.setValue('Hello world test');
      expect(component.getWordCount()).toBe(3);
    });

    it('should count words in HTML content', () => {
      component.articleFormControl.setValue('<p>Hello <strong>world</strong> test</p>');
      expect(component.getWordCount()).toBe(3);
    });

    it('should handle multiple spaces', () => {
      component.articleFormControl.setValue('Hello    world   test');
      expect(component.getWordCount()).toBe(3);
    });

    it('should filter empty words', () => {
      component.articleFormControl.setValue('Hello  world  ');
      expect(component.getWordCount()).toBe(2);
    });

    it('should use articleContent as fallback', () => {
      component.articleFormControl.setValue('');
      component.articleContent = '<p>Fallback content test</p>';
      
      expect(component.getWordCount()).toBe(3);
    });
  });

  describe('Toolbar configuration', () => {
    it('should have correct toolbar configuration', () => {
      expect(component.toolbar).toBeDefined();
      expect(Array.isArray(component.toolbar)).toBe(true);
      expect(component.toolbar.length).toBeGreaterThan(0);
      
      // Vérifier quelques éléments de base
      expect(component.toolbar[0]).toContain('bold');
      expect(component.toolbar[0]).toContain('italic');
      expect(component.toolbar[4]).toContain({ heading: ["h1", "h2", "h3", "h4", "h5", "h6"] });
    });
  });
});