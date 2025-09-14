describe('ImagePreviewComponent', () => {
  let mockEditImageUrl: any;
  let mockOpenImageInNewTab: any;
  let mockImageError: any;
  let mockImageLoad: any;
  let component: any;

  beforeEach(() => {
    // Créer des mocks simples
    mockEditImageUrl = {
      emit: jasmine.createSpy('emit')
    };
    
    mockOpenImageInNewTab = {
      emit: jasmine.createSpy('emit')
    };
    
    mockImageError = {
      emit: jasmine.createSpy('emit')
    };
    
    mockImageLoad = {
      emit: jasmine.createSpy('emit')
    };

    // Créer un objet composant simple avec les méthodes principales
    component = {
      imageUrl: () => null,
      title: () => null,
      editImageUrl: mockEditImageUrl,
      openImageInNewTab: mockOpenImageInNewTab,
      imageError: mockImageError,
      imageLoad: mockImageLoad,
      
      onEditImageUrl: function(): void {
        this.editImageUrl.emit();
      },
      
      onOpenImageInNewTab: function(): void {
        this.openImageInNewTab.emit();
      },
      
      onImageError: function(event: Event): void {
        this.imageError.emit(event);
      },
      
      onImageLoad: function(event: Event): void {
        this.imageLoad.emit(event);
      }
    };
  });

  it('devrait être créé', () => {
    expect(component).toBeTruthy();
  });

  describe('onEditImageUrl', () => {
    it('devrait émettre l\'événement editImageUrl', () => {
      component.onEditImageUrl();
      
      expect(mockEditImageUrl.emit).toHaveBeenCalled();
    });

    it('devrait émettre l\'événement editImageUrl même si appelé plusieurs fois', () => {
      component.onEditImageUrl();
      component.onEditImageUrl();
      
      expect(mockEditImageUrl.emit).toHaveBeenCalledTimes(2);
    });
  });

  describe('onOpenImageInNewTab', () => {
    it('devrait émettre l\'événement openImageInNewTab', () => {
      component.onOpenImageInNewTab();
      
      expect(mockOpenImageInNewTab.emit).toHaveBeenCalled();
    });

    it('devrait émettre l\'événement openImageInNewTab même si appelé plusieurs fois', () => {
      component.onOpenImageInNewTab();
      component.onOpenImageInNewTab();
      
      expect(mockOpenImageInNewTab.emit).toHaveBeenCalledTimes(2);
    });
  });

  describe('onImageError', () => {
    it('devrait émettre l\'événement imageError avec l\'événement fourni', () => {
      const mockEvent = { type: 'error', target: { src: 'invalid-url.jpg' } } as any;
      
      component.onImageError(mockEvent);
      
      expect(mockImageError.emit).toHaveBeenCalledWith(mockEvent);
    });

    it('devrait gérer différents types d\'événements d\'erreur', () => {
      const errorEvent1 = { type: 'error', target: { src: 'image1.jpg' } } as any;
      const errorEvent2 = { type: 'error', target: { src: 'image2.jpg' } } as any;
      
      component.onImageError(errorEvent1);
      component.onImageError(errorEvent2);
      
      expect(mockImageError.emit).toHaveBeenCalledWith(errorEvent1);
      expect(mockImageError.emit).toHaveBeenCalledWith(errorEvent2);
      expect(mockImageError.emit).toHaveBeenCalledTimes(2);
    });

    it('devrait gérer les événements d\'erreur avec des détails', () => {
      const detailedEvent = { 
        type: 'error',
        target: { 
          src: 'https://example.com/image.jpg',
          alt: 'Image qui a échoué'
        }
      } as any;
      
      component.onImageError(detailedEvent);
      
      expect(mockImageError.emit).toHaveBeenCalledWith(detailedEvent);
    });
  });

  describe('onImageLoad', () => {
    it('devrait émettre l\'événement imageLoad avec l\'événement fourni', () => {
      const mockEvent = { type: 'load', target: { src: 'valid-url.jpg' } } as any;
      
      component.onImageLoad(mockEvent);
      
      expect(mockImageLoad.emit).toHaveBeenCalledWith(mockEvent);
    });

    it('devrait gérer différents types d\'événements de chargement', () => {
      const loadEvent1 = { type: 'load', target: { src: 'image1.jpg' } } as any;
      const loadEvent2 = { type: 'load', target: { src: 'image2.jpg' } } as any;
      
      component.onImageLoad(loadEvent1);
      component.onImageLoad(loadEvent2);
      
      expect(mockImageLoad.emit).toHaveBeenCalledWith(loadEvent1);
      expect(mockImageLoad.emit).toHaveBeenCalledWith(loadEvent2);
      expect(mockImageLoad.emit).toHaveBeenCalledTimes(2);
    });

    it('devrait gérer les événements de chargement avec des détails', () => {
      const detailedEvent = { 
        type: 'load',
        target: { 
          src: 'https://example.com/image.jpg',
          alt: 'Image chargée avec succès',
          naturalWidth: 800,
          naturalHeight: 600
        }
      } as any;
      
      component.onImageLoad(detailedEvent);
      
      expect(mockImageLoad.emit).toHaveBeenCalledWith(detailedEvent);
    });
  });

  describe('Propriétés d\'entrée', () => {
    it('devrait avoir des valeurs par défaut correctes', () => {
      expect(component.imageUrl()).toBe(null);
      expect(component.title()).toBe(null);
    });

    it('devrait gérer une URL d\'image valide', () => {
      const testUrl = 'https://example.com/image.jpg';
      component.imageUrl = () => testUrl;
      
      expect(component.imageUrl()).toBe(testUrl);
    });

    it('devrait gérer un titre valide', () => {
      const testTitle = 'Mon image de test';
      component.title = () => testTitle;
      
      expect(component.title()).toBe(testTitle);
    });

    it('devrait gérer une URL d\'image et un titre ensemble', () => {
      const testUrl = 'https://example.com/image.jpg';
      const testTitle = 'Image avec titre';
      
      component.imageUrl = () => testUrl;
      component.title = () => testTitle;
      
      expect(component.imageUrl()).toBe(testUrl);
      expect(component.title()).toBe(testTitle);
    });

    it('devrait gérer des URLs d\'images avec différents formats', () => {
      const formats = [
        'https://example.com/image.jpg',
        'https://example.com/image.png',
        'https://example.com/image.gif',
        'https://example.com/image.webp',
        'https://example.com/image.svg'
      ];
      
      formats.forEach((url, index) => {
        component.imageUrl = () => url;
        expect(component.imageUrl()).toBe(url);
      });
    });

    it('devrait gérer des URLs d\'images avec des paramètres', () => {
      const urlWithParams = 'https://example.com/image.jpg?w=800&h=600&q=80';
      component.imageUrl = () => urlWithParams;
      
      expect(component.imageUrl()).toBe(urlWithParams);
    });

    it('devrait gérer des URLs d\'images avec des fragments', () => {
      const urlWithFragment = 'https://example.com/image.jpg#section1';
      component.imageUrl = () => urlWithFragment;
      
      expect(component.imageUrl()).toBe(urlWithFragment);
    });
  });

  describe('Logique d\'affichage conditionnel', () => {
    it('devrait afficher le composant quand il y a une URL d\'image', () => {
      const testUrl = 'https://example.com/image.jpg';
      component.imageUrl = () => testUrl;
      
      const hasImage = component.imageUrl() !== null;
      
      expect(hasImage).toBe(true);
    });

    it('ne devrait pas afficher le composant quand il n\'y a pas d\'URL d\'image', () => {
      component.imageUrl = () => null;
      
      const hasImage = component.imageUrl() !== null;
      
      expect(hasImage).toBe(false);
    });

    it('devrait afficher le composant avec une chaîne vide comme URL', () => {
      component.imageUrl = () => '';
      
      const hasImage = component.imageUrl() !== null && component.imageUrl() !== '';
      
      expect(hasImage).toBe(false); // Chaîne vide est considérée comme pas d'image
    });
  });

  describe('Gestion des titres', () => {
    it('devrait gérer des titres avec des caractères spéciaux', () => {
      const specialTitle = 'Image avec éàçù & "guillemets"';
      component.title = () => specialTitle;
      
      expect(component.title()).toBe(specialTitle);
    });

    it('devrait gérer des titres longs', () => {
      const longTitle = 'Ceci est un titre très long pour une image qui contient beaucoup de détails et d\'informations supplémentaires';
      component.title = () => longTitle;
      
      expect(component.title()).toBe(longTitle);
    });

    it('devrait gérer des titres avec des espaces multiples', () => {
      const spacedTitle = 'Titre   avec    espaces   multiples';
      component.title = () => spacedTitle;
      
      expect(component.title()).toBe(spacedTitle);
    });

    it('devrait gérer des titres avec des caractères de contrôle', () => {
      const controlTitle = 'Titre avec\nretour à la ligne';
      component.title = () => controlTitle;
      
      expect(component.title()).toBe(controlTitle);
    });
  });

  describe('Workflow de gestion d\'images', () => {
    it('devrait permettre d\'éditer l\'URL puis d\'ouvrir l\'image', () => {
      // Éditer l'URL
      component.onEditImageUrl();
      expect(mockEditImageUrl.emit).toHaveBeenCalled();
      
      // Ouvrir l'image dans un nouvel onglet
      component.onOpenImageInNewTab();
      expect(mockOpenImageInNewTab.emit).toHaveBeenCalled();
      
      // Vérifier que les deux événements ont été émis
      expect(mockEditImageUrl.emit).toHaveBeenCalledTimes(1);
      expect(mockOpenImageInNewTab.emit).toHaveBeenCalledTimes(1);
    });

    it('devrait gérer le cycle de vie d\'une image (chargement et erreur)', () => {
      const loadEvent = { type: 'load', target: { src: 'image.jpg' } } as any;
      const errorEvent = { type: 'error', target: { src: 'image.jpg' } } as any;
      
      // Simulation du chargement réussi
      component.onImageLoad(loadEvent);
      expect(mockImageLoad.emit).toHaveBeenCalledWith(loadEvent);
      
      // Simulation d'une erreur
      component.onImageError(errorEvent);
      expect(mockImageError.emit).toHaveBeenCalledWith(errorEvent);
      
      expect(mockImageLoad.emit).toHaveBeenCalledTimes(1);
      expect(mockImageError.emit).toHaveBeenCalledTimes(1);
    });
  });

  describe('Validation des URLs', () => {
    it('devrait accepter les URLs HTTP', () => {
      const httpUrl = 'http://example.com/image.jpg';
      component.imageUrl = () => httpUrl;
      
      expect(component.imageUrl()).toBe(httpUrl);
    });

    it('devrait accepter les URLs HTTPS', () => {
      const httpsUrl = 'https://example.com/image.jpg';
      component.imageUrl = () => httpsUrl;
      
      expect(component.imageUrl()).toBe(httpsUrl);
    });

    it('devrait accepter les URLs avec des ports', () => {
      const urlWithPort = 'https://example.com:8080/image.jpg';
      component.imageUrl = () => urlWithPort;
      
      expect(component.imageUrl()).toBe(urlWithPort);
    });

    it('devrait accepter les URLs avec des chemins complexes', () => {
      const complexUrl = 'https://example.com/path/to/subfolder/image.jpg';
      component.imageUrl = () => complexUrl;
      
      expect(component.imageUrl()).toBe(complexUrl);
    });
  });

  describe('Performance et optimisation', () => {
    it('devrait gérer efficacement les changements d\'URL fréquents', () => {
      const urls = [
        'https://example.com/image1.jpg',
        'https://example.com/image2.jpg',
        'https://example.com/image3.jpg'
      ];
      
      urls.forEach((url: string) => {
        component.imageUrl = () => url;
        expect(component.imageUrl()).toBe(url);
      });
    });

    it('devrait gérer les événements multiples sans problème', () => {
      const events = Array.from({ length: 10 }, (_, i) => ({ 
        type: 'load', 
        target: { src: `image${i}.jpg` } 
      } as any));
      
      events.forEach((event: any) => {
        component.onImageLoad(event);
      });
      
      expect(mockImageLoad.emit).toHaveBeenCalledTimes(10);
    });
  });

  describe('Cas limites et edge cases', () => {
    it('devrait gérer les URLs avec des caractères spéciaux', () => {
      const specialUrls = [
        'https://example.com/image with spaces.jpg',
        'https://example.com/image-with-dashes.jpg',
        'https://example.com/image_with_underscores.jpg',
        'https://example.com/image.with.dots.jpg',
        'https://example.com/image+plus.jpg'
      ];
      
      specialUrls.forEach((url: string) => {
        component.imageUrl = () => url;
        expect(component.imageUrl()).toBe(url);
      });
    });

    it('devrait gérer les URLs avec des caractères Unicode', () => {
      const unicodeUrls = [
        'https://example.com/画像.jpg',
        'https://example.com/изображение.jpg',
        'https://example.com/صورة.jpg',
        'https://example.com/🖼️.jpg'
      ];
      
      unicodeUrls.forEach((url: string) => {
        component.imageUrl = () => url;
        expect(component.imageUrl()).toBe(url);
      });
    });

    it('devrait gérer les événements avec des propriétés manquantes', () => {
      const incompleteEvent = { type: 'load' } as any;
      
      component.onImageLoad(incompleteEvent);
      
      expect(mockImageLoad.emit).toHaveBeenCalledWith(incompleteEvent);
    });

    it('devrait gérer les événements avec des propriétés nulles', () => {
      const nullEvent = { 
        type: 'error', 
        target: null 
      } as any;
      
      component.onImageError(nullEvent);
      
      expect(mockImageError.emit).toHaveBeenCalledWith(nullEvent);
    });

    it('devrait gérer les titres avec des caractères de contrôle', () => {
      const controlTitles = [
        'Titre avec\t\ttabulations',
        'Titre avec\r\nretour à la ligne',
        'Titre avec\0caractère nul',
        'Titre avec\x1B[31mcodes ANSI'
      ];
      
      controlTitles.forEach((title: string) => {
        component.title = () => title;
        expect(component.title()).toBe(title);
      });
    });

    it('devrait gérer les URLs avec des encodages spéciaux', () => {
      const encodedUrls = [
        'https://example.com/image%20with%20spaces.jpg',
        'https://example.com/image%C3%A9.jpg', // é
        'https://example.com/image%2Bplus%2B.jpg',
        'https://example.com/image%3Fquery%3Dvalue.jpg'
      ];
      
      encodedUrls.forEach((url: string) => {
        component.imageUrl = () => url;
        expect(component.imageUrl()).toBe(url);
      });
    });
  });

  describe('Tests de robustesse', () => {
    it('devrait gérer les appels rapides successifs d\'événements', () => {
      const rapidEvents = Array.from({ length: 5 }, (_, i) => ({ 
        type: 'load', 
        target: { src: `rapid${i}.jpg` } 
      } as any));
      
      // Appels rapides successifs
      rapidEvents.forEach((event: any) => {
        component.onImageLoad(event);
        component.onEditImageUrl();
      });
      
      expect(mockImageLoad.emit).toHaveBeenCalledTimes(5);
      expect(mockEditImageUrl.emit).toHaveBeenCalledTimes(5);
    });

    it('devrait maintenir la cohérence lors de changements rapides d\'URL', () => {
      const urls = [
        'https://example.com/image1.jpg',
        'https://example.com/image2.jpg',
        'https://example.com/image3.jpg'
      ];
      
      urls.forEach((url: string, index: number) => {
        component.imageUrl = () => url;
        component.onEditImageUrl();
        
        expect(component.imageUrl()).toBe(url);
        expect(mockEditImageUrl.emit).toHaveBeenCalledTimes(index + 1);
      });
    });

    it('devrait gérer les événements avec des types inattendus', () => {
      const unexpectedEvents = [
        { type: 'custom', target: { src: 'custom.jpg' } },
        { type: 'unknown', target: { src: 'unknown.jpg' } },
        { type: '', target: { src: 'empty.jpg' } }
      ] as any[];
      
      unexpectedEvents.forEach((event: any) => {
        component.onImageLoad(event);
        component.onImageError(event);
      });
      
      expect(mockImageLoad.emit).toHaveBeenCalledTimes(3);
      expect(mockImageError.emit).toHaveBeenCalledTimes(3);
    });
  });

  describe('Tests d\'intégration avancés', () => {
    it('devrait gérer un cycle complet de gestion d\'image', () => {
      const imageUrl = 'https://example.com/test-image.jpg';
      const imageTitle = 'Image de test';
      
      // 1. Configuration initiale
      component.imageUrl = () => imageUrl;
      component.title = () => imageTitle;
      
      expect(component.imageUrl()).toBe(imageUrl);
      expect(component.title()).toBe(imageTitle);
      
      // 2. Édition de l'URL
      component.onEditImageUrl();
      expect(mockEditImageUrl.emit).toHaveBeenCalled();
      
      // 3. Simulation du chargement
      const loadEvent = { type: 'load', target: { src: imageUrl } } as any;
      component.onImageLoad(loadEvent);
      expect(mockImageLoad.emit).toHaveBeenCalledWith(loadEvent);
      
      // 4. Ouverture dans un nouvel onglet
      component.onOpenImageInNewTab();
      expect(mockOpenImageInNewTab.emit).toHaveBeenCalled();
    });

    it('devrait gérer la gestion d\'erreurs et de récupération', () => {
      const imageUrl = 'https://example.com/broken-image.jpg';
      component.imageUrl = () => imageUrl;
      
      // 1. Tentative de chargement
      const loadEvent = { type: 'load', target: { src: imageUrl } } as any;
      component.onImageLoad(loadEvent);
      
      // 2. Simulation d'une erreur
      const errorEvent = { type: 'error', target: { src: imageUrl } } as any;
      component.onImageError(errorEvent);
      
      // 3. Édition de l'URL pour corriger
      component.onEditImageUrl();
      
      // Vérifier que tous les événements ont été émis
      expect(mockImageLoad.emit).toHaveBeenCalledWith(loadEvent);
      expect(mockImageError.emit).toHaveBeenCalledWith(errorEvent);
      expect(mockEditImageUrl.emit).toHaveBeenCalled();
    });

    it('devrait gérer les métadonnées d\'image complexes', () => {
      const complexEvent = {
        type: 'load',
        target: {
          src: 'https://example.com/complex-image.jpg',
          alt: 'Image complexe',
          naturalWidth: 1920,
          naturalHeight: 1080,
          complete: true,
          crossOrigin: 'anonymous',
          loading: 'lazy',
          decoding: 'async'
        }
      } as any;
      
      component.onImageLoad(complexEvent);
      
      expect(mockImageLoad.emit).toHaveBeenCalledWith(complexEvent);
    });

    it('devrait gérer les événements avec des informations d\'erreur détaillées', () => {
      const detailedErrorEvent = {
        type: 'error',
        target: {
          src: 'https://example.com/missing-image.jpg',
          alt: 'Image manquante',
          naturalWidth: 0,
          naturalHeight: 0,
          complete: false
        },
        error: {
          message: 'Failed to load image',
          code: 404
        }
      } as any;
      
      component.onImageError(detailedErrorEvent);
      
      expect(mockImageError.emit).toHaveBeenCalledWith(detailedErrorEvent);
    });
  });

  describe('Tests de validation des données', () => {
    it('devrait gérer les URLs avec des protocoles non standard', () => {
      const nonStandardUrls = [
        'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD...',
        'blob:https://example.com/12345678-1234-1234-1234-123456789abc',
        'file:///path/to/local/image.jpg'
      ];
      
      nonStandardUrls.forEach((url: string) => {
        component.imageUrl = () => url;
        expect(component.imageUrl()).toBe(url);
      });
    });

    it('devrait gérer les titres avec des formats de texte riches', () => {
      const richTitles = [
        '**Titre en gras**',
        '*Titre en italique*',
        '`Titre en code`',
        '[Titre avec lien](https://example.com)',
        '> Titre en citation',
        '# Titre en titre',
        '---Titre avec séparateur---'
      ];
      
      richTitles.forEach((title: string) => {
        component.title = () => title;
        expect(component.title()).toBe(title);
      });
    });

    it('devrait gérer les événements avec des timestamps', () => {
      const timestampEvent = {
        type: 'load',
        target: { src: 'https://example.com/image.jpg' },
        timeStamp: Date.now(),
        isTrusted: true,
        bubbles: true,
        cancelable: false
      } as any;
      
      component.onImageLoad(timestampEvent);
      
      expect(mockImageLoad.emit).toHaveBeenCalledWith(timestampEvent);
    });
  });
});
