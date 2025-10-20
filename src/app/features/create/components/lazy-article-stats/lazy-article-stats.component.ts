import { Component, input, output, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-lazy-article-stats',
  standalone: true,
  imports: [CommonModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <ng-container *ngIf="shouldLoad()">
      <ng-container *ngComponentOutlet="articleStatsComponent; inputs: articleStatsInputs"></ng-container>
    </ng-container>
  `
})
export class LazyArticleStatsComponent {
  // Inputs du composant ArticleStatsComponent
  article = input<string | null>('');
  isGenerating = input<boolean>(false);
  canSave = input<boolean>(false);
  articleStats = input<any>(null);
  internalImagesCount = input<number>(0);
  faqCount = input<number>(0);
  imageUrl = input<string | null>('');
  video = input<string | null>('');
  botanicalNamesCount = input<number>(0);
  internalLinksStats = input<any>(null);

  // Outputs du composant ArticleStatsComponent
  saveAllData = output<void>();
  showPerformanceStats = output<void>();
  editImageUrl = output<void>();

  articleStatsComponent: any = null;
  articleStatsInputs: any = {};

  async ngOnInit() {
    // Charger le composant seulement quand nécessaire
    const module = await import('../article-stats/article-stats.component');
    this.articleStatsComponent = module.ArticleStatsComponent;
    
    // Synchroniser les inputs
    this.articleStatsInputs = {
      article: this.article(),
      isGenerating: this.isGenerating(),
      canSave: this.canSave(),
      articleStats: this.articleStats(),
      internalImagesCount: this.internalImagesCount(),
      faqCount: this.faqCount(),
      imageUrl: this.imageUrl(),
      video: this.video(),
      botanicalNamesCount: this.botanicalNamesCount(),
      internalLinksStats: this.internalLinksStats()
    };
  }

  shouldLoad(): boolean {
    return this.articleStatsComponent !== null;
  }
}
