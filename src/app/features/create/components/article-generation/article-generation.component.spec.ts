import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { ArticleGenerationComponent } from './article-generation.component';

describe('ArticleGenerationComponent', () => {
  let component: ArticleGenerationComponent;
  let fixture: ComponentFixture<ArticleGenerationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArticleGenerationComponent],
      providers: [provideZonelessChangeDetection()]
    }).compileComponents();

    fixture = TestBed.createComponent(ArticleGenerationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('devrait être créé', () => {
    expect(component).toBeTruthy();
  });

  describe('onGenerate()', () => {
    it('devrait émettre l\'événement generate', () => {
      spyOn(component.generate, 'emit');
      
      component.onGenerate();
      
      expect(component.generate.emit).toHaveBeenCalled();
    });

    it('devrait émettre l\'événement generate même si appelé plusieurs fois', () => {
      spyOn(component.generate, 'emit');
      
      component.onGenerate();
      component.onGenerate();
      
      expect(component.generate.emit).toHaveBeenCalledTimes(2);
    });

    it('devrait émettre l\'événement generate sans paramètres', () => {
      spyOn(component.generate, 'emit');
      
      component.onGenerate();
      
      expect(component.generate.emit).toHaveBeenCalledWith();
    });

    it('devrait fonctionner avec des appels rapides', () => {
      spyOn(component.generate, 'emit');
      
      // Appels rapides successifs
      for (let i = 0; i < 5; i++) {
        component.onGenerate();
      }
      
      expect(component.generate.emit).toHaveBeenCalledTimes(5);
    });

    it('devrait être une méthode pure sans effets de bord', () => {
      spyOn(component.generate, 'emit');
      spyOn(component.articleIdeaChange, 'emit');
      
      component.onGenerate();
      
      expect(component.generate.emit).toHaveBeenCalled();
      expect(component.articleIdeaChange.emit).not.toHaveBeenCalled();
    });
  });

  describe('onArticleIdeaChange(value: string)', () => {
    it('devrait émettre l\'événement articleIdeaChange avec la valeur fournie', () => {
      const testValue = 'Comment planter des roses';
      spyOn(component.articleIdeaChange, 'emit');
      
      component.onArticleIdeaChange(testValue);
      
      expect(component.articleIdeaChange.emit).toHaveBeenCalledWith(testValue);
    });

    it('devrait émettre une chaîne vide', () => {
      spyOn(component.articleIdeaChange, 'emit');
      
      component.onArticleIdeaChange('');
      
      expect(component.articleIdeaChange.emit).toHaveBeenCalledWith('');
    });

    it('devrait émettre une valeur avec des espaces', () => {
      const testValue = '  Idée avec espaces  ';
      spyOn(component.articleIdeaChange, 'emit');
      
      component.onArticleIdeaChange(testValue);
      
      expect(component.articleIdeaChange.emit).toHaveBeenCalledWith(testValue);
    });

    it('devrait gérer les valeurs longues', () => {
      const longValue = 'Ceci est une très longue idée d\'article qui décrit en détail comment créer un jardin urbain avec des plantes comestibles et des fleurs ornementales dans un espace limité';
      spyOn(component.articleIdeaChange, 'emit');
      
      component.onArticleIdeaChange(longValue);
      
      expect(component.articleIdeaChange.emit).toHaveBeenCalledWith(longValue);
    });

    it('devrait gérer les caractères spéciaux', () => {
      const specialValue = 'Article avec éàçù & "guillemets" et <balises>';
      spyOn(component.articleIdeaChange, 'emit');
      
      component.onArticleIdeaChange(specialValue);
      
      expect(component.articleIdeaChange.emit).toHaveBeenCalledWith(specialValue);
    });

    it('devrait gérer les caractères Unicode', () => {
      const unicodeValue = '🌱 Jardinage avec plantes 🌿 et fleurs 🌸';
      spyOn(component.articleIdeaChange, 'emit');
      
      component.onArticleIdeaChange(unicodeValue);
      
      expect(component.articleIdeaChange.emit).toHaveBeenCalledWith(unicodeValue);
    });

    it('devrait gérer plusieurs appels avec différentes valeurs', () => {
      spyOn(component.articleIdeaChange, 'emit');
      
      const values = ['Première idée', 'Deuxième idée', 'Troisième idée'];
      values.forEach(value => {
        component.onArticleIdeaChange(value);
      });
      
      expect(component.articleIdeaChange.emit).toHaveBeenCalledTimes(3);
      expect(component.articleIdeaChange.emit).toHaveBeenCalledWith('Première idée');
      expect(component.articleIdeaChange.emit).toHaveBeenCalledWith('Deuxième idée');
      expect(component.articleIdeaChange.emit).toHaveBeenCalledWith('Troisième idée');
    });

    it('devrait être une méthode pure sans effets de bord', () => {
      const testValue = 'Test value';
      spyOn(component.generate, 'emit');
      spyOn(component.articleIdeaChange, 'emit');
      
      component.onArticleIdeaChange(testValue);
      
      expect(component.articleIdeaChange.emit).toHaveBeenCalledWith(testValue);
      expect(component.generate.emit).not.toHaveBeenCalled();
    });

    it('devrait préserver la valeur exacte passée en paramètre', () => {
      const exactValue = 'Valeur exacte avec espaces   et caractères spéciaux éàçù';
      spyOn(component.articleIdeaChange, 'emit');
      
      component.onArticleIdeaChange(exactValue);
      
      expect(component.articleIdeaChange.emit).toHaveBeenCalledWith(exactValue);
    });

    it('devrait gérer les chaînes contenant des URLs', () => {
      const urlValue = 'Article sur https://example.com/jardinage avec des liens';
      spyOn(component.articleIdeaChange, 'emit');
      
      component.onArticleIdeaChange(urlValue);
      
      expect(component.articleIdeaChange.emit).toHaveBeenCalledWith(urlValue);
    });

    it('devrait gérer les chaînes contenant des emails', () => {
      const emailValue = 'Contact: jardinier@example.com pour plus d\'infos';
      spyOn(component.articleIdeaChange, 'emit');
      
      component.onArticleIdeaChange(emailValue);
      
      expect(component.articleIdeaChange.emit).toHaveBeenCalledWith(emailValue);
    });

    it('devrait gérer les chaînes contenant des nombres', () => {
      const numberValue = 'Planter 15 graines à 2cm de profondeur';
      spyOn(component.articleIdeaChange, 'emit');
      
      component.onArticleIdeaChange(numberValue);
      
      expect(component.articleIdeaChange.emit).toHaveBeenCalledWith(numberValue);
    });

    it('devrait gérer les chaînes contenant des mesures', () => {
      const measureValue = 'Arroser 2.5L d\'eau par m² tous les 3-4 jours';
      spyOn(component.articleIdeaChange, 'emit');
      
      component.onArticleIdeaChange(measureValue);
      
      expect(component.articleIdeaChange.emit).toHaveBeenCalledWith(measureValue);
    });
  });

  describe('Intégration des deux méthodes', () => {
    it('devrait pouvoir appeler les deux méthodes indépendamment', () => {
      spyOn(component.generate, 'emit');
      spyOn(component.articleIdeaChange, 'emit');
      
      component.onGenerate();
      component.onArticleIdeaChange('Test idea');
      
      expect(component.generate.emit).toHaveBeenCalledTimes(1);
      expect(component.articleIdeaChange.emit).toHaveBeenCalledTimes(1);
      expect(component.articleIdeaChange.emit).toHaveBeenCalledWith('Test idea');
    });

    it('devrait pouvoir appeler les deux méthodes dans n\'importe quel ordre', () => {
      spyOn(component.generate, 'emit');
      spyOn(component.articleIdeaChange, 'emit');
      
      component.onArticleIdeaChange('Première idée');
      component.onGenerate();
      component.onArticleIdeaChange('Deuxième idée');
      
      expect(component.generate.emit).toHaveBeenCalledTimes(1);
      expect(component.articleIdeaChange.emit).toHaveBeenCalledTimes(2);
    });

    it('devrait maintenir l\'état correct entre les appels', () => {
      spyOn(component.generate, 'emit');
      spyOn(component.articleIdeaChange, 'emit');
      
      component.onGenerate();
      component.onArticleIdeaChange('Idée après génération');
      component.onGenerate();
      
      expect(component.generate.emit).toHaveBeenCalledTimes(2);
      expect(component.articleIdeaChange.emit).toHaveBeenCalledTimes(1);
    });
  });

  describe('Tests de robustesse', () => {
    it('devrait gérer les appels multiples rapides sur onGenerate', () => {
      spyOn(component.generate, 'emit');
      
      // Simuler des clics rapides
      for (let i = 0; i < 20; i++) {
        component.onGenerate();
      }
      
      expect(component.generate.emit).toHaveBeenCalledTimes(20);
    });

    it('devrait gérer les changements rapides sur onArticleIdeaChange', () => {
      spyOn(component.articleIdeaChange, 'emit');
      
      // Simuler des changements rapides de texte
      for (let i = 0; i < 50; i++) {
        component.onArticleIdeaChange(`Valeur ${i}`);
      }
      
      expect(component.articleIdeaChange.emit).toHaveBeenCalledTimes(50);
      expect(component.articleIdeaChange.emit).toHaveBeenCalledWith('Valeur 49');
    });

    it('devrait maintenir la cohérence des appels', () => {
      spyOn(component.generate, 'emit');
      spyOn(component.articleIdeaChange, 'emit');
      
      const generateCount = 5;
      const changeCount = 10;
      
      // Appels alternés
      for (let i = 0; i < Math.max(generateCount, changeCount); i++) {
        if (i < generateCount) component.onGenerate();
        if (i < changeCount) component.onArticleIdeaChange(`Value ${i}`);
      }
      
      expect(component.generate.emit).toHaveBeenCalledTimes(generateCount);
      expect(component.articleIdeaChange.emit).toHaveBeenCalledTimes(changeCount);
    });
  });

  describe('Propriétés du composant', () => {
    it('devrait avoir des valeurs par défaut correctes', () => {
      expect(component.articleIdea()).toBe('');
      expect(component.isGenerating()).toBe(false);
      expect(component.step()).toBe(0);
    });

    it('devrait avoir les outputs correctement définis', () => {
      expect(component.generate).toBeDefined();
      expect(component.articleIdeaChange).toBeDefined();
    });
  });
});
