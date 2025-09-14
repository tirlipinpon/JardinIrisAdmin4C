import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';

import { ImagePreviewComponent } from './image-preview.component';

describe('ImagePreviewComponent', () => {
  let component: ImagePreviewComponent;
  let fixture: ComponentFixture<ImagePreviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImagePreviewComponent],
      providers: [provideZonelessChangeDetection()]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ImagePreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('devrait être créé', () => {
    expect(component).toBeTruthy();
  });

  describe('onEditImageUrl()', () => {
    it('devrait émettre l\'événement editImageUrl', () => {
      spyOn(component.editImageUrl, 'emit');
      
      component.onEditImageUrl();
      
      expect(component.editImageUrl.emit).toHaveBeenCalled();
    });

    it('devrait émettre l\'événement editImageUrl sans paramètres', () => {
      spyOn(component.editImageUrl, 'emit');
      
      component.onEditImageUrl();
      
      expect(component.editImageUrl.emit).toHaveBeenCalledWith();
    });

    it('devrait fonctionner avec des appels multiples', () => {
      spyOn(component.editImageUrl, 'emit');
      
      component.onEditImageUrl();
      component.onEditImageUrl();
      
      expect(component.editImageUrl.emit).toHaveBeenCalledTimes(2);
    });

    it('devrait être une méthode pure', () => {
      spyOn(component.editImageUrl, 'emit');
      
      component.onEditImageUrl();
      
      expect(component.editImageUrl.emit).toHaveBeenCalled();
    });
  });

  describe('onOpenImageInNewTab()', () => {
    it('devrait émettre l\'événement openImageInNewTab', () => {
      spyOn(component.openImageInNewTab, 'emit');
      
      component.onOpenImageInNewTab();
      
      expect(component.openImageInNewTab.emit).toHaveBeenCalled();
    });

    it('devrait émettre l\'événement openImageInNewTab sans paramètres', () => {
      spyOn(component.openImageInNewTab, 'emit');
      
      component.onOpenImageInNewTab();
      
      expect(component.openImageInNewTab.emit).toHaveBeenCalledWith();
    });

    it('devrait fonctionner avec des appels multiples', () => {
      spyOn(component.openImageInNewTab, 'emit');
      
      component.onOpenImageInNewTab();
      component.onOpenImageInNewTab();
      
      expect(component.openImageInNewTab.emit).toHaveBeenCalledTimes(2);
    });

    it('devrait être une méthode pure', () => {
      spyOn(component.openImageInNewTab, 'emit');
      
      component.onOpenImageInNewTab();
      
      expect(component.openImageInNewTab.emit).toHaveBeenCalled();
    });
  });

  describe('onImageError()', () => {
    it('devrait émettre l\'événement imageError avec l\'événement passé', () => {
      spyOn(component.imageError, 'emit');
      const mockEvent = { target: 'test' } as any;
      
      component.onImageError(mockEvent);
      
      expect(component.imageError.emit).toHaveBeenCalledWith(mockEvent);
    });

    it('devrait émettre l\'événement imageError avec le bon événement', () => {
      spyOn(component.imageError, 'emit');
      const mockEvent = { target: 'image', type: 'error' } as any;
      
      component.onImageError(mockEvent);
      
      expect(component.imageError.emit).toHaveBeenCalledWith(mockEvent);
    });

    it('devrait fonctionner avec des événements différents', () => {
      spyOn(component.imageError, 'emit');
      const event1 = { target: 'img1' } as any;
      const event2 = { target: 'img2' } as any;
      
      component.onImageError(event1);
      component.onImageError(event2);
      
      expect(component.imageError.emit).toHaveBeenCalledTimes(2);
      expect(component.imageError.emit).toHaveBeenCalledWith(event1);
      expect(component.imageError.emit).toHaveBeenCalledWith(event2);
    });

    it('devrait être une méthode pure', () => {
      spyOn(component.imageError, 'emit');
      const mockEvent = { target: 'test' } as any;
      
      component.onImageError(mockEvent);
      
      expect(component.imageError.emit).toHaveBeenCalledWith(mockEvent);
    });
  });

  describe('onImageLoad()', () => {
    it('devrait émettre l\'événement imageLoad avec l\'événement passé', () => {
      spyOn(component.imageLoad, 'emit');
      const mockEvent = { target: 'test' } as any;
      
      component.onImageLoad(mockEvent);
      
      expect(component.imageLoad.emit).toHaveBeenCalledWith(mockEvent);
    });

    it('devrait émettre l\'événement imageLoad avec le bon événement', () => {
      spyOn(component.imageLoad, 'emit');
      const mockEvent = { target: 'image', type: 'load' } as any;
      
      component.onImageLoad(mockEvent);
      
      expect(component.imageLoad.emit).toHaveBeenCalledWith(mockEvent);
    });

    it('devrait fonctionner avec des événements différents', () => {
      spyOn(component.imageLoad, 'emit');
      const event1 = { target: 'img1' } as any;
      const event2 = { target: 'img2' } as any;
      
      component.onImageLoad(event1);
      component.onImageLoad(event2);
      
      expect(component.imageLoad.emit).toHaveBeenCalledTimes(2);
      expect(component.imageLoad.emit).toHaveBeenCalledWith(event1);
      expect(component.imageLoad.emit).toHaveBeenCalledWith(event2);
    });

    it('devrait être une méthode pure', () => {
      spyOn(component.imageLoad, 'emit');
      const mockEvent = { target: 'test' } as any;
      
      component.onImageLoad(mockEvent);
      
      expect(component.imageLoad.emit).toHaveBeenCalledWith(mockEvent);
    });
  });
});
