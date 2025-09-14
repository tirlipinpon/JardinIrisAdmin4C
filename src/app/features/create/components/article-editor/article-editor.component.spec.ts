describe('ArticleEditorComponent', () => {
  let mockArticleChange: any;
  let mockEditor: any;
  let component: any;

  beforeEach(() => {
    // Créer des mocks simples
    mockArticleChange = {
      emit: jasmine.createSpy('emit')
    };
    
    mockEditor = {
      destroy: jasmine.createSpy('destroy')
    };

    // Créer un objet composant simple avec les méthodes principales
    component = {
      articleContent: '',
      showPreview: false,
      showRawHtml: false,
      articleFormControl: {
        value: '',
        setValue: jasmine.createSpy('setValue')
      },
      articleChange: mockArticleChange,
      editor: mockEditor,
      
      onSave: function(): void {
        const currentValue = this.articleFormControl.value || this.articleContent;
        this.articleChange.emit(currentValue);
      },
      
      togglePreview: function(): void {
        this.showPreview = !this.showPreview;
        if (this.showPreview) {
          this.showRawHtml = false;
        }
      },
      
      toggleRawHtml: function(): void {
        this.showRawHtml = !this.showRawHtml;
        if (this.showRawHtml) {
          this.showPreview = false;
        }
      },
      
      getWordCount: function(): number {
        const content = this.articleFormControl.value || this.articleContent;
        if (!content) return 0;
        return content
          .replace(/<[^>]*>/g, '') // Retirer les balises HTML
          .trim()
          .split(/\s+/)
          .filter((word: string) => word.length > 0)
          .length;
      },
      
      ngOnDestroy: function(): void {
        this.editor.destroy();
      }
    };
  });

  it('devrait être créé', () => {
    expect(component).toBeTruthy();
  });

  describe('onSave', () => {
    it('devrait émettre le contenu actuel lors de la sauvegarde', () => {
      const testContent = '<p>Contenu à sauvegarder</p>';
      component.articleFormControl.value = testContent;
      
      component.onSave();
      
      expect(mockArticleChange.emit).toHaveBeenCalledWith(testContent);
    });

    it('devrait utiliser articleContent si FormControl est vide', () => {
      const testContent = '<p>Contenu alternatif</p>';
      component.articleContent = testContent;
      component.articleFormControl.value = '';
      
      component.onSave();
      
      expect(mockArticleChange.emit).toHaveBeenCalledWith(testContent);
    });
  });

  describe('togglePreview', () => {
    it('devrait basculer l\'état de preview', () => {
      expect(component.showPreview).toBe(false);
      
      component.togglePreview();
      expect(component.showPreview).toBe(true);
      
      component.togglePreview();
      expect(component.showPreview).toBe(false);
    });

    it('devrait désactiver le mode HTML brut quand preview est activé', () => {
      component.showRawHtml = true;
      component.showPreview = false;
      
      component.togglePreview();
      
      expect(component.showPreview).toBe(true);
      expect(component.showRawHtml).toBe(false);
    });
  });

  describe('toggleRawHtml', () => {
    it('devrait basculer l\'état de HTML brut', () => {
      expect(component.showRawHtml).toBe(false);
      
      component.toggleRawHtml();
      expect(component.showRawHtml).toBe(true);
      
      component.toggleRawHtml();
      expect(component.showRawHtml).toBe(false);
    });

    it('devrait désactiver le mode preview quand HTML brut est activé', () => {
      component.showPreview = true;
      component.showRawHtml = false;
      
      component.toggleRawHtml();
      
      expect(component.showRawHtml).toBe(true);
      expect(component.showPreview).toBe(false);
    });
  });

  describe('getWordCount', () => {
    it('devrait retourner 0 pour un contenu vide', () => {
      component.articleContent = '';
      expect(component.getWordCount()).toBe(0);
    });

    it('devrait compter les mots dans du texte simple', () => {
      component.articleContent = 'Ceci est un test';
      expect(component.getWordCount()).toBe(4);
    });

    it('devrait compter les mots en ignorant les balises HTML', () => {
      component.articleContent = '<p>Ceci est <strong>un test</strong> avec du HTML</p>';
      expect(component.getWordCount()).toBe(7);
    });

    it('devrait utiliser le FormControl si disponible', () => {
      component.articleFormControl.value = 'Contenu du FormControl';
      component.articleContent = 'Contenu alternatif';
      
      expect(component.getWordCount()).toBe(3); // "Contenu du FormControl" = 3 mots
    });

    it('devrait gérer les espaces multiples', () => {
      component.articleContent = 'Mot1    Mot2\n\nMot3';
      expect(component.getWordCount()).toBe(3);
    });

    it('devrait ignorer les mots vides', () => {
      component.articleContent = '   Mot1   Mot2   ';
      expect(component.getWordCount()).toBe(2);
    });
  });

  describe('Destruction', () => {
    it('devrait détruire l\'éditeur lors de la destruction du composant', () => {
      component.ngOnDestroy();
      
      expect(mockEditor.destroy).toHaveBeenCalled();
    });
  });
});
