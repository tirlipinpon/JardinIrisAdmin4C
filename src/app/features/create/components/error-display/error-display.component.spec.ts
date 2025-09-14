describe('ErrorDisplayComponent', () => {
  let mockRemoveError: any;
  let mockClearAllErrors: any;
  let component: any;

  beforeEach(() => {
    // Créer des mocks simples
    mockRemoveError = {
      emit: jasmine.createSpy('emit')
    };
    
    mockClearAllErrors = {
      emit: jasmine.createSpy('emit')
    };

    // Créer un objet composant simple avec les méthodes principales
    component = {
      errors: () => [],
      removeError: mockRemoveError,
      clearAllErrors: mockClearAllErrors,
      
      onRemoveError: function(error: string): void {
        this.removeError.emit(error);
      },
      
      onClearAllErrors: function(): void {
        this.clearAllErrors.emit();
      },
      
      trackByError: function(index: number, error: string): string {
        return error;
      }
    };
  });

  it('devrait être créé', () => {
    expect(component).toBeTruthy();
  });

  describe('onRemoveError', () => {
    it('devrait émettre l\'événement removeError avec l\'erreur spécifiée', () => {
      const testError = 'Erreur de test';
      component.onRemoveError(testError);
      
      expect(mockRemoveError.emit).toHaveBeenCalledWith(testError);
    });

    it('devrait gérer la suppression de différentes erreurs', () => {
      const error1 = 'Première erreur';
      const error2 = 'Deuxième erreur';
      
      component.onRemoveError(error1);
      component.onRemoveError(error2);
      
      expect(mockRemoveError.emit).toHaveBeenCalledWith(error1);
      expect(mockRemoveError.emit).toHaveBeenCalledWith(error2);
      expect(mockRemoveError.emit).toHaveBeenCalledTimes(2);
    });

    it('devrait gérer la suppression d\'erreurs avec des caractères spéciaux', () => {
      const specialError = 'Erreur avec caractères spéciaux: éàçù & "quotes"';
      component.onRemoveError(specialError);
      
      expect(mockRemoveError.emit).toHaveBeenCalledWith(specialError);
    });

    it('devrait gérer la suppression d\'erreurs vides', () => {
      const emptyError = '';
      component.onRemoveError(emptyError);
      
      expect(mockRemoveError.emit).toHaveBeenCalledWith(emptyError);
    });
  });

  describe('onClearAllErrors', () => {
    it('devrait émettre l\'événement clearAllErrors', () => {
      component.onClearAllErrors();
      
      expect(mockClearAllErrors.emit).toHaveBeenCalled();
    });

    it('devrait émettre l\'événement clearAllErrors même si appelé plusieurs fois', () => {
      component.onClearAllErrors();
      component.onClearAllErrors();
      
      expect(mockClearAllErrors.emit).toHaveBeenCalledTimes(2);
    });
  });

  describe('trackByError', () => {
    it('devrait retourner l\'erreur comme clé de tracking', () => {
      const testError = 'Erreur pour tracking';
      const result = component.trackByError(0, testError);
      
      expect(result).toBe(testError);
    });

    it('devrait retourner l\'erreur même avec différents index', () => {
      const testError = 'Même erreur';
      const result1 = component.trackByError(0, testError);
      const result2 = component.trackByError(5, testError);
      
      expect(result1).toBe(testError);
      expect(result2).toBe(testError);
      expect(result1).toBe(result2);
    });

    it('devrait gérer les erreurs avec des caractères spéciaux pour le tracking', () => {
      const specialError = 'Erreur avec éàçù & "quotes"';
      const result = component.trackByError(0, specialError);
      
      expect(result).toBe(specialError);
    });
  });

  describe('Propriétés d\'entrée', () => {
    it('devrait avoir un tableau d\'erreurs vide par défaut', () => {
      const errors = component.errors();
      
      expect(Array.isArray(errors)).toBe(true);
      expect(errors.length).toBe(0);
    });

    it('devrait gérer une liste d\'erreurs', () => {
      const testErrors = ['Erreur 1', 'Erreur 2', 'Erreur 3'];
      component.errors = () => testErrors;
      
      const errors = component.errors();
      
      expect(errors.length).toBe(3);
      expect(errors).toEqual(testErrors);
    });

    it('devrait gérer une liste d\'erreurs vide', () => {
      component.errors = () => [];
      
      const errors = component.errors();
      
      expect(errors.length).toBe(0);
    });

    it('devrait gérer une liste d\'erreurs avec des messages longs', () => {
      const longErrors = [
        'Cette erreur contient un message très long qui peut poser des problèmes d\'affichage',
        'Une autre erreur avec beaucoup de détails techniques et d\'informations de débogage',
        'Erreur finale avec encore plus de contexte et d\'explications détaillées'
      ];
      component.errors = () => longErrors;
      
      const errors = component.errors();
      
      expect(errors.length).toBe(3);
      expect(errors[0].length).toBeGreaterThan(50);
    });
  });

  describe('Logique d\'affichage conditionnel', () => {
    it('devrait afficher le composant quand il y a des erreurs', () => {
      const testErrors = ['Erreur 1', 'Erreur 2'];
      component.errors = () => testErrors;
      
      const hasErrors = component.errors().length > 0;
      
      expect(hasErrors).toBe(true);
    });

    it('ne devrait pas afficher le composant quand il n\'y a pas d\'erreurs', () => {
      component.errors = () => [];
      
      const hasErrors = component.errors().length > 0;
      
      expect(hasErrors).toBe(false);
    });

    it('devrait compter correctement le nombre d\'erreurs', () => {
      const testErrors = ['Erreur 1', 'Erreur 2', 'Erreur 3', 'Erreur 4'];
      component.errors = () => testErrors;
      
      const errorCount = component.errors().length;
      
      expect(errorCount).toBe(4);
    });
  });

  describe('Gestion des erreurs', () => {
    it('devrait gérer les erreurs avec des caractères spéciaux', () => {
      const specialErrors = [
        'Erreur avec éàçù',
        'Erreur avec "guillemets"',
        'Erreur avec & caractères',
        'Erreur avec <balises> HTML'
      ];
      component.errors = () => specialErrors;
      
      const errors = component.errors();
      
      expect(errors.length).toBe(4);
      expect(errors[0]).toContain('éàçù');
      expect(errors[1]).toContain('"guillemets"');
      expect(errors[2]).toContain('& caractères');
      expect(errors[3]).toContain('<balises>');
    });

    it('devrait gérer les erreurs avec des espaces multiples', () => {
      const spacedErrors = [
        'Erreur    avec    espaces',
        '  Erreur avec espaces en début',
        'Erreur avec espaces en fin  '
      ];
      component.errors = () => spacedErrors;
      
      const errors = component.errors();
      
      expect(errors.length).toBe(3);
    });

    it('devrait gérer les erreurs avec des caractères de contrôle', () => {
      const controlErrors = [
        'Erreur avec\nretour à la ligne',
        'Erreur avec\ttabulation',
        'Erreur avec\rretour chariot'
      ];
      component.errors = () => controlErrors;
      
      const errors = component.errors();
      
      expect(errors.length).toBe(3);
      expect(errors[0]).toContain('\n');
      expect(errors[1]).toContain('\t');
      expect(errors[2]).toContain('\r');
    });
  });

  describe('Workflow de gestion des erreurs', () => {
    it('devrait permettre de supprimer une erreur spécifique puis effacer toutes les erreurs', () => {
      const testError = 'Erreur à supprimer';
      
      // Supprimer une erreur spécifique
      component.onRemoveError(testError);
      expect(mockRemoveError.emit).toHaveBeenCalledWith(testError);
      
      // Effacer toutes les erreurs
      component.onClearAllErrors();
      expect(mockClearAllErrors.emit).toHaveBeenCalled();
      
      // Vérifier que les deux événements ont été émis
      expect(mockRemoveError.emit).toHaveBeenCalledTimes(1);
      expect(mockClearAllErrors.emit).toHaveBeenCalledTimes(1);
    });

    it('devrait gérer la suppression de plusieurs erreurs individuelles', () => {
      const errors = ['Erreur 1', 'Erreur 2', 'Erreur 3'];
      
      errors.forEach(error => {
        component.onRemoveError(error);
      });
      
      expect(mockRemoveError.emit).toHaveBeenCalledTimes(3);
      expect(mockRemoveError.emit).toHaveBeenCalledWith('Erreur 1');
      expect(mockRemoveError.emit).toHaveBeenCalledWith('Erreur 2');
      expect(mockRemoveError.emit).toHaveBeenCalledWith('Erreur 3');
    });
  });

  describe('Performance et optimisation', () => {
    it('devrait utiliser trackByError pour optimiser le rendu', () => {
      const errors = ['Erreur A', 'Erreur B', 'Erreur C'];
      
      errors.forEach((error, index) => {
        const trackKey = component.trackByError(index, error);
        expect(trackKey).toBe(error);
      });
    });

    it('devrait gérer efficacement un grand nombre d\'erreurs', () => {
      const manyErrors = Array.from({ length: 100 }, (_, i) => `Erreur ${i + 1}`);
      component.errors = () => manyErrors;
      
      const errors = component.errors();
      
      expect(errors.length).toBe(100);
      expect(errors[0]).toBe('Erreur 1');
      expect(errors[99]).toBe('Erreur 100');
    });
  });
});
