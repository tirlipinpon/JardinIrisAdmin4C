import { Component, input, output, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-lazy-article-editor',
  standalone: true,
  imports: [CommonModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <ng-container *ngIf="shouldLoad()">
      <ng-container *ngComponentOutlet="articleEditorComponent; inputs: articleEditorInputs"></ng-container>
    </ng-container>
  `
})
export class LazyArticleEditorComponent {
  article = input<string | null>('');
  articleChange = output<string>();

  articleEditorComponent: any = null;
  articleEditorInputs: any = {};

  async ngOnInit() {
    // Charger le composant seulement quand nécessaire
    const module = await import('../article-editor/article-editor.component');
    this.articleEditorComponent = module.ArticleEditorComponent;
    
    // Synchroniser les inputs
    this.articleEditorInputs = {
      article: this.article()
    };
  }

  shouldLoad(): boolean {
    return this.articleEditorComponent !== null;
  }
}
