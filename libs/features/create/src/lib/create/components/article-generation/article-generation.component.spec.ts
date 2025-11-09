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
      let emitted = false;
      component.generate.subscribe(() => emitted = true);
      
      component.onGenerate();
      
      expect(emitted).toBe(true);
    });

    it('devrait émettre l\'événement generate même si appelé plusieurs fois', () => {
      let callCount = 0;
      component.generate.subscribe(() => callCount++);
      
      component.onGenerate();
      component.onGenerate();
      
      expect(callCount).toBe(2);
    });

    it('devrait émettre l\'événement generate sans paramètres', () => {
      let emitted = false;
      component.generate.subscribe(() => emitted = true);
      
      component.onGenerate();
      
      expect(emitted).toBe(true);
    });

    it('devrait fonctionner avec des appels rapides', () => {
      let callCount = 0;
      component.generate.subscribe(() => callCount++);
      
      // Appels rapides successifs
      for (let i = 0; i < 5; i++) {
        component.onGenerate();
      }
      
      expect(callCount).toBe(5);
    });

    it('devrait être une méthode pure sans effets de bord', () => {
      let generateEmitted = false;
      let changeEmitted = false;
      component.generate.subscribe(() => generateEmitted = true);
      component.articleIdeaChange.subscribe(() => changeEmitted = true);
      
      component.onGenerate();
      
      expect(generateEmitted).toBe(true);
      expect(changeEmitted).toBe(false);
    });
  });

  describe('onArticleIdeaChange(value: string)', () => {
    it('devrait émettre l\'événement articleIdeaChange avec la valeur fournie', () => {
      const testValue = 'Comment planter des roses';
      let emittedValue = '';
      component.articleIdeaChange.subscribe(value => emittedValue = value);
      
      component.onArticleIdeaChange(testValue);
      
      expect(emittedValue).toBe(testValue);
    });

    it('devrait émettre une chaîne vide', () => {
      let emittedValue = 'not empty';
      component.articleIdeaChange.subscribe(value => emittedValue = value);
      
      component.onArticleIdeaChange('');
      
      expect(emittedValue).toBe('');
    });

    it('devrait émettre une valeur avec des espaces', () => {
      const testValue = '  Idée avec espaces  ';
      let emittedValue = '';
      component.articleIdeaChange.subscribe(value => emittedValue = value);
      
      component.onArticleIdeaChange(testValue);
      
      expect(emittedValue).toBe(testValue);
    });

    it('devrait gérer les valeurs longues', () => {
      const longValue = 'Ceci est une très longue idée d\'article qui décrit en détail comment créer un jardin urbain avec des plantes comestibles et des fleurs ornementales dans un espace limité';
      let emittedValue = '';
      component.articleIdeaChange.subscribe(value => emittedValue = value);
      
      component.onArticleIdeaChange(longValue);
      
      expect(emittedValue).toBe(longValue);
    });

    it('devrait gérer les caractères spéciaux', () => {
      const specialValue = 'Article avec éàçù & "guillemets" et <balises>';
      let emittedValue = '';
      component.articleIdeaChange.subscribe(value => emittedValue = value);
      
      component.onArticleIdeaChange(specialValue);
      
      expect(emittedValue).toBe(specialValue);
    });

    it('devrait gérer les caractères Unicode', () => {
      const unicodeValue = '🌱 Jardinage avec plantes 🌿 et fleurs 🌸';
      let emittedValue = '';
      component.articleIdeaChange.subscribe(value => emittedValue = value);
      
      component.onArticleIdeaChange(unicodeValue);
      
      expect(emittedValue).toBe(unicodeValue);
    });

    it('devrait gérer plusieurs appels avec différentes valeurs', () => {
      const emittedValues: string[] = [];
      component.articleIdeaChange.subscribe(value => emittedValues.push(value));
      
      const values = ['Première idée', 'Deuxième idée', 'Troisième idée'];
      values.forEach(value => {
        component.onArticleIdeaChange(value);
      });
      
      expect(emittedValues.length).toBe(3);
      expect(emittedValues[0]).toBe('Première idée');
      expect(emittedValues[1]).toBe('Deuxième idée');
      expect(emittedValues[2]).toBe('Troisième idée');
    });

    it('devrait être une méthode pure sans effets de bord', () => {
      const testValue = 'Test value';
      let generateEmitted = false;
      let changeEmitted = false;
      component.generate.subscribe(() => generateEmitted = true);
      component.articleIdeaChange.subscribe(() => changeEmitted = true);
      
      component.onArticleIdeaChange(testValue);
      
      expect(changeEmitted).toBe(true);
      expect(generateEmitted).toBe(false);
    });

    it('devrait préserver la valeur exacte passée en paramètre', () => {
      const exactValue = 'Valeur exacte avec espaces   et caractères spéciaux éàçù';
      let emittedValue = '';
      component.articleIdeaChange.subscribe(value => emittedValue = value);
      
      component.onArticleIdeaChange(exactValue);
      
      expect(emittedValue).toBe(exactValue);
    });

    it('devrait gérer les chaînes contenant des URLs', () => {
      const urlValue = 'Article sur https://example.com/jardinage avec des liens';
      let emittedValue = '';
      component.articleIdeaChange.subscribe(value => emittedValue = value);
      
      component.onArticleIdeaChange(urlValue);
      
      expect(emittedValue).toBe(urlValue);
    });

    it('devrait gérer les chaînes contenant des emails', () => {
      const emailValue = 'Contact: jardinier@example.com pour plus d\'infos';
      let emittedValue = '';
      component.articleIdeaChange.subscribe(value => emittedValue = value);
      
      component.onArticleIdeaChange(emailValue);
      
      expect(emittedValue).toBe(emailValue);
    });

    it('devrait gérer les chaînes contenant des nombres', () => {
      const numberValue = 'Planter 15 graines à 2cm de profondeur';
      let emittedValue = '';
      component.articleIdeaChange.subscribe(value => emittedValue = value);
      
      component.onArticleIdeaChange(numberValue);
      
      expect(emittedValue).toBe(numberValue);
    });

    it('devrait gérer les chaînes contenant des mesures', () => {
      const measureValue = 'Arroser 2.5L d\'eau par m² tous les 3-4 jours';
      let emittedValue = '';
      component.articleIdeaChange.subscribe(value => emittedValue = value);
      
      component.onArticleIdeaChange(measureValue);
      
      expect(emittedValue).toBe(measureValue);
    });
  });

  describe('Intégration des deux méthodes', () => {
    it('devrait pouvoir appeler les deux méthodes indépendamment', () => {
      let generateCount = 0;
      let changeCount = 0;
      let lastChangeValue = '';
      
      component.generate.subscribe(() => generateCount++);
      component.articleIdeaChange.subscribe(value => {
        changeCount++;
        lastChangeValue = value;
      });
      
      component.onGenerate();
      component.onArticleIdeaChange('Test idea');
      
      expect(generateCount).toBe(1);
      expect(changeCount).toBe(1);
      expect(lastChangeValue).toBe('Test idea');
    });

    it('devrait pouvoir appeler les deux méthodes dans n\'importe quel ordre', () => {
      let generateCount = 0;
      let changeCount = 0;
      
      component.generate.subscribe(() => generateCount++);
      component.articleIdeaChange.subscribe(() => changeCount++);
      
      component.onArticleIdeaChange('Première idée');
      component.onGenerate();
      component.onArticleIdeaChange('Deuxième idée');
      
      expect(generateCount).toBe(1);
      expect(changeCount).toBe(2);
    });

    it('devrait maintenir l\'état correct entre les appels', () => {
      let generateCount = 0;
      let changeCount = 0;
      
      component.generate.subscribe(() => generateCount++);
      component.articleIdeaChange.subscribe(() => changeCount++);
      
      component.onGenerate();
      component.onArticleIdeaChange('Idée après génération');
      component.onGenerate();
      
      expect(generateCount).toBe(2);
      expect(changeCount).toBe(1);
    });
  });

  describe('Tests de robustesse', () => {
    it('devrait gérer les appels multiples rapides sur onGenerate', () => {
      let callCount = 0;
      component.generate.subscribe(() => callCount++);
      
      // Simuler des clics rapides
      for (let i = 0; i < 20; i++) {
        component.onGenerate();
      }
      
      expect(callCount).toBe(20);
    });

    it('devrait gérer les changements rapides sur onArticleIdeaChange', () => {
      const emittedValues: string[] = [];
      component.articleIdeaChange.subscribe(value => emittedValues.push(value));
      
      // Simuler des changements rapides de texte
      for (let i = 0; i < 50; i++) {
        component.onArticleIdeaChange(`Valeur ${i}`);
      }
      
      expect(emittedValues.length).toBe(50);
      expect(emittedValues[49]).toBe('Valeur 49');
    });

    it('devrait maintenir la cohérence des appels', () => {
      let generateCount = 0;
      let changeCount = 0;
      
      component.generate.subscribe(() => generateCount++);
      component.articleIdeaChange.subscribe(() => changeCount++);
      
      const expectedGenerateCount = 5;
      const expectedChangeCount = 10;
      
      // Appels alternés
      for (let i = 0; i < Math.max(expectedGenerateCount, expectedChangeCount); i++) {
        if (i < expectedGenerateCount) component.onGenerate();
        if (i < expectedChangeCount) component.onArticleIdeaChange(`Value ${i}`);
      }
      
      expect(generateCount).toBe(expectedGenerateCount);
      expect(changeCount).toBe(expectedChangeCount);
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
