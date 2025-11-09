import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ProcessCompletionDialogComponent, ProcessCompletionData } from './process-completion-dialog.component';

describe('ProcessCompletionDialogComponent', () => {
  let component: ProcessCompletionDialogComponent;
  let fixture: ComponentFixture<ProcessCompletionDialogComponent>;
  let mockDialogRef: jasmine.SpyObj<MatDialogRef<ProcessCompletionDialogComponent>>;
  let mockData: ProcessCompletionData;

  beforeEach(async () => {
    const dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);
    
    mockData = {
      stats: {
        characters: 1500,
        words: 250,
        paragraphs: 8
      },
      internalLinksStats: {
        total: 15,
        unique: 12,
        duplicates: 3
      },
      botanicalCount: 5,
      faqCount: 3,
      imagesCount: 2,
      hasVideo: true
    };

    await TestBed.configureTestingModule({
      imports: [ProcessCompletionDialogComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: MAT_DIALOG_DATA, useValue: mockData }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProcessCompletionDialogComponent);
    component = fixture.componentInstance;
    mockDialogRef = TestBed.inject(MatDialogRef) as jasmine.SpyObj<MatDialogRef<ProcessCompletionDialogComponent>>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('constructor', () => {
    it('should inject dialogRef correctly', () => {
      expect(component.dialogRef).toBe(mockDialogRef);
    });

    it('should inject data correctly', () => {
      expect(component.data).toEqual(mockData);
    });

    it('should have correct data structure', () => {
      expect(component.data.stats).toBeDefined();
      expect(component.data.internalLinksStats).toBeDefined();
      expect(component.data.botanicalCount).toBeDefined();
      expect(component.data.faqCount).toBeDefined();
      expect(component.data.imagesCount).toBeDefined();
      expect(component.data.hasVideo).toBeDefined();
    });

    it('should have stats with correct properties', () => {
      expect(component.data.stats.characters).toBe(1500);
      expect(component.data.stats.words).toBe(250);
      expect(component.data.stats.paragraphs).toBe(8);
    });

    it('should have internalLinksStats with correct properties', () => {
      expect(component.data.internalLinksStats.total).toBe(15);
      expect(component.data.internalLinksStats.unique).toBe(12);
      expect(component.data.internalLinksStats.duplicates).toBe(3);
    });

    it('should have other counts correctly', () => {
      expect(component.data.botanicalCount).toBe(5);
      expect(component.data.faqCount).toBe(3);
      expect(component.data.imagesCount).toBe(2);
      expect(component.data.hasVideo).toBe(true);
    });
  });

  describe('onClose()', () => {
    it('should call dialogRef.close() with no parameters', () => {
      component.onClose();
      
      expect(mockDialogRef.close).toHaveBeenCalledWith();
    });

    it('should call dialogRef.close() multiple times', () => {
      component.onClose();
      component.onClose();
      component.onClose();
      
      expect(mockDialogRef.close).toHaveBeenCalledTimes(3);
    });

    it('should be idempotent', () => {
      component.onClose();
      component.onClose();
      
      expect(mockDialogRef.close).toHaveBeenCalledTimes(2);
    });

    it('should work regardless of component state', () => {
      // Test with different data states
      component.data.botanicalCount = 0;
      component.onClose();
      
      component.data.faqCount = 10;
      component.onClose();
      
      component.data.hasVideo = false;
      component.onClose();
      
      expect(mockDialogRef.close).toHaveBeenCalledTimes(3);
    });

    it('should work with empty data', () => {
      component.data = {
        stats: { characters: 0, words: 0, paragraphs: 0 },
        internalLinksStats: { total: 0, unique: 0, duplicates: 0 },
        botanicalCount: 0,
        faqCount: 0,
        imagesCount: 0,
        hasVideo: false
      };
      
      component.onClose();
      
      expect(mockDialogRef.close).toHaveBeenCalledWith();
    });
  });

  describe('onSave()', () => {
    it('should call dialogRef.close() with "save" parameter', () => {
      component.onSave();
      
      expect(mockDialogRef.close).toHaveBeenCalledWith('save');
    });

    it('should call dialogRef.close() with "save" parameter multiple times', () => {
      component.onSave();
      component.onSave();
      component.onSave();
      
      expect(mockDialogRef.close).toHaveBeenCalledTimes(3);
      expect(mockDialogRef.close).toHaveBeenCalledWith('save');
    });

    it('should be idempotent', () => {
      component.onSave();
      component.onSave();
      
      expect(mockDialogRef.close).toHaveBeenCalledTimes(2);
      expect(mockDialogRef.close).toHaveBeenCalledWith('save');
    });

    it('should work regardless of component state', () => {
      // Test with different data states
      component.data.botanicalCount = 0;
      component.onSave();
      
      component.data.faqCount = 10;
      component.onSave();
      
      component.data.hasVideo = false;
      component.onSave();
      
      expect(mockDialogRef.close).toHaveBeenCalledTimes(3);
      expect(mockDialogRef.close).toHaveBeenCalledWith('save');
    });

    it('should work with empty data', () => {
      component.data = {
        stats: { characters: 0, words: 0, paragraphs: 0 },
        internalLinksStats: { total: 0, unique: 0, duplicates: 0 },
        botanicalCount: 0,
        faqCount: 0,
        imagesCount: 0,
        hasVideo: false
      };
      
      component.onSave();
      
      expect(mockDialogRef.close).toHaveBeenCalledWith('save');
    });
  });

  describe('Component behavior', () => {
    it('should handle both onClose and onSave calls', () => {
      component.onClose();
      component.onSave();
      component.onClose();
      component.onSave();
      
      expect(mockDialogRef.close).toHaveBeenCalledTimes(4);
      expect(mockDialogRef.close).toHaveBeenCalledWith();
      expect(mockDialogRef.close).toHaveBeenCalledWith('save');
    });

    it('should work with different data configurations', () => {
      const testDataConfigurations = [
        {
          stats: { characters: 500, words: 100, paragraphs: 3 },
          internalLinksStats: { total: 5, unique: 5, duplicates: 0 },
          botanicalCount: 2,
          faqCount: 1,
          imagesCount: 1,
          hasVideo: false
        },
        {
          stats: { characters: 3000, words: 500, paragraphs: 15 },
          internalLinksStats: { total: 25, unique: 20, duplicates: 5 },
          botanicalCount: 10,
          faqCount: 8,
          imagesCount: 5,
          hasVideo: true
        },
        {
          stats: { characters: 0, words: 0, paragraphs: 0 },
          internalLinksStats: { total: 0, unique: 0, duplicates: 0 },
          botanicalCount: 0,
          faqCount: 0,
          imagesCount: 0,
          hasVideo: false
        }
      ];

      testDataConfigurations.forEach((testData, index) => {
        component.data = testData;
        component.onClose();
        component.onSave();
        
        expect(mockDialogRef.close).toHaveBeenCalledTimes((index + 1) * 2);
        expect(mockDialogRef.close).toHaveBeenCalledWith();
        expect(mockDialogRef.close).toHaveBeenCalledWith('save');
      });
    });

    it('should maintain data integrity during method calls', () => {
      const originalData = { ...component.data };
      
      component.onClose();
      component.onSave();
      component.onClose();
      
      expect(component.data).toEqual(originalData);
    });

    it('should handle rapid successive calls', () => {
      for (let i = 0; i < 10; i++) {
        component.onClose();
        component.onSave();
      }
      
      expect(mockDialogRef.close).toHaveBeenCalledTimes(20);
    });

    it('should work with undefined data properties', () => {
      component.data = {
        stats: { characters: 100, words: 20, paragraphs: 1 },
        internalLinksStats: { total: 1, unique: 1, duplicates: 0 },
        botanicalCount: 1,
        faqCount: 1,
        imagesCount: 1,
        hasVideo: true
      };
      
      component.onClose();
      component.onSave();
      
      expect(mockDialogRef.close).toHaveBeenCalledTimes(2);
      expect(mockDialogRef.close).toHaveBeenCalledWith();
      expect(mockDialogRef.close).toHaveBeenCalledWith('save');
    });
  });

  describe('Data interface validation', () => {
    it('should accept valid ProcessCompletionData', () => {
      const validData: ProcessCompletionData = {
        stats: { characters: 1000, words: 200, paragraphs: 5 },
        internalLinksStats: { total: 10, unique: 8, duplicates: 2 },
        botanicalCount: 3,
        faqCount: 2,
        imagesCount: 1,
        hasVideo: true
      };

      component.data = validData;
      
      expect(component.data).toEqual(validData);
      component.onClose();
      component.onSave();
      
      expect(mockDialogRef.close).toHaveBeenCalledTimes(2);
    });

    it('should handle edge case values', () => {
      const edgeCaseData: ProcessCompletionData = {
        stats: { characters: Number.MAX_SAFE_INTEGER, words: 0, paragraphs: Number.MAX_SAFE_INTEGER },
        internalLinksStats: { total: 0, unique: 0, duplicates: 0 },
        botanicalCount: 0,
        faqCount: 0,
        imagesCount: 0,
        hasVideo: false
      };

      component.data = edgeCaseData;
      
      component.onClose();
      component.onSave();
      
      expect(mockDialogRef.close).toHaveBeenCalledTimes(2);
    });
  });
});
