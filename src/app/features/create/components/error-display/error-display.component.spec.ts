import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';

import { ErrorDisplayComponent } from './error-display.component';

describe('ErrorDisplayComponent', () => {
  let component: ErrorDisplayComponent;
  let fixture: ComponentFixture<ErrorDisplayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ErrorDisplayComponent],
      providers: [provideZonelessChangeDetection()]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ErrorDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('devrait être créé', () => {
    expect(component).toBeTruthy();
  });

  describe('onRemoveError()', () => {
    it('devrait émettre l\'événement removeError avec l\'erreur spécifiée', () => {
      spyOn(component.removeError, 'emit');
      const testError = 'Erreur de test';
      
      component.onRemoveError(testError);
      
      expect(component.removeError.emit).toHaveBeenCalledWith(testError);
    });

    it('devrait gérer la suppression de différentes erreurs', () => {
      spyOn(component.removeError, 'emit');
      const error1 = 'Première erreur';
      const error2 = 'Deuxième erreur';
      
      component.onRemoveError(error1);
      component.onRemoveError(error2);
      
      expect(component.removeError.emit).toHaveBeenCalledWith(error1);
      expect(component.removeError.emit).toHaveBeenCalledWith(error2);
      expect(component.removeError.emit).toHaveBeenCalledTimes(2);
    });

    it('devrait gérer les erreurs avec caractères spéciaux', () => {
      spyOn(component.removeError, 'emit');
      const specialError = 'Erreur avec caractères spéciaux: éàçù & "quotes"';
      
      component.onRemoveError(specialError);
      
      expect(component.removeError.emit).toHaveBeenCalledWith(specialError);
    });

    it('devrait être une méthode pure', () => {
      spyOn(component.removeError, 'emit');
      const testError = 'Test error';
      
      component.onRemoveError(testError);
      
      expect(component.removeError.emit).toHaveBeenCalledWith(testError);
    });
  });

  describe('onClearAllErrors()', () => {
    it('devrait émettre l\'événement clearAllErrors', () => {
      spyOn(component.clearAllErrors, 'emit');
      
      component.onClearAllErrors();
      
      expect(component.clearAllErrors.emit).toHaveBeenCalled();
    });

    it('devrait émettre l\'événement clearAllErrors sans paramètres', () => {
      spyOn(component.clearAllErrors, 'emit');
      
      component.onClearAllErrors();
      
      expect(component.clearAllErrors.emit).toHaveBeenCalledWith();
    });

    it('devrait fonctionner avec des appels multiples', () => {
      spyOn(component.clearAllErrors, 'emit');
      
      component.onClearAllErrors();
      component.onClearAllErrors();
      
      expect(component.clearAllErrors.emit).toHaveBeenCalledTimes(2);
    });

    it('devrait être une méthode pure', () => {
      spyOn(component.clearAllErrors, 'emit');
      
      component.onClearAllErrors();
      
      expect(component.clearAllErrors.emit).toHaveBeenCalled();
    });
  });

  describe('trackByError()', () => {
    it('devrait retourner l\'erreur passée en paramètre', () => {
      const testError = 'Erreur de test';
      const result = component.trackByError(0, testError);
      
      expect(result).toBe(testError);
    });

    it('devrait retourner différentes erreurs pour différents index', () => {
      const error1 = 'Première erreur';
      const error2 = 'Deuxième erreur';
      
      const result1 = component.trackByError(0, error1);
      const result2 = component.trackByError(1, error2);
      
      expect(result1).toBe(error1);
      expect(result2).toBe(error2);
      expect(result1).not.toBe(result2);
    });

    it('devrait gérer les erreurs avec caractères spéciaux', () => {
      const specialError = 'Erreur avec éàçù & "quotes"';
      const result = component.trackByError(5, specialError);
      
      expect(result).toBe(specialError);
    });

    it('devrait être une fonction pure qui retourne toujours l\'erreur', () => {
      const testError = 'Test error';
      
      // Appeler plusieurs fois avec le même paramètre
      const result1 = component.trackByError(0, testError);
      const result2 = component.trackByError(1, testError);
      const result3 = component.trackByError(2, testError);
      
      expect(result1).toBe(testError);
      expect(result2).toBe(testError);
      expect(result3).toBe(testError);
    });
  });
});